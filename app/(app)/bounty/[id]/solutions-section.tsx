"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { 
  Code, 
  ExternalLink, 
  ThumbsUp, 
  ThumbsDown, 
  User, 
  Plus, 
  CheckCircle, 
  XCircle,
  Clock,
  Send
} from "lucide-react"
import Link from "next/link"

interface Solution {
  id: string
  title: string
  description: string
  implementation: string
  status: "PENDING" | "ACCEPTED" | "REJECTED"
  voteCount: number
  totalVoters: number
  acceptedAt?: string
  createdAt: string
  submitter: {
    id: string
    name: string | null
    image: string | null
  }
  votes: Array<{
    id: string
    vote: "APPROVE" | "REJECT"
    voter: {
      id: string
      name: string | null
      image: string | null
    }
  }>
  _count: {
    votes: number
  }
}

interface SolutionsSectionProps {
  bountyId: string
}

export default function SolutionsSection({ bountyId }: SolutionsSectionProps) {
  const { data: session } = useSession()
  const [solutions, setSolutions] = useState<Solution[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [newSolution, setNewSolution] = useState({
    title: "",
    description: "",
    implementation: "",
  })

  useEffect(() => {
    fetchSolutions()
  }, [bountyId])

  const fetchSolutions = async () => {
    try {
      const response = await fetch(`/api/bounties/${bountyId}/solutions`)
      if (response.ok) {
        const data = await response.json()
        setSolutions(data.solutions)
      }
    } catch (error) {
      console.error('Failed to fetch solutions:', error)
    } finally {
      setLoading(false)
    }
  }

  const submitSolution = async () => {
    if (!session) {
      alert('Please sign in to submit a solution')
      return
    }

    if (!newSolution.title || !newSolution.description || !newSolution.implementation) {
      alert('Please fill in all fields')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`/api/bounties/${bountyId}/solutions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSolution),
      })

      if (response.ok) {
        const newSolutionData = await response.json()
        setSolutions(prev => [newSolutionData, ...prev])
        setNewSolution({ title: "", description: "", implementation: "" })
        setShowSubmitDialog(false)
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to submit solution')
      }
    } catch (error) {
      console.error('Failed to submit solution:', error)
      alert('Failed to submit solution')
    } finally {
      setSubmitting(false)
    }
  }

  const vote = async (solutionId: string, voteType: "APPROVE" | "REJECT") => {
    if (!session) {
      alert('Please sign in to vote')
      return
    }

    try {
      const response = await fetch(`/api/solutions/${solutionId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vote: voteType }),
      })

      if (response.ok) {
        const data = await response.json()
        // Refresh solutions to get updated vote counts
        fetchSolutions()
        
        if (data.approvalPercentage >= 50) {
          alert('🎉 Solution accepted! This bounty has been completed.')
        }
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to vote')
      }
    } catch (error) {
      console.error('Failed to vote:', error)
      alert('Failed to vote')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getStatusBadge = (solution: Solution) => {
    switch (solution.status) {
      case "ACCEPTED":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Accepted</Badge>
      case "REJECTED":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      default:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
    }
  }

  const getUserVote = (solution: Solution) => {
    if (!session || !solution.votes) return null
    return solution.votes.find(vote => vote.voter.id === session.user?.id)?.vote
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <Code className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <p className="text-slate-600">Loading solutions...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Submit Solution Button */}
      {session && (
        <div className="flex justify-end">
          <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Submit Solution
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Submit Your Solution</DialogTitle>
                <DialogDescription>
                  Share your implementation to restore this functionality. Contributors will vote on whether to accept your solution.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Solution Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Zune HD Revival Server"
                    value={newSolution.title}
                    onChange={(e) => setNewSolution(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe how your solution works and what features it restores..."
                    value={newSolution.description}
                    onChange={(e) => setNewSolution(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="implementation">Implementation URL *</Label>
                  <Input
                    id="implementation"
                    type="url"
                    placeholder="https://github.com/yourusername/zune-revival"
                    value={newSolution.implementation}
                    onChange={(e) => setNewSolution(prev => ({ ...prev, implementation: e.target.value }))}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Link to GitHub repository, demo, or documentation
                  </p>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={submitSolution} disabled={submitting}>
                    <Send className="h-4 w-4 mr-2" />
                    {submitting ? "Submitting..." : "Submit Solution"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Solutions List */}
      {solutions.length === 0 ? (
        <div className="text-center py-12">
          <Code className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 mb-4">No solutions submitted yet.</p>
          <p className="text-sm text-slate-500">
            Be the first to submit a solution and claim this bounty!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {solutions.map((solution) => {
            const approvalPercentage = solution.totalVoters > 0 
              ? (solution.voteCount / solution.totalVoters) * 100 
              : 0
            const userVote = getUserVote(solution)
            
            return (
              <Card key={solution.id} className={`${solution.status === 'ACCEPTED' ? 'ring-2 ring-green-200 bg-green-50/50' : ''}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={solution.submitter.image || undefined} alt={solution.submitter.name || 'User'} />
                        <AvatarFallback>
                          {solution.submitter.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("") || <User className="h-4 w-4" />}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-lg">{solution.title}</CardTitle>
                          {getStatusBadge(solution)}
                        </div>
                        <p className="text-sm text-slate-600">
                          by {solution.submitter.name || 'Anonymous'} • {formatDate(solution.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-slate-700">{solution.description}</p>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href={solution.implementation} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Implementation
                      </a>
                    </Button>
                  </div>

                  {solution.status === "PENDING" && (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Approval Progress</span>
                          <span>{solution.voteCount}/{solution.totalVoters} contributors</span>
                        </div>
                        <Progress value={approvalPercentage} className="h-2" />
                        <p className="text-xs text-slate-500">
                          {Math.round(approvalPercentage)}% approval • Need 50% to accept
                        </p>
                      </div>

                      {session && solution.submitter.id !== session.user?.id && (
                        <div className="flex gap-2 pt-2 border-t">
                          <Button
                            size="sm"
                            variant={userVote === "APPROVE" ? "default" : "outline"}
                            onClick={() => vote(solution.id, "APPROVE")}
                            className="flex items-center gap-2"
                          >
                            <ThumbsUp className="h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant={userVote === "REJECT" ? "destructive" : "outline"}
                            onClick={() => vote(solution.id, "REJECT")}
                            className="flex items-center gap-2"
                          >
                            <ThumbsDown className="h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </>
                  )}

                  {solution.status === "ACCEPTED" && (
                    <div className="bg-green-100 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-green-800 font-medium">
                        🎉 This solution has been accepted by the contributors!
                      </p>
                      {solution.acceptedAt && (
                        <p className="text-xs text-green-600 mt-1">
                          Accepted on {formatDate(solution.acceptedAt)}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}