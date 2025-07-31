import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/session"
import { z } from "zod"

const createCommentSchema = z.object({
  content: z.string().min(1).max(1000),
  parentId: z.string().optional(),
})

// GET /api/bounties/[id]/comments - Get comments for a bounty
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "20")
    const offset = parseInt(searchParams.get("offset") || "0")

    const comments = await prisma.comment.findMany({
      where: {
        bountyId: params.id,
        parentId: null, // Only get top-level comments
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
        // Get replies
        _count: {
          select: {
            _all: true,
          },
        },
      },
    })

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await prisma.comment.findMany({
          where: {
            parentId: comment.id,
          },
          orderBy: {
            createdAt: "asc",
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        })

        return {
          ...comment,
          replies,
        }
      })
    )

    const total = await prisma.comment.count({
      where: {
        bountyId: params.id,
        parentId: null,
      },
    })

    return NextResponse.json({
      comments: commentsWithReplies,
      total,
      hasMore: offset + limit < total,
    })
  } catch (error) {
    console.error("Error fetching comments:", error)
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    )
  }
}

// POST /api/bounties/[id]/comments - Create a new comment
export async function POST(
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
        allowComments: true,
        title: true,
      },
    })

    if (!bounty) {
      return NextResponse.json(
        { error: "Bounty not found" },
        { status: 404 }
      )
    }

    if (!bounty.allowComments) {
      return NextResponse.json(
        { error: "Comments are disabled for this bounty" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = createCommentSchema.parse(body)

    // Validate parent comment exists if provided
    if (validatedData.parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: validatedData.parentId },
      })

      if (!parentComment || parentComment.bountyId !== params.id) {
        return NextResponse.json(
          { error: "Invalid parent comment" },
          { status: 400 }
        )
      }
    }

    const comment = await prisma.comment.create({
      data: {
        ...validatedData,
        bountyId: params.id,
        userId: user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    // Create notification for comment reply
    if (validatedData.parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: validatedData.parentId },
        select: { userId: true },
      })

      if (parentComment && parentComment.userId !== user.id) {
        await prisma.notification.create({
          data: {
            userId: parentComment.userId,
            type: "COMMENT_REPLY",
            title: "New reply to your comment",
            message: `${user.name || "Someone"} replied to your comment on ${bounty.title}`,
            link: `/bounty/${params.id}#comment-${comment.id}`,
          },
        })
      }
    }

    return NextResponse.json(comment)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating comment:", error)
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    )
  }
}