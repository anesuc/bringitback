"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, Plus, User, LogOut, LayoutDashboard, Shield } from "lucide-react"

export function Navbar() {
  const { data: session, update } = useSession()
  const [isAdmin, setIsAdmin] = useState<boolean>(false)
  
  // Debug logging
  console.log("Session in navbar:", session?.user)
  
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
    <nav className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-xl">
            ReviveIt
          </Link>
          <Link href="/browse" className="text-sm font-medium hover:text-primary">
            Browse
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {session ? (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link href="/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Bounty
                </Link>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session.user.image || ""} />
                      <AvatarFallback>
                        {session.user.name?.[0] || session.user.email?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {session.user.name || "User"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session.user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/saved">
                      <Heart className="mr-2 h-4 w-4" />
                      Saved Bounties
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
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
                    onClick={() => signOut()}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}