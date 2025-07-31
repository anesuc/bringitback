import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/session"
import { createStripeConnectAccount, createStripeAccountLink } from "@/lib/stripe"

// POST /api/user/stripe-connect - Create Stripe Connect account and onboarding link
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    let stripeConnectId = user.stripeConnectId

    // Create Stripe Connect account if doesn't exist
    if (!stripeConnectId) {
      const account = await createStripeConnectAccount(user.email)
      stripeConnectId = account.id

      await prisma.user.update({
        where: { id: user.id },
        data: { stripeConnectId },
      })
    }

    // Create account link for onboarding
    const accountLink = await createStripeAccountLink(
      stripeConnectId,
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/payouts`,
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/payouts?onboarding=complete`
    )

    return NextResponse.json({
      url: accountLink.url,
    })
  } catch (error) {
    console.error("Error creating Stripe Connect account:", error)
    return NextResponse.json(
      { error: "Failed to create Stripe Connect account" },
      { status: 500 }
    )
  }
}

// GET /api/user/stripe-connect - Get Stripe Connect account status
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    return NextResponse.json({
      hasStripeConnect: !!user.stripeConnectId,
      isOnboarded: user.stripeConnectOnboarded,
    })
  } catch (error) {
    console.error("Error fetching Stripe Connect status:", error)
    return NextResponse.json(
      { error: "Failed to fetch Stripe Connect status" },
      { status: 500 }
    )
  }
}