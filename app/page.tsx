import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowRight, Users, Zap, Target, TrendingUp } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { prisma } from "@/lib/prisma"

// Helper function to format category names
function formatCategory(category: string): string {
  return category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export default async function HomePage() {
  // Get featured bounties from database
  const featuredBounties = await prisma.bounty.findMany({
    where: {
      status: "ACTIVE",
      isPublic: true,
    },
    orderBy: [
      { featured: "desc" },
      { trending: "desc" },
      { fundingCurrent: "desc" },
    ],
    take: 6,
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      _count: {
        select: {
          contributions: {
            where: {
              status: "COMPLETED",
            },
          },
        },
      },
    },
  })

  // Prepare bounties data for display
  const bountiesWithData = featuredBounties.map((bounty) => ({
    ...bounty,
    backers: bounty._count.contributions,
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-8 sm:pt-24 sm:pb-12">
        <div className="container mx-auto px-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl xl:text-7xl">
              Make What You
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {" "}
                Bought Work
              </span>
            </h1>
            <p className="mt-6 text-base leading-7 text-slate-600 sm:text-lg sm:leading-8 lg:text-xl">
              Fund bounties to restore functionality to products and services you purchased. When companies shut down
              servers or discontinue support, we come together to make your purchases work again.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6 sm:mt-10">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-8 w-full sm:w-auto"
                asChild
              >
                <Link href="/browse">
                  Restore Your Products
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="px-8 bg-transparent w-full sm:w-auto" asChild>
                <Link href="/create">
                  Start a Restoration
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 blur-3xl">
            <div className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-blue-300 to-purple-300 opacity-20" />
          </div>
        </div>
      </section>

      {/* Featured Bounties */}
      <section className="py-12">
        <div className="container mx-auto px-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-12 sm:mb-16">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">Active Restorations</h2>
            <p className="mt-4 text-base text-slate-600 sm:text-lg">
              Help restore functionality to products that people purchased but can no longer use
            </p>
          </div>

          {bountiesWithData.length === 0 ? (
            <div className="col-span-full text-center py-12 pt-0">
              <div className="max-w-md mx-auto">
                <Target className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No active restorations yet</h3>
                <p className="text-slate-600 mb-6">
                  Be the first to create a bounty for a discontinued product you want to see revived.
                </p>
                <Button asChild>
                  <Link href="/create">
                    Create the First Bounty
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {bountiesWithData.map((bounty) => (
              <Link key={bounty.id} href={`/bounty/${bounty.id}`}>
                <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm cursor-pointer">
                
                <div className="aspect-video overflow-hidden">
                  <Image
                    src={bounty.imageUrl || "/placeholder.svg"}
                    alt={bounty.title}
                    width={300}
                    height={200}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
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
                  <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">{bounty.title}</CardTitle>
                  <CardDescription className="text-slate-600">{bounty.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm mb-2">
                        <span className="font-medium text-slate-900">${bounty.fundingCurrent.toLocaleString()} contributed</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-slate-600">
                        <Users className="mr-1 h-4 w-4" />
                        {bounty.backers.toLocaleString()} contributors
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
          )}

          {bountiesWithData.length > 0 && (
            <div className="text-center mt-12">
            <Button variant="outline" size="lg" asChild>
              <Link href="/browse">
                View All Bounties
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">How It Works</h2>
            <p className="mt-4 text-lg text-slate-600">
              Simple steps to restore functionality to products you purchased
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl font-bold">
                  1
                </div>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Report a Broken Product</h3>
              <p className="text-slate-600">
                Start a restoration campaign for a product or service you purchased that no longer works due to company
                decisions.
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl font-bold">
                  2
                </div>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Rally Other Owners</h3>
              <p className="text-slate-600">
                Connect with others who purchased the same product and want it working again. Collective action gets
                results.
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl font-bold">
                  3
                </div>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Fund the Fix</h3>
              <p className="text-slate-600">
                When the goal is reached, funds go to developers who can restore functionality or create compatible
                alternatives.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Got Something That Stopped Working?
            </h2>
            <p className="mt-4 text-lg text-blue-100">
              Join thousands of others who refuse to accept that products they purchased should become useless.
            </p>
            <div className="mt-8 flex items-center justify-center gap-x-6">
              <Button size="lg" variant="secondary" className="px-8" asChild>
                <Link href="/create">
                  Start a Restoration
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-8 border-white text-white hover:bg-white hover:text-blue-600 bg-transparent"
                asChild
              >
                <Link href="/browse">
                  Find Your Product
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-16 relative overflow-hidden">
        {/* Gradient accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/25">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">ReviveIt</span>
              </div>
              <p className="text-slate-200 max-w-md text-lg leading-relaxed">
                Crowdfunding platform dedicated to restoring functionality to products and services that people
                purchased but can no longer use.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-white mb-6 text-lg">Platform</h3>
              <ul className="space-y-3 text-white/75">
                <li>
                  <Link href="/browse" className="hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                    Browse Bounties
                  </Link>
                </li>
                <li>
                  <Link href="/create" className="hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                    Create Bounty
                  </Link>
                </li>
                <li>
                  <Link href="/how-it-works" className="hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                    How It Works
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-6 text-lg">Support</h3>
              <ul className="space-y-3 text-white/75">
                <li>
                  <Link href="/help" className="hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Gradient separator */}
          <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent mb-8"></div>
          
          <div className="text-center">
            <p className="text-white/75 text-lg">
              &copy; {new Date().getFullYear()} <span className="font-semibold text-white">ReviveIt</span>. All rights reserved.
            </p>
          </div>
        </div>
        
        {/* Subtle background decoration */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-24 bg-gradient-to-t from-blue-500/5 to-transparent blur-xl"></div>
      </footer>
    </div>
  )
}
