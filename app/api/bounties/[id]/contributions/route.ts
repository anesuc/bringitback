import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/bounties/[id]/contributions - Get all contributions for a bounty
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "20")
    const offset = parseInt(searchParams.get("offset") || "0")

    const [contributions, total] = await Promise.all([
      prisma.contribution.findMany({
        where: {
          bountyId: params.id,
          status: "COMPLETED",
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: offset,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      }),
      prisma.contribution.count({
        where: {
          bountyId: params.id,
          status: "COMPLETED",
        },
      }),
    ])

    // Hide user details for anonymous contributions
    const sanitizedContributions = contributions.map((contribution) => {
      if (contribution.anonymous) {
        return {
          ...contribution,
          user: null,
        }
      }
      return contribution
    })

    return NextResponse.json({
      contributions: sanitizedContributions,
      total,
      hasMore: offset + limit < total,
    })
  } catch (error) {
    console.error("Error fetching contributions:", error)
    return NextResponse.json(
      { error: "Failed to fetch contributions" },
      { status: 500 }
    )
  }
}