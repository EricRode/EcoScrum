"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getAllBacklogItems, updateItem, type Item } from "@/lib/axiosInstance"
import { useToast } from "@/hooks/use-toast"

interface UnassignedItemsSelectorProps {
  sprintId: string
  projectId: string
  onClose: () => void
  onItemsAdded: () => void
}

export function UnassignedItemsSelector({ sprintId, projectId, onClose, onItemsAdded }: UnassignedItemsSelectorProps) {
  const { toast } = useToast()
  const [unassignedItems, setUnassignedItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")

  // Priority order for sorting
  const PRIORITY_ORDER = {
    "High": 0,
    "Medium": 1,
    "Low": 2
  }

  useEffect(() => {
    const fetchUnassignedItems = async () => {
      try {
        setLoading(true)
        const allItems = await getAllBacklogItems()
        
        // Filter for items without a sprintId and belonging to this project
        const unassigned = allItems.filter((item: Item) => 
          !item.sprintId && item.projectId === projectId
        )
        
        // Sort by priority
        unassigned.sort((a: Item, b: Item) => {
          // First compare by basic priority
          const priorityDiff = PRIORITY_ORDER[a.priority as keyof typeof PRIORITY_ORDER] - 
                             PRIORITY_ORDER[b.priority as keyof typeof PRIORITY_ORDER]
          
          if (priorityDiff !== 0) return priorityDiff
          
          // Then by sustainability (sustainable items first within same priority)
          return a.sustainable === b.sustainable ? 0 : a.sustainable ? -1 : 1
        })
        
        setUnassignedItems(unassigned)
      } catch (error) {
        console.error("Failed to load unassigned items:", error)
        toast({
          title: "Error",
          description: "Failed to load unassigned backlog items.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUnassignedItems()
  }, [projectId, toast])

  const toggleItemSelection = (itemId: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId)
    } else {
      newSelected.add(itemId)
    }
    setSelectedItems(newSelected)
  }

  const handleAddItemsToSprint = async () => {
    if (selectedItems.size === 0) {
      onClose()
      return
    }

    try {
      const updatePromises = Array.from(selectedItems).map(itemId => {
        const item = unassignedItems.find(item => item.id === itemId)
        if (!item) return Promise.resolve()
        
        return updateItem(itemId, { 
          ...item,
          sprintId: sprintId,
          status: "To Do" 
        })
      })

      await Promise.all(updatePromises)
      
      toast({
        title: "Success",
        description: `Added ${selectedItems.size} items to the sprint.`,
      })
      
      onItemsAdded()
      onClose()
    } catch (error) {
      console.error("Failed to add items to sprint:", error)
      toast({
        title: "Error",
        description: "Failed to add items to the sprint.",
        variant: "destructive",
      })
    }
  }

  // Filter items by search query
  const filteredItems = unassignedItems.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Helper function to display priority with '+' for sustainable items
  const getDisplayPriority = (item: Item) => {
    return item.sustainable ? `${item.priority}+` : item.priority
  }

  if (loading) {
    return <div className="flex justify-center p-6">Loading unassigned items...</div>
  }

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <Label htmlFor="search-items">Search Items</Label>
        <Input 
          id="search-items"
          placeholder="Search by title..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)} 
        />
      </div>
      
      {filteredItems.length === 0 ? (
        <div className="text-center p-6 text-gray-500">
          No unassigned items found.
        </div>
      ) : (
        <>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">
              {selectedItems.size} of {filteredItems.length} items selected
            </span>
            <Button 
              variant="link" 
              className="px-0 h-auto text-sm"
              onClick={() => {
                selectedItems.size === filteredItems.length 
                  ? setSelectedItems(new Set()) 
                  : setSelectedItems(new Set(filteredItems.map(i => i.id)))
              }}
            >
              {selectedItems.size === filteredItems.length ? "Deselect All" : "Select All"}
            </Button>
          </div>

          <ScrollArea className="h-[400px] rounded-md border">
            <div className="p-4 space-y-3">
              {filteredItems.map(item => (
                <Card key={item.id} className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedItems.has(item.id) ? 'bg-gray-50 border-gray-400' : ''
                }`} onClick={() => toggleItemSelection(item.id)}>
                  <div className="flex items-start gap-3">
                    <Checkbox 
                      checked={selectedItems.has(item.id)} 
                      onCheckedChange={() => toggleItemSelection(item.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium mb-1">{item.title}</div>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-2">{item.description}</p>
                      
                      <div className="flex flex-wrap gap-2">
                        <Badge className={
                          item.priority === 'High' ? 'bg-red-100 text-red-800' :
                          item.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }>
                          {getDisplayPriority(item)}
                        </Badge>
                        
                        <div className="flex items-center bg-gray-100 px-2 py-1 rounded text-xs">
                          SP: {item.storyPoints}
                        </div>
                        
                        {(item.sustainabilityPoints > 0 || item.sustainable) && (
                          <div className="flex items-center bg-emerald-50 px-2 py-1 rounded text-xs text-emerald-700">
                            SUS: {item.sustainabilityPoints || 0}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </>
      )}

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          className="bg-gray-900 hover:bg-gray-800"
          onClick={handleAddItemsToSprint}
          disabled={selectedItems.size === 0}
        >
          Add {selectedItems.size} Items to Sprint
        </Button>
      </div>
    </div>
  )
}