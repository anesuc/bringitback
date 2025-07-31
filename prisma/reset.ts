import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🗑️  Starting database reset...")
  
  try {
    // Delete all data in reverse order of dependencies
    console.log("Deleting solution votes...")
    await prisma.solutionVote.deleteMany({})
    
    console.log("Deleting solutions...")
    await prisma.solution.deleteMany({})
    
    console.log("Deleting updates...")
    await prisma.update.deleteMany({})
    
    console.log("Deleting comments...")
    await prisma.comment.deleteMany({})
    
    console.log("Deleting notifications...")
    await prisma.notification.deleteMany({})
    
    console.log("Deleting saved bounties...")
    await prisma.savedBounty.deleteMany({})
    
    console.log("Deleting contributions...")
    await prisma.contribution.deleteMany({})
    
    console.log("Deleting milestones...")
    await prisma.milestone.deleteMany({})
    
    console.log("Deleting bounties...")
    await prisma.bounty.deleteMany({})
    
    console.log("Deleting sessions...")
    await prisma.session.deleteMany({})
    
    console.log("Deleting accounts...")
    await prisma.account.deleteMany({})
    
    console.log("Deleting verification tokens...")
    await prisma.verificationToken.deleteMany({})
    
    console.log("Deleting images...")
    await prisma.image.deleteMany({})
    
    console.log("Deleting users...")
    await prisma.user.deleteMany({})
    
    console.log("✅ Database reset complete! All data has been deleted.")
  } catch (error) {
    console.error("❌ Error resetting database:", error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })