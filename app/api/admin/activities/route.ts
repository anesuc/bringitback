import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin"
import { ActivityType } from "@prisma/client"

// GET /api/admin/activities - Get activity feed with filtering
export async function GET(request: Request) {
  // Check admin access
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const type = searchParams.get("type") as ActivityType | null
    const userId = searchParams.get("userId")
    const bountyId = searchParams.get("bountyId")

    const skip = (page - 1) * limit

    // Build filter conditions
    const where: any = {}
    if (type) where.type = type
    if (userId) where.userId = userId
    if (bountyId) where.bountyId = bountyId

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          bounty: {
            select: {
              id: true,
              title: true,
            },
          },
          solution: {
            select: {
              id: true,
              title: true,
            },
          },
          payout: {
            select: {
              id: true,
              amount: true,
              netAmount: true,
              status: true,
            },
          },
          contribution: {
            select: {
              id: true,
              amount: true,
            },
          },
        },
      }),
      prisma.activity.count({ where }),
    ])

    // Parse metadata for each activity
    const activitiesWithMetadata = activities.map(activity => ({
      ...activity,
      metadata: activity.metadata ? JSON.parse(activity.metadata) : null,
    }))

    return NextResponse.json({
      activities: activitiesWithMetadata,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching activities:", error)
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    )
  }
}