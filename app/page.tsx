"use client"

import { useEffect, useMemo } from "react"
import Link from "next/link"
import { ArrowRight, BarChart3, CheckCircle, ListTodo, Plus } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import { useSprintContext } from "@/components/sprint-context"
import { useProjectContext } from "@/components/project-context"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getAllSprints, useSprintData, useTasksData } from "@/lib/mongodb"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

export default function Dashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const { selectedSprintId, setSelectedSprintId } = useSprintContext()
  const { projects, selectedProjectId, setSelectedProjectId, createNewProject } = useProjectContext()

  // State for creating a new project
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false)
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
  })

  // Get all sprints for the selected project
  const projectSprints = useMemo(() => {
    if (!selectedProjectId) return []
    return getAllSprints(selectedProjectId)
  }, [selectedProjectId])

  // Get the selected sprint data
  const { data: sprint, loading: sprintLoading } = useSprintData(selectedSprintId, selectedProjectId)

  // Get tasks for the selected sprint
  const { data: tasks, loading: tasksLoading } = useTasksData(sprint?.id || "", selectedProjectId)

  // Calculate metrics based on tasks
  const metrics = useMemo(() => {
    if (!tasks)
      return {
        sustainablePBIs: 0,
        teamVelocity: 0,
        completionRate: 0,
      }

    const totalTasks = tasks.length
    const sustainableTasks = tasks.filter((t) => t.sustainable).length
    const completedTasks = tasks.filter((t) => t.status === "Done").length
    const totalStoryPoints = tasks.reduce((sum, task) => sum + task.storyPoints, 0)
    const completedStoryPoints = tasks
      .filter((t) => t.status === "Done")
      .reduce((sum, task) => sum + task.storyPoints, 0)

    return {
      sustainablePBIs: totalTasks > 0 ? Math.round((sustainableTasks / totalTasks) * 100) : 0,
      teamVelocity: completedStoryPoints,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    }
  }, [tasks])

  // Prepare data for the sustainability trend chart
  const trendChartData = useMemo(() => {
    return projectSprints.map((sprint) => ({
      name: sprint.name.split("#")[1] ? `Sprint ${sprint.name.split("#")[1]}` : sprint.name,
      score: sprint.sustainabilityScore,
      previousScore: sprint.previousScore,
    }))
  }, [projectSprints])

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [loading, user, router])

  const handleCreateProject = async () => {
    try {
      const project = await createNewProject(newProject.name, newProject.description)
      setIsCreateProjectOpen(false)
      setNewProject({ name: "", description: "" })
      setSelectedProjectId(project.id)
      toast({
        title: "Project created",
        description: "Your new project has been created successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create project.",
        variant: "destructive",
      })
    }
  }

  if (loading || !user) {
    return null // Will redirect to login
  }

  // If no project is selected or no projects exist
  if (!selectedProjectId || projects.length === 0) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Welcome to EcoScrum</h1>
          <p className="text-gray-500 mb-6">Get started by creating a new project or selecting an existing one.</p>

          {projects.length > 0 ? (
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm text-gray-500">Select a project to continue:</p>
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="Select Project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <p className="text-sm text-gray-500 mt-4">Or create a new project:</p>
            </div>
          ) : (
            <p className="text-gray-500 mb-6">
              You don't have any projects yet. Create your first project to get started.
            </p>
          )}

          <Dialog open={isCreateProjectOpen} onOpenChange={setIsCreateProjectOpen}>
            <DialogTrigger asChild>
              <Button className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Create New Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>Create a new project to organize your sprints and team members.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="project-name">Project Name</Label>
                  <Input
                    id="project-name"
                    value={newProject.name}
                    onChange={(e) => setNewProject((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter project name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project-description">Description</Label>
                  <Textarea
                    id="project-description"
                    value={newProject.description}
                    onChange={(e) => setNewProject((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your project"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateProjectOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateProject}>Create Project</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {projects.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold mb-4">Your Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedProjectId(project.id)}
                >
                  <CardHeader>
                    <CardTitle>{project.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">{project.description}</p>
                    <div className="flex items-center gap-2 mt-4">
                      <div className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                        {project.sprints.length} Sprints
                      </div>
                      <div className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                        {project.teamMembers.length} Members
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => setSelectedProjectId(project.id)}>
                      Select Project
                    </Button>
                  </CardFooter>
                </Card>
              ))}

              <Card
                className="border-dashed cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setIsCreateProjectOpen(true)}
              >
                <CardContent className="flex flex-col items-center justify-center h-full py-12">
                  <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full mb-4">
                    <Plus className="h-6 w-6" />
                  </Button>
                  <p className="text-sm text-gray-500">Create New Project</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    )
  }

  // If no sprints exist for the selected project
  if (projectSprints.length === 0) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">{projects.find((p) => p.id === selectedProjectId)?.name}</h1>
          <p className="text-gray-500 mb-6">This project doesn't have any sprints yet.</p>
          <Link href="/sprint-board">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create First Sprint
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const handleSprintChange = (sprintId: string) => {
    setSelectedSprintId(sprintId)
  }

  // Get previous sprint data for comparison
  const getPreviousSprintData = () => {
    const currentIndex = projectSprints.findIndex((s) => s.id === sprint?.id)
    if (currentIndex > 0) {
      return projectSprints[currentIndex - 1]
    }
    return null
  }

  const previousSprint = getPreviousSprintData()

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              {projects.find((p) => p.id === selectedProjectId)?.name} - Dashboard
            </h1>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Project Sustainability Score</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="relative h-48 w-48">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold">{metrics.sustainablePBIs}%</div>
                    <div className="text-sm text-muted-foreground">PBIs Related to Sustainability</div>
                  </div>
                </div>
                <svg className="h-full w-full" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="10"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * metrics.sustainablePBIs) / 100}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>PBIs by SuSAF Dimension</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 space-y-2">
                {tasks && (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                        <span className="text-sm">
                          Technical ({tasks.filter((t) => t.susafCategory === "Technical").length})
                        </span>
                      </div>
                      <div className="h-6 w-full max-w-[200px] rounded-full bg-blue-100">
                        <div
                          className="h-full rounded-full bg-blue-500"
                          style={{
                            width: `${
                              tasks.length > 0
                                ? (tasks.filter((t) => t.susafCategory === "Technical").length / tasks.length) * 100
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                        <span className="text-sm">
                          Human ({tasks.filter((t) => t.susafCategory === "Human").length})
                        </span>
                      </div>
                      <div className="h-6 w-full max-w-[200px] rounded-full bg-blue-100">
                        <div
                          className="h-full rounded-full bg-blue-500"
                          style={{
                            width: `${
                              tasks.length > 0
                                ? (tasks.filter((t) => t.susafCategory === "Human").length / tasks.length) * 100
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                        <span className="text-sm">
                          Environmental ({tasks.filter((t) => t.susafCategory === "Environmental").length})
                        </span>
                      </div>
                      <div className="h-6 w-full max-w-[200px] rounded-full bg-blue-100">
                        <div
                          className="h-full rounded-full bg-blue-500"
                          style={{
                            width: `${
                              tasks.length > 0
                                ? (tasks.filter((t) => t.susafCategory === "Environmental").length / tasks.length) * 100
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                        <span className="text-sm">
                          Social ({tasks.filter((t) => t.susafCategory === "Social").length})
                        </span>
                      </div>
                      <div className="h-6 w-full max-w-[200px] rounded-full bg-blue-100">
                        <div
                          className="h-full rounded-full bg-blue-500"
                          style={{
                            width: `${
                              tasks.length > 0
                                ? (tasks.filter((t) => t.susafCategory === "Social").length / tasks.length) * 100
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                        <span className="text-sm">
                          Economical ({tasks.filter((t) => t.susafCategory === "Economical").length})
                        </span>
                      </div>
                      <div className="h-6 w-full max-w-[200px] rounded-full bg-blue-100">
                        <div
                          className="h-full rounded-full bg-blue-500"
                          style={{
                            width: `${
                              tasks.length > 0
                                ? (tasks.filter((t) => t.susafCategory === "Economical").length / tasks.length) * 100
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sprint Sustainability Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ChartContainer
              config={{
                score: {
                  label: "Sustainability Score",
                  color: "#10b981",
                },
                previousScore: {
                  label: "Previous Score",
                  color: "#94a3b8",
                },
              }}
              className="h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendChartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="var(--color-score)"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Sustainability Score"
                  />
                  <Line
                    type="monotone"
                    dataKey="previousScore"
                    stroke="var(--color-previousScore)"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 4 }}
                    name="Previous Score"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detailed Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 text-left font-medium">Metric</th>
                    <th className="py-3 text-left font-medium">Current</th>
                    <th className="py-3 text-left font-medium">Previous</th>
                    <th className="py-3 text-left font-medium">Change</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3">Sustainable PBIs</td>
                    <td className="py-3">{metrics.sustainablePBIs}%</td>
                    <td className="py-3">{previousSprint ? previousSprint.sustainabilityScore : "N/A"}</td>
                    <td className="py-3 text-emerald-600">
                      {previousSprint
                        ? `${metrics.sustainablePBIs > previousSprint.sustainabilityScore ? "↑" : "↓"} 
                        ${Math.abs(metrics.sustainablePBIs - previousSprint.sustainabilityScore)}%`
                        : "N/A"}
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3">Team Velocity</td>
                    <td className="py-3">{metrics.teamVelocity} points</td>
                    <td className="py-3">{previousSprint ? `${previousSprint.progress} points` : "N/A"}</td>
                    <td className="py-3 text-emerald-600">
                      {previousSprint
                        ? `${metrics.teamVelocity > previousSprint.progress ? "↑" : "↓"} 
                        ${Math.abs(metrics.teamVelocity - previousSprint.progress)}`
                        : "N/A"}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3">Completion Rate</td>
                    <td className="py-3">{metrics.completionRate}%</td>
                    <td className="py-3">{previousSprint ? `${previousSprint.progress}%` : "N/A"}</td>
                    <td className="py-3 text-emerald-600">
                      {previousSprint
                        ? `${metrics.completionRate > previousSprint.progress ? "↑" : "↓"} 
                        ${Math.abs(metrics.completionRate - previousSprint.progress)}%`
                        : "N/A"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Sprint Progress</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sprint?.progress || 0}%</div>
              <div className="mt-4 h-2 w-full rounded-full bg-muted">
                <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${sprint?.progress || 0}%` }}></div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Sprint Goal: {sprint?.goal || "No goal set"}</p>
            </CardContent>
            <CardFooter>
              <Link href="/sprint-board" className="w-full">
                <Button variant="outline" className="w-full">
                  <span>View Sprint Board</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sustainability Score</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline">
                <div className="text-2xl font-bold">{sprint?.sustainabilityScore || 0}</div>
                <div className="ml-2 flex items-center text-sm text-emerald-500">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <path
                      fillRule="evenodd"
                      d="M12.577 4.878a.75.75 0 01.919-.53l4.78 1.281a.75.75 0 01.531.919l-1.281 4.78a.75.75 0 01-1.449-.387l.81-3.022a19.407 19.407 0 00-5.594 5.203.75.75 0 01-1.139.093L7 10.06l-4.72 4.72a.75.75 0 01-1.06-1.061l5.25-5.25a.75.75 0 011.06 0l3.074 3.073a20.923 20.923 0 015.545-4.931l-3.042-.815a.75.75 0 01-.53-.919z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>
                    {sprint && sprint.previousScore
                      ? `${sprint.sustainabilityScore > sprint.previousScore ? "+" : ""}${
                          sprint.sustainabilityScore - sprint.previousScore
                        } from last sprint`
                      : "No previous data"}
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Previous Sprint Score: {sprint?.previousScore || "N/A"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Effects Tackled: {sprint?.effectsTackled || 0}</p>
            </CardContent>
            <CardFooter>
              <Link href="/retrospective" className="w-full">
                <Button variant="outline" className="w-full">
                  <span>View Retrospective</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Product Backlog</CardTitle>
              <ListTodo className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tasks?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-4">Total Backlog Items</p>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                <p className="text-xs text-muted-foreground">
                  {tasks?.filter((t) => t.sustainable).length || 0} Sustainable Items
                </p>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                <p className="text-xs text-muted-foreground">
                  {tasks?.filter((t) => !t.sustainable).length || 0} Regular Items
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/backlog" className="w-full">
                <Button variant="outline" className="w-full">
                  <span>View Backlog</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
