import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
  typescript: true,
})

export async function createStripeCustomer(email: string, name?: string) {
  const customer = await stripe.customers.create({
    email,
    name: name || undefined,
  })
  
  return customer
}

export async function createStripeConnectAccount(email: string) {
  const account = await stripe.accounts.create({
    type: "express",
    email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  })
  
  return account
}

export async function createStripeAccountLink(accountId: string, refreshUrl: string, returnUrl: string) {
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: "account_onboarding",
  })
  
  return accountLink
}

export async function createCheckoutSession({
  customerId,
  bountyId,
  bountyTitle,
  amount,
  successUrl,
  cancelUrl,
}: {
  customerId: string
  bountyId: string
  bountyTitle: string
  amount: number
  successUrl: string
  cancelUrl: string
}) {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Contribution to: ${bountyTitle}`,
            description: `Support the restoration of ${bountyTitle}`,
          },
          unit_amount: Math.round(amount * 100), // Convert to cents
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      bountyId,
    },
  })
  
  return session
}

export async function retrieveCheckoutSession(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId)
  return session
}

export async function createRefund(chargeId: string, amount?: number) {
  const refund = await stripe.refunds.create({
    charge: chargeId,
    amount: amount ? Math.round(amount * 100) : undefined,
  })
  
  return refund
}

export async function createConnectTransfer(connectedAccountId: string, amount: number, description?: string) {
  const transfer = await stripe.transfers.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency: "usd",
    destination: connectedAccountId,
    description: description || "Bounty payout",
  })
  
  return transfer
}

export async function getConnectAccountStatus(accountId: string) {
  const account = await stripe.accounts.retrieve(accountId)
  return {
    charges_enabled: account.charges_enabled,
    payouts_enabled: account.payouts_enabled,
    requirements: account.requirements,
  }
}