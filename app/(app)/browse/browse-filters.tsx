"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, TrendingUp } from "lucide-react"

interface BrowseFiltersProps {
  categories: { value: string; label: string }[]
  currentSearch: string
  currentCategory: string
  currentSort: string
}

export default function BrowseFilters({ 
  categories, 
  currentSearch, 
  currentCategory, 
  currentSort 
}: BrowseFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(currentSearch)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      updateURL({ search: searchQuery })
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const updateURL = (updates: { search?: string; category?: string; sort?: string }) => {
    const params = new URLSearchParams(searchParams.toString())
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== "all") {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })

    router.push(`/browse?${params.toString()}`)
  }

  const handleCategoryChange = (category: string) => {
    updateURL({ category })
  }

  const handleSortChange = (sort: string) => {
    updateURL({ sort })
  }

  return (
    <div className="mb-8 space-y-4 md:space-y-0 md:flex md:items-center md:space-x-4">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
        <Input
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Select value={currentCategory} onValueChange={handleCategoryChange}>
        <SelectTrigger className="w-full md:w-48">
          <Filter className="mr-2 h-4 w-4" />
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((category) => (
            <SelectItem key={category.value} value={category.value}>
              {category.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={currentSort} onValueChange={handleSortChange}>
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
  )
}