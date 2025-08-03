import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2]
  
  if (!email) {
    console.log("Usage: npx tsx prisma/make-admin.ts <email>")
    process.exit(1)
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      console.log(`❌ User with email ${email} not found`)
      process.exit(1)
    }

    await prisma.user.update({
      where: { email },
      data: { isAdmin: true }
    })

    console.log(`✅ User ${email} is now an admin!`)
  } catch (error) {
    console.error("❌ Error making user admin:", error)
    process.exit(1)
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