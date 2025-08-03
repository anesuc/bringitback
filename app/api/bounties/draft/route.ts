import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/session"
import { z } from "zod"

const saveDraftSchema = z.object({
  id: z.string().optional(), // For updating existing drafts
  title: z.string().min(1).max(100),
  company: z.string().optional(),
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
  ]).nullable().optional(),
  description: z.string().optional(),
  longDescription: z.string().optional(),
  whatStoppedWorking: z.string().optional(),
  imageUrl: z.string().optional(),
  imageId: z.string().optional(),
})

// POST /api/bounties/draft - Save a draft bounty
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
    const validatedData = saveDraftSchema.parse(body)

    // Check if we're updating a specific draft or finding existing one
    let existingDraft = null
    if (validatedData.id) {
      // Updating specific draft
      existingDraft = await prisma.bounty.findFirst({
        where: {
          id: validatedData.id,
          creatorId: user.id,
          status: "DRAFT"
        }
      })
    } else {
      // Find any existing draft for this user
      existingDraft = await prisma.bounty.findFirst({
        where: {
          creatorId: user.id,
          status: "DRAFT"
        }
      })
    }

    let draft
    if (existingDraft) {
      // Update existing draft
      const updateData: any = {
        title: validatedData.title,
        company: validatedData.company || "",
        category: validatedData.category || "OTHER",
        description: validatedData.description || "",
        longDescription: validatedData.longDescription || "",
        whatStoppedWorking: validatedData.whatStoppedWorking || "",
        imageUrl: validatedData.imageUrl,
        updatedAt: new Date(),
      }
      
      // Only set imageId if it has a valid value
      if (validatedData.imageId && validatedData.imageId.trim() !== "") {
        updateData.imageId = validatedData.imageId
      }
      
      draft = await prisma.bounty.update({
        where: { id: existingDraft.id },
        data: updateData
      })
    } else {
      // Create new draft
      const createData: any = {
        title: validatedData.title,
        company: validatedData.company || "",
        category: validatedData.category || "OTHER",
        description: validatedData.description || "",
        longDescription: validatedData.longDescription || "",
        whatStoppedWorking: validatedData.whatStoppedWorking || "",
        imageUrl: validatedData.imageUrl,
        creatorId: user.id,
        status: "DRAFT",
        // Draft defaults
        fundingGoal: 0,
        fundingDeadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      }
      
      // Only set imageId if it has a valid value
      if (validatedData.imageId && validatedData.imageId.trim() !== "") {
        createData.imageId = validatedData.imageId
      }
      
      draft = await prisma.bounty.create({
        data: createData
      })
    }

    return NextResponse.json({ 
      message: "Draft saved successfully",
      draftId: draft.id 
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error saving draft:", error)
    return NextResponse.json(
      { error: "Failed to save draft" },
      { status: 500 }
    )
  }
}