/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileUp, X, File, Image, FileText, AlertCircle } from "lucide-react"
import { ProjectDraft } from "@/types/project.types"

interface ProjectAttachmentsProps {
  projectData: ProjectDraft
  updateProjectData: (data: keyof ProjectDraft, value: any) => void
}

export default function ProjectAttachments({ projectData, updateProjectData }: ProjectAttachmentsProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    // In a real app, you would handle file uploads here
    // For this demo, we'll simulate adding files
    if (e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files).map((file) => ({
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
      }))

      updateProjectData(
        "attachments",
        [...projectData.attachments, ...newFiles],
      )
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map((file) => ({
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
      }))

      updateProjectData(
        "attachments",
        [...projectData.attachments, ...newFiles],
      )
    }
  }

  const removeAttachment = (id: number | string) => {
    updateProjectData(
      "attachments",
      projectData.attachments.filter((file: any) => file.id !== id),
    )
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) {
      return <Image className="h-6 w-6 text-blue-500" />
    } else if (type.includes("pdf")) {
      return <FileText className="h-6 w-6 text-red-500" />
    } else {
      return <File className="h-6 w-6 text-gray-500" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " bytes"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / 1048576).toFixed(1) + " MB"
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
            <CardTitle>Project Attachments</CardTitle>
            <CardDescription>
              Upload files that will help freelancers understand your project requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center ${
                isDragging ? "border-[#15949C] bg-[#DEEFE7]/20" : "border-gray-200"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <FileUp className="h-10 w-10 text-[#15949C] mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[#002333] mb-2">Drag and drop files here</h3>
              <p className="text-sm text-[#002333]/70 mb-4">
                Upload documents, images, or any files that will help explain your project
              </p>
              <div className="relative">
                <input
                  type="file"
                  multiple
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                />
                <Button className="bg-[#15949C] hover:bg-[#15949C]/90">Browse Files</Button>
              </div>
              <p className="text-xs text-[#002333]/50 mt-4">
                Maximum file size: 25MB. Supported formats: PDF, DOC, DOCX, JPG, PNG, GIF
              </p>
            </div>

            {projectData.attachments.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Uploaded Files</Label>
                  <p className="text-sm text-muted-foreground">{projectData.attachments.length} file(s)</p>
                </div>

                <div className="space-y-3">
                  {projectData.attachments.map((file: any) => (
                    <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        {getFileIcon(file.type)}
                        <div className="ml-3">
                          <p className="font-medium text-[#002333]">{file.name}</p>
                          <p className="text-xs text-[#002333]/70">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeAttachment(file.id)}
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            <div className="space-y-4">
              <h3 className="font-medium text-[#002333]">Recommended Attachments</h3>
              <ul className="space-y-2 text-sm text-[#002333]/70">
                <li className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-[#15949C]" />
                  Project brief or detailed specifications
                </li>
                <li className="flex items-center">
                  <Image className="h-4 w-4 mr-2 text-[#15949C]" />
                  Design mockups or reference images
                </li>
                <li className="flex items-center">
                  <File className="h-4 w-4 mr-2 text-[#15949C]" />
                  Examples of similar projects you like
                </li>
              </ul>
            </div>

            <Alert className="bg-[#DEEFE7]/30 border-[#15949C]">
              <AlertCircle className="h-4 w-4 text-[#15949C]" />
              <AlertDescription className="text-[#002333]/70">
                Projects with detailed attachments receive 40% more accurate proposals and have a higher completion
                rate.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

