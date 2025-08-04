import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/session"
import { getAnalytics } from "@/lib/analytics"

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()
    
    // Check if user is admin
    if (!user?.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get("days") || "7")
    
    const analytics = await getAnalytics(days)
    
    return NextResponse.json(analytics)
  } catch (error) {
    console.error("Failed to get analytics:", error)
    return NextResponse.json(
      { error: "Failed to get analytics" },
      { status: 500 }
    )
  }
}