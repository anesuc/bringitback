import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin"
import { getCurrentUser } from "@/lib/session"
import { ActivityLogger } from "@/lib/activity"
import { z } from "zod"

const updatePayoutSchema = z.object({
  status: z.enum(["PENDING", "PROCESSING", "COMPLETED", "PAID", "FAILED", "CANCELLED"]),
  notes: z.string().optional(),
})

// PATCH /api/admin/payouts/[id] - Update payout status
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Check admin access
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = updatePayoutSchema.parse(body)

    const payout = await prisma.payout.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        solution: {
          select: {
            id: true,
            title: true,
            bounty: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    })

    if (!payout) {
      return NextResponse.json(
        { error: "Payout not found" },
        { status: 404 }
      )
    }

    // Update payout status
    const updateData: any = {
      status: validatedData.status,
      updatedAt: new Date(),
    }

    if (validatedData.status === "COMPLETED" || validatedData.status === "PAID") {
      updateData.processedAt = new Date()
    } else if (validatedData.status === "FAILED") {
      updateData.failedAt = new Date()
      updateData.failureReason = validatedData.notes || "Rejected by admin"
    }

    const updatedPayout = await prisma.payout.update({
      where: { id },
      data: updateData,
    })

    // Get current admin user for activity logging
    const admin = await getCurrentUser()

    // Create notification for user
    let notificationType: "PAYOUT_COMPLETED" | "PAYOUT_FAILED" = "PAYOUT_COMPLETED"
    let title = "Payout completed"
    let message = `Your payout of $${payout.netAmount.toFixed(2)} for ${payout.solution.bounty.title} has been processed successfully.`

    if (validatedData.status === "PAID") {
      title = "Payout paid"
      message = `Your payout of $${payout.netAmount.toFixed(2)} for ${payout.solution.bounty.title} has been marked as paid by our team.`
    } else if (validatedData.status === "FAILED") {
      notificationType = "PAYOUT_FAILED"
      title = "Payout failed"
      message = `Your payout request for ${payout.solution.bounty.title} was rejected. ${validatedData.notes || "Please contact support for more information."}`
    }

    await prisma.notification.create({
      data: {
        userId: payout.user.id,
        type: notificationType,
        title,
        message,
        link: `/dashboard`,
      },
    })

    // Log activity
    if (validatedData.status === "PAID" && admin) {
      await ActivityLogger.payoutPaid(
        payout.id,
        payout.solution.id,
        payout.netAmount,
        payout.solution.title,
        admin.id
      )
    } else if (validatedData.status === "FAILED" && admin) {
      await ActivityLogger.adminAction(
        admin.id,
        "Payout rejected",
        `Rejected payout of $${payout.netAmount.toFixed(2)} for solution: ${payout.solution.title}`
      )
    }

    return NextResponse.json({
      message: `Payout ${validatedData.status.toLowerCase()} successfully`,
      payout: updatedPayout,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error updating payout:", error)
    return NextResponse.json(
      { error: "Failed to update payout" },
      { status: 500 }
    )
  }
}