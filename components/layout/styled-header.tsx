"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Target } from "lucide-react"

export function StyledHeader() {
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <Target className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-slate-900">ReviveIt</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/browse" className="text-slate-600 hover:text-slate-900 transition-colors">
              Browse
            </Link>
            <Link href="/create" className="text-slate-600 hover:text-slate-900 transition-colors">
              Create Bounty
            </Link>
            <Link href="/about" className="text-slate-600 hover:text-slate-900 transition-colors">
              About
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            {session ? (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <Button
                  size="sm"
                  className="bg-black hover:bg-gray-800 text-white"
                  asChild
                >
                  <Link href="/create">Create Bounty</Link>
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
                <Button
                  size="sm"
                  className="bg-black hover:bg-gray-800 text-white"
                  asChild
                >
                  <Link href="/auth/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}