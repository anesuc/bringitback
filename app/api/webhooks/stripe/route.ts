import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get("Stripe-Signature") as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error("Webhook signature verification failed:", error)
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    )
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

        // Update bounty funding amount
        const contribution = await prisma.contribution.findUnique({
          where: {
            stripeCheckoutSessionId: session.id,
          },
          include: {
            bounty: true,
          },
        })

        if (contribution) {
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

          // Check if bounty is fully funded
          const updatedBounty = await prisma.bounty.findUnique({
            where: {
              id: contribution.bountyId,
            },
          })

          if (updatedBounty && updatedBounty.fundingCurrent >= updatedBounty.fundingGoal) {
            await prisma.bounty.update({
              where: {
                id: contribution.bountyId,
              },
              data: {
                status: "FUNDED",
              },
            })

            // Create notification for bounty creator
            await prisma.notification.create({
              data: {
                userId: updatedBounty.creatorId,
                type: "BOUNTY_FUNDED",
                title: "Your bounty has been fully funded!",
                message: `${updatedBounty.title} has reached its funding goal of $${updatedBounty.fundingGoal}`,
                link: `/bounty/${updatedBounty.id}`,
              },
            })
          }

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