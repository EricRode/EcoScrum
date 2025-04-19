"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { CheckCircle, MessageCircle, Menu, Plus, Trash2, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  useSprintData,
  useTasksData,
  updateTaskStatus,
  completeSprintAndRedirect,
  addTask,
  deleteTask,
  updateTask,
  getAllUsers,
  getAllSprints,
  createSprint,
  type Task,
  User,
} from "@/lib/axiosInstance"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { useSprintContext } from "@/components/sprint-context"
import { useProjectContext } from "@/components/project-context"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { SUSAF_CATEGORIES, SUSAF_EFFECTS } from "@/lib/constants"

export default function SprintBoard() {
  const { selectedProjectId } = useProjectContext();
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const { selectedSprintId, setSelectedSprintId } = useSprintContext()

  // Get all sprints for the dropdown
  //const allSprints = useMemo(() => getAllSprints(), [])
  const [allSprints, setAllSprints] = useState<any[]>([]);
  useEffect(() => {
    const fetchSprints = async () => {
      try {
        if (!selectedProjectId) return;
        const sprints = await getAllSprints(selectedProjectId);
        setAllSprints(sprints);
      } catch (error) {
        console.error("Failed to fetch sprints", error);
      }
    };
    fetchSprints();
  }, [selectedProjectId]);

  useEffect(() => {
    if (allSprints.length > 0 && !selectedSprintId) {
      const latestSprint = allSprints[allSprints.length - 1];
      setSelectedSprintId(latestSprint.id);
    }
  }, [allSprints, selectedSprintId]);

  
  // Use the selected sprint from context
  const { data: sprint, loading: sprintLoading } = useSprintData(selectedSprintId || undefined)
  const { data: tasks, loading: tasksLoading } = useTasksData(sprint?.id || "")

  // Local state for tasks to enable immediate UI updates
  const [localTasks, setLocalTasks] = useState<Task[]>([])

  // Ref to track if we've already updated the local tasks
  const tasksUpdatedRef = useRef(false)

  // Update local tasks when the fetched tasks change - only once when tasks are loaded
  useEffect(() => {
    if (tasks && tasks.length > 0 && !tasksUpdatedRef.current) {
      tasksUpdatedRef.current = true
      setLocalTasks(tasks)
    } else if (tasks && tasks.length > 0 && JSON.stringify(tasks) !== JSON.stringify(localTasks)) {
      // Only update if the tasks have actually changed (deep comparison)
      setLocalTasks(tasks)
    }
  }, [tasks, localTasks])

  // Use useMemo to ensure stable reference for users
  const [allUsers, setAllUsers] = useState<User[]>([])

useEffect(() => {
  const fetchUsers = async () => {
    try {
      const users = await getAllUsers() // <-- This returns a promise
      setAllUsers(users)
    } catch (error) {
      console.error("Failed to load users", error)
    }
  }

  fetchUsers()
}, [])

  // Group tasks by status and sort by order
  const tasksByStatus = useMemo(() => {
    if (!localTasks.length) return { "To Do": [], "In Progress": [], Done: [] }

    return {
      "To Do": localTasks.filter((t) => t.status === "To Do").sort((a, b) => a.order - b.order),
      "In Progress": localTasks.filter((t) => t.status === "In Progress").sort((a, b) => a.order - b.order),
      Done: localTasks.filter((t) => t.status === "Done").sort((a, b) => a.order - b.order),
    }
  }, [localTasks])

  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false)
  const [isCreateSprintDialogOpen, setIsCreateSprintDialogOpen] = useState(false)
  const [editedTask, setEditedTask] = useState<Task | null>(null)

  // State for new sprint creation
  const [newSprint, setNewSprint] = useState({
    name: "",
    goal: "",
    startDate: "",
    endDate: "",
    progress: 0,
    sustainabilityScore: 0,
    previousScore: 0,
    effectsTackled: 0,
    tasks: [] as string[],
  })

  // State for SuSAF effects selection
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [availableEffects, setAvailableEffects] = useState<string[]>([])

  const newTaskInitialState = {
    title: "",
    description: "",
    priority: "Medium" as "Medium" | "Low" | "Low+" | "Medium+" | "High" | "High+",
    sustainabilityContext: "",
    status: "To Do" as "To Do" | "In Progress" | "Done",
    comments: 0,
    subtasks: 0,
    sustainabilityWeight: 5,
    assignedTo: "",
    sprintId: "",
    storyPoints: 3,
    sustainabilityPoints: 5,
    definitionOfDone: "",
    sustainable: false,
    susafCategory: undefined,
    relatedSusafEffects: [] as string[],
  }

  const [newTask, setNewTask] = useState<Partial<Task>>(newTaskInitialState)

  // Ref to track if we've updated the newTask.sprintId
  const sprintIdUpdatedRef = useRef(false)

  // Set the selected sprint ID if not already set - only once when component mounts
  const initialSprintSetRef = useRef(false)
  useEffect(() => {
    if (allSprints.length > 0 && !selectedSprintId && !initialSprintSetRef.current) {
      initialSprintSetRef.current = true
      // Get the latest sprint
      const latestSprint = allSprints[allSprints.length - 1]
      setSelectedSprintId(latestSprint.id)
    }
  }, [allSprints, selectedSprintId])

  // Update newTask.sprintId when sprint changes - only if it's different
  useEffect(() => {
    if (sprint?.id && (!newTask.sprintId || newTask.sprintId !== sprint.id)) {
      setNewTask((prev) => ({
        ...prev,
        sprintId: sprint.id,
      }))
    }
  }, [sprint?.id, newTask.sprintId])

  // Update available effects when category changes
  useEffect(() => {
    if (selectedCategory && selectedCategory in SUSAF_EFFECTS) {
      setAvailableEffects(SUSAF_EFFECTS[selectedCategory as keyof typeof SUSAF_EFFECTS])
    } else {
      setAvailableEffects([])
    }
  }, [selectedCategory])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [authLoading, user, router])

  if (authLoading || sprintLoading || tasksLoading || !user) {
    return null // Will redirect to login if not authenticated
  }

  const handleDragEnd = (result: any) => {
    const { destination, source, draggableId } = result

    // Dropped outside a droppable area
    if (!destination) return

    // Dropped in the same place
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    // Find the task being dragged
    const taskToMove = localTasks.find((t) => t.id === draggableId)
    if (!taskToMove) return

    // Create a new array of tasks with the updated status and order
    const updatedTasks = localTasks.map((task) => {
      // This is the task we're moving
      if (task.id === draggableId) {
        return {
          ...task,
          status: destination.droppableId as "To Do" | "In Progress" | "Done",
          order: destination.index,
        }
      }

      // Adjust order of other tasks in the destination column
      if (task.status === destination.droppableId && task.id !== draggableId) {
        if (destination.index <= task.order) {
          return { ...task, order: task.order + 1 }
        }
      }

      // Adjust order of tasks in the source column if moving between columns
      if (source.droppableId !== destination.droppableId && task.status === source.droppableId) {
        if (task.order > source.index) {
          return { ...task, order: task.order - 1 }
        }
      }

      return task
    })

    // Update local state immediately for responsive UI
    setLocalTasks(updatedTasks)

    // Update the database
    updateTaskStatus(draggableId, destination.droppableId as "To Do" | "In Progress" | "Done").catch((error) => {
      console.error("Error updating task status:", error)
      // Revert to original tasks if there's an error
      if (tasks) {
        setLocalTasks([...tasks])
      }
      toast({
        title: "Error",
        description: "Failed to update task status.",
        variant: "destructive",
      })
    })
  }

  const handleCompleteSprintClick = async () => {
    if (!selectedSprintId) return // Optionally guard against undefined
    await completeSprintAndRedirect(selectedSprintId)
    router.push("/retrospective")
  }

  const openTaskDialog = (task: Task) => {
    setSelectedTask(task)
    setEditedTask({ ...task })
    setIsTaskDialogOpen(true)
  }

  const handleTaskChange = (key: keyof Task, value: any) => {
    if (editedTask) {
      setEditedTask({ ...editedTask, [key]: value })
    }
  }

  const handleNewTaskChange = (key: keyof Task, value: any) => {
    setNewTask((prev) => ({ ...prev, [key]: value }))
  }

  const handleSaveChanges = async () => {
    if (editedTask) {
      await updateTask(editedTask.id, editedTask)

      // Update local state
      setLocalTasks(localTasks.map((task) => (task.id === editedTask.id ? editedTask : task)))

      setIsTaskDialogOpen(false)
      toast({
        title: "Task updated",
        description: "Task has been updated successfully.",
      })
    }
  }

  const handleAddTask = async () => {
    try {
      const taskToAdd = {
        ...newTask,
        sprintId: sprint?.id || "",
      } as Omit<Task, "id" | "order">

      const newTaskWithId = await addTask(taskToAdd)

      // Add to local state
      setLocalTasks((prev) => [...prev, newTaskWithId as Task])

      setIsAddTaskDialogOpen(false)
      toast({
        title: "Task added",
        description: "New task has been added successfully.",
      })

      // Reset form
      setNewTask(newTaskInitialState)
      setSelectedCategory("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add task.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTask = async () => {
    if (selectedTask) {
      await deleteTask(selectedTask.id)

      // Remove from local state
      setLocalTasks(localTasks.filter((task) => task.id !== selectedTask.id))

      setIsTaskDialogOpen(false)
      toast({
        title: "Task deleted",
        description: "Task has been deleted successfully.",
      })
    }
  }

  const handleCreateSprint = async () => {
    try {
      const sprintToCreate = {
        ...newSprint,
        progress: 0,
        sustainabilityScore: 0,
        previousScore: sprint?.sustainabilityScore || 0,
        effectsTackled: 0,
        tasks: [],
        projectId: sprint?.projectId || "", 
      }

      const createdSprint = await createSprint(sprintToCreate)
      setIsCreateSprintDialogOpen(false)
      setSelectedSprintId(createdSprint.id)

      toast({
        title: "Sprint created",
        description: "New sprint has been created successfully.",
      })

      // Reset form
      setNewSprint({
        name: "",
        goal: "",
        startDate: "",
        endDate: "",
        progress: 0,
        sustainabilityScore: 0,
        previousScore: 0,
        effectsTackled: 0,
        tasks: [],
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create sprint.",
        variant: "destructive",
      })
    }
  }

  const getUserById = (userId: string | undefined) => {
    if (!userId) return null
    return allUsers.find((u) => u.id === userId)
  }

  const handleSprintChange = (sprintId: string) => {
    if (sprintId !== selectedSprintId) {
      setSelectedSprintId(sprintId)
      // Reset the tasks updated flag when changing sprints
      tasksUpdatedRef.current = false
    }
  }

  const handleSusafCategoryChange = (category: string) => {
    setSelectedCategory(category)
    handleNewTaskChange("susafCategory", category)
  }

  const handleSusafEffectsChange = (effect: string) => {
    const currentEffects = newTask.relatedSusafEffects || []
    if (currentEffects.includes(effect)) {
      // Remove the effect if already selected
      handleNewTaskChange(
        "relatedSusafEffects",
        currentEffects.filter((e) => e !== effect),
      )
    } else {
      // Add the effect
      handleNewTaskChange("relatedSusafEffects", [...currentEffects, effect])
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="bg-white border rounded-md p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Menu className="h-6 w-6" />
            <h1 className="text-2xl font-bold">{sprint?.name}</h1>
          </div>
          <div className="flex items-center gap-4">
            <Dialog open={isCreateSprintDialogOpen} onOpenChange={setIsCreateSprintDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  New Sprint
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New Sprint</DialogTitle>
                  <DialogDescription>Set up a new sprint with sustainability goals</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="sprint-name">Sprint Name *</Label>
                    <Input
                      id="sprint-name"
                      value={newSprint.name}
                      onChange={(e) => setNewSprint((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Sprint #25 - Q2 2025"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sprint-goal">Sustainability Goal *</Label>
                    <Textarea
                      id="sprint-goal"
                      value={newSprint.goal}
                      onChange={(e) => setNewSprint((prev) => ({ ...prev, goal: e.target.value }))}
                      placeholder="e.g., Reduce server energy consumption by 15%"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start-date">Start Date *</Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={newSprint.startDate}
                        onChange={(e) => setNewSprint((prev) => ({ ...prev, startDate: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="end-date">End Date *</Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={newSprint.endDate}
                        onChange={(e) => setNewSprint((prev) => ({ ...prev, endDate: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateSprintDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateSprint} className="bg-gray-900 hover:bg-gray-800">
                    Create Sprint
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button onClick={handleCompleteSprintClick} className="bg-gray-900 hover:bg-gray-800">
              Complete Sprint
            </Button>
          </div>
        </div>

        <div className="mb-6 p-4 bg-gray-50 rounded-md">
          <h2 className="text-lg font-medium mb-2">Sprint Sustainability Status</h2>
          <div className="p-4 bg-gray-100 rounded-md">
            <div className="text-sm font-medium">Sprint Sustainability Goal:</div>
            <div>{sprint?.goal}</div>
          </div>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(["To Do", "In Progress", "Done"] as const).map((column) => (
              <div key={column} className="space-y-4">
                <div className="flex items-center">
                  <div
                    className={`h-2 w-2 rounded-full mr-2 ${
                      column === "To Do" ? "bg-gray-400" : column === "In Progress" ? "bg-blue-500" : "bg-green-500"
                    }`}
                  ></div>
                  <h2 className="text-lg font-medium">{column}</h2>
                  {column === "To Do" && (
                    <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setIsAddTaskDialogOpen(true)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <Droppable droppableId={column}>
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="min-h-[500px] bg-gray-50 rounded-md space-y-3 p-3"
                    >
                      {tasksByStatus[column].map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => openTaskDialog(task)}
                              className="bg-white p-4 rounded-md border shadow-sm cursor-pointer"
                            >
                              <div className="mb-2">
                                <h3 className="font-medium">{task.title}</h3>
                                <p className="text-sm text-gray-500 line-clamp-2">{task.description}</p>
                              </div>
                              <div className="flex flex-wrap gap-2 mb-2">
                                <Badge
                                  className={
                                    task.priority === "Low"
                                      ? "bg-blue-100 text-blue-800"
                                      : task.priority === "Low+"
                                        ? "bg-blue-200 text-blue-900"
                                        : task.priority === "Medium"
                                          ? "bg-yellow-100 text-yellow-800"
                                          : task.priority === "Medium+"
                                            ? "bg-yellow-200 text-yellow-900"
                                            : task.priority === "High"
                                              ? "bg-red-100 text-red-800"
                                              : "bg-red-200 text-red-900"
                                  }
                                >
                                  {task.priority}
                                </Badge>
                                {task.sustainable && (
                                  <Badge
                                    variant="outline"
                                    className="bg-emerald-50 text-emerald-700 border-emerald-200"
                                  >
                                    Sustainable
                                  </Badge>
                                )}
                              </div>
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3 text-gray-500">
                                  {task.comments > 0 && (
                                    <div className="flex items-center gap-1">
                                      <MessageCircle className="h-3 w-3" />
                                      <span className="text-xs">{task.comments}</span>
                                    </div>
                                  )}
                                  {task.subtasks > 0 && (
                                    <div className="flex items-center gap-1">
                                      <CheckCircle className="h-3 w-3" />
                                      <span className="text-xs">{task.subtasks}</span>
                                    </div>
                                  )}
                                </div>
                                {task.assignedTo && (
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={getUserById(task.assignedTo)?.avatar || "/placeholder.svg"} />
                                    <AvatarFallback>{getUserById(task.assignedTo)?.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>

        {/* Task Edit Dialog */}
        <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{selectedTask?.title}</DialogTitle>
              <DialogDescription>View and edit task details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>PBI Title</Label>
                <Input value={editedTask?.title || ""} onChange={(e) => handleTaskChange("title", e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editedTask?.description || ""}
                  onChange={(e) => handleTaskChange("description", e.target.value)}
                  className="resize-none h-24"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={editedTask?.priority || "Medium"}
                    onValueChange={(value) => handleTaskChange("priority", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Low+">Low+</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Medium+">Medium+</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="High+">High+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Sprint Assignment</Label>
                  <Select
                    value={editedTask?.sprintId || ""}
                    onValueChange={(value) => handleTaskChange("sprintId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sprint" />
                    </SelectTrigger>
                    <SelectContent>
                      {allSprints.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Assigned Person</Label>
                <Select
                  value={editedTask?.assignedTo || ""}
                  onValueChange={(value) => handleTaskChange("assignedTo", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a person..." />
                  </SelectTrigger>
                  <SelectContent>
                    {allUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Sustainability Context</Label>
                <Textarea
                  value={editedTask?.sustainabilityContext || ""}
                  onChange={(e) => handleTaskChange("sustainabilityContext", e.target.value)}
                  className="resize-none h-16"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Sustainability Points</Label>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    value={editedTask?.sustainabilityPoints || editedTask?.sustainabilityWeight || 0}
                    onChange={(e) => handleTaskChange("sustainabilityPoints", Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Story Points</Label>
                  <Input
                    type="number"
                    min="1"
                    value={editedTask?.storyPoints || 1}
                    onChange={(e) => handleTaskChange("storyPoints", Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Definition of Done</Label>
                <Textarea
                  value={editedTask?.definitionOfDone || ""}
                  onChange={(e) => handleTaskChange("definitionOfDone", e.target.value)}
                  className="resize-none h-16"
                />
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={editedTask?.status || "To Do"}
                  onValueChange={(value) => handleTaskChange("status", value as "To Do" | "In Progress" | "Done")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="To Do">To Do</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="flex justify-between">
              <Button variant="destructive" onClick={handleDeleteTask}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
              <div className="space-x-2">
                <Button variant="outline" onClick={() => setIsTaskDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveChanges} className="bg-gray-900 hover:bg-gray-800">
                  Save Changes
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Task Dialog */}
        <Dialog open={isAddTaskDialogOpen} onOpenChange={setIsAddTaskDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
              <DialogDescription>Create a new task for the current sprint</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>PBI Title *</Label>
                <Input
                  value={newTask.title || ""}
                  onChange={(e) => handleNewTaskChange("title", e.target.value)}
                  placeholder="Enter task title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Description *</Label>
                <Textarea
                  value={newTask.description || ""}
                  onChange={(e) => handleNewTaskChange("description", e.target.value)}
                  placeholder="Describe the task"
                  className="resize-none h-24"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Priority *</Label>
                  <Select
                    value={newTask.priority || "Medium"}
                    onValueChange={(value) => handleNewTaskChange("priority", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Low+">Low+</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Medium+">Medium+</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="High+">High+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Assigned Person</Label>
                  <Select
                    value={newTask.assignedTo || ""}
                    onValueChange={(value) => handleNewTaskChange("assignedTo", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a person..." />
                    </SelectTrigger>
                    <SelectContent>
                      {allUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sustainable"
                  checked={newTask.sustainable}
                  onCheckedChange={(checked) => handleNewTaskChange("sustainable", checked)}
                />
                <Label htmlFor="sustainable">This task has sustainability impact</Label>
              </div>

              <div className="space-y-2">
                <Label>Sustainability Context</Label>
                <Textarea
                  value={newTask.sustainabilityContext || ""}
                  onChange={(e) => handleNewTaskChange("sustainabilityContext", e.target.value)}
                  placeholder="Describe sustainability impact"
                  className="resize-none h-16"
                />
              </div>

              <div className="space-y-2">
                <Label>SuSAF Category</Label>
                <Select value={selectedCategory} onValueChange={handleSusafCategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUSAF_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCategory && (
                <div className="space-y-2">
                  <Label>SuSAF Effects</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {availableEffects.map((effect) => (
                      <div key={effect} className="flex items-center space-x-2">
                        <Checkbox
                          id={`effect-${effect}`}
                          checked={(newTask.relatedSusafEffects || []).includes(effect)}
                          onCheckedChange={() => handleSusafEffectsChange(effect)}
                        />
                        <Label htmlFor={`effect-${effect}`} className="text-sm">
                          {effect}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Sustainability Points</Label>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    value={newTask.sustainabilityPoints || 0}
                    onChange={(e) => handleNewTaskChange("sustainabilityPoints", Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Story Points *</Label>
                  <Input
                    type="number"
                    min="1"
                    value={newTask.storyPoints || 1}
                    onChange={(e) => handleNewTaskChange("storyPoints", Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Definition of Done</Label>
                <Textarea
                  value={newTask.definitionOfDone || ""}
                  onChange={(e) => handleNewTaskChange("definitionOfDone", e.target.value)}
                  placeholder="Define when this task is considered done"
                  className="resize-none h-16"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddTaskDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddTask} className="bg-gray-900 hover:bg-gray-800">
                Add Task
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
