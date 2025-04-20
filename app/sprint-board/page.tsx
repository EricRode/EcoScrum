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
  useItemsData,
  updateItemStatus,
  completeSprintAndRedirect,
  addItem,
  deleteItem,
  updateItem,
  getAllUsers,
  getAllSprints,
  createSprint,
  getSustainabilityEffects,
  type Item,
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
import { ScrollArea } from "@/components/ui/scroll-area"
import { ItemForm } from "@/components/item-form"

export default function SprintBoard() {
  const { selectedProjectId } = useProjectContext();
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const { selectedSprintId, setSelectedSprintId } = useSprintContext()

  // Get all sprints for the dropdown
  const [allSprints, setAllSprints] = useState<any[]>([]);
  useEffect(() => {
    const fetchSprints = async () => {
      try {
        if (!selectedProjectId) {
          console.log("selectedProjectId is not set yet"); // Debugging log
          return;
        }
        console.log("Fetching sprints for projectId:", selectedProjectId); // Debugging log
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
  const { data: sprint, loading: sprintLoading } = useSprintData(selectedSprintId || undefined, selectedProjectId)
  const { data: items, loading: itemsLoading } = useItemsData(sprint?.id || "")

  // Local state for items to enable immediate UI updates
  const [localItems, setLocalItems] = useState<Item[]>([])

  // Ref to track if we've already updated the local items
  const itemsUpdatedRef = useRef(false)

  // Update local items when the fetched items change - only once when items are loaded
  useEffect(() => {
    if (items && items.length > 0 && !itemsUpdatedRef.current) {
      itemsUpdatedRef.current = true
      setLocalItems(items)
    } else if (items && items.length > 0 && JSON.stringify(items) !== JSON.stringify(localItems)) {
      // Only update if the items have actually changed (deep comparison)
      setLocalItems(items)
    }
  }, [items, localItems])

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

  // Group items by status and sort by order
  const itemsByStatus = useMemo(() => {
    if (!localItems.length) return { "To Do": [], "In Progress": [], Done: [] }

    return {
      "To Do": localItems.filter((t) => t.status === "To Do").sort((a, b) => a.order - b.order),
      "In Progress": localItems.filter((t) => t.status === "In Progress").sort((a, b) => a.order - b.order),
      Done: localItems.filter((t) => t.status === "Done").sort((a, b) => a.order - b.order),
    }
  }, [localItems])

  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false)
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false)
  const [isCreateSprintDialogOpen, setIsCreateSprintDialogOpen] = useState(false)
  const [editedItem, setEditedItem] = useState<Item | null>(null)

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
    items: [] as string[],
  })

  // State for SuSAF effects selection
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [availableEffects, setAvailableEffects] = useState<string[]>([])

  // State for sustainability effects
  const [sustainabilityEffects, setSustainabilityEffects] = useState<any[]>([])
  const [selectedEffects, setSelectedEffects] = useState<string[]>([])
  const [editItemSelectedEffects, setEditItemSelectedEffects] = useState<string[]>([])

  const newItemInitialState = {
    title: "",
    description: "",
    priority: "Medium" as "Medium" | "Low" | "Low+" | "Medium+" | "High" | "High+",
    sustainabilityContext: "",
    status: "To Do" as "To Do" | "In Progress" | "Done",
    comments: 0,
    subitems: 0,
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

  const [newItem, setNewItem] = useState<Partial<Item>>(newItemInitialState)

  // Ref to track if we've updated the newItem.sprintId
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

  // Update newItem.sprintId when sprint changes - only if it's different
  useEffect(() => {
    if (sprint?.id && (!newItem.sprintId || newItem.sprintId !== sprint.id)) {
      setNewItem((prev) => ({
        ...prev,
        sprintId: sprint.id,
      }))
    }
  }, [sprint?.id, newItem.sprintId])

  // Update available effects when category changes
  useEffect(() => {
    if (selectedCategory && selectedCategory in SUSAF_EFFECTS) {
      setAvailableEffects(SUSAF_EFFECTS[selectedCategory as keyof typeof SUSAF_EFFECTS])
    } else {
      setAvailableEffects([])
    }
  }, [selectedCategory])

  // Fetch sustainability effects when project ID changes
  useEffect(() => {
    if (!selectedProjectId) return;

    const fetchEffects = async () => {
      try {
        const response = await getSustainabilityEffects(selectedProjectId);
        // Process the data structure from the API response
        if (response && response.success && response.data) {
          // The response.data contains the array of dimension objects with their effects
          setSustainabilityEffects(response.data);
        } else {
          setSustainabilityEffects([]);
          console.error('Unexpected response format from sustainability effects API');
        }
      } catch (error) {
        console.error('Failed to fetch sustainability effects:', error);
        toast({
          title: "Error",
          description: "Failed to load sustainability effects.",
          variant: "destructive",
        });
      }
    };

    fetchEffects();
  }, [selectedProjectId, toast]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [authLoading, user, router])

  if (authLoading || sprintLoading || itemsLoading || !user) {
    return null // Will redirect to login if not authenticated
  }

  const handleDragEnd = (result: any) => {
    const { destination, source, draggableId } = result

    // Dropped outside a droppable area
    if (!destination) return

    // Dropped in the same place
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    // Find the item being dragged
    const itemToMove = localItems.find((t) => t.id === draggableId)
    if (!itemToMove) return

    // Create a new array of items with the updated status and order
    const updatedItems = localItems.map((item) => {
      // This is the item we're moving
      if (item.id === draggableId) {
        return {
          ...item,
          status: destination.droppableId as "To Do" | "In Progress" | "Done",
          order: destination.index,
        }
      }

      // Adjust order of other items in the destination column
      if (item.status === destination.droppableId && item.id !== draggableId) {
        if (destination.index <= item.order) {
          return { ...item, order: item.order + 1 }
        }
      }

      // Adjust order of items in the source column if moving between columns
      if (source.droppableId !== destination.droppableId && item.status === source.droppableId) {
        if (item.order > source.index) {
          return { ...item, order: item.order - 1 }
        }
      }

      return item
    })

    // Update local state immediately for responsive UI
    setLocalItems(updatedItems)

    // Update the database
    updateItemStatus(draggableId, destination.droppableId as "To Do" | "In Progress" | "Done").catch((error) => {
      console.error("Error updating item status:", error)
      // Revert to original items if there's an error
      if (items) {
        setLocalItems([...items])
      }
      toast({
        title: "Error",
        description: "Failed to update item status.",
        variant: "destructive",
      })
    })
  }

  const handleCompleteSprintClick = async () => {
    if (!selectedSprintId) return // Optionally guard against undefined
    await completeSprintAndRedirect(selectedSprintId)
    router.push("/retrospective")
  }

  const openItemDialog = (item: Item) => {
    setSelectedItem(item)
    setEditedItem({ ...item })
    // Initialize selected effects from the item (try both possible locations)
    setEditItemSelectedEffects(item.relatedSusafEffects || item.relatedSusafEffects || [])
    setIsItemDialogOpen(true)
  }

  const handleItemChange = (key: keyof Item, value: any) => {
    if (editedItem) {
      setEditedItem({ ...editedItem, [key]: value })
    }
  }

  const handleNewItemChange = (key: keyof Item, value: any) => {
    setNewItem((prev) => ({ ...prev, [key]: value }))
  }

  const toggleEffect = (effectId: string) => {
    setSelectedEffects(prev => 
      prev.includes(effectId)
        ? prev.filter(id => id !== effectId)
        : [...prev, effectId]
    );
  };

  const toggleEditEffect = (effectId: string) => {
    setEditItemSelectedEffects(prev => 
      prev.includes(effectId)
        ? prev.filter(id => id !== effectId)
        : [...prev, effectId]
    )
    
    // Also update the editedItem
    if (editedItem) {
      const updatedEffects = editItemSelectedEffects.includes(effectId)
        ? editItemSelectedEffects.filter(id => id !== effectId)
        : [...editItemSelectedEffects, effectId]
        
      setEditedItem({
        ...editedItem,
        relatedSusafEffects: updatedEffects,
      })
    }
  }

  const handleSaveChanges = async () => {
    if (editedItem) {
      // Make sure effects are properly included in the update
      const itemToUpdate = {
        ...editedItem,
        sustainabilityEffects: editItemSelectedEffects,
        relatedSusafEffects: editItemSelectedEffects
      }
      
      await updateItem(itemToUpdate.id, itemToUpdate)

      // Update local state
      setLocalItems(localItems.map((item) => (item.id === itemToUpdate.id ? itemToUpdate : item)))

      setIsItemDialogOpen(false)
      toast({
        title: "Item updated",
        description: "Item has been updated successfully.",
      })
    }
  }

  const handleAddItem = async () => {
    try {
      if (!selectedProjectId) {
        toast({
          title: "Error",
          description: "No project selected. Please select a project first.",
          variant: "destructive",
        });
        return;
      }
      
      const itemToAdd = {
        ...newItem,
        sprintId: sprint?.id || "",
        projectId: selectedProjectId, // Ensure projectId is explicitly set
        relatedSusafEffects: selectedEffects,
      } as Omit<Item, "id" | "order">;

      console.log("Creating item with data:", itemToAdd); // Log for debugging
      const newItemWithId = await addItem(itemToAdd);

      // Add to local state
      setLocalItems((prev) => [...prev, newItemWithId as Item]);

      setIsAddItemDialogOpen(false);
      toast({
        title: "Item added",
        description: "New item has been added successfully.",
      });

      // Reset form
      setNewItem(newItemInitialState);
      setSelectedCategory("");
      setSelectedEffects([]);
    } catch (error) {
      console.error("Error adding item:", error);
      toast({
        title: "Error",
        description: "Failed to add item.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteItem = async () => {
    if (selectedItem) {
      await deleteItem(selectedItem.id)

      // Remove from local state
      setLocalItems(localItems.filter((item) => item.id !== selectedItem.id))

      setIsItemDialogOpen(false)
      toast({
        title: "Item deleted",
        description: "Item has been deleted successfully.",
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
        items: [],
        projectId: selectedProjectId, 
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
        items: [],
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
      // Reset the items updated flag when changing sprints
      itemsUpdatedRef.current = false
    }
  }

  const handleSusafEffectsChange = (effect: string) => {
    const currentEffects = newItem.relatedSusafEffects || []
    if (currentEffects.includes(effect)) {
      // Remove the effect if already selected
      handleNewItemChange(
        "relatedSusafEffects",
        currentEffects.filter((e) => e !== effect),
      )
    } else {
      // Add the effect
      handleNewItemChange("relatedSusafEffects", [...currentEffects, effect])
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
                    <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setIsAddItemDialogOpen(true)}>
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
                      {itemsByStatus[column].map((item, index) => (
                        <Draggable key={item.id} draggableId={item.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => openItemDialog(item)}
                              className="bg-white p-4 rounded-md border shadow-sm cursor-pointer"
                            >
                              <div className="mb-2">
                                <h3 className="font-medium">{item.title}</h3>
                                <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
                              </div>
                              <div className="flex flex-wrap gap-2 mb-2">
                                <Badge
                                  className={
                                    item.priority === "Low"
                                      ? "bg-blue-100 text-blue-800"
                                      : item.priority === "Low+"
                                        ? "bg-blue-200 text-blue-900"
                                        : item.priority === "Medium"
                                          ? "bg-yellow-100 text-yellow-800"
                                          : item.priority === "Medium+"
                                            ? "bg-yellow-200 text-yellow-900"
                                            : item.priority === "High"
                                              ? "bg-red-100 text-red-800"
                                              : "bg-red-200 text-red-900"
                                  }
                                >
                                  {item.priority}
                                </Badge>
                                {item.sustainable && (
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
                                  {item.comments > 0 && (
                                    <div className="flex items-center gap-1">
                                      <MessageCircle className="h-3 w-3" />
                                      <span className="text-xs">{item.comments}</span>
                                    </div>
                                  )}
                                  {item.subitems > 0 && (
                                    <div className="flex items-center gap-1">
                                      <CheckCircle className="h-3 w-3" />
                                      <span className="text-xs">{item.subitems}</span>
                                    </div>
                                  )}
                                </div>
                                {item.assignedTo && (
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={getUserById(item.assignedTo)?.avatar || "/placeholder.svg"} />
                                    <AvatarFallback>{getUserById(item.assignedTo)?.name.charAt(0)}</AvatarFallback>
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

        {/* Item Edit Dialog */}
        <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedItem?.title}</DialogTitle>
              <DialogDescription>View and edit item details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>PBI Title</Label>
                <Input value={editedItem?.title || ""} onChange={(e) => handleItemChange("title", e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editedItem?.description || ""}
                  onChange={(e) => handleItemChange("description", e.target.value)}
                  className="resize-none h-24"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={editedItem?.priority || "Medium"}
                    onValueChange={(value) => handleItemChange("priority", value)}
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
                    value={editedItem?.sprintId || ""}
                    onValueChange={(value) => handleItemChange("sprintId", value)}
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
                  value={editedItem?.assignedTo || ""}
                  onValueChange={(value) => handleItemChange("assignedTo", value)}
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
                  value={editedItem?.sustainabilityContext || ""}
                  onChange={(e) => handleItemChange("sustainabilityContext", e.target.value)}
                  className="resize-none h-16"
                />
              </div>

              <div className="space-y-2">
                <Label>Sustainability Effects</Label>
                {sustainabilityEffects.length > 0 ? (
                  <ScrollArea className="h-[250px] border rounded-md p-4">
                    <div className="space-y-6">
                      {sustainabilityEffects.map((dimension) => (
                        <div key={dimension._id} className="space-y-2">
                          <h3 className="font-medium text-sm text-gray-900 bg-gray-100 p-2 rounded">
                            {dimension.name}: {dimension.question}
                          </h3>
                          
                          <div className="ml-2 space-y-3">
                            {dimension.effects && dimension.effects.map((effect) => (
                              <div key={effect._id} className="flex items-start space-x-2">
                                <Checkbox
                                  id={`edit-effect-${effect._id}`}
                                  checked={editItemSelectedEffects.includes(effect._id)}
                                  onCheckedChange={() => toggleEditEffect(effect._id)}
                                  className="mt-1"
                                />
                                <div>
                                  <div className="flex items-center gap-2">
                                    <Label htmlFor={`edit-effect-${effect._id}`} className="font-medium text-sm">
                                      {effect.description}
                                    </Label>
                                    <Badge 
                                      variant="outline" 
                                      className={effect.is_positive ? 
                                        "bg-green-50 text-green-700 border-green-200" : 
                                        "bg-amber-50 text-amber-700 border-amber-200"
                                      }
                                    >
                                      {effect.is_positive ? "Positive" : "Negative"}
                                    </Badge>
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1 ml-1">
                                    Impact: {effect.impact_level}/5 · Likelihood: {effect.likelihood}/5 · Type: {effect.order_of_impact}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center p-4 border rounded-md">
                    <p className="text-sm text-gray-500">No sustainability effects available for this project.</p>
                  </div>
                )}

                {editItemSelectedEffects.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium mb-1">Selected effects:</p>
                    <div className="flex flex-wrap gap-2">
                      {editItemSelectedEffects.map((effectId) => {
                        // Find the effect across all dimensions
                        let effect;
                        for (const dimension of sustainabilityEffects) {
                          effect = dimension.effects.find(e => e._id === effectId);
                          if (effect) break;
                        }
                        return (
                          <Badge 
                            key={effectId}
                            variant="secondary"
                            className="pl-2 bg-emerald-50 text-emerald-700 border-emerald-200"
                          >
                            {effect ? effect.description.substring(0, 30) + (effect.description.length > 30 ? '...' : '') : 'Unknown effect'}
                            <button 
                              className="ml-1 hover:bg-emerald-100 rounded-full p-1"
                              onClick={(e) => {
                                e.preventDefault();
                                toggleEditEffect(effectId);
                              }}
                            >
                              ✕
                            </button>
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Sustainability Points</Label>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    value={editedItem?.sustainabilityPoints || 0}
                    onChange={(e) => handleItemChange("sustainabilityPoints", Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Story Points</Label>
                  <Input
                    type="number"
                    min="1"
                    value={editedItem?.storyPoints || 1}
                    onChange={(e) => handleItemChange("storyPoints", Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Definition of Done</Label>
                <Textarea
                  value={editedItem?.definitionOfDone || ""}
                  onChange={(e) => handleItemChange("definitionOfDone", e.target.value)}
                  className="resize-none h-16"
                />
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={editedItem?.status || "To Do"}
                  onValueChange={(value) => handleItemChange("status", value as "To Do" | "In Progress" | "Done")}
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
              <Button variant="destructive" onClick={handleDeleteItem}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
              <div className="space-x-2">
                <Button variant="outline" onClick={() => setIsItemDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveChanges} className="bg-gray-900 hover:bg-gray-800">
                  Save Changes
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Item Dialog */}
        <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Item</DialogTitle>
              <DialogDescription>Create a new item for the current sprint</DialogDescription>
            </DialogHeader>
            <ItemForm
              item={newItem}
              onChange={handleNewItemChange}
              onSubmit={handleAddItem}
              onCancel={() => setIsAddItemDialogOpen(false)}
              users={allUsers}
              sprints={allSprints}
              sustainabilityEffects={sustainabilityEffects}
              selectedEffects={selectedEffects}
              onToggleEffect={toggleEffect}
              projectId={selectedProjectId || ""}
              submitLabel="Add Item"
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
