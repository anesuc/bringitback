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
    
    // Delete the bounty (cascade will handle related data due to onDelete: Cascade in schema)
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