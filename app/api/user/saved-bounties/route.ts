import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/session"

// GET /api/user/saved-bounties - Get user's saved bounties
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

    const [savedBounties, total] = await Promise.all([
      prisma.savedBounty.findMany({
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
            include: {
              creator: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
              _count: {
                select: {
                  contributions: true,
                  comments: true,
                },
              },
            },
          },
        },
      }),
      prisma.savedBounty.count({
        where: {
          userId: user.id,
        },
      }),
    ])

    const bounties = savedBounties.map((saved) => ({
      ...saved.bounty,
      savedAt: saved.createdAt,
    }))

    return NextResponse.json({
      bounties,
      total,
      hasMore: offset + limit < total,
    })
  } catch (error) {
    console.error("Error fetching saved bounties:", error)
    return NextResponse.json(
      { error: "Failed to fetch saved bounties" },
      { status: 500 }
    )
  }
}