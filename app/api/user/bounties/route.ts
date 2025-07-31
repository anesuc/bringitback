import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/session"

// GET /api/user/bounties - Get user's created bounties
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
    const limit = parseInt(searchParams.get("limit") || "12")
    const offset = parseInt(searchParams.get("offset") || "0")
    const status = searchParams.get("status")

    const where: any = {
      creatorId: user.id,
    }

    if (status) {
      where.status = status
    }

    const [bounties, total] = await Promise.all([
      prisma.bounty.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip: offset,
        take: limit,
        include: {
          _count: {
            select: {
              contributions: true,
              comments: true,
              savedBy: true,
            },
          },
        },
      }),
      prisma.bounty.count({ where }),
    ])

    const stats = await prisma.bounty.aggregate({
      where: {
        creatorId: user.id,
      },
      _sum: {
        fundingCurrent: true,
      },
      _count: {
        id: true,
      },
    })

    return NextResponse.json({
      bounties,
      total,
      totalRaised: stats._sum.fundingCurrent || 0,
      hasMore: offset + limit < total,
    })
  } catch (error) {
    console.error("Error fetching user bounties:", error)
    return NextResponse.json(
      { error: "Failed to fetch bounties" },
      { status: 500 }
    )
  }
}