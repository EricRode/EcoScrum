"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSprintData, saveRetrospective, getAllSprints } from "@/lib/axiosInstance"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import { useSprintContext } from "@/components/sprint-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useProjectContext } from "@/components/project-context"

export default function Retrospective() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const { selectedSprintId, setSelectedSprintId } = useSprintContext()
  const { selectedProjectId } = useProjectContext()

  const [allSprints, setAllSprints] = useState<any[]>([])
  useEffect(() => {
    const fetchSprints = async () => {
      try {
        if (!selectedProjectId) return
        const sprints = await getAllSprints(selectedProjectId)
        setAllSprints(sprints)
      } catch (error) {
        console.error("Failed to fetch sprints", error)
      }
    }
    fetchSprints()
  }, [selectedProjectId])

  useEffect(() => {
    if (allSprints.length > 0 && !selectedSprintId) {
      const latestSprint = allSprints[allSprints.length - 1]
      setSelectedSprintId(latestSprint.id)
    }
  }, [allSprints, selectedSprintId])

  const { data: sprint, loading: sprintLoading, error } = useSprintData(
    selectedSprintId || undefined,
    selectedProjectId
  )

  const [formData, setFormData] = useState({
    goalMet: "Partially",
    inefficientProcesses: "",
    improvements: "",
    teamNotes: "",
  })

  useEffect(() => {
    if (sprint && sprint.retrospective) {
      setFormData({
        goalMet: sprint.retrospective.goalMet,
        inefficientProcesses: sprint.retrospective.inefficientProcesses,
        improvements: sprint.retrospective.improvements,
        teamNotes: sprint.retrospective.teamNotes,
      })
    } else if (sprint) {
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
    return null
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
    if (!sprint || !sprint.id) {
      console.error("Sprint is not loaded yet or missing ID")
      return
    }

    await saveRetrospective({
      sprintId: sprint.id,
      ...formData,
    })

    toast({
      title: "🎉 Retrospective saved!",
      description: "Your team's reflection has been stored. Keep improving!",
    })
  }

  return (
    <div className="container mx-auto py-6">
      {/* Progress Indicator */}
      <div className="flex justify-center gap-2 mb-4">
        <div className="w-3 h-3 rounded-full bg-emerald-600"></div>
        <div className="w-3 h-3 rounded-full bg-gray-300"></div>
        <div className="w-3 h-3 rounded-full bg-gray-300"></div>
      </div>

      <div className="bg-white border rounded-md p-6">
        <h1 className="text-2xl font-bold mb-6">Sprint Retrospective – Sustainability Review</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 p-4 bg-gray-50 rounded-md">
          <Stat label="Overall Progress" value={`${sprint?.progress}%`} color="gray-800" />
          <Stat label="Sustainability Score" value={`${sprint?.sustainabilityScore} ↑`} />
          <Stat label="Previous Score" value={sprint?.previousScore} />
          <Stat label="Effects Tackled" value={sprint?.effectsTackled} />
        </div>

        {/* Sprint Goal */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-medium mb-2">Sprint Goal: {sprint?.goal}</h2>
            <p className="text-sm text-gray-500 mb-2">Reflect on whether your team met the sprint goal.</p>
            <RadioGroup value={formData.goalMet} onValueChange={handleRadioChange} className="flex gap-4">
              <RadioOption id="goal-yes" value="Yes" label="Yes" />
              <RadioOption id="goal-no" value="No" label="No" />
              <RadioOption id="goal-partially" value="Partially" label="Partially" />
            </RadioGroup>
          </div>

          {/* Inputs */}
          <InputSection
            label="Did we notice any inefficient processes, tools, or code that increased resource usage?"
            name="inefficientProcesses"
            value={formData.inefficientProcesses}
            onChange={handleInputChange}
            placeholder="e.g., Rebuilding the entire frontend on every commit slowed us down..."
          />

          <InputSection
            label="What can be improved?"
            name="improvements"
            value={formData.improvements}
            onChange={handleInputChange}
            placeholder="e.g., Move to incremental builds. Educate devs on green patterns."
          />

          <InputSection
            label="Team Notes"
            name="teamNotes"
            value={formData.teamNotes}
            onChange={handleInputChange}
            placeholder="e.g., Great communication overall. Let’s explore energy-saving CI pipelines."
          />

          {/* Summary */}
          <div className="bg-gray-50 p-4 rounded-md mb-4">
            <p className="text-sm font-medium mb-1">Summary</p>
            <ul className="text-sm text-gray-600 list-disc list-inside">
              <li><strong>Goal Met:</strong> {formData.goalMet}</li>
              <li><strong>Inefficiencies:</strong> {formData.inefficientProcesses || "None listed"}</li>
              <li><strong>Improvements:</strong> {formData.improvements || "None listed"}</li>
              <li><strong>Team Notes:</strong> {formData.teamNotes || "None listed"}</li>
            </ul>
          </div>

          <div className="flex justify-end">
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-500">
              Submit Reflection
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// 🔹 Reusable components
function Stat({ label, value, color = "gray-400" }: { label: string; value: any; color?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`h-3 w-3 rounded-full bg-${color}`}></div>
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-sm text-gray-500">{value}</div>
      </div>
    </div>
  )
}

function RadioOption({ id, value, label }: { id: string; value: string; label: string }) {
  return (
    <div className="flex items-center space-x-2">
      <RadioGroupItem value={value} id={id} />
      <Label htmlFor={id}>{label}</Label>
    </div>
  )
}

function InputSection({
  label,
  name,
  value,
  onChange,
  placeholder,
}: {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  placeholder: string
}) {
  return (
    <div className="space-y-2">
      <h2 className="text-lg font-medium">{label}</h2>
      <Textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="min-h-[100px]"
      />
    </div>
  )
}
