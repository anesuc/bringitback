import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin"

// GET /api/admin/stats - Get platform statistics
export async function GET() {
  // Check admin access
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  try {
    // Get all stats in parallel
    const [
      totalUsers,
      totalBounties,
      activeBounties,
      completedBounties,
      totalContributions,
      totalFunding,
      pendingPayouts,
      completedPayouts,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.bounty.count({
        where: { status: { not: "DRAFT" } }
      }),
      prisma.bounty.count({
        where: { status: "ACTIVE" }
      }),
      prisma.bounty.count({
        where: { status: "COMPLETED" }
      }),
      prisma.contribution.count({
        where: { status: "COMPLETED" }
      }),
      prisma.contribution.aggregate({
        where: { status: "COMPLETED" },
        _sum: { amount: true }
      }),
      prisma.payout.count({
        where: { status: "PENDING" }
      }),
      prisma.payout.count({
        where: { status: "COMPLETED" }
      }),
    ])

    return NextResponse.json({
      totalUsers,
      totalBounties,
      activeBounties,
      completedBounties,
      totalContributions,
      totalDonations: totalFunding._sum.amount || 0,
      pendingPayouts,
      completedPayouts,
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    )
  }
}