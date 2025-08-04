import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Get total count of page views
    const totalPageViews = await prisma.pageView.count()
    
    // Get last 10 page views
    const recentPageViews = await prisma.pageView.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        sessionId: true,
        path: true,
        country: true,
        device: true,
        browser: true,
        createdAt: true,
      },
    })
    
    // Get unique sessions count
    const uniqueSessions = await prisma.pageView.groupBy({
      by: ['sessionId'],
    })
    
    return NextResponse.json({
      totalPageViews,
      uniqueSessions: uniqueSessions.length,
      recentPageViews,
      message: totalPageViews === 0 ? 
        "No page views recorded yet. Make sure to visit some pages and check the browser console for tracking logs." :
        "Analytics data is being collected successfully!"
    })
  } catch (error) {
    console.error("Debug analytics error:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics data", details: error },
      { status: 500 }
    )
  }
}