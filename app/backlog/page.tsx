"use client"

import { useState, useEffect } from "react"
import { Layers, Plus, ArrowUpDown, ArrowUp, ArrowDown, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useBacklogData, addBacklogItem, getAllSprints, getSustainabilityEffects, updateItem, deleteItem, type Item } from "@/lib/axiosInstance"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import { useSprintContext } from "@/components/sprint-context"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useProjectContext } from "@/components/project-context"
import { ItemForm } from "@/components/item-form"
import { Badge } from "@/components/ui/badge"

// Define the order for basic priority values
const PRIORITY_ORDER = {
  "High": 0,
  "Medium": 1, 
  "Low": 2
};

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
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ 
    key: 'priority', 
    direction: 'asc' 
  });

  // State for edit functionality
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [editItemSelectedEffects, setEditItemSelectedEffects] = useState<string[]>([]);

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
        
        if (response && response.success && response.data) {
          setSustainabilityEffects(response.data);
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
    storyPoints: 1,
    status: "To Do",
    sustainabilityPoints: 0,
    relatedSusafEffects: [],
    definitionOfDone: "",
    sprintId: "",
  })

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

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

  const toggleEditEffect = (effectId: string) => {
    setEditItemSelectedEffects(prev => 
      prev.includes(effectId)
        ? prev.filter(id => id !== effectId)
        : [...prev, effectId]
    )
    
    // Also update the editingItem
    if (editingItem) {
      const updatedEffects = editItemSelectedEffects.includes(effectId)
        ? editItemSelectedEffects.filter(id => id !== effectId)
        : [...editItemSelectedEffects, effectId]
        
      setEditingItem({
        ...editingItem,
        relatedSusafEffects: updatedEffects,
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
      
      // Let the sustainable flag be explicitly set by the checkbox only
      const itemToAdd = {
        ...newItem,
        sprintId: newItem.sprintId || "", // Keep empty string if not assigned
        projectId: selectedProjectId,
        relatedSusafEffects: selectedEffects,
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
        sprintId: "",
      });
      setSelectedEffects([]);
      
      // Refresh the page to show the new item
      window.location.reload();
    } catch (error) {
      console.error("Error adding backlog item:", error);
      toast({
        title: "Error",
        description: "Failed to add backlog item. Please check the console for details.",
        variant: "destructive",
      });
    }
  };

  const handleEditItem = async () => {
    if (!editingItem) return;

    try {
      await updateItem(editingItem.id, {
        ...editingItem,
        relatedSusafEffects: editItemSelectedEffects
      });
      
      setIsEditDialogOpen(false);
      toast({
        title: "Item updated",
        description: "The backlog item has been updated successfully.",
      });
      
      // Refresh the page to show the updated item
      window.location.reload();
    } catch (error) {
      console.error("Error updating backlog item:", error);
      toast({
        title: "Error",
        description: "Failed to update backlog item.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteItem = async () => {
    if (!editingItem) return;

    try {
      await deleteItem(editingItem.id);
      
      setIsEditDialogOpen(false);
      toast({
        title: "Item deleted",
        description: "The backlog item has been deleted successfully.",
      });
      
      // Refresh the page to show the updated list
      window.location.reload();
    } catch (error) {
      console.error("Error deleting backlog item:", error);
      toast({
        title: "Error",
        description: "Failed to delete backlog item.",
        variant: "destructive",
      });
    }
  };

  const handleEditItemChange = (key: keyof Item, value: any) => {
    if (!editingItem) return;
    setEditingItem({ ...editingItem, [key]: value });
  };

  const openItemForEdit = (item: Item) => {
    setEditingItem(item);
    setEditItemSelectedEffects(item.relatedSusafEffects || []);
    setIsEditDialogOpen(true);
  };

  // Function to handle sorting
  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key, direction });
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
      if (item.priority !== filters.priority) return false
    }

    if (filters.susafCategory !== "All" && item.susafCategory !== filters.susafCategory) return false

    if (filters.status !== "All" && item.status !== filters.status) return false

    if (filters.search && !item.title.toLowerCase().includes(filters.search.toLowerCase())) return false

    return true
  });

  // Sort filtered items
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortConfig.key === 'priority') {
      // Get the base priority value without the '+'
      const priorityA = PRIORITY_ORDER[a.priority as keyof typeof PRIORITY_ORDER];
      const priorityB = PRIORITY_ORDER[b.priority as keyof typeof PRIORITY_ORDER];
      
      if (priorityA === priorityB) {
        // When priorities are equal, sort sustainable items first
        return sortConfig.direction === 'asc'
          ? (b.sustainable ? 1 : 0) - (a.sustainable ? 1 : 0)
          : (a.sustainable ? 1 : 0) - (b.sustainable ? 1 : 0);
      }
      
      return sortConfig.direction === 'asc' 
        ? priorityA - priorityB 
        : priorityB - priorityA;
    }
    
    if (sortConfig.key === 'sustainable') {
      const boolA = a.sustainable ? 1 : 0;
      const boolB = b.sustainable ? 1 : 0;
      
      return sortConfig.direction === 'asc'
        ? boolA - boolB
        : boolB - boolA;
    }
    
    if (sortConfig.key === 'storyPoints' || sortConfig.key === 'sustainabilityPoints') {
      const valA = a[sortConfig.key] || 0;
      const valB = b[sortConfig.key] || 0;
      
      return sortConfig.direction === 'asc'
        ? valA - valB
        : valB - valA;
    }
    
    // Default string comparison for title and status
    const valA = a[sortConfig.key as keyof typeof a] as string;
    const valB = b[sortConfig.key as keyof typeof b] as string;
    
    if (sortConfig.direction === 'asc') {
      return valA > valB ? 1 : -1;
    } else {
      return valA < valB ? 1 : -1;
    }
  });

  const uniqueCategories = Array.from(new Set(backlogItems.map((item) => item.susafCategory))).filter(
    Boolean,
  ) as string[]

  // Helper to show sort indicator
  const getSortDirection = (key: string) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3 ml-1" /> : <ArrowDown className="h-3 w-3 ml-1" />;
    }
    return <ArrowUpDown className="h-3 w-3 ml-1 opacity-30" />;
  };

  // Helper to get the display priority (with + for sustainable items)
  const getDisplayPriority = (item: Item) => {
    return item.sustainable ? `${item.priority}+` : item.priority;
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6 px-4">
        <div className="flex items-center gap-2">
          <Layers className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Product Backlog</h1>
        </div>
        <div className="flex items-center gap-4">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <Button className="bg-gray-900 hover:bg-gray-800" onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add New PBI
            </Button>
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
                sustainabilityEffects={sustainabilityEffects}
                selectedEffects={selectedEffects}
                onToggleEffect={toggleEffect}
                projectId={selectedProjectId || ""}
                submitLabel="Save PBI"
                isSprintBoard={false}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit Item Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Backlog Item</DialogTitle>
            <DialogDescription>Update the details of this backlog item</DialogDescription>
          </DialogHeader>
          {editingItem && (
            <ItemForm
              item={editingItem}
              onChange={handleEditItemChange}
              onSubmit={handleEditItem}
              onCancel={() => setIsEditDialogOpen(false)}
              users={[  // Replace with actual user data
                { id: "user-1", name: "Alex Johnson", email: "alex@example.com" },
                { id: "user-2", name: "Sam Smith", email: "sam@example.com" },
                { id: "user-3", name: "Jordan Lee", email: "jordan@example.com" }
              ]}
              sprints={allSprints}
              sustainabilityEffects={sustainabilityEffects}
              selectedEffects={editItemSelectedEffects}
              onToggleEffect={toggleEditEffect}
              projectId={selectedProjectId || ""}
              submitLabel="Update PBI"
              cancelLabel="Cancel"
              showDelete={true}
              onDelete={handleDeleteItem}
              isEdit={true}
              isSprintBoard={false}
            />
          )}
        </DialogContent>
      </Dialog>

      <div className="bg-white border rounded-md">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4">
          <div>
            <Label className="mb-2 block">Search</Label>
            <Input 
              placeholder="Search by title" 
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
          </div>

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
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
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
                <th className="px-6 py-3">
                  <button 
                    onClick={() => requestSort('title')}
                    className="flex items-center font-semibold hover:text-gray-700 focus:outline-none"
                  >
                    Title {getSortDirection('title')}
                  </button>
                </th>
                <th className="px-6 py-3">
                  <button 
                    onClick={() => requestSort('priority')}
                    className="flex items-center font-semibold hover:text-gray-700 focus:outline-none"
                  >
                    Priority {getSortDirection('priority')}
                  </button>
                </th>
                <th className="px-6 py-3">
                  <button 
                    onClick={() => requestSort('sustainable')}
                    className="flex items-center font-semibold hover:text-gray-700 focus:outline-none"
                  >
                    Sustainable {getSortDirection('sustainable')}
                  </button>
                </th>
                <th className="px-6 py-3">
                  <button 
                    onClick={() => requestSort('storyPoints')}
                    className="flex items-center font-semibold hover:text-gray-700 focus:outline-none"
                  >
                    Story Points {getSortDirection('storyPoints')}
                  </button>
                </th>
                <th className="px-6 py-3">
                  <button 
                    onClick={() => requestSort('sustainabilityPoints')}
                    className="flex items-center font-semibold hover:text-gray-700 focus:outline-none"
                  >
                    Sustainability Points {getSortDirection('sustainabilityPoints')}
                  </button>
                </th>
                <th className="px-6 py-3">
                  <button 
                    onClick={() => requestSort('status')}
                    className="flex items-center font-semibold hover:text-gray-700 focus:outline-none"
                  >
                    Status {getSortDirection('status')}
                  </button>
                </th>
                <th className="px-6 py-3">
                  <span className="font-semibold">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sortedItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No backlog items match your filters
                  </td>
                </tr>
              ) : (
                sortedItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{item.title}</td>
                    <td className="px-6 py-4">
                      <Badge className={
                        item.priority === 'High' ? 'bg-red-100 text-red-800' :
                        item.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }>
                        {getDisplayPriority(item)}
                      </Badge>
                    </td>
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
                    <td className="px-6 py-4">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => openItemForEdit(item)}
                        className="flex items-center space-x-1"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Edit</span>
                      </Button>
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
