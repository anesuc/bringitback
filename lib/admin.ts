import { getCurrentUser } from "@/lib/session"
import { NextResponse } from "next/server"

export async function isAdmin() {
  const user = await getCurrentUser()
  return user?.isAdmin === true
}

export async function requireAdmin() {
  const user = await getCurrentUser()
  
  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }
  
  if (!user.isAdmin) {
    return NextResponse.json(
      { error: "Admin access required" },
      { status: 403 }
    )
  }
  
  return null // Continue if admin
}