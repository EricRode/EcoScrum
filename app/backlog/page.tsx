"use client"

import { useState, useEffect, useMemo } from "react"
import { Layers, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useBacklogData, addBacklogItem, getAllSprints, getSustainabilityEffects, type Item } from "@/lib/axiosInstance"
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
import { useProjectContext } from "@/components/project-context"
import { ItemForm } from "@/components/item-form"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

export default function Backlog() {
  const { data: backlogItems, loading, error } = useBacklogData()
  const { toast } = useToast()
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { selectedSprintId, setSelectedSprintId } = useSprintContext()
  const { selectedProjectId } = useProjectContext();
  
  const [allSprints, setAllSprints] = useState<any[]>([]);
  const [sustainabilityEffects, setSustainabilityEffects] = useState<any[]>([])
  const [selectedEffects, setSelectedEffects] = useState<string[]>([])

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

  useEffect(() => {
    if (!selectedProjectId) return;

    const fetchEffects = async () => {
      try {
        const response = await getSustainabilityEffects(selectedProjectId);
        console.log("Sustainability effects response:", response); // Debug line
        
        if (response && response.success && response.data) {
          setSustainabilityEffects(response.data);
          console.log("Set sustainability effects:", response.data); // Debug line
        } else {
          setSustainabilityEffects([]);
          console.error('Unexpected response format from sustainability effects API:', response);
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

  const [filters, setFilters] = useState({
    sustainability: "All",
    priority: "All",
    susafCategory: "All",
    status: "All",
    search: "",
  })

  const [newItem, setNewItem] = useState<Partial<Item>>({
    title: "",
    description: "",
    priority: "High",
    sustainable: false,
    storyPoints: 3,
    status: "To Do",
    sustainabilityPoints: 0,
    relatedSusafEffects: [],
    definitionOfDone: "",
    tags: [],
    sprintId: "",
  })

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [tagsInput, setTagsInput] = useState("")

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
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
      
      // Make sure the sustainable flag is set appropriately based on selected effects
      const sustainable = selectedEffects.length > 0 || newItem.sustainable;
      
      const itemToAdd = {
        ...newItem,
        sprintId: selectedSprintId,
        projectId: selectedProjectId,
        relatedSusafEffects: selectedEffects,
        sustainable: sustainable,
        tags: tagsInput
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
      } as Omit<Item, "id">;

      console.log("Creating backlog item with data:", itemToAdd);
      await addBacklogItem(itemToAdd);
      
      setIsAddDialogOpen(false);
      toast({
        title: "Backlog item added",
        description: "Your new backlog item has been added successfully.",
      });

      // Reset form
      setNewItem({
        title: "",
        description: "",
        priority: "High",
        sustainable: false,
        storyPoints: 3,
        status: "To Do",
        sustainabilityPoints: 0,
        relatedSusafEffects: [],
        definitionOfDone: "",
        tags: [],
        sprintId: selectedSprintId,
      });
      setTagsInput("");
      setSelectedEffects([]);
    } catch (error) {
      console.error("Error adding backlog item:", error);
      toast({
        title: "Error",
        description: "Failed to add backlog item. Please check the console for details.",
        variant: "destructive",
      });
    }
  };

  if (loading || authLoading || !user) {
    return null // Will redirect to login if not authenticated
  }

  if (error) {
    return <div className="flex justify-center items-center h-64 text-red-500">Error loading backlog data</div>
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
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Add Product Backlog Item
                </DialogTitle>
                <DialogDescription>Create a new product backlog item with sustainability metrics</DialogDescription>
              </DialogHeader>
              <ItemForm
                item={newItem}
                onChange={handleNewItemChange}
                onSubmit={handleAddItem}
                onCancel={() => setIsAddDialogOpen(false)}
                users={[  // Replace this with your actual users data
                  { id: "user-1", name: "Alex Johnson", email: "alex@example.com" },
                  { id: "user-2", name: "Sam Smith", email: "sam@example.com" },
                  { id: "user-3", name: "Jordan Lee", email: "jordan@example.com" }
                ]}
                sprints={allSprints}
                sustainabilityEffects={sustainabilityEffects}  // All available effects
                selectedEffects={selectedEffects}             // Currently selected effects
                onToggleEffect={toggleEffect}                 // Function to toggle selection
                projectId={selectedProjectId || ""}
                submitLabel="Save PBI"
              />
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
                <th className="px-6 py-3">Sustainability Points</th>
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
                    <td className="px-6 py-4">{item.sustainabilityPoints}</td>
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
