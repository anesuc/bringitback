import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma" 
import { getCurrentUser } from "@/lib/session"
import { ActivityLogger } from "@/lib/activity"

// GET /api/solutions/[id]/payout - Get payout status for a solution
export async function GET(
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

    const solution = await prisma.solution.findUnique({
      where: { id },
      include: {
        bounty: {
          select: {
            id: true,
            title: true,
            fundingCurrent: true,
          },
        },
        submitter: {
          select: {
            id: true,
            stripeConnectId: true,
            stripeConnectOnboarded: true,
          },
        },
        payouts: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    })

    if (!solution) {
      return NextResponse.json(
        { error: "Solution not found" },
        { status: 404 }
      )
    }

    // Check if user is the solution submitter
    if (solution.submitterId !== user.id) {
      return NextResponse.json(
        { error: "Only the solution submitter can view payout information" },
        { status: 403 }
      )
    }

    // Check if solution is accepted
    if (solution.status !== "ACCEPTED") {
      return NextResponse.json(
        { error: "Solution must be accepted to request payout" },
        { status: 400 }
      )
    }

    // Calculate payout details
    const totalAmount = solution.bounty.fundingCurrent
    const platformFeeRate = 0.05 // 5% platform fee
    const platformFee = totalAmount * platformFeeRate
    const stripeFeeRate = 0.029 + 0.30 // Stripe's standard rate: 2.9% + 30¢
    const processingFee = totalAmount * stripeFeeRate
    const netAmount = totalAmount - platformFee - processingFee

    const latestPayout = solution.payouts[0]

    return NextResponse.json({
      solution: {
        id: solution.id,
        title: solution.title,
        status: solution.status,
      },
      bounty: solution.bounty,
      payout: {
        totalAmount,
        platformFee,
        processingFee,
        netAmount,
        canRequest: !latestPayout || latestPayout.status === "FAILED",
        stripeConnectRequired: !solution.submitter.stripeConnectOnboarded,
      },
      latestPayout,
    })
  } catch (error) {
    console.error("Error fetching payout information:", error)
    return NextResponse.json(
      { error: "Failed to fetch payout information" },
      { status: 500 }
    )
  }
}

// POST /api/solutions/[id]/payout - Request a payout for an accepted solution
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

    const solution = await prisma.solution.findUnique({
      where: { id },
      include: {
        bounty: {
          select: {
            id: true,
            title: true,
            fundingCurrent: true,
          },
        },
        submitter: {
          select: {
            id: true,
            stripeConnectId: true,
            stripeConnectOnboarded: true,
          },
        },
        payouts: {
          where: {
            status: {
              not: "FAILED"
            }
          }
        },
      },
    })

    if (!solution) {
      return NextResponse.json(
        { error: "Solution not found" },
        { status: 404 }
      )
    }

    // Check if user is the solution submitter
    if (solution.submitterId !== user.id) {
      return NextResponse.json(
        { error: "Only the solution submitter can request payout" },
        { status: 403 }
      )
    }

    // Check if solution is accepted
    if (solution.status !== "ACCEPTED") {
      return NextResponse.json(
        { error: "Solution must be accepted to request payout" },
        { status: 400 }
      )
    }

    // Note: Stripe Connect check removed - payouts are now handled manually by admins

    // Check if there's already a pending or completed payout
    if (solution.payouts.length > 0) {
      return NextResponse.json(
        { error: "Payout has already been requested for this solution" },
        { status: 400 }
      )
    }

    // Calculate payout amounts
    const totalAmount = solution.bounty.fundingCurrent
    const platformFeeRate = 0.05 // 5% platform fee
    const platformFee = totalAmount * platformFeeRate
    const stripeFeeRate = 0.029 + 0.30 // Stripe's standard rate: 2.9% + 30¢
    const processingFee = totalAmount * stripeFeeRate
    const netAmount = totalAmount - platformFee - processingFee

    // Create payout record (manual processing by admin)
    const payout = await prisma.payout.create({
      data: {
        solutionId: id,
        userId: user.id,
        amount: totalAmount,
        platformFee,
        processingFee,
        netAmount,
        status: "PENDING",
      },
    })

    // Notify the user that payout request was received
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: "PAYOUT_REQUESTED",
        title: "Payout request received",
        message: `Your payout request for ${solution.bounty.title} has been received. Our team will contact you within 2-3 business days with payment details. Amount: $${netAmount.toFixed(2)} (after fees).`,
        link: `/dashboard`,
      },
    })

    // Notify admins about the new payout request
    const admins = await prisma.user.findMany({
      where: { isAdmin: true },
      select: { id: true },
    })

    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          type: "PAYOUT_REQUESTED",
          title: "New payout request",
          message: `${user.name || user.email} requested a payout of $${netAmount.toFixed(2)} for solution: ${solution.title}`,
          link: `/admin/payouts`,
        },
      })
    }

    // Log activity
    await ActivityLogger.payoutRequested(
      user.id,
      payout.id,
      solution.id,
      netAmount,
      solution.title
    )

    return NextResponse.json({
      message: "Payout request submitted successfully. Our team will contact you within 2-3 business days.",
      payout: {
        id: payout.id,
        amount: totalAmount,
        platformFee,
        processingFee,
        netAmount,
        status: payout.status,
      },
    })
  } catch (error) {
    console.error("Error requesting payout:", error)
    return NextResponse.json(
      { error: "Failed to request payout" },
      { status: 500 }
    )
  }
}