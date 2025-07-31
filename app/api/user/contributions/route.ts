import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/session"

// GET /api/user/contributions - Get user's contributions
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "20")
    const offset = parseInt(searchParams.get("offset") || "0")

    const [contributions, total] = await Promise.all([
      prisma.contribution.findMany({
        where: {
          userId: user.id,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: offset,
        take: limit,
        include: {
          bounty: {
            select: {
              id: true,
              title: true,
              company: true,
              imageUrl: true,
              fundingGoal: true,
              fundingCurrent: true,
              status: true,
            },
          },
        },
      }),
      prisma.contribution.count({
        where: {
          userId: user.id,
        },
      }),
    ])

    const totalContributed = await prisma.contribution.aggregate({
      where: {
        userId: user.id,
        status: "COMPLETED",
      },
      _sum: {
        amount: true,
      },
    })

    return NextResponse.json({
      contributions,
      total,
      totalContributed: totalContributed._sum.amount || 0,
      hasMore: offset + limit < total,
    })
  } catch (error) {
    console.error("Error fetching user contributions:", error)
    return NextResponse.json(
      { error: "Failed to fetch contributions" },
      { status: 500 }
    )
  }
}