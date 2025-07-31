import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/session"
import { z } from "zod"

const updateBountySchema = z.object({
  title: z.string().min(1).max(100).optional(),
  company: z.string().min(1).max(100).optional(),
  category: z.enum([
    "PRODUCTIVITY",
    "SOCIAL_MEDIA",
    "MOBILE_OS",
    "COMMUNICATION",
    "DEVELOPMENT",
    "GAMING",
    "IOT_DEVICES",
    "SMART_HOME",
    "WEARABLES",
    "ENTERTAINMENT",
    "EDUCATION",
    "HEALTH_FITNESS",
    "OTHER",
  ]).optional(),
  description: z.string().min(1).max(500).optional(),
  longDescription: z.string().min(1).optional(),
  imageUrl: z.string().url().optional().nullable(),
  fundingGoal: z.number().min(100).optional(),
  fundingDeadline: z.string().datetime().optional(),
  status: z.enum([
    "DRAFT",
    "ACTIVE",
    "FUNDED",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
    "EXPIRED",
  ]).optional(),
  allowComments: z.boolean().optional(),
  isPublic: z.boolean().optional(),
})

// GET /api/bounties/[id] - Get a single bounty
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const bounty = await prisma.bounty.findUnique({
      where: {
        id: params.id,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
            bio: true,
          },
        },
        milestones: {
          orderBy: {
            order: "asc",
          },
        },
        updates: {
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },
        contributions: {
          where: {
            status: "COMPLETED",
            anonymous: false,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        _count: {
          select: {
            contributions: true,
            comments: true,
            savedBy: true,
          },
        },
      },
    })

    if (!bounty) {
      return NextResponse.json(
        { error: "Bounty not found" },
        { status: 404 }
      )
    }

    // Increment view count
    await prisma.bounty.update({
      where: { id: params.id },
      data: { viewCount: { increment: 1 } },
    })

    // Check if user has saved this bounty
    const user = await getCurrentUser()
    let isSaved = false
    if (user) {
      const saved = await prisma.savedBounty.findUnique({
        where: {
          userId_bountyId: {
            userId: user.id,
            bountyId: params.id,
          },
        },
      })
      isSaved = !!saved
    }

    return NextResponse.json({ ...bounty, isSaved })
  } catch (error) {
    console.error("Error fetching bounty:", error)
    return NextResponse.json(
      { error: "Failed to fetch bounty" },
      { status: 500 }
    )
  }
}

// PATCH /api/bounties/[id] - Update a bounty
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const bounty = await prisma.bounty.findUnique({
      where: { id: params.id },
      select: { creatorId: true },
    })

    if (!bounty) {
      return NextResponse.json(
        { error: "Bounty not found" },
        { status: 404 }
      )
    }

    if (bounty.creatorId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = updateBountySchema.parse(body)

    const updatedBounty = await prisma.bounty.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        fundingDeadline: validatedData.fundingDeadline
          ? new Date(validatedData.fundingDeadline)
          : undefined,
      },
    })

    return NextResponse.json(updatedBounty)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error updating bounty:", error)
    return NextResponse.json(
      { error: "Failed to update bounty" },
      { status: 500 }
    )
  }
}

// DELETE /api/bounties/[id] - Delete a bounty
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const bounty = await prisma.bounty.findUnique({
      where: { id: params.id },
      select: { 
        creatorId: true,
        fundingCurrent: true,
        status: true,
      },
    })

    if (!bounty) {
      return NextResponse.json(
        { error: "Bounty not found" },
        { status: 404 }
      )
    }

    if (bounty.creatorId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    // Don't allow deletion if there are contributions
    if (bounty.fundingCurrent > 0) {
      return NextResponse.json(
        { error: "Cannot delete bounty with contributions" },
        { status: 400 }
      )
    }

    await prisma.bounty.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting bounty:", error)
    return NextResponse.json(
      { error: "Failed to delete bounty" },
      { status: 500 }
    )
  }
}