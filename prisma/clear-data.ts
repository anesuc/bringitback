import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Clearing existing data...")
  
  // Delete in order to respect foreign key constraints
  await prisma.refund.deleteMany()
  await prisma.contribution.deleteMany()
  await prisma.milestone.deleteMany()
  await prisma.update.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.savedBounty.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.bounty.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.verificationToken.deleteMany()
  await prisma.user.deleteMany()
  
  console.log("All data cleared successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })