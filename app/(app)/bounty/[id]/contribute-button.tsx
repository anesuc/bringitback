"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { DollarSign, Heart, HeartHandshake } from "lucide-react"
import ContributeModal from "./contribute-modal"

interface ContributeButtonProps {
  bountyId: string
  bountyTitle: string
  variant?: "primary" | "secondary" | "empty-state"
  className?: string
  isSaved?: boolean
}

export default function ContributeButton({ 
  bountyId, 
  bountyTitle, 
  variant = "primary",
  className,
  isSaved = false
}: ContributeButtonProps) {
  const { data: session } = useSession()
  const [showModal, setShowModal] = useState(false)
  const [saved, setSaved] = useState(isSaved)
  const [savingState, setSavingState] = useState(false)

  const handleContributeSuccess = () => {
    // Refresh the page to show updated contribution data
    window.location.reload()
  }

  const handleSaveToggle = async () => {
    if (!session) {
      alert('Please sign in to save bounties')
      return
    }

    setSavingState(true)
    try {
      const method = saved ? 'DELETE' : 'POST'
      const response = await fetch(`/api/bounties/${bountyId}/save`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        setSaved(!saved)
      } else {
        const errorData = await response.json()
        alert(errorData.error || `Failed to ${saved ? 'unsave' : 'save'} bounty`)
      }
    } catch (error) {
      console.error('Failed to toggle save:', error)
      alert(`Failed to ${saved ? 'unsave' : 'save'} bounty`)
    } finally {
      setSavingState(false)
    }
  }

  if (variant === "primary") {
    return (
      <>
        <Button
          size="lg"
          className={`w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 ${className || ""}`}
          onClick={() => setShowModal(true)}
        >
          <DollarSign className="mr-2 h-4 w-4" />
          Donate to This Restoration
        </Button>
        <ContributeModal
          bountyId={bountyId}
          bountyTitle={bountyTitle}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={handleContributeSuccess}
        />
      </>
    )
  }

  if (variant === "secondary") {
    return (
      <Button 
        variant="outline" 
        size="lg" 
        className={`w-full bg-transparent ${className || ""} ${saved ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100' : ''}`}
        onClick={handleSaveToggle}
        disabled={savingState}
      >
        {saved ? (
          <HeartHandshake className="mr-2 h-4 w-4 fill-current" />
        ) : (
          <Heart className="mr-2 h-4 w-4" />
        )}
        {savingState 
          ? (saved ? 'Removing...' : 'Saving...') 
          : (saved ? 'Saved' : 'Save for Later')
        }
      </Button>
    )
  }

  if (variant === "empty-state") {
    return (
      <>
        <Button
          size="lg"
          className={`bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 ${className || ""}`}
          onClick={() => setShowModal(true)}
        >
          <DollarSign className="mr-2 h-4 w-4" />
          Donate to This Restoration
        </Button>
        <ContributeModal
          bountyId={bountyId}
          bountyTitle={bountyTitle}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={handleContributeSuccess}
        />
      </>
    )
  }

  return null
}