"use client"

import { useState, useEffect, useMemo } from "react"
import { Layers, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useBacklogData, addBacklogItem, getAllSprints, type BacklogItem } from "@/lib/axiosInstance"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import { useSprintContext } from "@/components/sprint-context"
import { useRouter } from "next/navigation"
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
import { SUSAF_CATEGORIES, SUSAF_EFFECTS } from "@/lib/constants"

export default function Backlog() {
  const { data: backlogItems, loading, error } = useBacklogData()
  const { toast } = useToast()
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { selectedSprintId, setSelectedSprintId } = useSprintContext()

  // Get all sprints for the dropdown
  const allSprints = useMemo(() => getAllSprints(), [])

  const [filters, setFilters] = useState({
    sustainability: "All",
    priority: "All",
    susafCategory: "All",
    status: "All",
    search: "",
  })

  // State for SuSAF effects selection
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [availableEffects, setAvailableEffects] = useState<string[]>([])

  const [newItem, setNewItem] = useState<Partial<BacklogItem>>({
    title: "",
    description: "",
    priority: "High",
    sustainable: false,
    storyPoints: 3,
    sustainabilityScore: 0,
    status: "To Do",
    susafCategory: undefined,
    sustainabilityPoints: 0,
    relatedSusafEffects: [],
    definitionOfDone: "",
    tags: [],
    sprintId: "",
  })

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [tagsInput, setTagsInput] = useState("")

  // Update available effects when category changes
  useEffect(() => {
    if (selectedCategory && selectedCategory in SUSAF_EFFECTS) {
      setAvailableEffects(SUSAF_EFFECTS[selectedCategory as keyof typeof SUSAF_EFFECTS])
    } else {
      setAvailableEffects([])
    }
  }, [selectedCategory])

  // Update newItem.sprintId when selected sprint changes
  useEffect(() => {
    if (selectedSprintId) {
      setNewItem((prev) => ({
        ...prev,
        sprintId: selectedSprintId,
      }))
    }
  }, [selectedSprintId])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [authLoading, user, router])

  if (loading || authLoading || !user) {
    return null // Will redirect to login if not authenticated
  }

  if (error) {
    return <div className="flex justify-center items-center h-64 text-red-500">Error loading backlog data</div>
  }

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleNewItemChange = (key: keyof BacklogItem, value: any) => {
    setNewItem((prev) => ({ ...prev, [key]: value }))
  }

  const handleAddItem = async () => {
    // Process tags from comma-separated string
    const tags = tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag)

    const itemToAdd = {
      ...newItem,
      tags,
      sprintId: selectedSprintId,
    } as Omit<BacklogItem, "id">

    await addBacklogItem(itemToAdd)
    setIsAddDialogOpen(false)
    toast({
      title: "Backlog item added",
      description: "Your new backlog item has been added successfully.",
    })

    // Reset form
    setNewItem({
      title: "",
      description: "",
      priority: "High",
      sustainable: false,
      storyPoints: 3,
      sustainabilityScore: 0,
      status: "To Do",
      susafCategory: undefined,
      sustainabilityPoints: 0,
      relatedSusafEffects: [],
      definitionOfDone: "",
      tags: [],
      sprintId: selectedSprintId,
    })
    setTagsInput("")
    setSelectedCategory("")
  }

  const handleSprintChange = (sprintId: string) => {
    setSelectedSprintId(sprintId)
  }

  const handleSusafCategoryChange = (category: string) => {
    setSelectedCategory(category)
    handleNewItemChange("susafCategory", category)
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

  // Filter backlog items based on selected sprint and other filters
  const filteredItems = backlogItems.filter((item) => {
    // Filter by sprint
    if (selectedSprintId && selectedSprintId !== "all") {
      if (item.sprintId !== selectedSprintId) return false
    }

    // Apply other filters
    if (filters.sustainability !== "All") {
      if (filters.sustainability === "Sustainable" && !item.sustainable) return false
      if (filters.sustainability === "Non-Sustainable" && item.sustainable) return false
    }

    if (filters.priority !== "All") {
      // Handle the "+" variants
      if (filters.priority.endsWith("+")) {
        const basePriority = filters.priority.slice(0, -1)
        if (item.priority !== filters.priority && !(item.priority === basePriority && item.sustainable)) {
          return false
        }
      } else {
        // For non-"+" priorities, match exactly but also include items with "+" if they match the base priority
        const itemBasePriority = item.priority.endsWith("+") ? item.priority.slice(0, -1) : item.priority
        if (itemBasePriority !== filters.priority) return false
      }
    }

    if (filters.susafCategory !== "All" && item.susafCategory !== filters.susafCategory) return false

    if (filters.status !== "All" && item.status !== filters.status) return false

    if (filters.search && !item.title.toLowerCase().includes(filters.search.toLowerCase())) return false

    return true
  })

  const uniqueCategories = Array.from(new Set(backlogItems.map((item) => item.susafCategory))).filter(
    Boolean,
  ) as string[]

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6 px-4">
        <div className="flex items-center gap-2">
          <Layers className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Product Backlog</h1>
        </div>
        <div className="flex items-center gap-4">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gray-900 hover:bg-gray-800">
                <Plus className="h-4 w-4 mr-2" />
                Add New PBI
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Add Product Backlog Item
                </DialogTitle>
                <DialogDescription>Create a new product backlog item with sustainability metrics</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">PBI Title *</Label>
                  <Input
                    id="title"
                    value={newItem.title || ""}
                    onChange={(e) => handleNewItemChange("title", e.target.value)}
                    placeholder="Enter backlog item title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={newItem.description || ""}
                    onChange={(e) => handleNewItemChange("description", e.target.value)}
                    placeholder="Describe the backlog item"
                    className="min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority *</Label>
                    <Select value={newItem.priority} onValueChange={(value) => handleNewItemChange("priority", value)}>
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
                    <Label htmlFor="sprint-assignment">Sprint Assignment</Label>
                    <Select
                      value={newItem.sprintId || ""}
                      onValueChange={(value) => handleNewItemChange("sprintId", value)}
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
                  <Label htmlFor="assigned-person">Assigned Person</Label>
                  <Select
                    value={newItem.assignedTo || ""}
                    onValueChange={(value) => handleNewItemChange("assignedTo", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a person..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user-1">Alex Johnson</SelectItem>
                      <SelectItem value="user-2">Sam Smith</SelectItem>
                      <SelectItem value="user-3">Jordan Lee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sustainable"
                    checked={newItem.sustainable}
                    onCheckedChange={(checked) => handleNewItemChange("sustainable", checked)}
                  />
                  <Label htmlFor="sustainable">This item has sustainability impact</Label>
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
                            checked={(newItem.relatedSusafEffects || []).includes(effect)}
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
                    <Label htmlFor="sustainability-points">Sustainability Points</Label>
                    <Input
                      id="sustainability-points"
                      type="number"
                      min="0"
                      max="10"
                      value={newItem.sustainabilityPoints || 0}
                      onChange={(e) => handleNewItemChange("sustainabilityPoints", Number(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="story-points">Estimated Effort (Story Points) *</Label>
                    <Input
                      id="story-points"
                      type="number"
                      min="1"
                      value={newItem.storyPoints || 1}
                      onChange={(e) => handleNewItemChange("storyPoints", Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="definition-of-done">Definition of Done *</Label>
                  <Textarea
                    id="definition-of-done"
                    value={newItem.definitionOfDone || ""}
                    onChange={(e) => handleNewItemChange("definitionOfDone", e.target.value)}
                    placeholder="Define when this item is considered done"
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    placeholder="Separate tags with commas"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddItem} className="bg-gray-900 hover:bg-gray-800">
                  Save PBI
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-white border rounded-md">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
          <div>
            <Label className="mb-2 block">Sustainability</Label>
            <Select
              value={filters.sustainability}
              onValueChange={(value) => handleFilterChange("sustainability", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by sustainability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Sustainable">Sustainable</SelectItem>
                <SelectItem value="Non-Sustainable">Non-Sustainable</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-2 block">Priority</Label>
            <Select value={filters.priority} onValueChange={(value) => handleFilterChange("priority", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Low+">Low+</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Medium+">Medium+</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="High+">High+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-2 block">SuSAF Category</Label>
            <Select value={filters.susafCategory} onValueChange={(value) => handleFilterChange("susafCategory", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Categories</SelectItem>
                {uniqueCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-2 block">Status</Label>
            <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="To Do">To Do</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Done">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-t border-b text-left text-xs uppercase tracking-wider text-gray-500">
                <th className="px-6 py-3">Title</th>
                <th className="px-6 py-3">Priority</th>
                <th className="px-6 py-3">Sustainable</th>
                <th className="px-6 py-3">Story Points</th>
                <th className="px-6 py-3">Sustainability Score</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No backlog items match your filters
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{item.title}</td>
                    <td className="px-6 py-4">{item.priority}</td>
                    <td className="px-6 py-4">
                      <Checkbox checked={item.sustainable} disabled />
                    </td>
                    <td className="px-6 py-4">{item.storyPoints}</td>
                    <td className="px-6 py-4">{item.sustainabilityScore}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                        ${
                          item.status === "In Progress"
                            ? "bg-blue-100 text-blue-800"
                            : item.status === "Done"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
