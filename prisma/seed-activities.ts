import { PrismaClient } from "@prisma/client"
import { ActivityLogger } from "../lib/activity"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding sample activities...")

  // Get a sample user (you can update this email to match your test user)
  const user = await prisma.user.findFirst({
    where: { email: "anesuemail@gmail.com" }
  })

  if (!user) {
    console.log("❌ No user found. Please create a user first.")
    return
  }

  // Create some sample activities
  const activities = [
    {
      type: "USER_REGISTERED" as const,
      title: "New user registered",
      description: `${user.name || user.email} joined the platform`,
      userId: user.id,
    },
    {
      type: "BOUNTY_CREATED" as const,
      title: "New bounty created",
      description: "Created bounty: Nintendo DSi Shop Revival",
      userId: user.id,
      metadata: { amount: 250 },
    },
    {
      type: "CONTRIBUTION_MADE" as const,
      title: "New contribution",
      description: "Contributed $50 to Zune HD Revival",
      userId: user.id,
      metadata: { amount: 50 },
    },
    {
      type: "SOLUTION_SUBMITTED" as const,
      title: "Solution submitted",
      description: "Submitted solution 'Open Source Zune Server' for Zune HD Revival",
      userId: user.id,
    },
    {
      type: "PAYOUT_REQUESTED" as const,
      title: "Payout requested",
      description: "Requested payout of $125.50 for solution: Open Source Zune Server",
      userId: user.id,
      metadata: { amount: 125.50 },
    },
    {
      type: "ADMIN_ACTION" as const,
      title: "Admin action",
      description: "User review: Approved new bounty submission",
      userId: user.id,
      metadata: { action: "bounty_approval" },
    },
  ]

  for (const activity of activities) {
    await prisma.activity.create({
      data: {
        ...activity,
        metadata: activity.metadata ? JSON.stringify(activity.metadata) : null,
      },
    })
  }

  console.log(`✅ Created ${activities.length} sample activities`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)  
  })
  .finally(async () => {
    await prisma.$disconnect()
  })