import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/session"
import { z } from "zod"

const createBountySchema = z.object({
  title: z.string().min(1).max(100),
  company: z.string().min(1).max(100),
  category: z.enum([
    "MEDIA_PLAYERS",
    "ONLINE_GAMES",
    "SMART_DEVICES",
    "MOBILE_APPS",
    "DESKTOP_SOFTWARE",
    "STREAMING_SERVICES",
    "SOCIAL_PLATFORMS",
    "PRODUCTIVITY_TOOLS",
    "CLOUD_SERVICES",
    "MESSAGING_APPS",
    "WEARABLE_DEVICES",
    "OTHER",
  ]),
  description: z.string().min(1).max(500),
  longDescription: z.string().min(1),
  whatStoppedWorking: z.string().optional(),
  imageUrl: z.string().optional(),
  imageId: z.string().optional(),
})

// GET /api/bounties - Get all bounties with filtering
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const sort = searchParams.get("sort") || "newest"
    const status = searchParams.get("status") || "ACTIVE"
    const featured = searchParams.get("featured")
    const limit = parseInt(searchParams.get("limit") || "12")
    const offset = parseInt(searchParams.get("offset") || "0")

    const where: any = {
      isPublic: true,
    }

    if (status) {
      where.status = status
    }

    if (category) {
      where.category = category
    }

    if (featured === "true") {
      where.featured = true
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    let orderBy: any = {}
    switch (sort) {
      case "popular":
        orderBy = { viewCount: "desc" }
        break
      case "funding":
        orderBy = { fundingCurrent: "desc" }
        break
      case "ending-soon":
        orderBy = { fundingDeadline: "asc" }
        break
      case "newest":
      default:
        orderBy = { createdAt: "desc" }
    }

    const [bounties, total] = await Promise.all([
      prisma.bounty.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit,
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
      }),
      prisma.bounty.count({ where }),
    ])

    return NextResponse.json({
      bounties,
      total,
      hasMore: offset + limit < total,
    })
  } catch (error) {
    console.error("Error fetching bounties:", error)
    return NextResponse.json(
      { error: "Failed to fetch bounties" },
      { status: 500 }
    )
  }
}

// POST /api/bounties - Create a new bounty
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createBountySchema.parse(body)

    const bounty = await prisma.bounty.create({
      data: {
        title: validatedData.title,
        company: validatedData.company,
        category: validatedData.category,
        description: validatedData.description,
        longDescription: validatedData.longDescription,
        whatStoppedWorking: validatedData.whatStoppedWorking || null,
        imageUrl: validatedData.imageUrl,
        imageId: validatedData.imageId,
        creatorId: user.id,
        // Flexible funding defaults
        fundingGoal: 999999999, // Very high default since it's flexible
        fundingDeadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        status: "ACTIVE",
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json(bounty)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating bounty:", error)
    return NextResponse.json(
      { error: "Failed to create bounty" },
      { status: 500 }
    )
  }
}