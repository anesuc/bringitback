"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { 
  Calendar, 
  Plus, 
  Send,
  User
} from "lucide-react"

interface Update {
  id: string
  title: string
  content: string
  imageUrl?: string
  createdAt: string
  author?: {
    id: string
    name: string
    image?: string
  } | null
}

interface UpdatesSectionProps {
  bountyId: string
  currentUserId?: string
  isCreator: boolean
  hasSolutionSubmission: boolean
}

export default function UpdatesSection({ bountyId, currentUserId, isCreator, hasSolutionSubmission }: UpdatesSectionProps) {
  const { data: session } = useSession()
  const [updates, setUpdates] = useState<Update[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newUpdate, setNewUpdate] = useState({
    title: "",
    content: "",
    imageUrl: "",
  })

  useEffect(() => {
    fetchUpdates()
  }, [bountyId])

  const fetchUpdates = async () => {
    try {
      const response = await fetch(`/api/bounties/${bountyId}/updates`)
      if (response.ok) {
        const data = await response.json()
        setUpdates(data)
      }
    } catch (error) {
      console.error('Failed to fetch updates:', error)
    } finally {
      setLoading(false)
    }
  }

  const createUpdate = async () => {
    if (!session) {
      alert('Please sign in to create an update')
      return
    }

    if (!newUpdate.title || !newUpdate.content) {
      alert('Please fill in title and content')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`/api/bounties/${bountyId}/updates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newUpdate.title,
          content: newUpdate.content,
          imageUrl: newUpdate.imageUrl || undefined,
        }),
      })

      if (response.ok) {
        const newUpdateData = await response.json()
        setUpdates(prev => [newUpdateData, ...prev])
        setNewUpdate({ title: "", content: "", imageUrl: "" })
        setShowCreateDialog(false)
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to create update')
      }
    } catch (error) {
      console.error('Failed to create update:', error)
      alert('Failed to create update')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <p className="text-slate-600">Loading updates...</p>
      </div>
    )
  }

  const canPostUpdate = session && (isCreator || hasSolutionSubmission)

  return (
    <div className="space-y-6">
      {/* Create Update Button - For creators and solution submitters */}
      {canPostUpdate && (
        <div className="flex justify-end">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Post Update
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Post Update</DialogTitle>
                <DialogDescription>
                  {isCreator 
                    ? "Share updates about the bounty status or clarifications with contributors."
                    : "Share your development progress with contributors. They'll be notified about this update."
                  }
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="update-title">Update Title *</Label>
                  <Input
                    id="update-title"
                    placeholder={isCreator 
                      ? "e.g., Bounty Requirements Updated"
                      : "e.g., Server Setup Complete - Testing Phase Started"
                    }
                    value={newUpdate.title}
                    onChange={(e) => setNewUpdate(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="update-content">Content *</Label>
                  <Textarea
                    id="update-content"
                    placeholder={isCreator
                      ? "Share updates about the bounty, clarify requirements, or provide additional context..."
                      : "Describe your progress, any challenges you've overcome, next steps, or milestones reached..."
                    }
                    value={newUpdate.content}
                    onChange={(e) => setNewUpdate(prev => ({ ...prev, content: e.target.value }))}
                    rows={6}
                  />
                </div>
                <div>
                  <Label htmlFor="update-image">Image URL (optional)</Label>
                  <Input
                    id="update-image"
                    type="url"
                    placeholder="https://example.com/screenshot.png"
                    value={newUpdate.imageUrl}
                    onChange={(e) => setNewUpdate(prev => ({ ...prev, imageUrl: e.target.value }))}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Link to screenshot, demo, or progress image
                  </p>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createUpdate} disabled={submitting}>
                    <Send className="h-4 w-4 mr-2" />
                    {submitting ? "Posting..." : "Post Update"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Updates List */}
      {updates.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 mb-4">No updates yet</p>
          {canPostUpdate ? (
            <p className="text-sm text-slate-500">
              Keep contributors informed by posting updates about progress or bounty details
            </p>
          ) : (
            <p className="text-sm text-slate-500">
              No updates have been posted yet
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {updates.map((update) => (
            <Card key={update.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={update.author?.image || undefined} alt={update.author?.name || 'User'} />
                      <AvatarFallback>
                        {update.author?.name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("") || <User className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{update.title}</CardTitle>
                      <div className="flex items-center text-sm text-slate-500 mt-1">
                        <Calendar className="mr-1 h-4 w-4" />
                        {formatDate(update.createdAt)} • by {update.author?.name || 'Unknown'}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="prose max-w-none">
                  <p className="text-slate-700 whitespace-pre-wrap">{update.content}</p>
                </div>
                {update.imageUrl && (
                  <div className="mt-4">
                    <img
                      src={update.imageUrl}
                      alt="Update image"
                      className="rounded-lg max-w-full h-auto border"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}