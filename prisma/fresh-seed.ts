import { PrismaClient, Category, BountyStatus } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Creating fresh database with single Zune HD bounty...")

  // Create a sample user
  const user = await prisma.user.create({
    data: {
      email: "sarah@example.com",
      name: "Sarah Chen",
      bio: "Former Microsoft engineer passionate about restoring discontinued products",
    },
  })

  console.log("User created:", user.name)

  // Create the Zune HD bounty
  const bounty = await prisma.bounty.create({
    data: {
      title: "Zune HD",
      company: "Microsoft",
      category: "MEDIA_PLAYERS" as Category,
      description: "Restore functionality to the innovative Zune HD media player that people purchased but can no longer fully use",
      longDescription: "The Zune HD was Microsoft's premium portable media player with an OLED touchscreen, released in 2009. After Microsoft discontinued the Zune service in 2015, many features including the marketplace, social features, and streaming capabilities became inaccessible. This bounty aims to restore these core functionalities by creating alternative servers and services, allowing existing Zune HD owners to fully utilize their devices again. The project will focus on music streaming, podcast support, marketplace access, and social features that made the Zune ecosystem unique.",
      imageUrl: "https://images.unsplash.com/photo-1493020258366-be3ead1b3027?w=400&h=300&fit=crop",
      fundingGoal: 500000,
      fundingCurrent: 125000,
      fundingDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      status: "ACTIVE" as BountyStatus,
      featured: true,
      trending: true,
      creatorId: user.id,
      stripeProductId: `prod_zune_hd_revival_${Date.now()}`,
      stripePriceId: `price_zune_hd_revival_${Date.now()}`,
    },
  })

  console.log("Zune HD bounty created:", bounty.title)

  // Create realistic milestones
  await prisma.milestone.createMany({
    data: [
      {
        bountyId: bounty.id,
        title: "Research & Protocol Analysis",
        description: "Reverse engineer Zune HD firmware and original Zune service communication protocols",
        targetAmount: 100000,
        order: 0,
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      },
      {
        bountyId: bounty.id,
        title: "Server Infrastructure Development",
        description: "Build replacement servers for Zune Marketplace, music streaming, and social features",
        targetAmount: 300000,
        order: 1,
        dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      },
      {
        bountyId: bounty.id,
        title: "Beta Testing & Public Launch",
        description: "Comprehensive testing with real Zune HD devices and launch of restored services",
        targetAmount: 500000,
        order: 2,
        dueDate: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000),
      },
    ],
  })

  // Create some sample contributions to show backer count
  const contributionCount = 8 // Matches the "8 backers" shown in the image
  for (let i = 0; i < contributionCount; i++) {
    await prisma.contribution.create({
      data: {
        bountyId: bounty.id,
        userId: user.id,
        amount: [25, 50, 100, 250, 500, 1000][Math.floor(Math.random() * 6)],
        status: "COMPLETED",
        anonymous: Math.random() > 0.7, // 30% anonymous
        stripePaymentIntentId: `pi_test_zune_${bounty.id}_${i}_${Date.now()}`,
        stripeCheckoutSessionId: `cs_test_zune_${bounty.id}_${i}_${Date.now()}`,
        stripeChargeId: `ch_test_zune_${bounty.id}_${i}_${Date.now()}`,
      },
    })
  }

  console.log(`Created ${contributionCount} sample contributions`)
  console.log("Fresh database setup complete!")
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