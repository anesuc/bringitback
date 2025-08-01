import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/session"
import { z } from "zod"

const createUpdateSchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(1),
  imageUrl: z.string().url().optional(),
})

// GET /api/bounties/[id]/updates - Get all updates for a bounty
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const updates = await prisma.update.findMany({
      where: {
        bountyId: id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(updates)
  } catch (error) {
    console.error("Error fetching updates:", error)
    return NextResponse.json(
      { error: "Failed to fetch updates" },
      { status: 500 }
    )
  }
}

// POST /api/bounties/[id]/updates - Create a new update
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const bounty = await prisma.bounty.findUnique({
      where: { id },
      select: { creatorId: true, title: true },
    })

    if (!bounty) {
      return NextResponse.json(
        { error: "Bounty not found" },
        { status: 404 }
      )
    }

    // Check if user is creator or has submitted a solution
    const isCreator = bounty.creatorId === user.id
    const hasSolution = await prisma.solution.findFirst({
      where: {
        bountyId: id,
        submitterId: user.id,
      },
    })

    if (!isCreator && !hasSolution) {
      return NextResponse.json(
        { error: "Only bounty creators and solution submitters can post updates" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = createUpdateSchema.parse(body)

    const update = await prisma.update.create({
      data: {
        ...validatedData,
        bountyId: id,
        authorId: user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    // Create notifications for all contributors
    const contributors = await prisma.contribution.findMany({
      where: {
        bountyId: id,
        status: "COMPLETED",
      },
      select: {
        userId: true,
      },
      distinct: ["userId"],
    })

    if (contributors.length > 0) {
      await prisma.notification.createMany({
        data: contributors.map((contributor) => ({
          userId: contributor.userId,
          type: "BOUNTY_UPDATE",
          title: "New update on supported bounty",
          message: `${bounty.title} has a new update: ${validatedData.title}`,
          link: `/bounty/${id}`,
        })),
      })
    }

    return NextResponse.json(update)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating update:", error)
    return NextResponse.json(
      { error: "Failed to create update" },
      { status: 500 }
    )
  }
}