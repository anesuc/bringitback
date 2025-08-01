import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/session"
import { z } from "zod"

const createSolutionSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  implementation: z.string().url("Implementation must be a valid URL"),
})

// GET /api/bounties/[id]/solutions - Get solutions for a bounty
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Get current total contributors for this bounty
    const uniqueContributors = await prisma.contribution.findMany({
      where: {
        bountyId: id,
        status: "COMPLETED",
      },
      select: {
        userId: true,
      },
      distinct: ["userId"],
    })
    const currentContributorCount = uniqueContributors.length

    const solutions = await prisma.solution.findMany({
      where: {
        bountyId: id,
      },
      orderBy: [
        { status: "asc" }, // ACCEPTED first, then PENDING, then REJECTED
        { voteCount: "desc" }, // Most voted solutions first
        { createdAt: "desc" },
      ],
      include: {
        submitter: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        votes: {
          include: {
            voter: {
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
            votes: true,
          },
        },
      },
    })

    // Update totalVoters for all solutions to current contributor count
    const solutionsWithUpdatedVoters = solutions.map(solution => ({
      ...solution,
      totalVoters: currentContributorCount
    }))

    return NextResponse.json({ solutions: solutionsWithUpdatedVoters })
  } catch (error) {
    console.error("Error fetching solutions:", error)
    return NextResponse.json(
      { error: "Failed to fetch solutions" },
      { status: 500 }
    )
  }
}

// POST /api/bounties/[id]/solutions - Submit a solution
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
      select: { 
        title: true,
        status: true,
        creator: {
          select: {
            id: true,
          },
        },
        solutions: {
          where: {
            status: "ACCEPTED",
          },
          select: {
            id: true,
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

    if (bounty.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Bounty is not active" },
        { status: 400 }
      )
    }

    if (bounty.solutions.length > 0) {
      return NextResponse.json(
        { error: "This bounty already has an accepted solution" },
        { status: 400 }
      )
    }

    // Check if user already submitted a solution
    const existingSolution = await prisma.solution.findFirst({
      where: {
        bountyId: id,
        submitterId: user.id,
      },
    })

    if (existingSolution) {
      return NextResponse.json(
        { error: "You have already submitted a solution for this bounty" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = createSolutionSchema.parse(body)

    // Count eligible voters (contributors)
    const uniqueContributors = await prisma.contribution.findMany({
      where: {
        bountyId: id,
        status: "COMPLETED",
      },
      select: {
        userId: true,
      },
      distinct: ["userId"],
    })
    const contributorCount = uniqueContributors.length

    const solution = await prisma.solution.create({
      data: {
        ...validatedData,
        bountyId: id,
        submitterId: user.id,
        totalVoters: contributorCount,
      },
      include: {
        submitter: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        votes: {
          include: {
            voter: {
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
            votes: true,
          },
        },
      },
    })

    // Notify bounty creator
    if (bounty.creator.id !== user.id) {
      await prisma.notification.create({
        data: {
          userId: bounty.creator.id,
          type: "SOLUTION_SUBMITTED",
          title: "New solution submitted",
          message: `${user.name || "Someone"} submitted a solution for ${bounty.title}`,
          link: `/bounty/${id}?tab=solutions`,
        },
      })
    }

    return NextResponse.json(solution)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating solution:", error)
    return NextResponse.json(
      { error: "Failed to create solution" },
      { status: 500 }
    )
  }
}