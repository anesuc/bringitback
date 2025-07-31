import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import AuthSessionProvider from "@/components/auth/session-provider"
import { MainLayout } from "@/components/layout/main-layout"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ReviveIt - Crowdfund Bounties to Restore Discontinued Products",
  description:
    "Fund bounties to restore discontinued products and services. When companies shut down what we love, we come together to revive it.",
    generator: 'v0.dev'
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
          <MainLayout>{children}</MainLayout>
        </AuthSessionProvider>
      </body>
    </html>
  )
}
