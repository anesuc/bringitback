"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  BarChart3,
  Globe,
  Monitor,
  Smartphone,
  Eye
} from "lucide-react"
import Link from "next/link"
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from 'recharts'

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

interface Analytics {
  totalPageViews: number
  uniqueVisitors: number
  pageViewsByCountry: { country: string; count: number }[]
  pageViewsByPath: { path: string; count: number; bountyTitle?: string | null }[]
  deviceBreakdown: { device: string; count: number }[]
  browserBreakdown: { browser: string; count: number }[]
  hourlyTraffic: { hour: string; count: number }[]
  topReferrers: { referrer: string; count: number }[]
  mostViewedBounties: { id: string; title: string; viewCount: number }[]
}

// Chart colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658']

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm">
        <p className="text-sm font-medium">{`${label}`}</p>
        {payload.map((pld: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: pld.color }}>
            {`${pld.dataKey}: ${pld.value}`}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [pendingPayouts, setPendingPayouts] = useState<PendingPayout[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [activityFilter, setActivityFilter] = useState<string>("all")
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [analyticsDays, setAnalyticsDays] = useState(7)
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
  }, [activityFilter, analyticsDays])

  const fetchAdminData = async () => {
    try {
      const [statsResponse, payoutsResponse, activitiesResponse, analyticsResponse] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/payouts"),
        fetch(`/api/admin/activities?limit=10${activityFilter !== "all" ? `&type=${activityFilter}` : ""}`),
        fetch(`/api/admin/analytics?days=${analyticsDays}`)
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

      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json()
        setAnalytics(analyticsData)
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
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-600 mt-2">Manage ReviveIt platform operations</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-1 sm:gap-2">
              <BarChart3 className="h-4 w-4 hidden sm:block" />
              <span className="text-xs sm:text-sm">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-1 sm:gap-2">
              <Eye className="h-4 w-4 hidden sm:block" />
              <span className="text-xs sm:text-sm">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="payouts" className="flex items-center gap-1 sm:gap-2">
              <DollarSign className="h-4 w-4 hidden sm:block" />
              <span className="text-xs sm:text-sm">Payouts</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1 sm:gap-2 hidden sm:flex">
              <Settings className="h-4 w-4 hidden sm:block" />
              <span className="text-xs sm:text-sm">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-2xl font-bold">{stats.totalUsers}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Total Bounties</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-2xl font-bold">{stats.totalBounties}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.activeBounties} active • {stats.completedBounties} completed
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Total Funding</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-2xl font-bold">${stats.totalFunding.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalContributions} contributions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Pending Payouts</CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-2xl font-bold">{stats.pendingPayouts}</div>
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

          <TabsContent value="analytics">
            <div className="space-y-6">
              {/* Analytics Controls */}
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Traffic Analytics</h2>
                <Select value={analyticsDays.toString()} onValueChange={(v) => setAnalyticsDays(parseInt(v))}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Last 24 hours</SelectItem>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Key Metrics */}
              {analytics && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium">Page Views</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-lg sm:text-2xl font-bold">{analytics.totalPageViews.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Last {analyticsDays} days</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium">Unique Visitors</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-lg sm:text-2xl font-bold">{analytics.uniqueVisitors.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Last {analyticsDays} days</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium">Top Country</CardTitle>
                        <Globe className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-lg sm:text-2xl font-bold">
                          {analytics.pageViewsByCountry[0]?.country || 'N/A'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {analytics.pageViewsByCountry[0]?.count || 0} views
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium">Mobile Traffic</CardTitle>
                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-lg sm:text-2xl font-bold">
                          {Math.round(
                            ((analytics.deviceBreakdown.find(d => d.device === 'mobile')?.count || 0) /
                              analytics.totalPageViews) *
                              100
                          )}%
                        </div>
                        <p className="text-xs text-muted-foreground">Of total traffic</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Traffic Over Time Chart */}
                  {analytics.hourlyTraffic.length > 0 && (
                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle>Traffic Over Time</CardTitle>
                        <CardDescription>Page views over the last 24 hours</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <AreaChart data={analytics.hourlyTraffic}>
                            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                            <XAxis 
                              dataKey="hour" 
                              tick={{ fontSize: 12 }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <YAxis 
                              tick={{ fontSize: 12 }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area 
                              type="monotone" 
                              dataKey="count" 
                              stroke="#0088FE" 
                              fill="#0088FE" 
                              fillOpacity={0.1}
                              strokeWidth={2}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  )}

                  {/* Charts Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Top Pages Chart */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Top Pages</CardTitle>
                        <CardDescription>Most visited pages</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart 
                            data={analytics.pageViewsByPath.slice(0, 6).map(item => ({
                              ...item,
                              displayPath: item.path === '/' ? 'Home' : 
                                          item.path.startsWith('/bounty/') ? 'Bounty Page' :
                                          item.path.startsWith('/api/') ? 'API' :
                                          item.path.replace(/^\//, '').split('/')[0] || 'Page'
                            }))}
                          >
                            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                            <XAxis 
                              dataKey="displayPath" 
                              tick={{ fontSize: 11 }}
                              axisLine={false}
                              tickLine={false}
                              angle={-45}
                              textAnchor="end"
                              height={60}
                            />
                            <YAxis 
                              tick={{ fontSize: 12 }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <Tooltip 
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload
                                  return (
                                    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm max-w-xs">
                                      {data.bountyTitle ? (
                                        <>
                                          <p className="text-sm font-medium">{data.bountyTitle}</p>
                                          <p className="text-xs text-gray-500">{data.path}</p>
                                        </>
                                      ) : (
                                        <p className="text-sm font-medium">{data.path}</p>
                                      )}
                                      <p className="text-sm text-blue-600">Views: {data.count}</p>
                                    </div>
                                  )
                                }
                                return null
                              }}
                            />
                            <Bar dataKey="count" fill="#0088FE" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Device Breakdown Pie Chart */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Device Types</CardTitle>
                        <CardDescription>Traffic by device category</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={analytics.deviceBreakdown}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ device, percent }) => `${device} ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="count"
                            >
                              {analytics.deviceBreakdown.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                          </PieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Additional Charts Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Countries Chart */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Top Countries</CardTitle>
                        <CardDescription>Visitor locations</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={analytics.pageViewsByCountry.slice(0, 6)}>
                            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                            <XAxis 
                              dataKey="country" 
                              tick={{ fontSize: 12 }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <YAxis 
                              tick={{ fontSize: 12 }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="count" fill="#00C49F" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Browser Breakdown */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Top Browsers</CardTitle>
                        <CardDescription>Browser usage statistics</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={analytics.browserBreakdown}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="count"
                              nameKey="browser"
                              label={({ browser, percent }) => `${browser || 'Unknown'} ${(percent * 100).toFixed(0)}%`}
                            >
                              {analytics.browserBreakdown.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload
                                  return (
                                    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm">
                                      <p className="text-sm font-medium">{data.browser || 'Unknown'}</p>
                                      <p className="text-sm text-blue-600">Count: {data.count}</p>
                                    </div>
                                  )
                                }
                                return null
                              }}
                            />
                            <Legend 
                              formatter={(value, entry) => entry.payload.browser || 'Unknown'}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Data Tables */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Referrers */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Top Referrers</CardTitle>
                        <CardDescription>Traffic sources</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {analytics.topReferrers.slice(0, 5).map((ref, i) => (
                            <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                              <span className="text-sm text-slate-600 truncate flex-1 mr-2">
                                {ref.referrer === 'Direct' ? 'Direct' : 
                                 ref.referrer.startsWith('http') ? new URL(ref.referrer).hostname : ref.referrer}
                              </span>
                              <Badge variant="secondary">{ref.count}</Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Most Viewed Bounties */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Most Viewed Bounties</CardTitle>
                        <CardDescription>Popular restoration campaigns</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {analytics.mostViewedBounties.map((bounty, i) => (
                            <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                              <Link href={`/bounty/${bounty.id}`} className="text-sm text-blue-600 hover:underline flex-1 mr-2 truncate">
                                {bounty.title}
                              </Link>
                              <Badge variant="secondary">{bounty.viewCount} views</Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </div>
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