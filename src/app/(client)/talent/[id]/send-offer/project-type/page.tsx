"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import TalentLayout from "@/components/talent/talents/TalentLayout"

export default function ProjectTypePage() {
    const params = useParams()
    const router = useRouter()
    const talentId = params.id as string

    const [selectedType, setSelectedType] = useState<"long" | "short">("long")
    const [formData, setFormData] = useState<any>(null)

    useEffect(() => {
        // Retrieve form data from previous step
        const storedData = sessionStorage.getItem("offerFormData")
        if (storedData) {
            setFormData(JSON.parse(storedData))
        }
    }, [])

    const handlePostJob = () => {
        // Store project type and proceed to success page
        const completeData = {
            ...formData,
            projectType: selectedType,
        }
        sessionStorage.setItem("completeOfferData", JSON.stringify(completeData))
        router.push(`/talent/${talentId}/send-offer/success`)
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className='bg-white px-6 py-2'>
                <div className='flex items-center justify-between'>
                    <div className='flex-1 text-center'>
                        <h1 className='text-base font-bold text-gray-900'>Talents</h1>
                    </div>
                </div>
            </div>
            <TalentLayout>
                <div className="max-w-md mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Send an offer</h1>
                        <p className="text-gray-500">Create and send offer to hire</p>
                    </div>

                    {/* Project Type Options */}
                    <div className="space-y-4 mb-12">
                        {/* Long Term Project */}
                        <div
                            onClick={() => setSelectedType("long")}
                            className={`px-4 py-2 border-2 rounded-lg cursor-pointer transition-all ${selectedType === "long" ? "border-teal-500 bg-teal-50" : "border-gray-200 hover:border-gray-300"
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900 mb-1">Long term project</h3>
                                    <p className="text-gray-500 text-sm">
                                        More than thirty hours a week and/or will be longer than three months.
                                    </p>
                                </div>
                                <div
                                    className={`ml-4 w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedType === "long" ? "border-teal-500" : "border-gray-300"
                                        }`}
                                >
                                    {selectedType === "long" && <Check className="w-4 h-4 text-teal-500" />}
                                </div>
                            </div>
                        </div>

                        {/* Short Term Project */}
                        <div
                            onClick={() => setSelectedType("short")}
                            className={`px-4 py-2 border-2 rounded-lg cursor-pointer transition-all ${selectedType === "short" ? "border-teal-500 bg-teal-50" : "border-gray-200 hover:border-gray-300"
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900 mb-1">Short term project</h3>
                                    <p className="text-gray-500 text-sm">
                                        Less than thirty hours a week and/or will be shorter than three months.
                                    </p>
                                </div>
                                <div
                                    className={`ml-4 w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedType === "short" ? "border-teal-500" : "border-gray-300"
                                        }`}
                                >
                                    {selectedType === "short" && <Check className="w-4 h-4 text-teal-500" />}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="space-y-4 px-10">
                        <Button
                            onClick={handlePostJob}
                            className="w-full bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-full font-medium"
                        >
                            Post job
                        </Button>
                        <Button
                            onClick={() => router.back()}
                            variant="outline"
                            className="w-full bg-teal-500 hover:bg-teal-600 text-white border-teal-500 py-3 rounded-full font-medium"
                        >
                            Back
                        </Button>
                    </div>
                </div>
            </TalentLayout>
        </div>
    )
}
