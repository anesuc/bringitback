import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { trackPageView } from "@/lib/analytics"
import { getCurrentUser } from "@/lib/session"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const headersList = await headers()
    const user = await getCurrentUser()
    
    // Get session ID from cookie or body
    const cookieHeader = headersList.get('cookie')
    const sessionId = cookieHeader?.match(/session-id=([^;]+)/)?.[1] || body.sessionId
    
    console.log('Analytics track request:', {
      sessionId,
      userId: user?.id,
      path: body.path,
      hasCookie: !!cookieHeader,
      cookieValue: cookieHeader,
    })
    
    // Get IP and geo info (in production, you'd use a service like ipinfo.io)
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || '127.0.0.1'
    const country = headersList.get('x-vercel-ip-country') || 'US'
    const city = headersList.get('x-vercel-ip-city') || 'Unknown'
    
    await trackPageView({
      sessionId: sessionId || 'anonymous-' + Date.now(),
      userId: user?.id,
      path: body.path,
      referrer: body.referrer,
      userAgent: headersList.get('user-agent'),
      ip,
      country,
      city,
      bountyId: body.bountyId,
      isLocalhost: body.isLocalhost || false,
    })
    
    console.log('Page view tracked successfully')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to track page view:", error)
    return NextResponse.json({ error: "Failed to track" }, { status: 500 })
  }
}