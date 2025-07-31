import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/session"

// GET /api/bounties/draft/[id] - Load a specific draft
export async function GET(
  req: NextRequest,
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

    const draft = await prisma.bounty.findFirst({
      where: {
        id,
        creatorId: user.id,
        status: "DRAFT"
      },
      include: {
        image: {
          select: {
            id: true,
          }
        }
      }
    })

    if (!draft) {
      return NextResponse.json(
        { error: "Draft not found" },
        { status: 404 }
      )
    }

    // Parse the long description to extract whatStoppedWorking if it was appended
    let longDescription = draft.longDescription
    let whatStoppedWorking = ""
    
    const featuresMatch = longDescription.match(/\n\nFeatures that stopped working:\n(.*)$/s)
    if (featuresMatch) {
      whatStoppedWorking = featuresMatch[1]
      longDescription = longDescription.replace(/\n\nFeatures that stopped working:\n.*$/s, '')
    }

    return NextResponse.json({
      id: draft.id,
      title: draft.title,
      company: draft.company,
      category: draft.category,
      description: draft.description,
      longDescription,
      whatStoppedWorking,
      imageUrl: draft.imageUrl,
      imageId: draft.imageId,
    })

  } catch (error) {
    console.error("Error loading draft:", error)
    return NextResponse.json(
      { error: "Failed to load draft" },
      { status: 500 }
    )
  }
}

// DELETE /api/bounties/draft/[id] - Delete a draft
export async function DELETE(
  req: NextRequest,
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

    await prisma.bounty.deleteMany({
      where: {
        id,
        creatorId: user.id,
        status: "DRAFT"
      }
    })

    return NextResponse.json({ message: "Draft deleted successfully" })

  } catch (error) {
    console.error("Error deleting draft:", error)
    return NextResponse.json(
      { error: "Failed to delete draft" },
      { status: 500 }
    )
  }
}