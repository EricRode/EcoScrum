"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { useSprintData, saveRetrospective, getAllSprints } from "@/lib/axiosInstance"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import { useSprintContext } from "@/components/sprint-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function Retrospective() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const { selectedSprintId, setSelectedSprintId } = useSprintContext()

  // Get all sprints for the dropdown
  const allSprints = useMemo(() => getAllSprints(), [])

  // Get the selected sprint data from context
  const { data: sprint, loading: sprintLoading, error } = useSprintData(selectedSprintId || undefined)

  const [formData, setFormData] = useState({
    goalMet: "Partially",
    inefficientProcesses: "",
    improvements: "",
    teamNotes: "",
  })

  // Update form data when sprint changes
  useEffect(() => {
    if (sprint?.retrospective) {
      setFormData({
        goalMet: sprint.retrospective.goalMet,
        inefficientProcesses: sprint.retrospective.inefficientProcesses,
        improvements: sprint.retrospective.improvements,
        teamNotes: sprint.retrospective.teamNotes,
      })
    } else {
      // Reset form if no retrospective data exists
      setFormData({
        goalMet: "Partially",
        inefficientProcesses: "",
        improvements: "",
        teamNotes: "",
      })
    }
  }, [sprint])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [authLoading, user, router])

  if (authLoading || sprintLoading || !user) {
    return null // Will redirect to login if not authenticated
  }

  if (error) {
    return <div className="flex justify-center items-center h-64 text-red-500">Error loading retrospective data</div>
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRadioChange = (value: string) => {
    setFormData((prev) => ({ ...prev, goalMet: value as "Yes" | "No" | "Partially" }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await saveRetrospective({
      sprintId: sprint?.id,
      ...formData,
    })
    toast({
      title: "Retrospective saved",
      description: "Your sprint retrospective has been saved successfully.",
    })
  }

  const handleSprintChange = (sprintId: string) => {
    setSelectedSprintId(sprintId)
  }

  return (
    <div className="container mx-auto py-6">
      <div className="bg-white border rounded-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Sprint Retrospective – Sustainability Review</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 p-4 bg-gray-50 rounded-md">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-gray-800"></div>
            <div>
              <div className="text-sm font-medium">Overall Progress</div>
              <div className="text-sm text-gray-500">{sprint?.progress}% of story points completed</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-gray-400"></div>
            <div>
              <div className="text-sm font-medium">Current Sprint Sustainability Score</div>
              <div className="text-sm text-gray-500">{sprint?.sustainabilityScore} ↑</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-gray-400"></div>
            <div>
              <div className="text-sm font-medium">Previous Sprint Score</div>
              <div className="text-sm text-gray-500">{sprint?.previousScore}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-gray-400"></div>
            <div>
              <div className="text-sm font-medium">Effects Tackled</div>
              <div className="text-sm text-gray-500">{sprint?.effectsTackled}</div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-medium mb-2">Sprint Goal: {sprint?.goal}</h2>
              <div className="mb-2">Has this goal been met?</div>
              <RadioGroup value={formData.goalMet} onValueChange={handleRadioChange} className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Yes" id="goal-yes" />
                  <Label htmlFor="goal-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="No" id="goal-no" />
                  <Label htmlFor="goal-no">No</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Partially" id="goal-partially" />
                  <Label htmlFor="goal-partially">Partially</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-medium mb-2">
                Did we notice any inefficient processes, tools, or code that increased resource usage?
              </h2>
              <Textarea
                name="inefficientProcesses"
                value={formData.inefficientProcesses}
                onChange={handleInputChange}
                placeholder="Describe any inefficiencies noticed..."
                className="min-h-[100px]"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-medium mb-2">What can be improved?</h2>
              <Textarea
                name="improvements"
                value={formData.improvements}
                onChange={handleInputChange}
                placeholder="Enter improvement suggestions..."
                className="min-h-[100px]"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-medium mb-2">Team Notes</h2>
              <Textarea
                name="teamNotes"
                value={formData.teamNotes}
                onChange={handleInputChange}
                placeholder="Enter your team's observations and suggestions..."
                className="min-h-[100px]"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" className="bg-gray-900 hover:bg-gray-800">
              Submit Reflection
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
