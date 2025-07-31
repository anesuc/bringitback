import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Users, Target, Share2, Heart, MessageCircle, Calendar, DollarSign, CheckCircle, Copy, Check } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import ShareSection from "./share-section"
import CommentsSection from "./comments-section"
import SolutionsSection from "./solutions-section"
import UpdatesSection from "./updates-section"
import ContributeButton from "./contribute-button"
import { getCurrentUser } from "@/lib/session"

export default async function BountyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const currentUser = await getCurrentUser()
  
  // Fetch bounty data from database
  const bounty = await prisma.bounty.findUnique({
    where: { id },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          image: true,
          bio: true,
        },
      },
      milestones: {
        orderBy: { order: 'asc' },
      },
      updates: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      contributions: {
        where: { status: 'COMPLETED' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      _count: {
        select: {
          contributions: {
            where: { status: 'COMPLETED' },
          },
        },
      },
    },
  })

  if (!bounty) {
    notFound()
  }

  // Check if current user has submitted a solution
  const userHasSolution = currentUser ? await prisma.solution.findFirst({
    where: {
      bountyId: id,
      submitterId: currentUser.id,
    },
  }) : null

  // Check if current user has saved this bounty
  const isSaved = currentUser ? await prisma.savedBounty.findUnique({
    where: {
      userId_bountyId: {
        userId: currentUser.id,
        bountyId: id,
      },
    },
  }) : null

  // Calculate time left
  const now = new Date()
  const deadline = new Date(bounty.fundingDeadline)
  const diffTime = deadline.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  let timeLeft = "Expired"
  if (diffDays > 0) {
    timeLeft = diffDays === 1 ? "1 day" : `${diffDays} days`
  }

  // Get recent backers (non-anonymous contributions)
  const recentBackers = bounty.contributions
    .filter(contribution => !contribution.anonymous && contribution.user.name)
    .slice(0, 5)
    .map(contribution => ({
      name: contribution.user.name!,
      amount: contribution.amount,
      avatar: contribution.user.image || "/placeholder.svg?height=32&width=32",
    }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button variant="ghost" className="mb-6" asChild>
          <Link href="/browse">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Browse
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Image */}
            <div className="aspect-video overflow-hidden rounded-xl">
              <Image
                src={bounty.imageUrl || "/placeholder.svg"}
                alt={bounty.title}
                width={800}
                height={400}
                className="h-full w-full object-cover"
              />
            </div>

            {/* Title and Description */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="secondary">{bounty.category}</Badge>
                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Verified
                </Badge>
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-4">{bounty.title}</h1>
              <p className="text-lg text-slate-600 mb-6">{bounty.description}</p>

              {/* Creator Info */}
              <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg">
                <Avatar>
                  <AvatarImage src={bounty.creator.image || "/placeholder.svg"} alt={bounty.creator.name || 'Creator'} />
                  <AvatarFallback>
                    {bounty.creator.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("") || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-slate-900">{bounty.creator.name || 'Anonymous'}</p>
                  <p className="text-sm text-slate-600">{bounty.creator.bio || 'Creator of this restoration bounty'}</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="story" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="story">Story</TabsTrigger>
                <TabsTrigger value="solutions">Solutions</TabsTrigger>
                <TabsTrigger value="updates">Updates</TabsTrigger>
                <TabsTrigger value="comments">Comments</TabsTrigger>
                <TabsTrigger value="backers">Contributors</TabsTrigger>
              </TabsList>

              <TabsContent value="story" className="mt-6">
                <div className="prose max-w-none">
                  <p className="text-slate-700 leading-relaxed">{bounty.longDescription}</p>
                </div>
              </TabsContent>

              <TabsContent value="solutions" className="mt-6">
                <SolutionsSection bountyId={id} />
              </TabsContent>

              <TabsContent value="updates" className="mt-6">
                <UpdatesSection 
                  bountyId={id}
                  currentUserId={currentUser?.id}
                  isCreator={currentUser?.id === bounty.creator.id}
                  hasSolutionSubmission={!!userHasSolution}
                />
              </TabsContent>

              <TabsContent value="comments" className="mt-6">
                <CommentsSection bountyId={id} />
              </TabsContent>

              <TabsContent value="backers" className="mt-6">
                {recentBackers.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 mb-4">No contributors yet</p>
                    <p className="text-sm text-slate-500 mb-6">
                      Be the first to support this restoration project and help bring this device back to life!
                    </p>
                    <ContributeButton
                      bountyId={id}
                      bountyTitle={bounty.title}
                      variant="empty-state"
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentBackers.map((backer, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={backer.avatar || "/placeholder.svg"} alt={backer.name} />
                            <AvatarFallback>
                              {backer.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-slate-900">{backer.name}</span>
                        </div>
                        <Badge variant="secondary">${backer.amount}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Funding Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-slate-900">${bounty.fundingCurrent.toLocaleString()}</CardTitle>
                <CardDescription>contributed so far</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* No progress bar for flexible funding */}

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-slate-900">{bounty._count.contributions.toLocaleString()}</div>
                    <div className="text-sm text-slate-600">backers</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900">
                      {bounty.status === "COMPLETED" ? "Completed" : "Ongoing"}
                    </div>
                    <div className="text-sm text-slate-600">
                      {bounty.status === "COMPLETED" ? "solution accepted" : "flexible funding"}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <ContributeButton
                    bountyId={id}
                    bountyTitle={bounty.title}
                    variant="primary"
                  />
                  <ContributeButton
                    bountyId={id}
                    bountyTitle={bounty.title}
                    variant="secondary"
                    isSaved={!!isSaved}
                  />
                </div>

                <div className="text-xs text-slate-500 text-center">
                  Flexible funding. All contributions go toward making this restoration happen.
                </div>
              </CardContent>
            </Card>

            {/* Recent Backers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Recent Backers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentBackers.slice(0, 3).map((backer, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={backer.avatar || "/placeholder.svg"} alt={backer.name} />
                        <AvatarFallback className="text-xs">
                          {backer.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{backer.name}</p>
                        <p className="text-xs text-slate-500">${backer.amount}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" size="sm" className="w-full mt-4">
                  View All Backers
                </Button>
              </CardContent>
            </Card>

            {/* Share */}
            <ShareSection 
              bountyTitle={bounty.title}
              bountyUrl={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/bounty/${id}`}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
