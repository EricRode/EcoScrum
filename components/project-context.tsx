"use client"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { getAllProjects, createProject, addTeamMember, type Project } from "@/lib/axiosInstance"

interface ProjectContextType {
  projects: Project[]
  selectedProjectId: string
  setSelectedProjectId: (id: string) => void
  createNewProject: (name: string, description: string) => Promise<Project>
  inviteTeamMember: (projectId: string, email: string, role: string) => Promise<void>
  loading: boolean
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function useProjectContext() {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error("useProjectContext must be used within a ProjectProvider")
  }
  return context
}

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>("")
  const [loading, setLoading] = useState(true)

  // Load projects and selected project from localStorage on initial render
  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true)
      try {
        const allProjects: Project[] = await getAllProjects() // Explicitly typing allProjects as Project[]
        setProjects(allProjects)

        const storedProjectId = localStorage.getItem("selectedProjectId")
        if (storedProjectId && allProjects.some((p) => p.id === storedProjectId)) { // Now TypeScript knows p is of type Project
          setSelectedProjectId(storedProjectId)
        } else if (allProjects.length > 0) {
          // Default to the first project if no valid project is selected
          setSelectedProjectId(allProjects[0].id)
          localStorage.setItem("selectedProjectId", allProjects[0].id)
        }
      } catch (error) {
        console.error("Error loading projects:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProjects()
  }, [])

  // Save the selected project to localStorage whenever it changes
  useEffect(() => {
    if (selectedProjectId) {
      localStorage.setItem("selectedProjectId", selectedProjectId)
    }
  }, [selectedProjectId])

  const createNewProject = async (name: string, description: string) => {
    try {
      const newProject = await createProject({ name, description})
      setProjects((prev) => [...prev, newProject])
      return newProject
    } catch (error) {
      console.error("Error creating project:", error)
      throw error
    }
  }

  const inviteTeamMember = async (projectId: string, email: string, role: string) => {
    try {
      await addTeamMember(projectId, email, role)
      // Refresh projects to get updated team members
      const updatedProjects = await getAllProjects() // Ensure it's awaited
      setProjects(updatedProjects)
    } catch (error) {
      console.error("Error inviting team member:", error)
      throw error
    }
  }

  return (
    <ProjectContext.Provider
      value={{
        projects,
        selectedProjectId,
        setSelectedProjectId,
        createNewProject,
        inviteTeamMember,
        loading,
      }}
    >
      {children}
    </ProjectContext.Provider>
  )
}
