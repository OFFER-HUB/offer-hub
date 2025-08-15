"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { DollarSign, Plus, Trash2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ProjectDraft } from "@/types/project.types"

interface ProjectBudgetProps {
  projectData: any
  updateProjectData: (data: keyof ProjectDraft, value: any) => void
}

export default function ProjectBudget({ projectData, updateProjectData }: ProjectBudgetProps) {
  const [newMilestone, setNewMilestone] = useState({ title: "", amount: "" })

  const durations = [
    { id: "less-than-1-week", name: "Less than 1 week" },
    { id: "1-2-weeks", name: "1-2 weeks" },
    { id: "2-4-weeks", name: "2-4 weeks" },
    { id: "1-3-months", name: "1-3 months" },
    { id: "3-6-months", name: "3-6 months" },
    { id: "more-than-6-months", name: "More than 6 months" },
  ]

  const addMilestone = () => {
    if (newMilestone.title.trim() && newMilestone.amount) {
      updateProjectData(
        "milestones",
        [
          ...projectData.milestones,
          {
            id: Date.now(),
            title: newMilestone.title,
            amount: Number.parseFloat(newMilestone.amount),
          },
        ],
      )
      setNewMilestone({ title: "", amount: "" })
    }
  }

  const removeMilestone = (id: number) => {
    updateProjectData(
      "milestones",
      projectData.milestones.filter((m: any) => m.id !== id),
    )
  }

  const calculateTotalMilestones = () => {
    return projectData.milestones.reduce((total: number, milestone: any) => total + milestone.amount, 0)
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
            <CardTitle>Project Budget</CardTitle>
            <CardDescription>Define your budget and timeline for the project</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label>Budget Type</Label>
              <RadioGroup
                value={projectData.budgetType}
                onValueChange={(value) => updateProjectData("budgetType", value )}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="fixed" id="fixed" />
                  <Label htmlFor="fixed" className="flex-1 cursor-pointer">
                    <div className="font-medium">Fixed Price</div>
                    <div className="text-sm text-muted-foreground">Pay a fixed amount for the entire project</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="hourly" id="hourly" />
                  <Label htmlFor="hourly" className="flex-1 cursor-pointer">
                    <div className="font-medium">Hourly Rate</div>
                    <div className="text-sm text-muted-foreground">Pay based on the number of hours worked</div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {projectData.budgetType === "fixed" ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="budget-amount">Project Budget</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                    <Input
                      id="budget-amount"
                      type="number"
                      placeholder="Enter your budget"
                      className="pl-10"
                      value={projectData.budgetAmount || ""}
                      onChange={(e) => updateProjectData("budgetAmount", Number.parseFloat(e.target.value) || 0 )}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Set a realistic budget to attract qualified freelancers
                  </p>
                </div>

                {projectData.projectType === "one-time" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Project Milestones (Optional)</Label>
                      <p className="text-sm text-muted-foreground">Total: ${calculateTotalMilestones().toFixed(2)}</p>
                    </div>

                    {projectData.milestones.length > 0 && (
                      <div className="space-y-3 mb-4">
                        {projectData.milestones.map((milestone: any) => (
                          <div
                            key={milestone.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-[#002333]">{milestone.title}</p>
                              <p className="text-sm text-[#002333]/70">${milestone.amount.toFixed(2)}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeMilestone(milestone.id)}
                              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <Input
                          placeholder="Milestone title"
                          value={newMilestone.title}
                          onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                        />
                      </div>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                          <Input
                            type="number"
                            placeholder="Amount"
                            className="pl-10"
                            value={newMilestone.amount}
                            onChange={(e) => setNewMilestone({ ...newMilestone, amount: e.target.value })}
                          />
                        </div>
                        <Button
                          type="button"
                          onClick={addMilestone}
                          className="bg-[#15949C] hover:bg-[#15949C]/90 flex-shrink-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="hourly-rate">Hourly Rate</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                  <Input
                    id="hourly-rate"
                    type="number"
                    placeholder="Enter hourly rate"
                    className="pl-10"
                    value={projectData.budgetAmount || ""}
                    onChange={(e) => updateProjectData("budgetAmount", Number.parseFloat(e.target.value) || 0 )}
                  />
                </div>
                <p className="text-sm text-muted-foreground">The hourly rate you're willing to pay for this project</p>
              </div>
            )}

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="duration">Project Duration</Label>
              <Select value={projectData.duration} onValueChange={(value) => updateProjectData("duration", value )}>
                <SelectTrigger id="duration">
                  <SelectValue placeholder="Select estimated duration" />
                </SelectTrigger>
                <SelectContent>
                  {durations.map((duration) => (
                    <SelectItem key={duration.id} value={duration.id}>
                      {duration.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">Estimated time needed to complete the project</p>
            </div>

            <Alert className="bg-[#DEEFE7]/30 border-[#15949C]">
              <AlertCircle className="h-4 w-4 text-[#15949C]" />
              <AlertDescription className="text-[#002333]/70">
                Setting a clear budget and timeline helps freelancers understand if they can meet your expectations.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

