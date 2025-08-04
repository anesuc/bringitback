import { withAuth } from "next-auth/middleware"
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

// Protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/create',
  '/admin',
  '/api/bounties',
  '/api/user',
]

// Check if the path requires authentication
function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some(route => pathname.startsWith(route))
}

// Analytics tracking middleware
function trackingMiddleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Get or create session ID for analytics
  let sessionId = request.cookies.get('session-id')?.value
  if (!sessionId) {
    sessionId = uuidv4()
    response.cookies.set('session-id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })
  }

  // Add headers for analytics
  response.headers.set('x-session-id', sessionId)
  response.headers.set('x-pathname', request.nextUrl.pathname)
  response.headers.set('x-referrer', request.headers.get('referer') || '')
  
  return response
}

// Main middleware
export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // If it's a protected route, use withAuth
  if (isProtectedRoute(pathname)) {
    return (withAuth as any)(trackingMiddleware, {
      pages: {
        signIn: "/auth/signin",
      },
    })(request)
  }
  
  // Otherwise just apply tracking
  return trackingMiddleware(request)
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/create",
    "/api/bounties/:path*",
    "/api/user/:path*",
    "/",
    "/browse",
    "/bounty/:path*",
    "/about",
    "/admin/:path*",
  ],
}