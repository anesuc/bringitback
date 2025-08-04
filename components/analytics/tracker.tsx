"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { v4 as uuidv4 } from 'uuid'

export default function AnalyticsTracker() {
  const pathname = usePathname()
  
  useEffect(() => {
    // Track page view
    const trackView = async () => {
      try {
        // Get or create session ID
        let sessionId = document.cookie
          .split('; ')
          .find(row => row.startsWith('analytics-session='))
          ?.split('=')[1]
        
        if (!sessionId) {
          sessionId = uuidv4()
          // Set cookie for 30 days
          const expires = new Date()
          expires.setDate(expires.getDate() + 30)
          document.cookie = `analytics-session=${sessionId}; expires=${expires.toUTCString()}; path=/`
        }
        
        console.log('Tracking page view:', {
          sessionId,
          path: pathname,
          referrer: document.referrer,
        })
        
        // Extract bounty ID from path if applicable
        const bountyMatch = pathname.match(/\/bounty\/([a-zA-Z0-9]+)/)
        const bountyId = bountyMatch ? bountyMatch[1] : null
        
        // Detect if running on localhost
        const isLocalhost = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1' || 
                           window.location.hostname === '0.0.0.0'

        const response = await fetch('/api/analytics/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId,
            path: pathname,
            referrer: document.referrer,
            bountyId,
            isLocalhost,
          }),
        })
        
        if (!response.ok) {
          console.error('Analytics tracking failed:', await response.text())
        } else {
          console.log('Page view tracked successfully')
        }
      } catch (error) {
        console.error('Failed to track page view:', error)
      }
    }
    
    trackView()
  }, [pathname])
  
  return null
}