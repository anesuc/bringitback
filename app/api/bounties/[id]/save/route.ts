import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/session"

// POST /api/bounties/[id]/save - Save a bounty
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
    })

    if (!bounty) {
      return NextResponse.json(
        { error: "Bounty not found" },
        { status: 404 }
      )
    }

    const existingSave = await prisma.savedBounty.findUnique({
      where: {
        userId_bountyId: {
          userId: user.id,
          bountyId: id,
        },
      },
    })

    if (existingSave) {
      return NextResponse.json(
        { error: "Bounty already saved" },
        { status: 400 }
      )
    }

    const savedBounty = await prisma.savedBounty.create({
      data: {
        userId: user.id,
        bountyId: id,
      },
    })

    return NextResponse.json(savedBounty)
  } catch (error) {
    console.error("Error saving bounty:", error)
    return NextResponse.json(
      { error: "Failed to save bounty" },
      { status: 500 }
    )
  }
}

// DELETE /api/bounties/[id]/save - Unsave a bounty
export async function DELETE(
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

    const savedBounty = await prisma.savedBounty.findUnique({
      where: {
        userId_bountyId: {
          userId: user.id,
          bountyId: id,
        },
      },
    })

    if (!savedBounty) {
      return NextResponse.json(
        { error: "Bounty not saved" },
        { status: 404 }
      )
    }

    await prisma.savedBounty.delete({
      where: {
        id: savedBounty.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error unsaving bounty:", error)
    return NextResponse.json(
      { error: "Failed to unsave bounty" },
      { status: 500 }
    )
  }
}