import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowRight, Users, Zap, Target, TrendingUp, Clock } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function HomePage() {
  const featuredBounties = [
    {
      id: 1,
      title: "Google Reader",
      description: "Restore RSS functionality for the millions who relied on this service they used daily",
      company: "Google",
      raised: 125000,
      goal: 500000,
      backers: 2847,
      timeLeft: "23 days",
      category: "Productivity",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 2,
      title: "Vine",
      description: "Make 6-second video creation work again for creators who built their audience on this platform",
      company: "Twitter",
      raised: 89000,
      goal: 300000,
      backers: 1923,
      timeLeft: "45 days",
      category: "Social Media",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 3,
      title: "Windows Phone",
      description: "Restore functionality to Windows Phones that people purchased but can no longer fully use",
      company: "Microsoft",
      raised: 67000,
      goal: 1000000,
      backers: 1456,
      timeLeft: "67 days",
      category: "Mobile OS",
      image: "/placeholder.svg?height=200&width=300",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                <Target className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-slate-900">BringItBack</span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/browse" className="text-slate-600 hover:text-slate-900 transition-colors">
                Browse
              </Link>
              <Link href="/create" className="text-slate-600 hover:text-slate-900 transition-colors">
                Create Bounty
              </Link>
              <Link href="/about" className="text-slate-600 hover:text-slate-900 transition-colors">
                About
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
              <Button
                size="sm"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-6 bg-blue-50 text-blue-700 border-blue-200">
              <Zap className="mr-1 h-3 w-3" />
              Crowdfunded Revival
            </Badge>
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

      {/* Stats Section */}
      <section className="py-16 bg-white/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900">$2.4M</div>
              <div className="text-slate-600">Total Raised</div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900">12,847</div>
              <div className="text-slate-600">Active Backers</div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900">47</div>
              <div className="text-slate-600">Active Bounties</div>
            </div>
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

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {featuredBounties.map((bounty) => (
              <Card
                key={bounty.id}
                className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm"
              >
                <div className="aspect-video overflow-hidden">
                  <Image
                    src={bounty.image || "/placeholder.svg"}
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
                        <span className="font-medium text-slate-900">${bounty.raised.toLocaleString()} raised</span>
                        <span className="text-slate-500">${bounty.goal.toLocaleString()} goal</span>
                      </div>
                      <Progress value={(bounty.raised / bounty.goal) * 100} className="h-2" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-slate-600">
                        <Users className="mr-1 h-4 w-4" />
                        {bounty.backers.toLocaleString()} backers
                      </div>
                      <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                        View Details
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="outline" size="lg" asChild>
              <Link href="/browse">
                View All Bounties
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
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
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-semibold">BringItBack</span>
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
            <p>&copy; {new Date().getFullYear()} BringItBack. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
