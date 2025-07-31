"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Upload, Target, DollarSign, Calendar, ImageIcon, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function CreateBountyPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    longDescription: "",
    category: "",
    company: "",
    goal: "",
    duration: "",
    image: null,
  })

  const categories = [
    "Productivity",
    "Social Media",
    "Mobile OS",
    "Communication",
    "Development",
    "Gaming",
    "Entertainment",
    "Education",
    "Finance",
    "Health & Fitness",
  ]

  const handleNext = () => {
    if (step < 4) setStep(step + 1)
  }

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = () => {
    // Handle form submission
    console.log("Submitting bounty:", formData)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                <Target className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-slate-900">BringItBack</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                Save Draft
              </Button>
              <Button variant="ghost" size="sm">
                Preview
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button variant="ghost" className="mb-6" asChild>
          <Link href="/browse">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Browse
          </Link>
        </Button>

        <div className="max-w-4xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3, 4].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                      step >= stepNumber ? "bg-blue-500 border-blue-500 text-white" : "border-slate-300 text-slate-400"
                    }`}
                  >
                    {step > stepNumber ? <CheckCircle className="h-5 w-5" /> : stepNumber}
                  </div>
                  {stepNumber < 4 && (
                    <div className={`h-1 w-24 mx-4 ${step > stepNumber ? "bg-blue-500" : "bg-slate-200"}`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-sm text-slate-600">
              <span>Basic Info</span>
              <span>Details</span>
              <span>Funding</span>
              <span>Review</span>
            </div>
          </div>

          {/* Step Content */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {step === 1 && "Basic Information"}
                {step === 2 && "Project Details"}
                {step === 3 && "Funding Goals"}
                {step === 4 && "Review & Submit"}
              </CardTitle>
              <CardDescription>
                {step === 1 && "Tell us about the product or service that stopped working"}
                {step === 2 && "Provide detailed information about your restoration campaign"}
                {step === 3 && "Set your funding goal and timeline"}
                {step === 4 && "Review your restoration campaign before publishing"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {step === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="title">Product/Service That Stopped Working *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Google Reader"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Original Company</Label>
                    <Input
                      id="company"
                      placeholder="e.g., Google"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">What Stopped Working *</Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of the product/service you purchased that no longer works (max 200 characters)"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      maxLength={200}
                    />
                    <p className="text-sm text-slate-500">{formData.description.length}/200 characters</p>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="longDescription">Why This Needs to Work Again *</Label>
                    <Textarea
                      id="longDescription"
                      placeholder="Explain how you and others used this product, why it was important, and what happened when the company made it stop working..."
                      value={formData.longDescription}
                      onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
                      rows={8}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Project Image</Label>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-slate-400 transition-colors cursor-pointer">
                      <ImageIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-600 mb-2">Upload an image for your bounty</p>
                      <p className="text-sm text-slate-500">PNG, JPG up to 10MB</p>
                      <Button variant="outline" className="mt-4 bg-transparent">
                        <Upload className="mr-2 h-4 w-4" />
                        Choose File
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Why This Matters</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="p-4">
                        <h4 className="font-medium mb-2">Who Was Affected</h4>
                        <p className="text-sm text-slate-600">
                          How many people purchased or relied on this product/service?
                        </p>
                      </Card>
                      <Card className="p-4">
                        <h4 className="font-medium mb-2">What Was Lost</h4>
                        <p className="text-sm text-slate-600">
                          What functionality did people lose when the company shut it down?
                        </p>
                      </Card>
                    </div>
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="goal">Funding Goal *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                      <Input
                        id="goal"
                        type="number"
                        placeholder="100000"
                        value={formData.goal}
                        onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                    <p className="text-sm text-slate-500">Set a realistic goal based on development complexity</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Campaign Duration *</Label>
                    <Select
                      value={formData.duration}
                      onValueChange={(value) => setFormData({ ...formData, duration: value })}
                    >
                      <SelectTrigger>
                        <Calendar className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="60">60 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="120">120 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <Label>Funding Milestones</Label>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-4 p-4 border rounded-lg">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                          <Target className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <Input placeholder="Milestone amount" className="mb-2" />
                          <Input placeholder="What will be delivered at this milestone" />
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Add Milestone
                      </Button>
                    </div>
                  </div>
                </>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <div className="bg-slate-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Bounty Preview</h3>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-slate-600">Title</Label>
                        <p className="text-slate-900">{formData.title || "Not specified"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-600">Category</Label>
                        <div className="mt-1">
                          {formData.category && <Badge variant="secondary">{formData.category}</Badge>}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-600">Funding Goal</Label>
                        <p className="text-slate-900">
                          ${formData.goal ? Number.parseInt(formData.goal).toLocaleString() : "Not specified"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-600">Duration</Label>
                        <p className="text-slate-900">
                          {formData.duration ? `${formData.duration} days` : "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Before You Submit Your Restoration</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Make sure all information about the broken product is accurate</li>
                      <li>• Your restoration campaign will be reviewed before going live</li>
                      <li>• You'll be notified within 24-48 hours about approval status</li>
                      <li>• Focus on products that people actually purchased or actively used</li>
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={handlePrevious} disabled={step === 1}>
              Previous
            </Button>
            <div className="space-x-4">
              <Button variant="ghost">Save Draft</Button>
              {step < 4 ? (
                <Button onClick={handleNext}>Next</Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  Submit Restoration Campaign
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
