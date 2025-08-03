import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/session"
import { stripe } from "@/lib/stripe"

// POST /api/stripe/connect/onboard - Create Stripe Connect onboarding link
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

    // Create Stripe Connect account if it doesn't exist
    if (!stripeConnectId) {
      const account = await stripe.accounts.create({
        type: "express",
        country: "US",
        email: user.email,
        business_profile: {
          name: user.name || undefined,
        },
      })

      stripeConnectId = account.id

      // Update user with Stripe Connect ID
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeConnectId },
      })
    }

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: stripeConnectId,
      refresh_url: `${process.env.NEXTAUTH_URL}/dashboard?stripe_refresh=true`,
      return_url: `${process.env.NEXTAUTH_URL}/dashboard?stripe_onboarded=true`,
      type: "account_onboarding",
    })

    return NextResponse.json({
      url: accountLink.url,
    })
  } catch (error) {
    console.error("Error creating Stripe Connect onboarding link:", error)
    return NextResponse.json(
      { error: "Failed to create onboarding link" },
      { status: 500 }
    )
  }
}

// GET /api/stripe/connect/onboard - Check onboarding status
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    if (!user.stripeConnectId) {
      return NextResponse.json({
        onboarded: false,
        charges_enabled: false,
        payouts_enabled: false,
      })
    }

    // Check account status with Stripe
    const account = await stripe.accounts.retrieve(user.stripeConnectId)

    const isOnboarded = account.charges_enabled && account.payouts_enabled

    // Update user's onboarding status if it has changed
    if (isOnboarded !== user.stripeConnectOnboarded) {
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeConnectOnboarded: isOnboarded },
      })
    }

    return NextResponse.json({
      onboarded: isOnboarded,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      requirements: account.requirements,
    })
  } catch (error) {
    console.error("Error checking Stripe Connect status:", error)
    return NextResponse.json(
      { error: "Failed to check onboarding status" },
      { status: 500 }
    )
  }
}