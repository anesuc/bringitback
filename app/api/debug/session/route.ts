import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/session"

// GET /api/debug/session - Debug current session
export async function GET() {
  try {
    const user = await getCurrentUser()
    
    return NextResponse.json({
      user,
      isAdmin: user?.isAdmin,
      email: user?.email,
    })
  } catch (error) {
    console.error("Error getting session:", error)
    return NextResponse.json(
      { error: "Failed to get session" },
      { status: 500 }
    )
  }
}