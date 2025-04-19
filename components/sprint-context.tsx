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

  useEffect(() => {
    //if (projectLoading || !selectedProjectId) return
    if (projectLoading) return
    if (!selectedProjectId) return
    console.log("📦 Fetching sprints for project:", selectedProjectId) // DEBUG
    const loadSprints = async () => {
      try {
        const projectSprints = await getAllSprints(selectedProjectId)
        const storedSprintId = localStorage.getItem(`selectedSprintId:${selectedProjectId}`)

        if (storedSprintId && projectSprints.some((s: any) => s.id === storedSprintId)) {
          setSelectedSprintId(storedSprintId)
        } else if (projectSprints.length > 0) {
          const latestSprint = projectSprints[projectSprints.length - 1]
          setSelectedSprintId(latestSprint.id)
          localStorage.setItem(`selectedSprintId:${selectedProjectId}`, latestSprint.id)
        } else {
          setSelectedSprintId("")
          localStorage.removeItem(`selectedSprintId:${selectedProjectId}`)
        }
      } catch (err) {
        console.error("Failed to load sprints:", err)
        setSelectedSprintId("")
      }
    }

    loadSprints()
  }, [selectedProjectId, projectLoading])

  useEffect(() => {
    if (selectedSprintId && selectedProjectId) {
      localStorage.setItem(`selectedSprintId:${selectedProjectId}`, selectedSprintId)
    }
  }, [selectedSprintId, selectedProjectId])

  return (
    <SprintContext.Provider value={{ selectedSprintId, setSelectedSprintId }}>
      {children}
    </SprintContext.Provider>
  )
}