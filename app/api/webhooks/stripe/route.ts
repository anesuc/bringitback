import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"

// This is needed for Stripe webhooks to work properly
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get("Stripe-Signature") as string

  // Debug logging
  console.log("Webhook received:")
  console.log("Signature:", signature)
  console.log("Body length:", body.length)
  console.log("Webhook secret exists:", !!process.env.STRIPE_WEBHOOK_SECRET)

  // Check if we have the required values
  if (!signature) {
    console.error("No Stripe signature found")
    return NextResponse.json(
      { error: "No Stripe signature found" },
      { status: 400 }
    )
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("STRIPE_WEBHOOK_SECRET not configured")
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
    console.log("Webhook event constructed successfully:", event.type)
  } catch (error) {
    console.error("Webhook signature verification failed:", error)
    console.error("Expected secret starts with:", process.env.STRIPE_WEBHOOK_SECRET?.substring(0, 10))
    
    // For development only - temporarily skip signature verification
    if (process.env.NODE_ENV === 'development') {
      console.log("DEVELOPMENT MODE: Parsing webhook without signature verification")
      try {
        event = JSON.parse(body)
        console.log("Successfully parsed webhook event:", event.type)
      } catch (parseError) {
        console.error("Failed to parse webhook body as JSON:", parseError)
        return NextResponse.json(
          { error: "Invalid webhook payload" },
          { status: 400 }
        )
      }
    } else {
      return NextResponse.json(
        { error: "Webhook signature verification failed" },
        { status: 400 }
      )
    }
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        
        // Update contribution status
        await prisma.contribution.update({
          where: {
            stripeCheckoutSessionId: session.id,
          },
          data: {
            status: "COMPLETED",
            stripePaymentIntentId: session.payment_intent as string,
          },
        })

        // Get contribution details
        const contribution = await prisma.contribution.findUnique({
          where: {
            stripeCheckoutSessionId: session.id,
          },
          include: {
            bounty: true,
          },
        })

        if (contribution) {
          // Update bounty funding amount
          await prisma.bounty.update({
            where: {
              id: contribution.bountyId,
            },
            data: {
              fundingCurrent: {
                increment: contribution.amount,
              },
            },
          })

          // Create notification for bounty creator  
          await prisma.notification.create({
            data: {
              userId: contribution.bounty.creatorId,
              type: "BOUNTY_FUNDED",
              title: "New contribution received!",
              message: `Someone contributed $${contribution.amount} to ${contribution.bounty.title}`,
              link: `/bounty/${contribution.bountyId}`,
            },
          })

          // Create notification for contributor
          await prisma.notification.create({
            data: {
              userId: contribution.userId,
              type: "CONTRIBUTION_RECEIVED", 
              title: "Thank you for your contribution!",
              message: `Your contribution of $${contribution.amount} to ${contribution.bounty.title} has been received.`,
              link: `/bounty/${contribution.bountyId}`,
            },
          })
        }
        break
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge
        
        // Update contribution status
        await prisma.contribution.update({
          where: {
            stripeChargeId: charge.id,
          },
          data: {
            status: "REFUNDED",
          },
        })

        // Update bounty funding amount
        const contribution = await prisma.contribution.findUnique({
          where: {
            stripeChargeId: charge.id,
          },
        })

        if (contribution) {
          await prisma.bounty.update({
            where: {
              id: contribution.bountyId,
            },
            data: {
              fundingCurrent: {
                decrement: contribution.amount,
              },
            },
          })

          // Create refund record
          await prisma.refund.create({
            data: {
              contributionId: contribution.id,
              amount: charge.amount_refunded / 100,
              status: "COMPLETED",
              stripeRefundId: charge.refunds.data[0]?.id,
              processedAt: new Date(),
            },
          })

          // Create notification
          await prisma.notification.create({
            data: {
              userId: contribution.userId,
              type: "REFUND_PROCESSED",
              title: "Refund processed",
              message: `Your refund of $${charge.amount_refunded / 100} has been processed.`,
              link: `/bounty/${contribution.bountyId}`,
            },
          })
        }
        break
      }

      case "account.updated": {
        const account = event.data.object as Stripe.Account
        
        // Update user's Stripe Connect status
        if (account.charges_enabled && account.payouts_enabled) {
          await prisma.user.update({
            where: {
              stripeConnectId: account.id,
            },
            data: {
              stripeConnectOnboarded: true,
            },
          })
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    )
  }
}