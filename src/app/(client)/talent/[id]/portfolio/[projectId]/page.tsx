"use client"
import { useParams, useRouter } from "next/navigation"
import { useProjectDetails } from "@/hooks/talent/useProjectDetails"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import TalentLayout from "@/components/talent/talents/TalentLayout"

export default function ProjectDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { getProjectById, loading } = useProjectDetails()

    const projectId = params.projectId as string
    const talentId = params.id as string
    const project = getProjectById(projectId)

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading project details...</p>
                </div>
            </div>
        )
    }

    if (!project) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h1>
                    <Button onClick={() => router.back()} variant="outline">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Go Back
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <TalentLayout>
                <div className="">
                    {/* Main Images */}
                    <div className="mb-8">

                        <div className="overflow-hidden">
                            <Image
                                src={project.mainImages[0] || "/placeholder.svg"}
                                width={300}
                                height={300}
                                alt={project.mainImages[0]}
                                className="w-full h-auto object-cover object-center transform transition-transform duration-300 ease-in-out hover:scale-110"
                            />
                        </div>
                    </div>

                    {/* Project Info */}
                    <div className="mb-8">
                        <h1 className="text-xl text-center leading-tight font-bold text-gray-900 mb-2">{project.title}</h1>
                        <p className="text-gray-400 text-sm text-center mb-6">{project.date}</p>

                        <div className="prose max-w-none">
                            <p className="text-gray-700 text-sm leading-relaxed text-justify">{project.description}</p>
                        </div>
                    </div>
                    {/* Additional Images */}
                    <div className="mb-8">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            {project.additionalImages.map((image, index) => (
                                <div key={index} className="relative overflow-hidden">
                                    <Image
                                        src={image || "/placeholder.svg"}
                                        alt={`${project.title} - Additional Image ${index + 1}`}
                                        height={100}
                                        width={100}
                                        className="object-cover object-center w-full h-40 transform transition-transform duration-300 ease-in-out hover:scale-110"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Hire Button */}
                    <div className="">
                        <Button
                            onClick={() => router.push(`/talent/${talentId}/send-offer`)}
                            className='bg-slate-800 w-full hover:bg-slate-700 text-white rounded-full flex-1 py-3 font-medium'
                        >
                            Hire
                        </Button>
                    </div>
                </div>
            </TalentLayout>
        </div>
    )
}
