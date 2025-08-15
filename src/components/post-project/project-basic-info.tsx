"use client"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/text-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"
import { ProjectDraft } from "@/types/project.types"

interface ProjectBasicInfoProps {
  projectData: ProjectDraft
  updateProjectData: (data: keyof ProjectDraft, value: any) => void
}

export default function ProjectBasicInfo({ projectData, updateProjectData }: ProjectBasicInfoProps) {
  const categories = [
    { id: "web-dev", name: "Web Development" },
    { id: "mobile-dev", name: "Mobile Development" },
    { id: "design", name: "Design" },
    { id: "writing", name: "Writing & Translation" },
    { id: "marketing", name: "Marketing" },
    { id: "video", name: "Video & Animation" },
    { id: "admin", name: "Admin Support" },
    { id: "other", name: "Other" },
  ]

  const subcategories: Record<string, Array<{ id: string; name: string }>> = {
    "web-dev": [
      { id: "frontend", name: "Frontend Development" },
      { id: "backend", name: "Backend Development" },
      { id: "fullstack", name: "Full Stack Development" },
      { id: "cms", name: "CMS Development" },
      { id: "ecommerce", name: "E-commerce Development" },
    ],
    "mobile-dev": [
      { id: "ios", name: "iOS Development" },
      { id: "android", name: "Android Development" },
      { id: "cross-platform", name: "Cross-Platform Development" },
      { id: "flutter", name: "Flutter" },
      { id: "react-native", name: "React Native" },
    ],
    design: [
      { id: "ui-ux", name: "UI/UX Design" },
      { id: "graphic", name: "Graphic Design" },
      { id: "logo", name: "Logo Design" },
      { id: "illustration", name: "Illustration" },
      { id: "product-design", name: "Product Design" },
    ],
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <CardTitle>Basic Project Information</CardTitle>
            <CardDescription>
              Provide the essential details about your project to help freelancers understand what you need
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="project-title">Project Title</Label>
              <Input
                id="project-title"
                placeholder="e.g. Professional Website Design for Small Business"
                value={projectData.title}
                onChange={(e) => updateProjectData("title", e.target.value )}
              />
              <p className="text-sm text-muted-foreground">
                A clear title helps attract the right freelancers (50-80 characters recommended)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={projectData.category}
                  onValueChange={(value) => updateProjectData("category", value)}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subcategory">Subcategory</Label>
                <Select
                  value={projectData.subcategory}
                  onValueChange={(value) => updateProjectData("subcategory", value)}
                  disabled={!projectData.category || !subcategories[projectData.category]}
                >
                  <SelectTrigger id="subcategory">
                    <SelectValue placeholder="Select a subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectData.category &&
                      subcategories[projectData.category]?.map((subcategory) => (
                        <SelectItem key={subcategory.id} value={subcategory.id}>
                          {subcategory.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-description">Project Description</Label>
              <Textarea
                id="project-description"
                placeholder="Describe your project in detail..."
                className="min-h-[200px]"
                value={projectData.description}
                onChange={(e) => updateProjectData("description", e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Include all details about your project requirements, goals, and expectations
              </p>
            </div>

            <div className="space-y-4">
              <Label>Project Type</Label>
              <RadioGroup
                value={projectData.projectType}
                onValueChange={(value) => updateProjectData("projectType", value)}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="one-time" id="one-time" />
                  <Label htmlFor="one-time" className="flex-1 cursor-pointer">
                    <div className="font-medium">One-time project</div>
                    <div className="text-sm text-muted-foreground">A project with a defined scope and deliverables</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="ongoing" id="ongoing" />
                  <Label htmlFor="ongoing" className="flex-1 cursor-pointer">
                    <div className="font-medium">Ongoing project</div>
                    <div className="text-sm text-muted-foreground">A long-term project that may evolve over time</div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-4">
              <Label>Project Visibility</Label>
              <RadioGroup
                value={projectData.visibility}
                onValueChange={(value) => updateProjectData("visibility", value)}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="public" id="public" />
                  <Label htmlFor="public" className="flex-1 cursor-pointer">
                    <div className="font-medium">Public</div>
                    <div className="text-sm text-muted-foreground">
                      Visible to all freelancers who can send proposals
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="private" id="private" />
                  <Label htmlFor="private" className="flex-1 cursor-pointer">
                    <div className="font-medium">Private</div>
                    <div className="text-sm text-muted-foreground">
                      Only visible to freelancers you specifically invite
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Alert className="bg-[#DEEFE7]/30 border-[#15949C]">
              <Info className="h-4 w-4 text-[#15949C]" />
              <AlertDescription className="text-[#002333]/70">
                Projects with clear, detailed descriptions receive 3x more quality proposals from freelancers.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

