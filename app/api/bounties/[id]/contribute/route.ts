import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/session"
import { createCheckoutSession, createStripeCustomer } from "@/lib/stripe"
import { z } from "zod"

const contributeSchema = z.object({
  amount: z.number().min(1),
  message: z.string().optional(),
  anonymous: z.boolean().optional(),
})

// POST /api/bounties/[id]/contribute - Create a contribution
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
        id: true,
        title: true,
        status: true,
        fundingGoal: true,
        fundingCurrent: true,
      },
    })

    if (!bounty) {
      return NextResponse.json(
        { error: "Bounty not found" },
        { status: 404 }
      )
    }

    if (bounty.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Bounty is not accepting contributions" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = contributeSchema.parse(body)

    // Create or get Stripe customer
    let stripeCustomerId = user.stripeCustomerId
    if (!stripeCustomerId) {
      const customer = await createStripeCustomer(user.email, user.name || undefined)
      stripeCustomerId = customer.id

      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId },
      })
    }

    // Create contribution record
    const contribution = await prisma.contribution.create({
      data: {
        bountyId: params.id,
        userId: user.id,
        amount: validatedData.amount,
        message: validatedData.message,
        anonymous: validatedData.anonymous || false,
        status: "PENDING",
      },
    })

    // Create Stripe checkout session
    const session = await createCheckoutSession({
      customerId: stripeCustomerId,
      bountyId: bounty.id,
      bountyTitle: bounty.title,
      amount: validatedData.amount,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/bounty/${bounty.id}?contribution=success`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/bounty/${bounty.id}?contribution=cancelled`,
    })

    // Update contribution with Stripe session ID
    await prisma.contribution.update({
      where: { id: contribution.id },
      data: {
        stripeCheckoutSessionId: session.id,
      },
    })

    return NextResponse.json({
      checkoutUrl: session.url,
      sessionId: session.id,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating contribution:", error)
    return NextResponse.json(
      { error: "Failed to create contribution" },
      { status: 500 }
    )
  }
}