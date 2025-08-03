import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { DollarSign, TrendingUp, Users, Bookmark, Plus, FileText, Edit } from "lucide-react"

export default async function DashboardPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect("/auth/signin")
  }

  // Get user stats
  const [totalRaised, totalContributed, activeBounties, savedBounties, draftBounties] = await Promise.all([
    prisma.bounty.aggregate({
      where: { creatorId: user.id, status: { not: "DRAFT" } },
      _sum: { fundingCurrent: true },
    }),
    prisma.contribution.aggregate({
      where: { userId: user.id, status: "COMPLETED" },
      _sum: { amount: true },
    }),
    prisma.bounty.count({
      where: { creatorId: user.id, status: "ACTIVE" },
    }),
    prisma.savedBounty.count({
      where: { userId: user.id },
    }),
    prisma.bounty.count({
      where: { creatorId: user.id, status: "DRAFT" },
    }),
  ])

  // Get recent bounties (excluding drafts)
  const recentBounties = await prisma.bounty.findMany({
    where: { 
      creatorId: user.id,
      status: { not: "DRAFT" }
    },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      _count: {
        select: {
          contributions: true,
          comments: true,
        },
      },
    },
  })

  // Get draft bounties
  const drafts = await prisma.bounty.findMany({
    where: { 
      creatorId: user.id,
      status: "DRAFT"
    },
    orderBy: { updatedAt: "desc" },
    take: 5,
    select: {
      id: true,
      title: true,
      category: true,
      description: true,
      company: true,
      updatedAt: true,
    },
  })

  // Get recent contributions
  const recentContributions = await prisma.contribution.findMany({
    where: { userId: user.id, status: "COMPLETED" },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      bounty: {
        select: {
          id: true,
          title: true,
          company: true,
          imageUrl: true,
        },
      },
    },
  })

  // Get saved bounties
  const savedBountiesList = await prisma.savedBounty.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      bounty: {
        select: {
          id: true,
          title: true,
          company: true,
          imageUrl: true,
          status: true,
          fundingCurrent: true,
          createdAt: true,
          _count: {
            select: {
              contributions: true,
              comments: true,
            },
          },
        },
      },
    },
  })

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user.name || user.email}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5 mb-6 sm:mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Raised</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground hidden sm:block" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">
              ${totalRaised._sum.fundingCurrent?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              From your bounties
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Contributed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground hidden sm:block" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">
              ${totalContributed._sum.amount?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              To other bounties
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Active</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground hidden sm:block" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{activeBounties}</div>
            <p className="text-xs text-muted-foreground">
              Currently accepting funds
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Saved</CardTitle>
            <Bookmark className="h-4 w-4 text-muted-foreground hidden sm:block" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{savedBounties}</div>
            <p className="text-xs text-muted-foreground">
              In your watchlist
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Drafts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground hidden sm:block" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{draftBounties}</div>
            <p className="text-xs text-muted-foreground">
              Waiting to publish
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="bounties" className="space-y-4">
        <TabsList>
          <TabsTrigger value="bounties">My Bounties</TabsTrigger>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
          <TabsTrigger value="contributions">My Contributions</TabsTrigger>
          <TabsTrigger value="saved">Saved Bounties</TabsTrigger>
        </TabsList>
        
        <TabsContent value="bounties" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Your Bounties</h2>
            <Button asChild>
              <Link href="/create">
                <Plus className="mr-2 h-4 w-4" />
                Create New Bounty
              </Link>
            </Button>
          </div>
          
          {recentBounties.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  You haven&apos;t created any bounties yet.
                </p>
                <Button asChild>
                  <Link href="/create">Create Your First Bounty</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {recentBounties.map((bounty) => (
                <Card key={bounty.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          <Link href={`/bounty/${bounty.id}`} className="hover:underline">
                            {bounty.title}
                          </Link>
                        </CardTitle>
                        <CardDescription>{bounty.company}</CardDescription>
                      </div>
                      <Badge variant={bounty.status === "ACTIVE" ? "default" : "secondary"}>
                        {bounty.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-green-600">
                          ${bounty.fundingCurrent.toLocaleString()} raised
                        </span>
                        <span className="text-sm text-slate-500">
                          Flexible funding
                        </span>
                      </div>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>{bounty._count.contributions} backers</span>
                        <span>{bounty._count.comments} comments</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {recentBounties.length > 0 && (
            <div className="text-center">
              <Button variant="outline" asChild>
                <Link href="/dashboard/bounties">View All Bounties</Link>
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="drafts" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Draft Bounties</h2>
            <Button asChild>
              <Link href="/create">
                <Plus className="mr-2 h-4 w-4" />
                Create New Bounty
              </Link>
            </Button>
          </div>
          
          {drafts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                <p className="text-muted-foreground mb-4">
                  You don&apos;t have any draft bounties yet.
                </p>
                <Button asChild>
                  <Link href="/create">Create Your First Bounty</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {drafts.map((draft) => (
                <Card key={draft.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-lg">
                            {draft.title || "Untitled Draft"}
                          </CardTitle>
                          <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">
                            <FileText className="mr-1 h-3 w-3" />
                            Draft
                          </Badge>
                        </div>
                        <CardDescription>
                          {draft.company && `${draft.company} • `}
                          {draft.category && draft.category.replace('_', ' ')}
                        </CardDescription>
                        {draft.description && (
                          <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                            {draft.description}
                          </p>
                        )}
                      </div>
                      <Button asChild size="sm" className="ml-4">
                        <Link href={`/create?draft=${draft.id}`}>
                          <Edit className="mr-1 h-3 w-3" />
                          Continue Editing
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-xs text-slate-500">
                      Last updated: {new Date(draft.updatedAt).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {drafts.length > 0 && (
            <div className="text-center">
              <Button variant="outline" asChild>
                <Link href="/dashboard/drafts">View All Drafts</Link>
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="contributions" className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Your Contributions</h2>
          
          {recentContributions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  You haven&apos;t made any contributions yet.
                </p>
                <Button asChild>
                  <Link href="/browse">Browse Bounties</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {recentContributions.map((contribution) => (
                <Card key={contribution.id}>
                  <CardContent className="flex items-center gap-4 p-4">
                    {contribution.bounty.imageUrl && (
                      <img
                        src={contribution.bounty.imageUrl}
                        alt={contribution.bounty.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold">
                        <Link 
                          href={`/bounty/${contribution.bounty.id}`}
                          className="hover:underline"
                        >
                          {contribution.bounty.title}
                        </Link>
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {contribution.bounty.company}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${contribution.amount}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(contribution.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {recentContributions.length > 0 && (
            <div className="text-center">
              <Button variant="outline" asChild>
                <Link href="/dashboard/contributions">View All Contributions</Link>
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="saved" className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Saved Bounties</h2>
          
          {savedBountiesList.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  You haven&apos;t saved any bounties yet.
                </p>
                <Button asChild>
                  <Link href="/browse">Browse Bounties</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {savedBountiesList.map((savedBounty) => (
                <Card key={savedBounty.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          <Link href={`/bounty/${savedBounty.bounty.id}`} className="hover:underline">
                            {savedBounty.bounty.title}
                          </Link>
                        </CardTitle>
                        <CardDescription>{savedBounty.bounty.company}</CardDescription>
                      </div>
                      <Badge variant={savedBounty.bounty.status === "ACTIVE" ? "default" : "secondary"}>
                        {savedBounty.bounty.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-green-600">
                          ${savedBounty.bounty.fundingCurrent.toLocaleString()} raised
                        </span>
                        <span className="text-sm text-slate-500">
                          Saved {new Date(savedBounty.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>{savedBounty.bounty._count.contributions} backers</span>
                        <span>{savedBounty.bounty._count.comments} comments</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {savedBountiesList.length > 0 && (
            <div className="text-center">
              <Button variant="outline" asChild>
                <Link href="/dashboard/saved">View All Saved Bounties</Link>
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}