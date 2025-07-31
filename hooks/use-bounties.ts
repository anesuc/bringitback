"use client"

import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface Bounty {
  id: string
  title: string
  company: string
  category: string
  description: string
  imageUrl?: string
  fundingGoal: number
  fundingCurrent: number
  fundingDeadline: string
  status: string
  featured: boolean
  trending: boolean
  creator: {
    id: string
    name: string
    image?: string
  }
  _count: {
    contributions: number
    comments: number
  }
}

interface UseBountiesOptions {
  category?: string
  search?: string
  sort?: string
  status?: string
  featured?: boolean
  limit?: number
}

export function useBounties(options: UseBountiesOptions = {}) {
  const [bounties, setBounties] = useState<Bounty[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    fetchBounties()
  }, [options.category, options.search, options.sort, options.status, options.featured])

  const fetchBounties = async (offset = 0) => {
    try {
      const params = new URLSearchParams()
      if (options.category) params.append("category", options.category)
      if (options.search) params.append("search", options.search)
      if (options.sort) params.append("sort", options.sort)
      if (options.status) params.append("status", options.status)
      if (options.featured !== undefined) params.append("featured", String(options.featured))
      params.append("limit", String(options.limit || 12))
      params.append("offset", String(offset))

      const response = await fetch(`/api/bounties?${params}`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch bounties")
      }

      const data = await response.json()
      
      if (offset === 0) {
        setBounties(data.bounties)
      } else {
        setBounties((prev) => [...prev, ...data.bounties])
      }
      
      setHasMore(data.hasMore)
      setTotal(data.total)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load bounties",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchBounties(bounties.length)
    }
  }

  return {
    bounties,
    loading,
    hasMore,
    total,
    loadMore,
    refetch: () => fetchBounties(0),
  }
}