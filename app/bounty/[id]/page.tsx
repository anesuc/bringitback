"use client"

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

export default function BountyDetailPage({ params }: { params: { id: string } }) {
  // Mock data - in real app this would come from API
  const bounty = {
    id: 1,
    title: "Google Reader",
    description: "Restore RSS functionality for the millions who relied on this service they used daily",
    longDescription:
      "Google Reader was a web-based aggregator that millions of people used daily to stay informed. When Google shut it down in 2013, users lost access to a service they had integrated into their daily routines and workflows. Many had organized their entire information consumption around this tool. This restoration aims to fund the development of a compatible service that restores the functionality that users depended on, ensuring that the time and effort people invested in organizing their feeds wasn't wasted.",
    company: "Google",
    raised: 125000,
    goal: 500000,
    backers: 2847,
    timeLeft: "23 days",
    category: "Productivity",
    createdAt: "2024-01-15",
    creator: {
      name: "Sarah Chen",
      avatar: "/placeholder.svg?height=40&width=40",
      bio: "Former Google engineer passionate about RSS and information management",
    },
    image: "/placeholder.svg?height=400&width=800",
    updates: [
      {
        id: 1,
        title: "Development Team Assembled",
        content: "We've successfully assembled a team of experienced developers who worked on similar projects.",
        date: "2024-01-20",
        author: "Sarah Chen",
      },
      {
        id: 2,
        title: "Technical Specifications Released",
        content: "Detailed technical specifications and roadmap have been published for community review.",
        date: "2024-01-18",
        author: "Sarah Chen",
      },
    ],
    milestones: [
      { amount: 100000, description: "Basic RSS reader functionality", completed: true },
      { amount: 250000, description: "Advanced features and mobile app", completed: false },
      { amount: 500000, description: "Full feature parity with original Google Reader", completed: false },
    ],
  }

  const recentBackers = [
    { name: "Alex Johnson", amount: 250, avatar: "/placeholder.svg?height=32&width=32" },
    { name: "Maria Garcia", amount: 100, avatar: "/placeholder.svg?height=32&width=32" },
    { name: "David Kim", amount: 500, avatar: "/placeholder.svg?height=32&width=32" },
    { name: "Emma Wilson", amount: 75, avatar: "/placeholder.svg?height=32&width=32" },
    { name: "James Brown", amount: 200, avatar: "/placeholder.svg?height=32&width=32" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                <Target className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-slate-900">ReviveIt</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="ghost" size="sm">
                <Heart className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button
                size="sm"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                Back This Bounty
              </Button>
            </div>
          </div>
        </div>
      </header>

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
                src={bounty.image || "/placeholder.svg"}
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
                  <AvatarImage src={bounty.creator.avatar || "/placeholder.svg"} alt={bounty.creator.name} />
                  <AvatarFallback>
                    {bounty.creator.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-slate-900">{bounty.creator.name}</p>
                  <p className="text-sm text-slate-600">{bounty.creator.bio}</p>
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
                    {bounty.milestones.map((milestone, index) => (
                      <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
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
                          <p className="font-medium text-slate-900">${milestone.amount.toLocaleString()}</p>
                          <p className="text-sm text-slate-600">{milestone.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="updates" className="mt-6">
                <div className="space-y-6">
                  {bounty.updates.map((update) => (
                    <Card key={update.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{update.title}</CardTitle>
                          <div className="flex items-center text-sm text-slate-500">
                            <Calendar className="mr-1 h-4 w-4" />
                            {new Date(update.date).toLocaleDateString()}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-700">{update.content}</p>
                        <p className="text-sm text-slate-500 mt-2">By {update.author}</p>
                      </CardContent>
                    </Card>
                  ))}
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
                <CardTitle className="text-2xl text-slate-900">${bounty.raised.toLocaleString()}</CardTitle>
                <CardDescription>raised of ${bounty.goal.toLocaleString()} goal</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Progress value={(bounty.raised / bounty.goal) * 100} className="h-3" />

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-slate-900">{bounty.backers.toLocaleString()}</div>
                    <div className="text-sm text-slate-600">backers</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900">{bounty.timeLeft}</div>
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
