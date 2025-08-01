import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      stripeCustomerId?: string | null
      stripeConnectId?: string | null
      stripeConnectOnboarded?: boolean
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    stripeCustomerId?: string | null
    stripeConnectId?: string | null
    stripeConnectOnboarded?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    stripeCustomerId?: string | null
    stripeConnectId?: string | null
    stripeConnectOnboarded?: boolean
  }
}