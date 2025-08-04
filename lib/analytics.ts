import { prisma } from "@/lib/prisma"
import { createHash } from "crypto"
import { UAParser } from "ua-parser-js"

// Helper to hash IP for privacy
function hashIP(ip: string): string {
  return createHash('sha256').update(ip).digest('hex').substring(0, 16)
}

// Helper to get device type
function getDeviceType(ua: UAParser.IResult): string {
  const device = ua.device.type
  if (device === 'mobile') return 'mobile'
  if (device === 'tablet') return 'tablet'
  return 'desktop'
}

// Track a page view
export async function trackPageView({
  sessionId,
  userId,
  path,
  referrer,
  userAgent,
  ip,
  country,
  city,
  bountyId,
}: {
  sessionId: string
  userId?: string | null
  path: string
  referrer?: string | null
  userAgent?: string | null
  ip?: string | null
  country?: string | null
  city?: string | null
  bountyId?: string | null
}) {
  try {
    // Parse user agent
    let browser, os, device
    if (userAgent) {
      const parser = new UAParser(userAgent)
      const result = parser.getResult()
      browser = result.browser.name
      os = result.os.name
      device = getDeviceType(result)
    }

    // Create page view record
    await prisma.pageView.create({
      data: {
        sessionId,
        userId,
        path,
        referrer,
        userAgent,
        ip: ip ? hashIP(ip) : null,
        country,
        city,
        device,
        browser,
        os,
        bountyId,
      },
    })

    // Update bounty view count if applicable
    if (bountyId) {
      await prisma.bounty.update({
        where: { id: bountyId },
        data: { viewCount: { increment: 1 } },
      })
    }
  } catch (error) {
    console.error("Failed to track page view:", error)
  }
}

// Get analytics data for admin dashboard
export async function getAnalytics(days: number = 7) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  // Get total page views
  const totalPageViews = await prisma.pageView.count({
    where: {
      createdAt: { gte: startDate },
    },
  })

  // Get unique visitors (unique sessions)
  const uniqueVisitors = await prisma.pageView.groupBy({
    by: ['sessionId'],
    where: {
      createdAt: { gte: startDate },
    },
  })

  // Get page views by country
  const pageViewsByCountry = await prisma.pageView.groupBy({
    by: ['country'],
    _count: {
      country: true,
    },
    where: {
      createdAt: { gte: startDate },
      country: { not: null },
    },
    orderBy: {
      _count: {
        country: 'desc',
      },
    },
    take: 10,
  })

  // Get page views by path
  const pageViewsByPath = await prisma.pageView.groupBy({
    by: ['path'],
    _count: {
      path: true,
    },
    where: {
      createdAt: { gte: startDate },
    },
    orderBy: {
      _count: {
        path: 'desc',
      },
    },
    take: 10,
  })

  // Get device breakdown
  const deviceBreakdown = await prisma.pageView.groupBy({
    by: ['device'],
    _count: {
      device: true,
    },
    where: {
      createdAt: { gte: startDate },
      device: { not: null },
    },
  })

  // Get browser breakdown
  const browserBreakdown = await prisma.pageView.groupBy({
    by: ['browser'],
    _count: {
      browser: true,
    },
    where: {
      createdAt: { gte: startDate },
      browser: { not: null },
    },
    orderBy: {
      _count: {
        browser: 'desc',
      },
    },
    take: 5,
  })

  // Get hourly traffic for the last 24 hours
  const last24Hours = new Date()
  last24Hours.setHours(last24Hours.getHours() - 24)
  
  const hourlyTraffic = await prisma.pageView.aggregateRaw({
    pipeline: [
      {
        $match: {
          createdAt: { $gte: { $date: last24Hours.toISOString() } },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d %H:00",
              date: "$createdAt",
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ],
  })

  // Get top referrers
  const topReferrers = await prisma.pageView.groupBy({
    by: ['referrer'],
    _count: {
      referrer: true,
    },
    where: {
      createdAt: { gte: startDate },
      referrer: { 
        not: null,
        notIn: ['', '/'],
      },
    },
    orderBy: {
      _count: {
        referrer: 'desc',
      },
    },
    take: 10,
  })

  // Get most viewed bounties
  const mostViewedBounties = await prisma.bounty.findMany({
    where: {
      viewCount: { gt: 0 },
    },
    orderBy: {
      viewCount: 'desc',
    },
    take: 10,
    select: {
      id: true,
      title: true,
      viewCount: true,
    },
  })

  return {
    totalPageViews,
    uniqueVisitors: uniqueVisitors.length,
    pageViewsByCountry: pageViewsByCountry.map(item => ({
      country: item.country || 'Unknown',
      count: item._count.country,
    })),
    pageViewsByPath: pageViewsByPath.map(item => ({
      path: item.path,
      count: item._count.path,
    })),
    deviceBreakdown: deviceBreakdown.map(item => ({
      device: item.device || 'Unknown',
      count: item._count.device,
    })),
    browserBreakdown: browserBreakdown.map(item => ({
      browser: item.browser || 'Unknown',
      count: item._count.browser,
    })),
    hourlyTraffic: (hourlyTraffic as any[]).map(item => ({
      hour: item._id,
      count: item.count,
    })),
    topReferrers: topReferrers.map(item => ({
      referrer: item.referrer || 'Direct',
      count: item._count.referrer,
    })),
    mostViewedBounties,
  }
}