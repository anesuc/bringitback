import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Target, 
  Users, 
  Zap, 
  TrendingUp, 
  Heart, 
  Shield, 
  DollarSign, 
  CheckCircle, 
  ArrowRight,
  Lightbulb,
  Globe,
  Handshake
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-8 sm:pt-24 sm:pb-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/25">
                <Target className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              About 
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {" "}ReviveIt
              </span>
            </h1>
            <p className="mt-6 text-base leading-7 text-slate-600 sm:text-lg sm:leading-8 lg:text-xl">
              We believe that when you purchase a product or service, it should continue to work. 
              When companies shut down servers or discontinue support, we help communities come together 
              to restore functionality and keep your purchases alive.
            </p>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 blur-3xl">
            <div className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-blue-300 to-purple-300 opacity-20" />
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-12">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl mb-4">
              Our Mission
            </h2>
            <p className="text-lg text-slate-600">
              ReviveIt exists to solve a growing problem in our digital world: products and services 
              that stop working not because they're broken, but because companies decide to shut them down.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="text-center">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                    <Heart className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <CardTitle className="text-xl">Preserve Your Investments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  You paid for it, you should be able to use it. We help restore functionality 
                  to products you legitimately purchased.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <CardTitle className="text-xl">Community Power</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  When individual voices aren't heard, collective action gets results. 
                  Together, we can make restoration projects viable.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                    <Lightbulb className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <CardTitle className="text-xl">Enable Innovation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Fund developers and creators to build solutions, create compatible alternatives, 
                  or develop open-source replacements.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl mb-4">
              How ReviveIt Works
            </h2>
            <p className="text-lg text-slate-600">
              Our flexible funding model makes restoration projects possible, no matter the scale.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Report a Broken Product</h3>
                  <p className="text-slate-600">
                    Create a restoration campaign for any product or service you purchased that no longer 
                    works due to company decisions like server shutdowns or discontinued support.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Build Community Support</h3>
                  <p className="text-slate-600">
                    Other affected users discover your campaign and contribute funds. There's no fixed goal - 
                    every contribution helps show demand and builds the available budget.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Developers Create Solutions</h3>
                  <p className="text-slate-600">
                    Skilled developers see the community demand and available funding, then submit solutions 
                    like server replacements, compatibility tools, or open-source alternatives.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-bold flex-shrink-0">
                  4
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Community Votes & Funds Release</h3>
                  <p className="text-slate-600">
                    Contributors vote on submitted solutions. When 50% approve a solution, 
                    the developer receives the collected funds and the community gets their fix.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-xl font-semibold text-slate-900 mb-6">Why Flexible Funding?</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-slate-700">No arbitrary funding goals to meet</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-slate-700">Developers can see real demand before committing</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-slate-700">Every contribution helps, no matter the amount</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-slate-700">Community controls when solutions are good enough</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-slate-700">Projects can grow organically over time</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Examples Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-12">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl mb-4">
              What Can Be Revived?
            </h2>
            <p className="text-lg text-slate-600">
              Any product or service that stopped working due to business decisions can potentially be restored.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-600" />
                  Online Games
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 text-sm mb-3">
                  MMORPGs, mobile games, and multiplayer titles that lost server support
                </p>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">Private Servers</Badge>
                  <Badge variant="outline" className="text-xs">Community Hosting</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-green-600" />
                  Smart Devices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 text-sm mb-3">
                  IoT devices, smart home products, and wearables with discontinued cloud services
                </p>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">Local Control</Badge>
                  <Badge variant="outline" className="text-xs">Open Firmware</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  Media Players
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 text-sm mb-3">
                  Digital music players, streaming devices, and media centers with dead services
                </p>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">Sync Tools</Badge>
                  <Badge variant="outline" className="text-xs">Store Replacements</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-orange-600" />
                  Social Platforms
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 text-sm mb-3">
                  Messaging apps, social networks, and communication tools that shut down
                </p>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">Data Export</Badge>
                  <Badge variant="outline" className="text-xs">Federation</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-red-600" />
                  Software Tools
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 text-sm mb-3">
                  Desktop apps, productivity tools, and creative software with license servers
                </p>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">License Bypass</Badge>
                  <Badge variant="outline" className="text-xs">Open Alternatives</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-indigo-600" />
                  And More...
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 text-sm mb-3">
                  Any digital product or service that depends on company infrastructure
                </p>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">Creative Solutions</Badge>
                  <Badge variant="outline" className="text-xs">Community Driven</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-12">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl mb-4">
              Our Values
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start space-x-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 flex-shrink-0">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Transparency</h3>
                <p className="text-slate-600">
                  All funding, votes, and decisions are visible to the community. 
                  You always know where your money goes and how decisions are made.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 flex-shrink-0">
                <Handshake className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Fair Compensation</h3>
                <p className="text-slate-600">
                  Developers and creators deserve to be paid for their work. 
                  Our platform ensures they receive funds when they deliver working solutions.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 flex-shrink-0">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Community Control</h3>
                <p className="text-slate-600">
                  The people who paid for products should decide what solutions are acceptable. 
                  Democratic voting ensures community needs are met.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 flex-shrink-0">
                <Globe className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Open Solutions</h3>
                <p className="text-slate-600">
                  We encourage open-source solutions and community ownership to prevent 
                  future shutdowns from breaking things again.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl mb-4">
              Ready to Revive Something?
            </h2>
            <p className="text-lg text-blue-100 mb-8">
              Whether you have something that needs restoring or skills to help restore others' products, 
              ReviveIt connects communities with solutions.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" variant="secondary" className="px-8 w-full sm:w-auto" asChild>
                <Link href="/create">
                  Start a Restoration
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-8 border-white text-white hover:bg-white hover:text-blue-600 bg-transparent w-full sm:w-auto"
                asChild
              >
                <Link href="/browse">
                  Find Projects to Support
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Info */}
      <section className="py-12 bg-slate-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-slate-400 mb-2">
              ReviveIt is a community-driven platform for restoring discontinued digital products and services.
            </p>
            <p className="text-slate-500 text-sm">
              We believe in digital preservation, fair compensation, and community ownership.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}