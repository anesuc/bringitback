import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Users, TrendingUp, Heart } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { prisma } from "@/lib/prisma"
import BrowseFilters from "./browse-filters"

// Helper function to format category names
function formatCategory(category: string): string {
  return category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

// Trending algorithm: calculates trending score based on recent activity
function calculateTrendingScore(bounty: any): number {
  const now = new Date()
  const daysSinceCreated = Math.max(1, (now.getTime() - new Date(bounty.createdAt).getTime()) / (1000 * 60 * 60 * 24))
  
  // Recent contributions (last 7 days) get higher weight
  const recentContributions = bounty.contributions?.filter((c: any) => {
    const contributionAge = (now.getTime() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    return contributionAge <= 7
  }).length || 0
  
  // Recent comments (last 7 days) 
  const recentComments = bounty.comments?.filter((c: any) => {
    const commentAge = (now.getTime() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    return commentAge <= 7
  }).length || 0
  
  // Recent solutions (last 14 days)
  const recentSolutions = bounty.solutions?.filter((s: any) => {
    const solutionAge = (now.getTime() - new Date(s.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    return solutionAge <= 14
  }).length || 0
  
  // Calculate trending score
  const contributionScore = recentContributions * 10
  const commentScore = recentComments * 3
  const solutionScore = recentSolutions * 20
  const fundingScore = (bounty.fundingCurrent / 1000) * 2
  const contributorScore = bounty._count.contributions * 1
  
  // Age decay factor (newer bounties get slight boost)
  const ageDecay = Math.max(0.1, 1 - (daysSinceCreated / 365))
  
  return (contributionScore + commentScore + solutionScore + fundingScore + contributorScore) * ageDecay
}

interface BrowsePageProps {
  searchParams?: {
    search?: string
    category?: string
    sort?: string
  }
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const search = searchParams?.search || ""
  const category = searchParams?.category || "all"
  const sortBy = searchParams?.sort || "trending"

  // Fetch bounties with related data for trending calculation
  const bounties = await prisma.bounty.findMany({
    where: {
      status: "ACTIVE",
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { company: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(category !== "all" && { category }),
    },
    include: {
      _count: {
        select: {
          contributions: {
            where: { status: "COMPLETED" }
          },
          comments: true,
          solutions: true,
        },
      },
      contributions: {
        where: { status: "COMPLETED" },
        select: {
          createdAt: true,
          amount: true,
        },
        orderBy: { createdAt: "desc" },
        take: 50, // Get recent contributions for trending calc
      },
      comments: {
        select: { createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 50, // Get recent comments for trending calc
      },
      solutions: {
        select: { createdAt: true, status: true },
        orderBy: { createdAt: "desc" },
        take: 20, // Get recent solutions for trending calc
      },
    },
  })

  // Calculate trending scores and sort
  const bountiesWithTrending = bounties.map(bounty => ({
    ...bounty,
    trendingScore: calculateTrendingScore(bounty),
    isTrending: calculateTrendingScore(bounty) > 20, // Threshold for trending badge
  }))

  // Sort bounties based on selected criteria
  let sortedBounties = [...bountiesWithTrending]
  switch (sortBy) {
    case "trending":
      sortedBounties.sort((a, b) => b.trendingScore - a.trendingScore)
      break
    case "newest":
      sortedBounties.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      break
    case "most-funded":
      sortedBounties.sort((a, b) => b.fundingCurrent - a.fundingCurrent)
      break
    case "most-contributors":
      sortedBounties.sort((a, b) => b._count.contributions - a._count.contributions)
      break
  }

  // Get unique categories from actual data
  const allCategories = await prisma.bounty.findMany({
    where: { status: "ACTIVE" },
    select: { category: true },
    distinct: ["category"],
  })
  const categories = ["all", ...allCategories.map(b => b.category).filter(Boolean)]
  
  // Format categories for display
  const formattedCategories = categories.map(cat => ({
    value: cat,
    label: cat === "all" ? "All Categories" : formatCategory(cat)
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Restore Your Products</h1>
          <p className="text-slate-600">
            Find campaigns to restore functionality to products and services you purchased
          </p>
        </div>

        {/* Filters */}
        <BrowseFilters 
          categories={formattedCategories}
          currentSearch={search}
          currentCategory={category}
          currentSort={sortBy}
        />

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-slate-600">
            Showing {sortedBounties.length} restoration campaigns
          </p>
        </div>

        {/* Bounties Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sortedBounties.map((bounty) => (
            <Link key={bounty.id} href={`/bounty/${bounty.id}`}>
              <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm cursor-pointer">
              
              <div className="aspect-video overflow-hidden relative">
                <Image
                  src={bounty.imageUrl || "/placeholder.svg"}
                  alt={bounty.title}
                  width={300}
                  height={200}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {bounty.isTrending && (
                  <Badge className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-red-500 border-0">
                    <TrendingUp className="mr-1 h-3 w-3" />
                    Trending
                  </Badge>
                )}
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {formatCategory(bounty.category)}
                  </Badge>
                  <div className="text-xs text-slate-500">
                    Flexible funding
                  </div>
                </div>
                <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                  {bounty.title}
                </CardTitle>
                <CardDescription className="text-slate-600">
                  {bounty.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div>
                    <div className="text-sm mb-2">
                      <span className="font-medium text-slate-900">
                        ${bounty.fundingCurrent.toLocaleString()} contributed
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-slate-600">
                      <Users className="mr-1 h-4 w-4" />
                      {bounty._count.contributions.toLocaleString()} contributors
                    </div>
                    <div className="flex items-center text-sm text-blue-600 group-hover:text-blue-700 transition-colors">
                      View Details
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </div>
                  </div>
                </div>
              </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {sortedBounties.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-600 mb-4">No bounties found matching your criteria.</p>
            <Button asChild>
              <Link href="/create">Create the First Bounty</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}