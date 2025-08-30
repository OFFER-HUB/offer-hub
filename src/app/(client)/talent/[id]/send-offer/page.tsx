"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import TalentLayout from "@/components/talent/talents/TalentLayout"
import { useOffer } from "@/lib/contexts/OfferContext"
import { useNotification } from "@/lib/contexts/NotificatonContext"
import { useTalentData } from "@/hooks/talent/useTalentData"

export default function SendOfferPage() {
  const params = useParams()
  const router = useRouter()
  const talentId = params.id as string

  const { state: offerState, actions: offerActions } = useOffer()
  const { actions: notificationActions } = useNotification()
  const { getTalentById } = useTalentData()

  const [formData, setFormData] = useState({
    jobTitle: "",
    jobDescription: "",
    estimate: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const talent = getTalentById(Number(talentId))

  useEffect(() => {
    const savedData = sessionStorage.getItem("offerFormData")
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        setFormData(parsed)
      } catch (error) {
        console.error("Failed to parse saved form data:", error)
      }
    }
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    const updatedData = { ...formData, [field]: value }
    sessionStorage.setItem("offerFormData", JSON.stringify(updatedData))
  }

  const handleNext = async () => {
    if (!formData.jobTitle.trim() || !formData.jobDescription.trim() || !formData.estimate.trim()) {
      notificationActions.addNotification({
        type: "error",
        title: "Validation Error",
        message: "Please fill in all required fields",
      })
      return
    }

    try {
      setIsSubmitting(true)

      if (!talent) {
        throw new Error("Talent not found")
      }

      offerActions.createDraft(talentId, talent.name)
      offerActions.updateDraft({
        projectTitle: formData.jobTitle,
        projectDescription: formData.jobDescription,
        budget: Number(formData.estimate),
      })

      sessionStorage.setItem("offerFormData", JSON.stringify(formData))

      notificationActions.addNotification({
        type: "success",
        title: "Offer Draft Created",
        message: "Your offer details have been saved",
      })

      router.push(`/talent/${talentId}/send-offer/project-type`)
    } catch (error) {
      notificationActions.addNotification({
        type: "error",
        title: "Error",
        message: "Failed to save offer details. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white px-6 py-2">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.back()} className="text-gray-600 hover:text-gray-900">
            ← Back
          </Button>
          <div className="flex-1 text-center">
            <h1 className="text-base font-bold text-gray-900">Send Offer</h1>
          </div>
          <div className="w-16" />
        </div>
      </div>
      <TalentLayout>
        <div className="max-w-md mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Send an offer</h1>
            <p className="text-teal-600 font-semibold">
              {talent ? `Create and send offer to ${talent.name}` : "Create and send offer to hire"}
            </p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Job Title */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Job title <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Give your job a title"
                value={formData.jobTitle}
                onChange={(e) => handleInputChange("jobTitle", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                disabled={isSubmitting}
              />
            </div>

            {/* Job Description */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Job description <span className="text-red-500">*</span>
              </label>
              <Textarea
                placeholder="Enter a description..."
                value={formData.jobDescription}
                onChange={(e) => handleInputChange("jobDescription", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent min-h-[120px] resize-none"
                disabled={isSubmitting}
              />
            </div>

            {/* Estimate */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                What is your estimate for this project <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="$0"
                value={formData.estimate}
                type="number"
                min="0"
                onChange={(e) => handleInputChange("estimate", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-12 space-y-4 px-10">
            <Button
              onClick={handleNext}
              disabled={isSubmitting || offerState.loading}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-full font-medium disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Next"}
            </Button>
            <Button
              onClick={() => router.back()}
              variant="outline"
              disabled={isSubmitting}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white border-teal-500 py-3 rounded-full font-medium disabled:opacity-50"
            >
              Back
            </Button>
          </div>
        </div>
      </TalentLayout>
    </div>
  )
}
