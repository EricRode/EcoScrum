"use client"

import { useState, useEffect } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Item, User } from "@/lib/axiosInstance"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Trash2 } from "lucide-react"

interface ItemFormProps {
  item: Partial<Item>
  onChange: (key: keyof Item, value: any) => void
  onSubmit: () => void
  onCancel: () => void
  users: User[]
  sprints: any[]
  sustainabilityEffects: any[]
  selectedEffects: string[]
  onToggleEffect: (effectId: string) => void
  projectId: string
  submitLabel?: string
  cancelLabel?: string
  showDelete?: boolean
  onDelete?: () => void
  isEdit?: boolean
  isSprintBoard?: boolean
}

export function ItemForm({
  item,
  onChange,
  onSubmit,
  onCancel,
  users,
  sprints,
  sustainabilityEffects,
  selectedEffects,
  onToggleEffect,
  projectId,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  showDelete = false,
  onDelete,
  isEdit = false,
  isSprintBoard = false
}: ItemFormProps) {
  
  // If in sprint board, ensure the current sprint is selected when form initializes
  useEffect(() => {
    if (isSprintBoard && sprints?.length > 0 && (!item.sprintId || !sprints.some(s => s.id === item.sprintId))) {
      const currentSprint = sprints[sprints.length - 1];
      if (currentSprint) {
        onChange("sprintId", currentSprint.id);
      }
    }
  }, [isSprintBoard, sprints, item.sprintId, onChange]);
 
  return (
    <div className="space-y-4 py-4">
      <input type="hidden" name="projectId" value={projectId} />
      
      <div className="space-y-2">
        <Label>PBI Title</Label>
        <Input
          value={item.title || ""}
          onChange={(e) => onChange("title", e.target.value)}
          placeholder="Enter item title"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={item.description || ""}
          onChange={(e) => onChange("description", e.target.value)}
          placeholder="Describe the item"
          className="resize-none h-24"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Priority</Label>
          <Select value={item.priority || "Medium"} onValueChange={(value) => onChange("priority", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Sprint Assignment{isSprintBoard ? " (Current Sprint)" : ""}</Label>
          <Select
            value={item.sprintId || "unassigned"}
            onValueChange={(value) => onChange("sprintId", value === "unassigned" ? "" : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={isSprintBoard ? "Current Sprint" : "Select sprint"} />
            </SelectTrigger>
            <SelectContent>
              {!isSprintBoard && (
                <SelectItem value="unassigned">No Sprint Assigned</SelectItem>
              )}
              {sprints.map((s) => (
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
          value={item.assignedTo || "unassigned"}
          onValueChange={(value) => onChange("assignedTo", value === "unassigned" ? "" : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a person..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unassigned">Not Assigned</SelectItem>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2 py-2">
        <Checkbox 
          id="sustainable"
          checked={!!item.sustainable}
          onCheckedChange={(checked) => onChange("sustainable", !!checked)}
        />
        <Label htmlFor="sustainable" className="font-medium">
          Sustainable Item
        </Label>
      </div>

      <div className="space-y-2">
        <Label>Sustainability Context</Label>
        <Textarea
          value={item.sustainabilityContext || ""}
          onChange={(e) => onChange("sustainabilityContext", e.target.value)}
          placeholder="Describe sustainability impact"
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
                          id={`effect-${effect._id}`}
                          checked={selectedEffects.includes(effect._id)}
                          onCheckedChange={() => onToggleEffect(effect._id)}
                          className="mt-1"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`effect-${effect._id}`} className="font-medium text-sm">
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
                            Impact: {effect.impact_level}/3 · Likelihood: {effect.likelihood}/5 · Type: {effect.order_of_impact}
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

        {selectedEffects.length > 0 && (
          <div className="mt-2">
            <p className="text-sm font-medium mb-1">Selected effects:</p>
            <div className="flex flex-wrap gap-2">
              {selectedEffects.map((effectId) => {
                let effect;
                for (const dimension of sustainabilityEffects) {
                  effect = dimension.effects?.find(e => e._id === effectId);
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
                        onToggleEffect(effectId);
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
            value={item.sustainabilityPoints || 0}
            onChange={(e) => onChange("sustainabilityPoints", Number(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          <Label>Story Points</Label>
          <Input
            type="number"
            min="1"
            value={item.storyPoints || 1}
            onChange={(e) => onChange("storyPoints", Number(e.target.value))}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Definition of Done</Label>
        <Textarea
          value={item.definitionOfDone || ""}
          onChange={(e) => onChange("definitionOfDone", e.target.value)}
          placeholder="Define when this item is considered done"
          className="resize-none h-16"
        />
      </div>

      <div className="space-y-2">
        <Label>Status</Label>
        <Select
          value={item.status || "To Do"}
          onValueChange={(value) => onChange("status", value as "To Do" | "In Progress" | "Done")}
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

      <div className={`flex ${showDelete ? 'justify-between' : 'justify-end'} gap-2 pt-4`}>
        {showDelete && (
          <Button variant="destructive" onClick={onDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        )}
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button onClick={onSubmit} className="bg-gray-900 hover:bg-gray-800">
            {submitLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}