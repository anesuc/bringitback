import { PrismaClient, Category, BountyStatus } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // Create a sample user first (or get existing one)
  const user = await prisma.user.upsert({
    where: { email: "creator@example.com" },
    update: {},
    create: {
      email: "creator@example.com",
      name: "Sarah Chen",
      bio: "Former Google engineer passionate about restoring discontinued products",
    },
  })

  // Create sample bounties
  const bounties = [
    {
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
    },
    {
      title: "Vine",
      company: "Twitter",
      category: "SOCIAL_MEDIA" as Category,
      description: "Make 6-second video creation work again for creators who built their audience on this platform",
      longDescription: "Vine was a short-form video hosting service where users could share six-second-long looping video clips. It was discontinued in 2017, leaving creators without their beloved platform. This bounty aims to recreate the Vine experience with modern video technologies.",
      imageUrl: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=300&fit=crop",
      fundingGoal: 300000,
      fundingCurrent: 89000,
      fundingDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
      status: "ACTIVE" as BountyStatus,
      featured: true,
      creatorId: user.id,
    },
    {
      title: "Windows Phone",
      company: "Microsoft",
      category: "MOBILE_OS" as Category,
      description: "Restore functionality to Windows Phones that people purchased but can no longer fully use",
      longDescription: "Windows Phone was Microsoft's mobile operating system that was discontinued in 2017. Many users still have these devices but can't access app stores or receive updates. This bounty aims to create an alternative ecosystem for Windows Phone devices.",
      imageUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop",
      fundingGoal: 1000000,
      fundingCurrent: 67000,
      fundingDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
      status: "ACTIVE" as BountyStatus,
      creatorId: user.id,
    },
    {
      title: "Google Wave",
      company: "Google",
      category: "COMMUNICATION" as Category,
      description: "Revive the real-time collaborative communication platform that was ahead of its time",
      longDescription: "Google Wave was a real-time communication and collaboration platform that combined email, instant messaging, wikis, and social networking. Though discontinued in 2012, its concepts were revolutionary and influenced many modern collaboration tools.",
      imageUrl: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&h=300&fit=crop",
      fundingGoal: 200000,
      fundingCurrent: 34000,
      fundingDeadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000), // 35 days from now
      status: "ACTIVE" as BountyStatus,
      creatorId: user.id,
    },
    {
      title: "Adobe Flash Player",
      company: "Adobe",
      category: "DEVELOPMENT" as Category,
      description: "Revive Flash support for legacy games and animations",
      longDescription: "Adobe Flash Player was discontinued in 2020, leaving thousands of games, animations, and interactive content inaccessible. This bounty aims to create a modern, secure alternative that can run legacy Flash content.",
      imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=300&fit=crop",
      fundingGoal: 750000,
      fundingCurrent: 156000,
      fundingDeadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      status: "ACTIVE" as BountyStatus,
      trending: true,
      creatorId: user.id,
    },
    {
      title: "Clubhouse Audio Rooms",
      company: "Clubhouse",
      category: "SOCIAL_MEDIA" as Category,
      description: "Restore the original magic of drop-in audio conversations",
      longDescription: "Clubhouse pioneered drop-in audio conversations but has since changed significantly. This bounty aims to recreate the original Clubhouse experience when it was at its peak popularity during 2020-2021.",
      imageUrl: "https://images.unsplash.com/photo-1589903308904-1010c2294adc?w=400&h=300&fit=crop",
      fundingGoal: 150000,
      fundingCurrent: 23000,
      fundingDeadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 days from now
      status: "ACTIVE" as BountyStatus,
      creatorId: user.id,
    },
  ]

  // Create bounties and their milestones
  for (const bountyData of bounties) {
    // Check if bounty already exists
    const existingBounty = await prisma.bounty.findFirst({
      where: { title: bountyData.title, creatorId: user.id },
    })

    if (existingBounty) {
      console.log(`Bounty "${bountyData.title}" already exists, skipping...`)
      continue
    }

    const bounty = await prisma.bounty.create({
      data: bountyData,
    })

    // Create some sample milestones for each bounty
    await prisma.milestone.createMany({
      data: [
        {
          bountyId: bounty.id,
          title: "Research & Planning",
          description: "Research original functionality and create detailed implementation plan",
          targetAmount: bountyData.fundingGoal * 0.2,
          order: 0,
          dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        },
        {
          bountyId: bounty.id,
          title: "Core Development",
          description: "Implement core functionality and basic user interface",
          targetAmount: bountyData.fundingGoal * 0.6,
          order: 1,
          dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        },
        {
          bountyId: bounty.id,
          title: "Testing & Launch",
          description: "Comprehensive testing, bug fixes, and public launch",
          targetAmount: bountyData.fundingGoal,
          order: 2,
          dueDate: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000),
        },
      ],
    })

    // Create some sample contributions to show backer counts
    const contributionAmounts = [25, 50, 100, 250, 500]
    const numContributions = Math.floor(Math.random() * 20) + 5

    for (let i = 0; i < numContributions; i++) {
      await prisma.contribution.create({
        data: {
          bountyId: bounty.id,
          userId: user.id,
          amount: contributionAmounts[Math.floor(Math.random() * contributionAmounts.length)],
          status: "COMPLETED",
          anonymous: Math.random() > 0.7, // 30% anonymous
          stripePaymentIntentId: `pi_test_${bounty.id}_${i}_${Date.now()}`, // Generate unique test payment intent IDs
          stripeCheckoutSessionId: `cs_test_${bounty.id}_${i}_${Date.now()}`, // Generate unique test checkout session IDs
          stripeChargeId: `ch_test_${bounty.id}_${i}_${Date.now()}`, // Generate unique test charge IDs
        },
      })
    }
  }

  console.log("Database seeded successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })