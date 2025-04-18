"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { useProjectContext } from "@/components/project-context"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { getUserById } from "@/lib/axiosInstance"
import { Plus, UserPlus } from "lucide-react"

export default function TeamPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const { projects, selectedProjectId, inviteTeamMember } = useProjectContext()

  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [inviteData, setInviteData] = useState({
    email: "",
    role: "Developer",
  })

  const selectedProject = projects.find((p) => p.id === selectedProjectId)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [authLoading, user, router])

  if (authLoading || !user) {
    return null // Will redirect to login if not authenticated
  }

  if (!selectedProject) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Project Selected</h1>
          <p className="text-gray-500 mb-6">Please select or create a project to manage team members.</p>
        </div>
      </div>
    )
  }

  const handleInviteTeamMember = async () => {
    try {
      await inviteTeamMember(selectedProjectId, inviteData.email, inviteData.role)
      setIsInviteDialogOpen(false)
      setInviteData({ email: "", role: "Developer" })
      toast({
        title: "Team member invited",
        description: "The team member has been added to the project.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to invite team member. Make sure the email is registered.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{selectedProject.name} - Team</h1>
          <p className="text-gray-500">{selectedProject.teamMembers.length} team members</p>
        </div>

        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Team Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>Invite a team member to collaborate on this project.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={inviteData.email}
                  onChange={(e) => setInviteData((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter their EcoScrum email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={inviteData.role}
                  onValueChange={(value) => setInviteData((prev) => ({ ...prev, role: value }))}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Project Manager">Project Manager</SelectItem>
                    <SelectItem value="Developer">Developer</SelectItem>
                    <SelectItem value="Designer">Designer</SelectItem>
                    <SelectItem value="Product Owner">Product Owner</SelectItem>
                    <SelectItem value="Scrum Master">Scrum Master</SelectItem>
                    <SelectItem value="Tester">Tester</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleInviteTeamMember}>Invite</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {selectedProject.teamMembers.map((member) => {
          const memberUser = getUserById(member.userId)
          return (
            <Card key={member.userId}>
              <CardHeader className="flex flex-row items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={memberUser?.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{memberUser?.name.charAt(0) || "?"}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{memberUser?.name || "Unknown User"}</CardTitle>
                  <CardDescription>{member.role}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">{member.email}</p>
                <p className="text-xs text-gray-400 mt-1">Joined: {new Date(member.joinedAt).toLocaleDateString()}</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">
                  View Profile
                </Button>
              </CardFooter>
            </Card>
          )
        })}

        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center h-full py-12">
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-full mb-4"
              onClick={() => setIsInviteDialogOpen(true)}
            >
              <Plus className="h-6 w-6" />
            </Button>
            <p className="text-sm text-gray-500">Invite Team Member</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
