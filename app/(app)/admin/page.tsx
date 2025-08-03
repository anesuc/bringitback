"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Users, 
  Target, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Clock,
  Ban,
  Settings,
  BarChart3
} from "lucide-react"
import Link from "next/link"

interface AdminStats {
  totalUsers: number
  totalBounties: number
  totalContributions: number
  totalFunding: number
  pendingPayouts: number
  completedPayouts: number
  activeBounties: number
  completedBounties: number
}

interface PendingPayout {
  id: string
  amount: number
  netAmount: number
  status: string
  requestedAt: string
  user: {
    id: string
    name: string | null
    email: string
  }
  solution: {
    id: string
    title: string
    bounty: {
      id: string
      title: string
    }
  }
}

interface Activity {
  id: string
  type: string
  title: string
  description: string
  createdAt: string
  user?: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
  bounty?: {
    id: string
    title: string
  }
  solution?: {
    id: string
    title: string
  }
  payout?: {
    id: string
    amount: number
    netAmount: number
    status: string
  }
  metadata?: any
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [pendingPayouts, setPendingPayouts] = useState<PendingPayout[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [activityFilter, setActivityFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/auth/signin")
      return
    }

    // Check if user is admin - this will be verified on the server side too
    fetchAdminData()
  }, [session, status, router])

  // Refetch activities when filter changes
  useEffect(() => {
    if (session) {
      fetchAdminData()
    }
  }, [activityFilter])

  const fetchAdminData = async () => {
    try {
      const [statsResponse, payoutsResponse, activitiesResponse] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/payouts"),
        fetch(`/api/admin/activities?limit=10${activityFilter !== "all" ? `&type=${activityFilter}` : ""}`)
      ])

      if (statsResponse.status === 403 || payoutsResponse.status === 403) {
        router.push("/")
        return
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      if (payoutsResponse.ok) {
        const payoutsData = await payoutsResponse.json()
        setPendingPayouts(payoutsData.payouts)
      }

      if (activitiesResponse.ok) {
        const activitiesData = await activitiesResponse.json()
        setActivities(activitiesData.activities)
      }
    } catch (error) {
      console.error("Failed to fetch admin data:", error)
    } finally {
      setLoading(false)
    }
  }

  const updatePayoutStatus = async (payoutId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/payouts/${payoutId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        fetchAdminData() // Refresh data
      }
    } catch (error) {
      console.error("Failed to update payout status:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
          <p className="text-slate-600">You don't have permission to access the admin dashboard.</p>
          <Button asChild className="mt-4">
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-600 mt-2">Manage ReviveIt platform operations</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="payouts" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Payouts
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Bounties</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalBounties}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.activeBounties} active • {stats.completedBounties} completed
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Funding</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats.totalFunding.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalContributions} contributions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingPayouts}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.completedPayouts} completed
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Recent Activity</CardTitle>
                      <CardDescription>Latest platform activity</CardDescription>
                    </div>
                    <select
                      value={activityFilter}
                      onChange={(e) => setActivityFilter(e.target.value)}
                      className="text-sm border rounded px-2 py-1"
                    >
                      <option value="all">All Activities</option>
                      <option value="USER_REGISTERED">User Registrations</option>
                      <option value="BOUNTY_CREATED">Bounty Created</option>
                      <option value="CONTRIBUTION_MADE">Contributions</option>
                      <option value="SOLUTION_SUBMITTED">Solutions</option>
                      <option value="PAYOUT_REQUESTED">Payout Requests</option>
                      <option value="PAYOUT_PAID">Payouts Paid</option>
                      <option value="ADMIN_ACTION">Admin Actions</option>
                    </select>
                  </div>
                </CardHeader>
                <CardContent>
                  {activities.length === 0 ? (
                    <p className="text-sm text-slate-600 text-center py-4">No recent activity</p>
                  ) : (
                    <div className="space-y-3">
                      {activities.map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{activity.title}</span>
                              <Badge variant="outline" className="text-xs">
                                {activity.type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600">{activity.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                              {activity.user && (
                                <span>by {activity.user.name || activity.user.email}</span>
                              )}
                              <span>{new Date(activity.createdAt).toLocaleString()}</span>
                              {activity.bounty && (
                                <span>• {activity.bounty.title}</span>
                              )}
                              {activity.metadata?.amount && (
                                <span>• ${activity.metadata.amount.toFixed(2)}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="payouts">
            <Card>
              <CardHeader>
                <CardTitle>Payout Requests</CardTitle>
                <CardDescription>
                  Manage payout requests from solution submitters
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingPayouts.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-slate-600">No pending payout requests</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingPayouts.map((payout) => (
                      <div key={payout.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{payout.solution.title}</h3>
                              <Badge variant={payout.status === "PENDING" ? "secondary" : "default"}>
                                {payout.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600">
                              Bounty: {payout.solution.bounty.title}
                            </p>
                            <p className="text-sm text-slate-600">
                              User: {payout.user.name || payout.user.email}
                            </p>
                            <div className="flex items-center gap-4 text-sm">
                              <span>Amount: ${payout.amount.toFixed(2)}</span>
                              <span>Net: ${payout.netAmount.toFixed(2)}</span>
                              <span>Requested: {new Date(payout.requestedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {payout.status === "PENDING" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => updatePayoutStatus(payout.id, "PAID")}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Mark as Paid
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updatePayoutStatus(payout.id, "FAILED")}
                                >
                                  <Ban className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
                <CardDescription>Configure platform settings</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">Settings panel coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}