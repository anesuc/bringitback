"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Target, User, LogOut, Shield, Menu, X } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function StyledHeader() {
  const { data: session, update } = useSession()
  const [isAdmin, setIsAdmin] = useState<boolean>(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Debug logging
  console.log('Session data in header:', {
    name: session?.user?.name,
    email: session?.user?.email,
    image: session?.user?.image,
    isAdmin: session?.user?.isAdmin
  })
  
  // Check admin status from session or API fallback
  useEffect(() => {
    if (session?.user) {
      console.log("Checking admin status - session.user.isAdmin:", session.user.isAdmin)
      if (session.user.isAdmin !== undefined) {
        console.log("Using session isAdmin value:", session.user.isAdmin)
        setIsAdmin(session.user.isAdmin)
      } else {
        console.log("session.user.isAdmin is undefined, checking via API fallback...")
        // Fallback: check via API if session doesn't have isAdmin
        fetch('/api/debug/session')
          .then(res => res.json())
          .then(data => {
            console.log("API response isAdmin:", data.isAdmin)
            setIsAdmin(data.isAdmin || false)
            // Also force session update
            console.log("Forcing session update...")
            update()
          })
          .catch(err => {
            console.log("API fallback failed:", err)
            setIsAdmin(false)
          })
      }
    } else {
      console.log("No session user found")
    }
  }, [session, update])
  
  console.log("Final isAdmin state:", isAdmin)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <Target className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-slate-900">ReviveIt</span>
          </Link>

          {/* Desktop Navigation */}
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

          {/* Desktop Auth & User Menu */}
          <div className="hidden md:flex items-center space-x-4">
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarImage 
                          src={session.user?.image || undefined} 
                          alt={session.user?.name || 'User'}
                        />
                        <AvatarFallback>
                          {session.user?.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("") || <User className="h-4 w-4" />}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        {session.user?.name && <p className="font-medium">{session.user.name}</p>}
                        {session.user?.email && (
                          <p className="w-[200px] truncate text-sm text-muted-foreground">
                            {session.user.email}
                          </p>
                        )}
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">
                        <User className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/admin">
                            <Shield className="mr-2 h-4 w-4" />
                            Admin Dashboard
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onSelect={() => signOut({ callbackUrl: "/" })}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-slate-200">
              {/* Navigation Links */}
              <Link
                href="/browse"
                className="block px-3 py-2 text-base font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Browse
              </Link>
              <Link
                href="/create"
                className="block px-3 py-2 text-base font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Create Bounty
              </Link>
              <Link
                href="/about"
                className="block px-3 py-2 text-base font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>

              {/* User Section */}
              {session ? (
                <div className="border-t border-slate-200 pt-4 mt-4">
                  <div className="flex items-center px-3 py-2">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage src={session.user?.image || undefined} />
                      <AvatarFallback>
                        {session.user?.name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("") || <User className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <p className="font-medium text-slate-900">{session.user?.name}</p>
                      <p className="text-sm text-slate-500 truncate">{session.user?.email}</p>
                    </div>
                  </div>
                  
                  <Link
                    href="/dashboard"
                    className="block px-3 py-2 text-base font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="inline h-4 w-4 mr-2" />
                    Dashboard
                  </Link>
                  
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="block px-3 py-2 text-base font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-md"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Shield className="inline h-4 w-4 mr-2" />
                      Admin Dashboard
                    </Link>
                  )}
                  
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      signOut({ callbackUrl: "/" })
                    }}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-md"
                  >
                    <LogOut className="inline h-4 w-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="border-t border-slate-200 pt-4 mt-4 space-y-2">
                  <Link
                    href="/auth/signin"
                    className="block px-3 py-2 text-base font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="block px-3 py-2 text-base font-medium bg-black text-white hover:bg-gray-800 rounded-md text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}