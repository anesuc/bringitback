#!/usr/bin/env tsx

import { prisma } from '../lib/prisma'

async function forceDeleteBounty(bountyId: string) {
  if (!bountyId) {
    console.error('❌ Please provide a bounty ID')
    console.log('Usage: tsx scripts/delete-bounty-force.ts <bounty-id>')
    process.exit(1)
  }

  try {
    console.log(`🔍 Looking for bounty with ID: ${bountyId}`)
    
    // Check if the bounty exists
    const bounty = await prisma.bounty.findUnique({
      where: { id: bountyId },
      select: { title: true }
    })

    if (!bounty) {
      console.error(`❌ Bounty with ID ${bountyId} not found`)
      process.exit(1)
    }

    console.log(`🗑️  Force deleting bounty: "${bounty.title}"`)
    
    // Delete related data in order to avoid foreign key constraints
    // Note: Some relations have onDelete: Cascade, but not all, so we'll be explicit
    
    // Delete activities
    await prisma.activity.deleteMany({
      where: { bountyId }
    })
    
    // Delete page views
    await prisma.pageView.deleteMany({
      where: { bountyId }
    })
    
    // Delete comments
    await prisma.comment.deleteMany({
      where: { bountyId }
    })
    
    // Delete updates
    await prisma.update.deleteMany({
      where: { bountyId }
    })
    
    // Delete milestones
    await prisma.milestone.deleteMany({
      where: { bountyId }
    })
    
    // Get solutions to delete their payouts
    const solutions = await prisma.solution.findMany({
      where: { bountyId },
      select: { id: true }
    })
    
    if (solutions.length > 0) {
      await prisma.payout.deleteMany({
        where: { solutionId: { in: solutions.map(s => s.id) } }
      })
    }
    
    // Delete solutions
    await prisma.solution.deleteMany({
      where: { bountyId }
    })
    
    // Get contributions to delete their refunds
    const contributions = await prisma.contribution.findMany({
      where: { bountyId },
      select: { id: true }
    })
    
    if (contributions.length > 0) {
      await prisma.refund.deleteMany({
        where: { contributionId: { in: contributions.map(c => c.id) } }
      })
    }
    
    // Delete contributions
    await prisma.contribution.deleteMany({
      where: { bountyId }
    })
    
    // Finally, delete the bounty
    await prisma.bounty.delete({
      where: { id: bountyId }
    })
    
    console.log('✅ Successfully deleted bounty and all related data!')
    
  } catch (error) {
    console.error('❌ Error deleting bounty:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Get bounty ID from command line arguments
const bountyId = process.argv[2]
forceDeleteBounty(bountyId)