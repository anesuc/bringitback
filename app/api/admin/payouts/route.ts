import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin"

// GET /api/admin/payouts - Get all payout requests
export async function GET() {
  // Check admin access
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  try {
    const payouts = await prisma.payout.findMany({
      orderBy: { requestedAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        solution: {
          select: {
            id: true,
            title: true,
            bounty: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json({ payouts })
  } catch (error) {
    console.error("Error fetching payouts:", error)
    return NextResponse.json(
      { error: "Failed to fetch payouts" },
      { status: 500 }
    )
  }
}