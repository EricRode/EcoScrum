"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { useSprintData, saveRetrospective, getAllSprints, useItemsData, getAllItems } from "@/lib/axiosInstance"
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
  const [previousSprint, setPreviousSprint] = useState<any>(null)
  const [allItems, setAllItems] = useState<any[]>([])

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

  const { data: items } = useItemsData(selectedSprintId || "")

  useEffect(() => {
    const fetchAllItems = async () => {
      try {
        const items = await getAllItems()
        setAllItems(items)
      } catch (error) {
        console.error("Failed to fetch all items", error)
      }
    }
    fetchAllItems()
  }, [])

  useEffect(() => {
    if (sprint && allSprints.length > 0) {
      const currentIndex = allSprints.findIndex((s) => s.id === sprint.id)
      if (currentIndex > 0) {
        setPreviousSprint(allSprints[currentIndex - 1])
      } else {
        setPreviousSprint(null)
      }
    }
  }, [sprint, allSprints])

  const metrics = useMemo(() => {
    if (!sprint || !items) {
      return {
        progress: 0,
        sustainabilityScore: 0,
        previousScore: 0,
        effectsTackled: 0,
      }
    }

    const sustainabilityScore = items
      .filter((item) => item.status === "Done")
      .reduce((sum, item) => sum + (item.sustainabilityPoints || 0), 0)

    const previousScore = previousSprint?.sustainabilityScore || 0

    const effectsTackled = items.reduce(
      (count, item) => count + (item.relatedSusafEffects?.length || 0),
      0
    )

    const totalItems = items.length || 1
    const completedItems = items.filter((item) => item.status === "Done").length
    const progress = Math.round((completedItems / totalItems) * 100)

    return {
      progress,
      sustainabilityScore,
      previousScore,
      effectsTackled,
    }
  }, [sprint, items, previousSprint])

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
          <Stat label="Overall Progress" value={`${metrics.progress}%`} color="gray-800" />
          <Stat
            label="Sustainability Score"
            value={metrics.sustainabilityScore}
            comparison={metrics.previousScore}
            direction={metrics.sustainabilityScore >= metrics.previousScore ? "up" : "down"}
          />
          <Stat
            label="Previous Sprint"
            value={previousSprint ? previousSprint.name : "None"}
            subValue={metrics.previousScore ? `${metrics.previousScore} points` : "N/A"}
          />
          <Stat label="Effects Tackled" value={metrics.effectsTackled} />
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
function Stat({
  label,
  value,
  color = "emerald-600",
  comparison,
  direction,
  subValue,
}: {
  label: string
  value: any
  color?: string
  comparison?: number
  direction?: "up" | "down"
  subValue?: string
}) {
  return (
    <div className="flex items-center gap-3">
      <div className={`h-3 w-3 rounded-full bg-${color}`}></div>
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="flex items-center">
          <span className="text-lg font-semibold">{value}</span>
          {direction && (
            <span className={`ml-2 text-sm ${direction === "up" ? "text-emerald-600" : "text-red-600"}`}>
              {direction === "up" ? "↑" : "↓"}
              {comparison !== undefined && ` ${Math.abs(Number(value) - comparison)}`}
            </span>
          )}
        </div>
        {subValue && <div className="text-xs text-gray-500">{subValue}</div>}
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
