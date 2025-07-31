"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, Reply, Send, User } from "lucide-react"
import Link from "next/link"

interface Comment {
  id: string
  content: string
  createdAt: string
  user: {
    id: string
    name: string | null
    image: string | null
  }
  replies?: Comment[]
}

interface CommentsResponse {
  comments: Comment[]
  total: number
  hasMore: boolean
}

interface CommentsSectionProps {
  bountyId: string
}

export default function CommentsSection({ bountyId }: CommentsSectionProps) {
  const { data: session } = useSession()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")

  useEffect(() => {
    fetchComments()
  }, [bountyId])

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/bounties/${bountyId}/comments`)
      if (response.ok) {
        const data: CommentsResponse = await response.json()
        setComments(data.comments)
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const submitComment = async (content: string, parentId?: string) => {
    if (!session) {
      alert('Please sign in to comment')
      return
    }

    if (!content.trim()) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/bounties/${bountyId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content.trim(),
          parentId,
        }),
      })

      if (response.ok) {
        const newCommentData = await response.json()
        
        if (parentId) {
          // Add reply to existing comment
          setComments(prev => prev.map(comment => 
            comment.id === parentId 
              ? { ...comment, replies: [...(comment.replies || []), newCommentData] }
              : comment
          ))
          setReplyContent("")
          setReplyingTo(null)
        } else {
          // Add new top-level comment
          setComments(prev => [newCommentData, ...prev])
          setNewComment("")
        }
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to post comment')
      }
    } catch (error) {
      console.error('Failed to submit comment:', error)
      alert('Failed to post comment')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <MessageCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <p className="text-slate-600">Loading comments...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      {session ? (
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={session.user?.image || undefined} alt={session.user?.name || 'User'} />
              <AvatarFallback>
                {session.user?.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("") || <User className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <Textarea
                placeholder="Share your thoughts about this restoration..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[100px]"
              />
              <div className="flex justify-end">
                <Button 
                  onClick={() => submitComment(newComment)}
                  disabled={submitting || !newComment.trim()}
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  {submitting ? "Posting..." : "Post Comment"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 bg-slate-50 rounded-lg">
          <MessageCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 mb-4">Sign in to join the discussion</p>
          <Button asChild>
            <Link href="/auth/signin">Sign In</Link>
          </Button>
        </div>
      )}

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">No comments yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="space-y-4">
              {/* Main Comment */}
              <div className="flex items-start space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={comment.user.image || undefined} alt={comment.user.name || 'User'} />
                  <AvatarFallback>
                    {comment.user.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("") || <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-slate-900">
                        {comment.user.name || 'Anonymous'}
                      </span>
                      <span className="text-sm text-slate-500">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-slate-700">{comment.content}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                      className="text-slate-600 hover:text-slate-900"
                    >
                      <Reply className="h-4 w-4 mr-1" />
                      Reply
                    </Button>
                  </div>

                  {/* Reply Form */}
                  {replyingTo === comment.id && session && (
                    <div className="mt-4 ml-4 space-y-2">
                      <Textarea
                        placeholder="Write a reply..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        className="min-h-[80px]"
                      />
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setReplyingTo(null)
                            setReplyContent("")
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => submitComment(replyContent, comment.id)}
                          disabled={submitting || !replyContent.trim()}
                        >
                          {submitting ? "Posting..." : "Reply"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-12 space-y-4">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="flex items-start space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={reply.user.image || undefined} alt={reply.user.name || 'User'} />
                        <AvatarFallback className="text-xs">
                          {reply.user.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("") || <User className="h-3 w-3" />}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="bg-slate-50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-slate-900 text-sm">
                              {reply.user.name || 'Anonymous'}
                            </span>
                            <span className="text-xs text-slate-500">
                              {formatDate(reply.createdAt)}
                            </span>
                          </div>
                          <p className="text-slate-700 text-sm">{reply.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}