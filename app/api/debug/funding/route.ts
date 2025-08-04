import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Get all bounties with their funding and contribution data
    const bounties = await prisma.bounty.findMany({
      select: {
        id: true,
        title: true,
        fundingCurrent: true,
        status: true,
        contributions: {
          select: {
            id: true,
            amount: true,
            status: true,
            createdAt: true,
            stripeCheckoutSessionId: true,
            stripePaymentIntentId: true,
          },
        },
        _count: {
          select: {
            contributions: {
              where: {
                status: "COMPLETED",
              },
            },
          },
        },
      },
    })

    return NextResponse.json({
      bounties: bounties.map(bounty => ({
        ...bounty,
        totalContributions: bounty.contributions.length,
        completedContributions: bounty._count.contributions,
        pendingContributions: bounty.contributions.filter(c => c.status === "PENDING").length,
        calculatedFunding: bounty.contributions
          .filter(c => c.status === "COMPLETED")
          .reduce((sum, c) => sum + c.amount, 0),
      })),
    })
  } catch (error) {
    console.error("Debug funding error:", error)
    return NextResponse.json(
      { error: "Failed to fetch funding data" },
      { status: 500 }
    )
  }
}