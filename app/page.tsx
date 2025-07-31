import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowRight, Users, Zap, Target, TrendingUp, Clock } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { prisma } from "@/lib/prisma"

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

  // Calculate time left for each bounty
  const bountiesWithTimeLeft = featuredBounties.map((bounty) => {
    const now = new Date()
    const deadline = new Date(bounty.fundingDeadline)
    const diffTime = deadline.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    let timeLeft = "Expired"
    if (diffDays > 0) {
      timeLeft = diffDays === 1 ? "1 day" : `${diffDays} days`
    }

    return {
      ...bounty,
      timeLeft,
      backers: bounty._count.contributions,
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
              Make What You
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {" "}
                Bought Work
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-600 sm:text-xl">
              Fund bounties to restore functionality to products and services you purchased. When companies shut down
              servers or discontinue support, we come together to make your purchases work again.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-8"
              >
                Restore Your Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg" className="px-8 bg-transparent">
                Start a Restoration
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
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Active Restorations</h2>
            <p className="mt-4 text-lg text-slate-600">
              Help restore functionality to products that people purchased but can no longer use
            </p>
          </div>

          {bountiesWithTimeLeft.length === 0 ? (
            <div className="col-span-full text-center py-12">
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
              {bountiesWithTimeLeft.map((bounty) => (
              <Card
                key={bounty.id}
                className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm"
              >
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
                      {bounty.category}
                    </Badge>
                    <div className="flex items-center text-sm text-slate-500">
                      <Clock className="mr-1 h-3 w-3" />
                      {bounty.timeLeft}
                    </div>
                  </div>
                  <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">{bounty.title}</CardTitle>
                  <CardDescription className="text-slate-600">{bounty.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium text-slate-900">${bounty.fundingCurrent.toLocaleString()} raised</span>
                        <span className="text-slate-500">${bounty.fundingGoal.toLocaleString()} goal</span>
                      </div>
                      <Progress value={(bounty.fundingCurrent / bounty.fundingGoal) * 100} className="h-2" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-slate-600">
                        <Users className="mr-1 h-4 w-4" />
                        {bounty.backers.toLocaleString()} backers
                      </div>
                      <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700" asChild>
                        <Link href={`/bounty/${bounty.id}`}>
                          View Details
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              ))}
            </div>
          )}

          {bountiesWithTimeLeft.length > 0 && (
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
              <Button size="lg" variant="secondary" className="px-8">
                Start a Restoration
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-8 border-white text-white hover:bg-white hover:text-blue-600 bg-transparent"
              >
                Find Your Product
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-semibold">ReviveIt</span>
              </div>
              <p className="text-slate-400 max-w-md">
                Crowdfunding platform dedicated to restoring functionality to products and services that people
                purchased but can no longer use.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <Link href="/browse" className="hover:text-white transition-colors">
                    Browse Bounties
                  </Link>
                </li>
                <li>
                  <Link href="/create" className="hover:text-white transition-colors">
                    Create Bounty
                  </Link>
                </li>
                <li>
                  <Link href="/how-it-works" className="hover:text-white transition-colors">
                    How It Works
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <Link href="/help" className="hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white transition-colors">
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; {new Date().getFullYear()} ReviveIt. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
