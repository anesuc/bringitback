import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import AuthSessionProvider from "@/components/auth/session-provider"
import { StyledHeader } from "@/components/layout/styled-header"
import { Toaster } from "sonner"
import AnalyticsTracker from "@/components/analytics/tracker"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ReviveIt - Crowdfund Bounties to Restore Discontinued Products",
  description:
    "Donate to bounties to restore discontinued products and services. When companies shut down what we love, we come together to revive it.",
  generator: 'v0.dev',
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  manifest: "/site.webmanifest",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthSessionProvider>
          <AnalyticsTracker />
          <StyledHeader />
          {children}
          <Toaster position="top-right" />
        </AuthSessionProvider>
      </body>
    </html>
  )
}
