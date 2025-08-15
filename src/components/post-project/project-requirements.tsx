"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Plus, AlertCircle, Check } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ProjectDraft } from "@/types/project.types"

interface ProjectRequirementsProps {
  projectData: any
  updateProjectData: (data: keyof ProjectDraft, value: any) => void
}

export default function ProjectRequirements({ projectData, updateProjectData }: ProjectRequirementsProps) {
  const [skillInput, setSkillInput] = useState("")

  const experienceLevels = [
    { id: "entry", name: "Entry Level" },
    { id: "intermediate", name: "Intermediate" },
    { id: "expert", name: "Expert" },
  ]

  const suggestedSkills = {
    "web-dev": ["JavaScript", "React", "Node.js", "HTML", "CSS", "TypeScript", "Vue.js", "Angular", "PHP", "WordPress"],
    "mobile-dev": ["Swift", "Kotlin", "React Native", "Flutter", "Java", "Objective-C", "Firebase", "iOS", "Android"],
    design: ["Figma", "Adobe XD", "Photoshop", "Illustrator", "UI Design", "UX Design", "Sketch", "InDesign"],
  }

  const addSkill = () => {
    if (skillInput.trim() && !projectData.skills.includes(skillInput.trim())) {
      updateProjectData("skills", [...projectData.skills, skillInput.trim()] )
      setSkillInput("")
    }
  }

  const removeSkill = (skill: string) => {
    updateProjectData("skills", projectData.skills.filter((s: string) => s !== skill))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addSkill()
    }
  }

  const addSuggestedSkill = (skill: string) => {
    if (!projectData.skills.includes(skill)) {
      updateProjectData("skills", [...projectData.skills, skill])
    }
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

  // Get suggested skills based on selected category
  const categorySkills =
    projectData.category && suggestedSkills[projectData.category as keyof typeof suggestedSkills]
      ? suggestedSkills[projectData.category as keyof typeof suggestedSkills]
      : suggestedSkills["web-dev"] // Default to web-dev if category not found

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <CardTitle>Project Requirements</CardTitle>
            <CardDescription>Define the skills and experience level needed for your project</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label htmlFor="skills">Required Skills</Label>
              <div className="flex gap-2">
                <Input
                  id="skills"
                  placeholder="e.g. JavaScript, Photoshop, Content Writing"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <Button type="button" onClick={addSkill} className="bg-[#15949C] hover:bg-[#15949C]/90 flex-shrink-0">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {projectData.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {projectData.skills.map((skill: string) => (
                    <Badge key={skill} className="bg-[#DEEFE7] text-[#002333] hover:bg-[#DEEFE7]/80">
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-1 rounded-full hover:bg-[#15949C]/10"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              <div className="mt-4">
                <p className="text-sm text-[#002333]/70 mb-2">Suggested skills for your project:</p>
                <div className="flex flex-wrap gap-2">
                  {categorySkills.map((skill) => (
                    <Badge
                      key={skill}
                      className={`cursor-pointer ${
                        projectData.skills.includes(skill)
                          ? "bg-[#15949C] text-white"
                          : "bg-gray-100 text-[#002333] hover:bg-gray-200"
                      }`}
                      onClick={() => addSuggestedSkill(skill)}
                    >
                      {skill}
                      {projectData.skills.includes(skill) && <Check className="h-3 w-3 ml-1" />}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience-level">Experience Level</Label>
              <Select
                value={projectData.experienceLevel}
                onValueChange={(value) => updateProjectData("experienceLevel", value)}
              >
                <SelectTrigger id="experience-level">
                  <SelectValue placeholder="Select required experience level" />
                </SelectTrigger>
                <SelectContent>
                  {experienceLevels.map((level) => (
                    <SelectItem key={level.id} value={level.id}>
                      {level.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                This helps match your project with freelancers of the right experience level
              </p>
            </div>

            <Alert className="bg-[#DEEFE7]/30 border-[#15949C]">
              <AlertCircle className="h-4 w-4 text-[#15949C]" />
              <AlertDescription className="text-[#002333]/70">
                Clearly defined requirements help attract qualified freelancers and result in more accurate proposals.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

