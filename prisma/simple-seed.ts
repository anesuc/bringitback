import { PrismaClient, Category, BountyStatus } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // Create a sample user
  const user = await prisma.user.upsert({
    where: { email: "creator@example.com" },
    update: {},
    create: {
      email: "creator@example.com",
      name: "Sarah Chen",
      bio: "Former Microsoft engineer passionate about restoring discontinued products",
    },
  })

  console.log("Creating Zune HD bounty...")

  // Create the Zune HD bounty
  const bounty = await prisma.bounty.create({
    data: {
      title: "Zune HD",
      company: "Microsoft",
      category: "ENTERTAINMENT" as Category,
      description: "Restore functionality to the innovative Zune HD media player that people purchased but can no longer fully use",
      longDescription: "The Zune HD was Microsoft's premium portable media player with an OLED touchscreen, released in 2009. After Microsoft discontinued the Zune service in 2015, many features became inaccessible. This bounty aims to restore streaming capabilities, marketplace access, and social features to make these devices fully functional again for their owners.",
      imageUrl: "https://images.unsplash.com/photo-1493020258366-be3ead1b3027?w=400&h=300&fit=crop",
      fundingGoal: 500000,
      fundingCurrent: 125000,
      fundingDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      status: "ACTIVE" as BountyStatus,
      featured: true,
      trending: true,
      creatorId: user.id,
      stripeProductId: `prod_test_zunehd_${Date.now()}`,
      stripePriceId: `price_test_zunehd_${Date.now()}`,
    },
  })

  // Create some milestones
  await prisma.milestone.createMany({
    data: [
      {
        bountyId: bounty.id,
        title: "Research & Reverse Engineering",
        description: "Analyze Zune HD firmware and original Zune service protocols",
        targetAmount: 100000,
        order: 0,
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      },
      {
        bountyId: bounty.id,
        title: "Service Infrastructure",
        description: "Build replacement servers and APIs for Zune Marketplace and social features",
        targetAmount: 300000,
        order: 1,
        dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      },
      {
        bountyId: bounty.id,
        title: "Testing & Launch",
        description: "Beta testing with real Zune HD devices and public launch",
        targetAmount: 500000,
        order: 2,
        dueDate: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000),
      },
    ],
  })

  console.log("Zune HD bounty created successfully!")
  console.log(`Bounty ID: ${bounty.id}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })