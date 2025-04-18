"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { getAllSprints } from "@/lib/axiosInstance"
import { useProjectContext } from "./project-context"

interface SprintContextType {
  selectedSprintId: string
  setSelectedSprintId: (id: string) => void
}

const SprintContext = createContext<SprintContextType | undefined>(undefined)

export function useSprintContext() {
  const context = useContext(SprintContext)
  if (context === undefined) {
    throw new Error("useSprintContext must be used within a SprintProvider")
  }
  return context
}

export function SprintProvider({ children }: { children: ReactNode }) {
  const [selectedSprintId, setSelectedSprintId] = useState<string>("")
  const { selectedProjectId, loading: projectLoading } = useProjectContext()

  // Load the selected sprint from localStorage on initial render
  useEffect(() => {
    const fetchSprints = async () => {
      if (projectLoading || !selectedProjectId) return

      const storedSprintId = localStorage.getItem(`selectedSprintId:${selectedProjectId}`)
      const projectSprints = await getAllSprints(selectedProjectId)  // Await the promise here

      if (storedSprintId && projectSprints.some((s: { id: string }) => s.id === storedSprintId)) {
        setSelectedSprintId(storedSprintId)
      } else if (projectSprints.length > 0) {
        // Default to the latest sprint for the project
        const latestSprint = projectSprints[projectSprints.length - 1]
        setSelectedSprintId(latestSprint.id)
        localStorage.setItem(`selectedSprintId:${selectedProjectId}`, latestSprint.id)
      } else {
        // Clear selection if no sprints exist for this project
        setSelectedSprintId("")
        localStorage.removeItem(`selectedSprintId:${selectedProjectId}`)
      }
    }

    fetchSprints()  // Fetch the sprints when the effect runs
  }, [selectedProjectId, projectLoading])

  // Save the selected sprint to localStorage whenever it changes
  useEffect(() => {
    if (selectedSprintId && selectedProjectId) {
      localStorage.setItem(`selectedSprintId:${selectedProjectId}`, selectedSprintId)
    }
  }, [selectedSprintId, selectedProjectId])

  return <SprintContext.Provider value={{ selectedSprintId, setSelectedSprintId }}>{children}</SprintContext.Provider>
}
