"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DollarSign, Heart } from "lucide-react"
import ContributeModal from "./contribute-modal"

interface ContributeButtonProps {
  bountyId: string
  bountyTitle: string
  variant?: "primary" | "secondary" | "empty-state"
  className?: string
}

export default function ContributeButton({ 
  bountyId, 
  bountyTitle, 
  variant = "primary",
  className 
}: ContributeButtonProps) {
  const [showModal, setShowModal] = useState(false)

  const handleContributeSuccess = () => {
    // Refresh the page to show updated contribution data
    window.location.reload()
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
          Fund This Restoration
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
        className={`w-full bg-transparent ${className || ""}`}
        onClick={() => {
          // TODO: Implement save for later functionality
          alert('Save for later functionality coming soon!')
        }}
      >
        <Heart className="mr-2 h-4 w-4" />
        Save for Later
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
          Fund This Restoration
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