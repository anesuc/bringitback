"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRight, Search, Filter, Users, Clock, Target, TrendingUp, Heart } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function BrowsePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("trending")

  const bounties = [
    {
      id: 1,
      title: "Google Reader",
      description: "Revive the beloved RSS reader that millions relied on for news aggregation",
      company: "Google",
      raised: 125000,
      goal: 500000,
      backers: 2847,
      timeLeft: "23 days",
      category: "Productivity",
      trending: true,
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 2,
      title: "Vine",
      description: "Restore the 6-second video platform that launched countless creators",
      company: "Twitter",
      raised: 89000,
      goal: 300000,
      backers: 1923,
      timeLeft: "45 days",
      category: "Social Media",
      trending: true,
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 3,
      title: "Windows Phone",
      description: "Revive the innovative mobile OS with its unique tile interface",
      company: "Microsoft",
      raised: 67000,
      goal: 1000000,
      backers: 1456,
      timeLeft: "67 days",
      category: "Mobile OS",
      trending: false,
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 4,
      title: "Google Wave",
      description: "Restore the real-time collaborative communication platform",
      company: "Google",
      raised: 34000,
      goal: 200000,
      backers: 892,
      timeLeft: "12 days",
      category: "Communication",
      trending: false,
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 5,
      title: "Adobe Flash Player",
      description: "Revive Flash support for legacy games and animations",
      company: "Adobe",
      raised: 156000,
      goal: 750000,
      backers: 3421,
      timeLeft: "89 days",
      category: "Development",
      trending: true,
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 6,
      title: "Clubhouse Audio Rooms",
      description: "Restore the original audio-only social networking experience",
      company: "Clubhouse",
      raised: 23000,
      goal: 150000,
      backers: 567,
      timeLeft: "34 days",
      category: "Social Media",
      trending: false,
      image: "/placeholder.svg?height=200&width=300",
    },
  ]

  const categories = [
    "all",
    "Productivity",
    "Social Media",
    "Mobile OS",
    "Communication",
    "Development",
    "Gaming",
    "Entertainment",
  ]

  const filteredBounties = bounties.filter((bounty) => {
    const matchesSearch =
      bounty.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bounty.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || bounty.category === selectedCategory
    return matchesSearch && matchesCategory
  })

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
        <div className="mb-8 space-y-4 md:space-y-0 md:flex md:items-center md:space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search for products that stopped working..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-48">
              <TrendingUp className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="trending">Trending</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="most-funded">Most Funded</SelectItem>
              <SelectItem value="most-contributors">Most Contributors</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-slate-600">
            Showing {filteredBounties.length} of {bounties.length} restoration campaigns
          </p>
        </div>

        {/* Bounties Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredBounties.map((bounty) => (
            <Card
              key={bounty.id}
              className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm"
            >
              <div className="aspect-video overflow-hidden relative">
                <Image
                  src={bounty.image || "/placeholder.svg"}
                  alt={bounty.title}
                  width={300}
                  height={200}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {bounty.trending && (
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
                    {bounty.category}
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
                      <span className="font-medium text-slate-900">${bounty.raised.toLocaleString()} contributed</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-slate-600">
                      <Users className="mr-1 h-4 w-4" />
                      {bounty.backers.toLocaleString()} contributors
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

        {/* Load More */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            Load More Bounties
          </Button>
        </div>
      </div>
    </div>
  )
}
