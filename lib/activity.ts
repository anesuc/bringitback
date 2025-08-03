import { prisma } from "@/lib/prisma"
import { ActivityType } from "@prisma/client"

interface LogActivityParams {
  type: ActivityType
  title: string
  description: string
  userId?: string
  bountyId?: string
  contributionId?: string
  solutionId?: string
  payoutId?: string
  metadata?: Record<string, any>
}

export async function logActivity({
  type,
  title,
  description,
  userId,
  bountyId,
  contributionId,
  solutionId,
  payoutId,
  metadata,
}: LogActivityParams) {
  try {
    await prisma.activity.create({
      data: {
        type,
        title,
        description,
        userId,
        bountyId,
        contributionId,
        solutionId,
        payoutId,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    })
  } catch (error) {
    console.error("Failed to log activity:", error)
  }
}

// Helper functions for common activities
export const ActivityLogger = {
  userRegistered: (userId: string, userName: string) =>
    logActivity({
      type: "USER_REGISTERED",
      title: "New user registered",
      description: `${userName} joined the platform`,
      userId,
    }),

  bountyCreated: (userId: string, bountyId: string, bountyTitle: string) =>
    logActivity({
      type: "BOUNTY_CREATED",
      title: "New bounty created",
      description: `Created bounty: ${bountyTitle}`,
      userId,
      bountyId,
    }),

  contributionMade: (userId: string, contributionId: string, bountyId: string, amount: number, bountyTitle: string) =>
    logActivity({
      type: "CONTRIBUTION_MADE",
      title: "New contribution",
      description: `Contributed $${amount} to ${bountyTitle}`,
      userId,
      bountyId,
      contributionId,
      metadata: { amount },
    }),

  solutionSubmitted: (userId: string, solutionId: string, bountyId: string, solutionTitle: string, bountyTitle: string) =>
    logActivity({
      type: "SOLUTION_SUBMITTED",
      title: "Solution submitted",
      description: `Submitted solution "${solutionTitle}" for ${bountyTitle}`,
      userId,
      bountyId,
      solutionId,
    }),

  solutionAccepted: (solutionId: string, bountyId: string, solutionTitle: string, bountyTitle: string) =>
    logActivity({
      type: "SOLUTION_ACCEPTED",
      title: "Solution accepted",
      description: `Solution "${solutionTitle}" accepted for ${bountyTitle}`,
      bountyId,
      solutionId,
    }),

  payoutRequested: (userId: string, payoutId: string, solutionId: string, amount: number, solutionTitle: string) =>
    logActivity({
      type: "PAYOUT_REQUESTED",
      title: "Payout requested",
      description: `Requested payout of $${amount} for solution: ${solutionTitle}`,
      userId,
      solutionId,
      payoutId,
      metadata: { amount },
    }),

  payoutPaid: (payoutId: string, solutionId: string, amount: number, solutionTitle: string, adminId?: string) =>
    logActivity({
      type: "PAYOUT_PAID",
      title: "Payout marked as paid",
      description: `Payout of $${amount} marked as paid for solution: ${solutionTitle}`,
      userId: adminId,
      solutionId,
      payoutId,
      metadata: { amount },
    }),

  adminAction: (adminId: string, action: string, details: string) =>
    logActivity({
      type: "ADMIN_ACTION",
      title: "Admin action",
      description: `${action}: ${details}`,
      userId: adminId,
      metadata: { action },
    }),
}