"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { data: session } = useSession()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    longDescription: "",
    category: "",
    company: "",
    image: null,
    imageId: "",
    imageUrl: "",
    thumbnailUrl: "",
    whatStoppedWorking: "",
  })
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  const categories = [
    { value: "MEDIA_PLAYERS", label: "Media Players" },
    { value: "ONLINE_GAMES", label: "Online Games" },
    { value: "SMART_DEVICES", label: "Smart Devices" },
    { value: "MOBILE_APPS", label: "Mobile Apps" },
    { value: "DESKTOP_SOFTWARE", label: "Desktop Software" },
    { value: "STREAMING_SERVICES", label: "Streaming Services" },
    { value: "SOCIAL_PLATFORMS", label: "Social Platforms" },
    { value: "PRODUCTIVITY_TOOLS", label: "Productivity Tools" },
    { value: "CLOUD_SERVICES", label: "Cloud Services" },
    { value: "MESSAGING_APPS", label: "Messaging Apps" },
    { value: "WEARABLE_DEVICES", label: "Wearable Devices" },
    { value: "OTHER", label: "Other" },
  ]

  const handleNext = () => {
    if (step < 3) setStep(step + 1)
  }

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploadingImage(true)
    
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('image', file)

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: uploadFormData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to upload image')
      }

      const { imageId, imageUrl, thumbnailUrl } = await response.json()
      
      setFormData({ 
        ...formData, 
        image: file, 
        imageId,
        imageUrl, 
        thumbnailUrl 
      })
    } catch (error) {
      console.error('Image upload error:', error)
      alert('Failed to upload image. Please try again.')
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleSubmit = async () => {
    if (!session) {
      router.push('/auth/signin')
      return
    }

    if (!formData.title || !formData.company || !formData.category || !formData.description || !formData.longDescription || !formData.whatStoppedWorking) {
      alert('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/bounties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          company: formData.company,
          category: formData.category,
          description: formData.description,
          longDescription: formData.longDescription,
          whatStoppedWorking: formData.whatStoppedWorking,
          imageUrl: formData.imageUrl,
          imageId: formData.imageId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create bounty')
      }

      const bounty = await response.json()
      router.push(`/bounty/${bounty.id}`)
    } catch (error) {
      console.error('Error creating bounty:', error)
      alert('Failed to create bounty. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Redirect to login if not authenticated
  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
          <p className="text-slate-600 mb-6">You need to be signed in to create a restoration campaign.</p>
          <Button asChild>
            <Link href="/auth/signin">Sign In</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
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
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                      step >= stepNumber ? "bg-blue-500 border-blue-500 text-white" : "border-slate-300 text-slate-400"
                    }`}
                  >
                    {step > stepNumber ? <CheckCircle className="h-5 w-5" /> : stepNumber}
                  </div>
                  {stepNumber < 3 && (
                    <div className={`h-1 w-32 mx-4 ${step > stepNumber ? "bg-blue-500" : "bg-slate-200"}`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-sm text-slate-600">
              <span>Basic Info</span>
              <span>Details</span>
              <span>Review</span>
            </div>
          </div>

          {/* Step Content */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {step === 1 && "Basic Information"}
                {step === 2 && "Project Details"}
                {step === 3 && "Review & Submit"}
              </CardTitle>
              <CardDescription>
                {step === 1 && "Tell us about the product or service that stopped working"}
                {step === 2 && "Provide detailed information about your restoration campaign"}
                {step === 3 && "Review your restoration campaign before publishing"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {step === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="title">Product/Service That Stopped Working *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Zune HD, Nintendo DSi Shop, Guitar Hero Live"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Original Company</Label>
                    <Input
                      id="company"
                      placeholder="e.g., Microsoft, Nintendo, Activision"
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
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">What Stopped Working *</Label>
                    <Textarea
                      id="description"
                      placeholder="e.g., Game console that can't download games since shop servers were shut down"
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
                      placeholder="Describe how you and others used this device/software, what specific features became inaccessible when the company shut down servers, and why restoring functionality would benefit people who still own it..."
                      value={formData.longDescription}
                      onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
                      rows={8}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Project Image</Label>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-slate-400 transition-colors">
                      <ImageIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-600 mb-2">Upload an image for your bounty</p>
                      <p className="text-sm text-slate-500">Recommended: 1200x675px (16:9 ratio)</p>
                      <p className="text-sm text-slate-400">PNG, JPG up to 10MB</p>
                      {isUploadingImage && (
                        <p className="text-sm text-blue-600 mt-2">
                          Uploading and optimizing image...
                        </p>
                      )}
                      {formData.imageUrl && !isUploadingImage && (
                        <div className="mt-4">
                          <p className="text-sm text-green-600 mb-2">
                            ✓ Image uploaded successfully!
                          </p>
                          <img 
                            src={formData.imageUrl} 
                            alt="Preview" 
                            className="max-w-xs mx-auto rounded-lg border"
                          />
                        </div>
                      )}
                      <div className="mt-4">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <Button 
                          variant="outline" 
                          className="bg-transparent" 
                          asChild
                          disabled={isUploadingImage}
                        >
                          <label htmlFor="image-upload" className="cursor-pointer">
                            <Upload className="mr-2 h-4 w-4" />
                            {isUploadingImage ? 'Uploading...' : formData.imageUrl ? 'Replace Image' : 'Choose File'}
                          </label>
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatStoppedWorking">What Features Stopped Working *</Label>
                    <Textarea
                      id="whatStoppedWorking"
                      placeholder="e.g., Music marketplace, wireless sync, social features, podcast subscriptions, online multiplayer..."
                      value={formData.whatStoppedWorking}
                      onChange={(e) => setFormData({ ...formData, whatStoppedWorking: e.target.value })}
                      rows={4}
                    />
                    <p className="text-sm text-slate-500">List the specific features that became unusable when servers were shut down</p>
                  </div>
                </>
              )}

              {step === 3 && (
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
                          {formData.category && (
                            <Badge variant="secondary">
                              {categories.find(cat => cat.value === formData.category)?.label || formData.category}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-600">Company</Label>
                        <p className="text-slate-900">{formData.company || "Not specified"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-600">What Stopped Working</Label>
                        <p className="text-slate-900">{formData.description || "Not specified"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-600">Why This Needs to Work Again</Label>
                        <p className="text-slate-900 text-sm max-h-32 overflow-y-auto">
                          {formData.longDescription || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-600">What Features Stopped Working</Label>
                        <p className="text-slate-900 text-sm">
                          {formData.whatStoppedWorking || "Not specified"}
                        </p>
                      </div>
                      {formData.imageUrl && (
                        <div>
                          <Label className="text-sm font-medium text-slate-600">Project Image</Label>
                          <div className="mt-2">
                            <img 
                              src={formData.imageUrl} 
                              alt="Project preview" 
                              className="max-w-sm rounded-lg border"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">How Flexible Funding Works</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• People contribute any amount toward your restoration bounty</li>
                      <li>• Developers can see the total funding available before deciding to take it on</li>
                      <li>• No funding goals - just growing community interest and available money</li>
                      <li>• Your campaign will be reviewed before going live (24-48 hours)</li>
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
              {step < 3 ? (
                <Button onClick={handleNext}>Next</Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  {isSubmitting ? "Creating..." : "Submit Restoration Campaign"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
