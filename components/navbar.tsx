"use client"

import Link from "next/link"
import { Leaf, LogOut, User, FolderKanban, Plus, Calendar, RefreshCw, Settings } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useSprintContext } from "@/components/sprint-context"
import { useProjectContext } from "@/components/project-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getAllSprints, syncSustainabilityEffects, getSusafToken, updateSusafToken } from "@/lib/axiosInstance"
import { useEffect, useState } from "react"
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
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react"

export default function Navbar() {
  const { user, logout } = useAuth()
  const { selectedSprintId, setSelectedSprintId } = useSprintContext()
  const { projects, selectedProjectId, setSelectedProjectId, createNewProject } = useProjectContext()
  const { toast } = useToast()

  const [isSyncing, setIsSyncing] = useState(false)
  const [isTokenDialogOpen, setIsTokenDialogOpen] = useState(false)
  const [tokenData, setTokenData] = useState({ token: "", isLoading: false, error: null })
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false)
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
  })

  const [projectSprints, setProjectSprints] = useState<any[]>([])

  useEffect(() => {
    if (!selectedProjectId) {
      setProjectSprints([])
      return
    }

    const fetchSprints = async () => {
      try {
        const sprints = await getAllSprints(selectedProjectId)
        setProjectSprints(sprints)
      } catch (error) {
        console.error("Failed to fetch sprints:", error)
        setProjectSprints([])
      }
    }

    fetchSprints()
  }, [selectedProjectId])

  useEffect(() => {
    if (isTokenDialogOpen && selectedProjectId) {
      fetchToken()
    }
  }, [isTokenDialogOpen, selectedProjectId])

  const fetchToken = async () => {
    if (!selectedProjectId) return

    setTokenData((prev) => ({ ...prev, isLoading: true, error: null }))
    try {
      const response = await getSusafToken(selectedProjectId)
      if (response.success && response.data) {
        setTokenData({
          token: response.data.token || "",
          isLoading: false,
          error: null,
        })
      } else {
        setTokenData({
          token: "",
          isLoading: false,
          error: response.message || "No token found",
        })
      }
    } catch (error) {
      setTokenData({
        token: "",
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to fetch token",
      })
    }
  }

  const handleSaveToken = async () => {
    if (!selectedProjectId) return

    setTokenData((prev) => ({ ...prev, isLoading: true, error: null }))
    try {
      await updateSusafToken(selectedProjectId, tokenData.token)
      toast({
        title: "Token updated",
        description: "SusAF API token has been successfully updated.",
      })
      setIsTokenDialogOpen(false)
    } catch (error) {
      setTokenData((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to update token",
      }))
    }
  }

  const handleCreateProject = async () => {
    try {
      await createNewProject(newProject.name, newProject.description)
      setIsCreateProjectOpen(false)
      setNewProject({ name: "", description: "" })
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

  const handleSyncSuSAF = async () => {
    if (!selectedProjectId) {
      toast({
        title: "No project selected",
        description: "Please select a project to sync SuSAF effects.",
        variant: "destructive",
      })
      return
    }

    setIsSyncing(true)
    try {
      await syncSustainabilityEffects(selectedProjectId)
      toast({
        title: "SuSAF effects synced",
        description: "Successfully synchronized sustainability effects for the project.",
      })
    } catch (error) {
      toast({
        title: "Sync failed",
        description: "Failed to sync sustainability effects. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <header className="border-b bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-emerald-600" />
            <span className="font-bold text-xl">EcoScrum</span>
          </Link>
        </div>

        {user && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FolderKanban className="h-4 w-4 text-gray-500" />
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                <SelectTrigger className="w-[200px] h-8">
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

              <Dialog open={isCreateProjectOpen} onOpenChange={setIsCreateProjectOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                    <DialogDescription>
                      Create a new project to organize your sprints and team members.
                    </DialogDescription>
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

              {selectedProjectId && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSyncSuSAF}
                    disabled={isSyncing}
                    className="ml-2"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
                    {isSyncing ? "Syncing..." : "Sync SuSAF"}
                  </Button>

                  <Dialog open={isTokenDialogOpen} onOpenChange={setIsTokenDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="px-2">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>SuSAF API Token Settings</DialogTitle>
                        <DialogDescription>
                          Configure the API token used to connect to the Sustainability Framework.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4 py-4">
                        {tokenData.isLoading ? (
                          <div className="flex items-center justify-center py-4">
                            <RefreshCw className="h-5 w-5 animate-spin text-gray-400" />
                            <span className="ml-2 text-sm text-gray-500">Loading token...</span>
                          </div>
                        ) : tokenData.error ? (
                          <Alert variant="destructive" className="mb-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{tokenData.error}</AlertDescription>
                          </Alert>
                        ) : null}

                        <div className="space-y-2">
                          <Label htmlFor="api-token">API Token</Label>
                          <Input
                            id="api-token"
                            value={tokenData.token}
                            onChange={(e) => setTokenData((prev) => ({ ...prev, token: e.target.value }))}
                            placeholder="Enter SuSAF API token"
                            disabled={tokenData.isLoading}
                          />
                          <p className="text-xs text-gray-500">
                            This token is used to authenticate requests to the Sustainability Assessment Framework.
                          </p>
                        </div>

                        {tokenData.token && !tokenData.error && (
                          <Alert>
                            <CheckCircle2 className="h-4 w-4" />
                            <AlertTitle>Token Available</AlertTitle>
                            <AlertDescription>
                              SuSAF API token is configured for this project.
                            </AlertDescription>
                          </Alert>
                        )}

                        {!tokenData.token && !tokenData.error && (
                          <Alert variant="warning">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>No Token Found</AlertTitle>
                            <AlertDescription>
                              No SuSAF API token is configured for this project. Please enter a valid token.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>

                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsTokenDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleSaveToken} disabled={tokenData.isLoading}>
                          Save Token
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </div>

            {selectedProjectId && projectSprints.length > 0 && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <Select value={selectedSprintId} onValueChange={setSelectedSprintId}>
                  <SelectTrigger className="w-[180px] h-8">
                    <SelectValue placeholder="Select Sprint" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectSprints.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="ml-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href="/profile">
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}

        {!user && (
          <div>
            <Link href="/login">
              <Button variant="outline" size="sm">
                <User className="mr-2 h-4 w-4" />
                Login
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
