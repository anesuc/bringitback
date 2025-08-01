import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/session"
import { z } from "zod"

const voteSchema = z.object({
  vote: z.enum(["APPROVE", "REJECT"]),
})

// POST /api/solutions/[id]/vote - Vote on a solution
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

    const solution = await prisma.solution.findUnique({
      where: { id },
      include: {
        bounty: {
          select: {
            id: true,
            title: true,
            status: true,
            creator: {
              select: {
                id: true,
              },
            },
          },
        },
        submitter: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!solution) {
      return NextResponse.json(
        { error: "Solution not found" },
        { status: 404 }
      )
    }

    if (solution.status !== "PENDING") {
      return NextResponse.json(
        { error: "Cannot vote on this solution" },
        { status: 400 }
      )
    }

    if (solution.bounty.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Bounty is not active" },
        { status: 400 }
      )
    }

    // Check if user is a contributor (eligible to vote)
    const contribution = await prisma.contribution.findFirst({
      where: {
        bountyId: solution.bounty.id,
        userId: user.id,
        status: "COMPLETED",
      },
    })

    if (!contribution) {
      return NextResponse.json(
        { error: "Only contributors can vote on solutions" },
        { status: 403 }
      )
    }

    // Check if user is the solution submitter
    if (solution.submitterId === user.id) {
      return NextResponse.json(
        { error: "Cannot vote on your own solution" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { vote } = voteSchema.parse(body)

    // Upsert vote (update if exists, create if doesn't)
    const existingVote = await prisma.solutionVote.findUnique({
      where: {
        solutionId_voterId: {
          solutionId: id,
          voterId: user.id,
        },
      },
    })

    let voteRecord
    if (existingVote) {
      voteRecord = await prisma.solutionVote.update({
        where: { id: existingVote.id },
        data: { vote },
      })
    } else {
      voteRecord = await prisma.solutionVote.create({
        data: {
          solutionId: id,
          voterId: user.id,
          vote,
        },
      })
    }

    // Recalculate vote count
    const approvalCount = await prisma.solutionVote.count({
      where: {
        solutionId: id,
        vote: "APPROVE",
      },
    })

    // Get current total contributors for this bounty
    const uniqueContributors = await prisma.contribution.findMany({
      where: {
        bountyId: solution.bounty.id,
        status: "COMPLETED",
      },
      select: {
        userId: true,
      },
      distinct: ["userId"],
    })
    const currentContributorCount = uniqueContributors.length

    // Update solution vote count
    const updatedSolution = await prisma.solution.update({
      where: { id },
      data: {
        voteCount: approvalCount,
      },
    })

    // Check if solution reaches 50% approval using current contributor count
    const approvalPercentage = currentContributorCount > 0 
      ? (approvalCount / currentContributorCount) * 100 
      : 0

    if (approvalPercentage >= 50 && updatedSolution.status === "PENDING") {
      // Accept the solution
      await prisma.solution.update({
        where: { id },
        data: {
          status: "ACCEPTED",
          acceptedAt: new Date(),
        },
      })

      // Update bounty status
      await prisma.bounty.update({
        where: { id: solution.bounty.id },
        data: {
          status: "COMPLETED",
        },
      })

      // Notify solution submitter
      await prisma.notification.create({
        data: {
          userId: solution.submitterId,
          type: "SOLUTION_ACCEPTED",
          title: "Your solution was accepted!",
          message: `Your solution for ${solution.bounty.title} has been accepted by the contributors!`,
          link: `/bounty/${solution.bounty.id}?tab=solutions`,
        },
      })

      // Notify bounty creator
      if (solution.bounty.creator.id !== solution.submitterId) {
        await prisma.notification.create({
          data: {
            userId: solution.bounty.creator.id,
            type: "BOUNTY_FUNDED",
            title: "Bounty completed!",
            message: `A solution for ${solution.bounty.title} has been accepted!`,
            link: `/bounty/${solution.bounty.id}?tab=solutions`,
          },
        })
      }
    }

    return NextResponse.json({
      vote: voteRecord,
      approvalCount,
      approvalPercentage: Math.round(approvalPercentage),
      totalVoters: currentContributorCount,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error voting on solution:", error)
    return NextResponse.json(
      { error: "Failed to vote on solution" },
      { status: 500 }
    )
  }
}