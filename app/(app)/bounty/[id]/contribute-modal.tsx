"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
} from "@/components/ui/dialog"
import { DollarSign, CreditCard, Lock } from "lucide-react"

interface ContributeModalProps {
  bountyId: string
  bountyTitle: string
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function ContributeModal({ 
  bountyId, 
  bountyTitle, 
  isOpen, 
  onClose, 
  onSuccess 
}: ContributeModalProps) {
  const { data: session } = useSession()
  const [amount, setAmount] = useState("")
  const [anonymous, setAnonymous] = useState(false)
  const [processing, setProcessing] = useState(false)

  const predefinedAmounts = [10, 25, 50, 100, 250]

  const handleContribute = async () => {
    if (!session) {
      alert('Please sign in to contribute')
      return
    }

    const contributionAmount = parseFloat(amount)
    if (!contributionAmount || contributionAmount < 1) {
      alert('Please enter a valid amount (minimum $1)')
      return
    }

    setProcessing(true)
    try {
      const response = await fetch(`/api/bounties/${bountyId}/contribute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: contributionAmount,
          anonymous,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // Redirect to Stripe checkout
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl
        }
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to process contribution')
      }
    } catch (error) {
      console.error('Failed to contribute:', error)
      alert('Failed to process contribution')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Fund This Restoration
          </DialogTitle>
          <DialogDescription>
            Support the restoration of {bountyTitle}. Your contribution helps incentivize developers to create solutions.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Predefined amounts */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Quick amounts</Label>
            <div className="grid grid-cols-3 gap-2">
              {predefinedAmounts.map((preset) => (
                <Button
                  key={preset}
                  variant={amount === preset.toString() ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAmount(preset.toString())}
                  className="text-sm"
                >
                  ${preset}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom amount */}
          <div>
            <Label htmlFor="amount" className="text-sm font-medium">
              Custom amount (USD)
            </Label>
            <div className="relative mt-1">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="amount"
                type="number"
                min="1"
                step="1"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Anonymous option */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="anonymous"
              checked={anonymous}
              onCheckedChange={(checked) => setAnonymous(checked as boolean)}
            />
            <Label htmlFor="anonymous" className="text-sm text-slate-600">
              Contribute anonymously
            </Label>
          </div>

          {/* Security note */}
          <div className="flex items-start space-x-2 p-3 bg-slate-50 rounded-lg">
            <Lock className="h-4 w-4 text-slate-500 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-slate-600">
              <p className="font-medium mb-1">Secure payment processing</p>
              <p>Your payment information is processed securely. We don't store your card details.</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleContribute} 
              disabled={processing || !amount}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              {processing ? "Processing..." : `Contribute $${amount || "0"}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}