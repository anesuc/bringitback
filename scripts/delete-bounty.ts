#!/usr/bin/env tsx

import { prisma } from '../lib/prisma'

async function deleteBounty(bountyId: string) {
  if (!bountyId) {
    console.error('❌ Please provide a bounty ID')
    console.log('Usage: tsx scripts/delete-bounty.ts <bounty-id>')
    process.exit(1)
  }

  try {
    console.log(`🔍 Looking for bounty with ID: ${bountyId}`)
    
    // First, check if the bounty exists
    const bounty = await prisma.bounty.findUnique({
      where: { id: bountyId },
      include: {
        _count: {
          select: {
            contributions: true,
            solutions: true,
            comments: true,
            updates: true,
            milestones: true,
            activities: true,
            pageViews: true,
          }
        }
      }
    })

    if (!bounty) {
      console.error(`❌ Bounty with ID ${bountyId} not found`)
      process.exit(1)
    }

    console.log(`\n📊 Bounty found: "${bounty.title}"`)
    console.log('Related data:')
    console.log(`  - ${bounty._count.contributions} contributions`)
    console.log(`  - ${bounty._count.solutions} solutions`)
    console.log(`  - ${bounty._count.comments} comments`)
    console.log(`  - ${bounty._count.updates} updates`)
    console.log(`  - ${bounty._count.milestones} milestones`)
    console.log(`  - ${bounty._count.activities} activities`)
    console.log(`  - ${bounty._count.pageViews} page views`)
    
    // Prompt for confirmation
    console.log('\n⚠️  WARNING: This will permanently delete the bounty and ALL related data!')
    console.log('Type "DELETE" to confirm, or anything else to cancel:')
    
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    })
    
    const answer = await new Promise<string>((resolve) => {
      readline.question('> ', (answer) => {
        readline.close()
        resolve(answer)
      })
    })
    
    if (answer !== 'DELETE') {
      console.log('❌ Deletion cancelled')
      process.exit(0)
    }
    
    console.log('\n🗑️  Deleting bounty and related data...')
    
    // Delete related data in order (handling foreign key constraints)
    // Note: Most of these have onDelete: Cascade in the schema, but we'll be explicit
    
    // Delete related activities
    const deletedActivities = await prisma.activity.deleteMany({
      where: { bountyId }
    })
    console.log(`  ✓ Deleted ${deletedActivities.count} activities`)
    
    // Delete page views
    const deletedPageViews = await prisma.pageView.deleteMany({
      where: { bountyId }
    })
    console.log(`  ✓ Deleted ${deletedPageViews.count} page views`)
    
    // Delete comments
    const deletedComments = await prisma.comment.deleteMany({
      where: { bountyId }
    })
    console.log(`  ✓ Deleted ${deletedComments.count} comments`)
    
    // Delete updates
    const deletedUpdates = await prisma.update.deleteMany({
      where: { bountyId }
    })
    console.log(`  ✓ Deleted ${deletedUpdates.count} updates`)
    
    // Delete milestones
    const deletedMilestones = await prisma.milestone.deleteMany({
      where: { bountyId }
    })
    console.log(`  ✓ Deleted ${deletedMilestones.count} milestones`)
    
    // Delete payouts from solutions
    const solutions = await prisma.solution.findMany({
      where: { bountyId },
      select: { id: true }
    })
    const solutionIds = solutions.map(s => s.id)
    
    if (solutionIds.length > 0) {
      const deletedPayouts = await prisma.payout.deleteMany({
        where: { solutionId: { in: solutionIds } }
      })
      console.log(`  ✓ Deleted ${deletedPayouts.count} payouts`)
    }
    
    // Delete solutions
    const deletedSolutions = await prisma.solution.deleteMany({
      where: { bountyId }
    })
    console.log(`  ✓ Deleted ${deletedSolutions.count} solutions`)
    
    // Delete refunds from contributions
    const contributions = await prisma.contribution.findMany({
      where: { bountyId },
      select: { id: true }
    })
    const contributionIds = contributions.map(c => c.id)
    
    if (contributionIds.length > 0) {
      const deletedRefunds = await prisma.refund.deleteMany({
        where: { contributionId: { in: contributionIds } }
      })
      console.log(`  ✓ Deleted ${deletedRefunds.count} refunds`)
    }
    
    // Delete contributions
    const deletedContributions = await prisma.contribution.deleteMany({
      where: { bountyId }
    })
    console.log(`  ✓ Deleted ${deletedContributions.count} contributions`)
    
    // Finally, delete the bounty itself
    await prisma.bounty.delete({
      where: { id: bountyId }
    })
    console.log(`  ✓ Deleted bounty`)
    
    console.log('\n✅ Successfully deleted bounty and all related data!')
    
  } catch (error) {
    console.error('❌ Error deleting bounty:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Get bounty ID from command line arguments
const bountyId = process.argv[2]
deleteBounty(bountyId)