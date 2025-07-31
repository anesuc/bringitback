import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Users, Target, Share2, Heart, MessageCircle, Calendar, DollarSign, CheckCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"

export default async function BountyDetailPage({ params }: { params: { id: string } }) {
  // Fetch bounty data from database
  const bounty = await prisma.bounty.findUnique({
    where: { id: params.id },
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
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="story">Story</TabsTrigger>
                <TabsTrigger value="updates">Updates</TabsTrigger>
                <TabsTrigger value="comments">Comments</TabsTrigger>
                <TabsTrigger value="backers">Backers</TabsTrigger>
              </TabsList>

              <TabsContent value="story" className="mt-6">
                <div className="prose max-w-none">
                  <p className="text-slate-700 leading-relaxed">{bounty.longDescription}</p>

                  <h3 className="text-xl font-semibold text-slate-900 mt-8 mb-4">Why This Restoration Matters</h3>
                  <ul className="space-y-2 text-slate-700">
                    <li>• Millions of people organized their daily information consumption around this service</li>
                    <li>• Users invested significant time curating and organizing their RSS feeds</li>
                    <li>• No replacement has matched the reliability and features people depended on</li>
                    <li>• People deserve to have the functionality they relied on restored</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-slate-900 mt-8 mb-4">Funding Milestones</h3>
                  <div className="space-y-4">
                    {bounty.milestones.map((milestone) => (
                      <div key={milestone.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full ${
                            milestone.completed ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          {milestone.completed ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <DollarSign className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">${milestone.targetAmount.toLocaleString()}</p>
                          <p className="text-sm text-slate-600">{milestone.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="updates" className="mt-6">
                <div className="space-y-6">
                  {bounty.updates.length > 0 ? (
                    bounty.updates.map((update) => (
                      <Card key={update.id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{update.title}</CardTitle>
                            <div className="flex items-center text-sm text-slate-500">
                              <Calendar className="mr-1 h-4 w-4" />
                              {new Date(update.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-slate-700">{update.content}</p>
                          <p className="text-sm text-slate-500 mt-2">By {bounty.creator.name || 'Creator'}</p>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-600">No updates yet</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="comments" className="mt-6">
                <div className="text-center py-12">
                  <MessageCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">Comments will be available soon</p>
                </div>
              </TabsContent>

              <TabsContent value="backers" className="mt-6">
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
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Funding Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-slate-900">${bounty.fundingCurrent.toLocaleString()}</CardTitle>
                <CardDescription>raised of ${bounty.fundingGoal.toLocaleString()} goal</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Progress value={(bounty.fundingCurrent / bounty.fundingGoal) * 100} className="h-3" />

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-slate-900">{bounty._count.contributions.toLocaleString()}</div>
                    <div className="text-sm text-slate-600">backers</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900">{timeLeft}</div>
                    <div className="text-sm text-slate-600">to go</div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Button
                    size="lg"
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    <DollarSign className="mr-2 h-4 w-4" />
                    Fund This Restoration
                  </Button>
                  <Button variant="outline" size="lg" className="w-full bg-transparent">
                    <Heart className="mr-2 h-4 w-4" />
                    Save for Later
                  </Button>
                </div>

                <div className="text-xs text-slate-500 text-center">
                  All or nothing. This bounty will only be funded if it reaches its goal by the deadline.
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Share2 className="mr-2 h-5 w-5" />
                  Share This Bounty
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm">
                    Twitter
                  </Button>
                  <Button variant="outline" size="sm">
                    Facebook
                  </Button>
                  <Button variant="outline" size="sm">
                    LinkedIn
                  </Button>
                  <Button variant="outline" size="sm">
                    Copy Link
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
