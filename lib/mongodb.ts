// This is a mock implementation for MongoDB
// In a real application, you would use the MongoDB driver or an ORM like Mongoose
import {
  User,
  TeamMember,
  Project,
  Sprint,
  WorkItem,
  PRIORITY_LEVELS,
  TASK_STATUSES,
  SusafCategory,
  SprintDataResult,
  TasksDataResult,
  BacklogDataResult
} from '../mongodb.types'

// Mock users
const mockUsers: User[] = [
  {
    id: "user-1",
    name: "Alex Johnson",
    email: "alex@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "user-2",
    name: "Sam Smith",
    email: "sam@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "user-3",
    name: "Jordan Lee",
    email: "jordan@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

// Mock projects
const mockProjects: Project[] = [
  {
    id: "project-1",
    name: "EcoCommerce Platform",
    description: "An e-commerce platform with sustainability features",
    createdAt: "2024-01-15",
    createdBy: "user-1",
    teamMembers: [
      {
        userId: "user-1",
        role: "Project Manager",
        email: "alex@example.com",
        joinedAt: "2024-01-15",
      },
      {
        userId: "user-2",
        role: "Developer",
        email: "sam@example.com",
        joinedAt: "2024-01-16",
      },
      {
        userId: "user-3",
        role: "Designer",
        email: "jordan@example.com",
        joinedAt: "2024-01-17",
      },
    ],
    sprints: ["sprint-20", "sprint-21", "sprint-22", "sprint-23", "sprint-24"],
  },
  {
    id: "project-2",
    name: "Green Analytics Dashboard",
    description: "Analytics dashboard for tracking environmental impact",
    createdAt: "2024-02-10",
    createdBy: "user-1",
    teamMembers: [
      {
        userId: "user-1",
        role: "Project Manager",
        email: "alex@example.com",
        joinedAt: "2024-02-10",
      },
      {
        userId: "user-3",
        role: "Designer",
        email: "jordan@example.com",
        joinedAt: "2024-02-11",
      },
    ],
    sprints: ["sprint-1", "sprint-2", "sprint-3"],
  },
]

// Update sprints with projectId
const mockSprints: Sprint[] = [
  {
    id: "sprint-20",
    name: "Sprint #20 - Q1 2024",
    goal: "Establish baseline sustainability metrics",
    startDate: "2024-01-15",
    endDate: "2024-01-29",
    progress: 100,
    sustainabilityScore: 15,
    previousScore: 0,
    effectsTackled: 1,
    tasks: ["task-past-10", "task-past-11", "task-past-12"],
    projectId: "project-1",
    retrospective: {
      goalMet: "Yes",
      inefficientProcesses: "Initial metrics collection was manual and time-consuming.",
      improvements: "Automate metrics collection in future sprints.",
      teamNotes: "Team showed enthusiasm for sustainability initiatives.",
    },
  },
  {
    id: "sprint-21",
    name: "Sprint #21 - Q2 2024",
    goal: "Reduce API response size by 20%",
    startDate: "2024-04-01",
    endDate: "2024-04-15",
    progress: 100,
    sustainabilityScore: 18,
    previousScore: 15,
    effectsTackled: 2,
    tasks: ["task-past-7", "task-past-8", "task-past-9"],
    projectId: "project-1",
    retrospective: {
      goalMet: "Partially",
      inefficientProcesses: "Some APIs were difficult to optimize without breaking changes.",
      improvements: "Consider versioning APIs to allow for more significant optimizations.",
      teamNotes: "Good progress on the simpler APIs, need more time for complex ones.",
    },
  },
  {
    id: "sprint-22",
    name: "Sprint #22 - Q3 2024",
    goal: "Implement basic sustainability features",
    startDate: "2024-09-01",
    endDate: "2024-09-15",
    progress: 100,
    sustainabilityScore: 25,
    previousScore: 18,
    effectsTackled: 2,
    tasks: ["task-past-1", "task-past-2", "task-past-3"],
    projectId: "project-1",
    retrospective: {
      goalMet: "Yes",
      inefficientProcesses: "Initial metrics collection was manual and time-consuming.",
      improvements: "Automate metrics collection in future sprints.",
      teamNotes: "Team showed enthusiasm for sustainability initiatives.",
    },
  },
  {
    id: "sprint-23",
    name: "Sprint #23 - Q4 2024",
    goal: "Optimize database queries and reduce server load",
    startDate: "2024-12-01",
    endDate: "2024-12-15",
    progress: 100,
    sustainabilityScore: 32,
    previousScore: 25,
    effectsTackled: 3,
    tasks: ["task-past-4", "task-past-5", "task-past-6"],
    projectId: "project-1",
    retrospective: {
      goalMet: "Yes",
      inefficientProcesses: "Some queries were not properly indexed.",
      improvements: "Implement a query review process for new features.",
      teamNotes: "Significant performance improvements observed.",
    },
  },
  {
    id: "sprint-24",
    name: "Sprint #24 - Q1 2025",
    goal: "Reduce API calls to external services by 20%",
    startDate: "2025-03-25",
    endDate: "2025-04-08",
    progress: 85,
    sustainabilityScore: 35,
    previousScore: 32,
    effectsTackled: 3,
    tasks: ["task-1", "task-2", "task-3", "task-4", "task-5", "task-6"],
    projectId: "project-1",
  },
  {
    id: "sprint-1",
    name: "Sprint #1 - Q1 2024",
    goal: "Define standard sustainability data schema",
    startDate: "2024-01-01",
    endDate: "2024-01-07",
    progress: 20,
    sustainabilityScore: 10,
    previousScore: 0,
    effectsTackled: 1,
    tasks: ["task-past-10", "task-past-11", "task-past-12"],
    projectId: "project-2",
    retrospective: {
      goalMet: "Yes",
      inefficientProcesses: "Conducted manual data collection.",
      improvements: "Add more relevant metrics to the schema.",
      teamNotes: "Team was engaged and provided valuable feedback.",
    },
  },
  {
    id: "sprint-2",
    name: "Sprint #2 - Q2 2024",
    goal: "Integrate sustainability metrics into existing dashboard",
    startDate: "2024-05-05",
    endDate: "2024-05-14",
    progress: 96,
    sustainabilityScore: 8,
    previousScore: 10,
    effectsTackled: 3,
    tasks: ["task-past-7", "task-past-8", "task-past-9"],
    projectId: "project-2",
    retrospective: {
      goalMet: "Partially",
      inefficientProcesses: "Some metrics were difficult to visualize.",
      improvements: "Use more intuitive graphs and charts.",
      teamNotes: "Team was excited about the new features.",
    },
  },
  {
    id: "sprint-3",
    name: "Sprint #3 - Q3 2024",
    goal: "Implement user feedback system",
    startDate: "2024-09-01",
    endDate: "2024-09-09",
    progress: 40,
    sustainabilityScore: 20,
    previousScore: 15,
    effectsTackled: 4,
    tasks: ["task-past-1", "task-past-2", "task-past-3"],
    projectId: "project-2",
    retrospective: {
      goalMet: "Yes",
      inefficientProcesses: "Feedback collection was manual and time-consuming.",
      improvements: "Automate feedback collection in future sprints.",
      teamNotes: "Team was enthusiastic about the new features.",
    },
  },
]

// Update tasks with projectId
const mockPastTasks: WorkItem[] = [
  // Sprint 22 tasks
  {
    id: "task-past-1",
    title: "Implement basic sustainability metrics",
    description: "Create initial sustainability scoring system",
    priority: "High",
    sustainabilityContext: "Foundation for sustainability tracking",
    status: "Done",
    comments: 5,
    subtasks: 3,
    sustainabilityScore: 7,
    assignedTo: "user-1",
    sprintId: "sprint-22",
    storyPoints: 8,
    sustainable: true,
    susafCategory: "Technical",
    order: 0,
    projectId: "project-1",
  },
  {
    id: "task-past-2",
    title: "Add sustainability filter to backlog",
    description: "Allow filtering backlog items by sustainability impact",
    priority: "Medium+",
    sustainabilityContext: "Helps prioritize sustainable tasks",
    status: "Done",
    comments: 2,
    subtasks: 1,
    sustainabilityScore: 5,
    assignedTo: "user-2",
    sprintId: "sprint-22",
    storyPoints: 3,
    sustainable: true,
    susafCategory: "Technical",
    order: 1,
    projectId: "project-1",
  },
  {
    id: "task-past-3",
    title: "Create dashboard wireframes",
    description: "Design initial dashboard layout",
    priority: "Low",
    sustainabilityContext: "Minimal sustainability impact",
    status: "Done",
    comments: 3,
    subtasks: 0,
    sustainabilityScore: 2,
    assignedTo: "user-3",
    sprintId: "sprint-22",
    storyPoints: 2,
    sustainable: false,
    order: 2,
    projectId: "project-1",
  },

  // Sprint 23 tasks
  {
    id: "task-past-4",
    title: "Optimize database queries",
    description: "Reduce database load by optimizing queries",
    priority: "High+",
    sustainabilityContext: "Reduces server resource usage",
    status: "Done",
    comments: 4,
    subtasks: 2,
    sustainabilityScore: 8,
    assignedTo: "user-1",
    sprintId: "sprint-23",
    storyPoints: 5,
    sustainable: true,
    susafCategory: "Technical",
    order: 0,
    projectId: "project-1",
  },
  {
    id: "task-past-5",
    title: "Implement server-side caching",
    description: "Add caching layer to reduce database hits",
    priority: "Medium+",
    sustainabilityContext: "Improves performance and reduces resource usage",
    status: "Done",
    comments: 3,
    subtasks: 1,
    sustainabilityScore: 7,
    assignedTo: "user-2",
    sprintId: "sprint-23",
    storyPoints: 8,
    sustainable: true,
    susafCategory: "Technical",
    order: 1,
    projectId: "project-1",
  },
  {
    id: "task-past-6",
    title: "Update UI components",
    description: "Refresh UI components for better user experience",
    priority: "Low",
    sustainabilityContext: "Minimal sustainability impact",
    status: "Done",
    comments: 2,
    subtasks: 0,
    sustainabilityScore: 2,
    assignedTo: "user-3",
    sprintId: "sprint-23",
    storyPoints: 3,
    sustainable: false,
    order: 2,
    projectId: "project-1",
  },

  // Sprint 21 tasks
  {
    id: "task-past-7",
    title: "Optimize JSON response structure",
    description: "Reduce API response size by restructuring JSON",
    priority: "High",
    sustainabilityContext: "Reduces bandwidth usage and improves performance",
    status: "Done",
    comments: 4,
    subtasks: 2,
    sustainabilityScore: 6,
    assignedTo: "user-1",
    sprintId: "sprint-21",
    storyPoints: 5,
    sustainable: true,
    susafCategory: "Technical",
    order: 0,
    projectId: "project-1",
  },
  {
    id: "task-past-8",
    title: "Implement response compression",
    description: "Add GZIP compression to API responses",
    priority: "Medium",
    sustainabilityContext: "Reduces bandwidth usage",
    status: "Done",
    comments: 2,
    subtasks: 1,
    sustainabilityScore: 5,
    assignedTo: "user-2",
    sprintId: "sprint-21",
    storyPoints: 3,
    sustainable: true,
    susafCategory: "Technical",
    order: 1,
    projectId: "project-1",
  },
  {
    id: "task-past-9",
    title: "Document API optimization guidelines",
    description: "Create guidelines for sustainable API design",
    priority: "Low",
    sustainabilityContext: "Promotes sustainable practices",
    status: "Done",
    comments: 1,
    subtasks: 0,
    sustainabilityScore: 3,
    assignedTo: "user-3",
    sprintId: "sprint-21",
    storyPoints: 2,
    sustainable: true,
    susafCategory: "Communication",
    order: 2,
    projectId: "project-1",
  },

  // Sprint 20 tasks
  {
    id: "task-past-10",
    title: "Research sustainability metrics",
    description: "Identify key metrics for measuring software sustainability",
    priority: "High",
    sustainabilityContext: "Foundation for sustainability initiatives",
    status: "Done",
    comments: 5,
    subtasks: 3,
    sustainabilityScore: 6,
    assignedTo: "user-1",
    sprintId: "sprint-20",
    storyPoints: 8,
    sustainable: true,
    susafCategory: "Technical",
    order: 0,
    projectId: "project-1",
  },
  {
    id: "task-past-11",
    title: "Create sustainability scoring model",
    description: "Develop a model for scoring tasks based on sustainability impact",
    priority: "Medium",
    sustainabilityContext: "Enables prioritization of sustainable tasks",
    status: "Done",
    comments: 3,
    subtasks: 2,
    sustainabilityScore: 5,
    assignedTo: "user-2",
    sprintId: "sprint-20",
    storyPoints: 5,
    sustainable: true,
    susafCategory: "Technical",
    order: 1,
    projectId: "project-1",
  },
  {
    id: "task-past-12",
    title: "Present sustainability initiative to team",
    description: "Introduce the team to the sustainability initiative and goals",
    priority: "Low",
    sustainabilityContext: "Builds awareness and buy-in",
    status: "Done",
    comments: 2,
    subtasks: 0,
    sustainabilityScore: 3,
    assignedTo: "user-3",
    sprintId: "sprint-20",
    storyPoints: 2,
    sustainable: true,
    susafCategory: "Communication",
    order: 2,
    projectId: "project-1",
  },
]

// Update mockTasks with projectId
const mockTasks: WorkItem[] = [
  {
    id: "task-1",
    title: "Implement API response caching to reduce repeated external requests",
    description: "Store responses from frequently called endpoints to avoid redundant external calls.",
    priority: "High+",
    sustainabilityContext: "Reduces server load and energy consumption",
    status: "To Do",
    comments: 3,
    subtasks: 2,
    sustainabilityScore: 8,
    assignedTo: "user-1",
    sprintId: "sprint-24",
    storyPoints: 5,
    definitionOfDone: "Cache implementation reduces API calls by at least 30% in test environment",
    sustainable: true,
    susafCategory: "Technical",
    relatedSusafEffects: ["Resource Optimization", "Energy Efficiency"],
    order: 0,
    projectId: "project-1",
  },
  {
    id: "task-2",
    title: "Add debounce/throttle logic to user-triggered API calls",
    description: "Prevent unnecessary calls from rapid user input or interactions.",
    priority: "High+",
    sustainabilityContext: "Improves performance and reduces resource usage",
    status: "In Progress",
    comments: 2,
    subtasks: 3,
    sustainabilityScore: 6,
    assignedTo: "user-2",
    sprintId: "sprint-24",
    storyPoints: 8,
    definitionOfDone: "All user input forms implement debounce with 300ms delay",
    sustainable: true,
    susafCategory: "Technical",
    relatedSusafEffects: ["Resource Optimization", "Performance Improvement"],
    order: 0,
    projectId: "project-1",
  },
  {
    id: "task-3",
    title: "Replace external API usage with local mock data",
    description: "Use mock/stub data for testing or demo features to avoid live requests.",
    priority: "High+",
    sustainabilityContext: "Reduces bandwidth consumption and improves user experience",
    status: "Done",
    comments: 1,
    subtasks: 0,
    sustainabilityScore: 5,
    assignedTo: "user-3",
    sprintId: "sprint-24",
    storyPoints: 3,
    definitionOfDone: "All test environments use mock data instead of live API calls",
    sustainable: true,
    susafCategory: "Technical",
    relatedSusafEffects: ["Resource Optimization", "Energy Efficiency"],
    order: 0,
    projectId: "project-1",
  },
  {
    id: "task-4",
    title: "Add multi-language support for French and Spanish",
    description:
      "Enables internationalization for broader user access, but doesn't affect computational efficiency or resource use.",
    priority: "Medium",
    sustainabilityContext: "Improves accessibility without increasing resource usage",
    status: "To Do",
    comments: 0,
    subtasks: 2,
    sustainabilityScore: 3,
    assignedTo: "user-1",
    sprintId: "sprint-24",
    storyPoints: 3,
    definitionOfDone: "UI displays correctly in French and Spanish with all translations reviewed",
    sustainable: false,
    susafCategory: "Human",
    relatedSusafEffects: ["Accessibility", "Inclusivity"],
    order: 1,
    projectId: "project-1",
  },
  {
    id: "task-5",
    title: "Audit and remove unnecessary external API calls",
    description: "Identify and eliminate calls that don't provide critical data on initial load.",
    priority: "High+",
    sustainabilityContext: "Reduces energy consumption on user devices",
    status: "To Do",
    comments: 5,
    subtasks: 1,
    sustainabilityScore: 5,
    assignedTo: "user-2",
    sprintId: "sprint-24",
    storyPoints: 5,
    definitionOfDone: "Audit completed and at least 5 unnecessary API calls removed",
    sustainable: true,
    susafCategory: "Environmental",
    relatedSusafEffects: ["Energy Consumption", "Resource Conservation"],
    order: 2,
    projectId: "project-1",
  },
  {
    id: "task-6",
    title: "Redesign login page UI for improved visual consistency",
    description:
      "Improves user experience and branding, but doesn't impact backend performance or sustainability metrics.",
    priority: "Medium",
    sustainabilityContext: "Minimal impact on sustainability",
    status: "To Do",
    comments: 2,
    subtasks: 0,
    sustainabilityScore: 2,
    assignedTo: "user-3",
    sprintId: "sprint-24",
    storyPoints: 2,
    definitionOfDone: "New design implemented and approved by design team",
    sustainable: false,
    susafCategory: "Human",
    relatedSusafEffects: ["User Experience"],
    order: 3,
    projectId: "project-1",
  },
]

// Update backlog items with projectId
const mockBacklogItems: WorkItem[] = [
  {
    id: "backlog-1",
    title: "Implement screen reader",
    description: "Add screen reader support for accessibility",
    priority: "High+",
    sustainable: true,
    storyPoints: 8,
    sustainabilityScore: 8,
    status: "In Progress",
    susafCategory: "Human",
    assignedTo: "user-1",
    relatedSusafEffects: ["Accessibility", "Inclusivity"],
    definitionOfDone: "Screen reader successfully reads all UI elements",
    projectId: "project-1",
    sprintId: "sprint-20",
  },
  {
    id: "backlog-2",
    title: "Refractor Test class",
    description: "Improve test class structure and organization",
    priority: "High",
    sustainable: false,
    storyPoints: 5,
    sustainabilityScore: 0,
    status: "To Do",
    susafCategory: "Technical",
    definitionOfDone: "All tests pass with improved organization",
    projectId: "project-1",
    sprintId: "sprint-20",
  },
  {
    id: "backlog-3",
    title: "Optimize matching algorithm",
    description: "Improve performance of matching algorithm",
    priority: "Medium+",
    sustainable: true,
    storyPoints: 13,
    sustainabilityScore: 7,
    status: "To Do",
    susafCategory: "Technical",
    relatedSusafEffects: ["Performance Improvement", "Energy Efficiency"],
    definitionOfDone: "Algorithm performance improved by 30%",
    projectId: "project-1",
    sprintId: "sprint-20",
  },
  {
    id: "backlog-4",
    title: "Implement server-side caching",
    priority: "High",
    description: "Add caching layer to reduce database load",
    sustainable: true,
    storyPoints: 5,
    sustainabilityScore: 8,
    status: "To Do",
    susafCategory: "Technical",
    definitionOfDone: "Cache hit rate of at least 70%",
    projectId: "project-1",
    sprintId: "sprint-21",
  },
  {
    id: "backlog-5",
    title: "Add user profile settings",
    description: "Allow users to customize their profile settings",
    priority: "Medium",
    sustainable: false,
    storyPoints: 3,
    sustainabilityScore: 2,
    status: "To Do",
    susafCategory: "Human",
    definitionOfDone: "Users can update all profile settings",
    projectId: "project-1",
    sprintId: "sprint-21",
  },
  {
    id: "backlog-6",
    title: "Optimize image compression",
    description: "Improve image compression to reduce bandwidth usage",
    priority: "Medium+",
    sustainable: true,
    storyPoints: 2,
    sustainabilityScore: 7,
    status: "To Do",
    susafCategory: "Environmental",
    definitionOfDone: "Image size reduced by at least 40% with acceptable quality",
    projectId: "project-2",
    sprintId: "sprint-21",
  },
  {
    id: "backlog-7",
    title: "Implement analytics dashboard",
    description: "Add analytics dashboard to track user behavior",
    priority: "High",
    sustainable: false,
    storyPoints: 8,
    sustainabilityScore: 3,
    status: "To Do",
    susafCategory: "Technical",
    definitionOfDone: "Dashboard shows key metrics with filtering options",
    projectId: "project-1",
    sprintId: "sprint-22",
  },
  {
    id: "backlog-8",
    title: "Reduce JavaScript bundle size",
    description: "Optimize JavaScript bundle size for faster loading",
    priority: "High+",
    sustainable: true,
    storyPoints: 5,
    sustainabilityScore: 9,
    status: "To Do",
    susafCategory: "Technical",
    definitionOfDone: "Bundle size reduced by at least 25%",
    projectId: "project-1",
    sprintId: "sprint-23",
  },
  {
    id: "backlog-9",
    title: "Add offline support",
    description: "Allow app to function offline with data syncing",
    priority: "Medium+",
    sustainable: true,
    storyPoints: 13,
    sustainabilityScore: 6,
    status: "To Do",
    susafCategory: "Social",
    definitionOfDone: "App functions offline and syncs when connection is restored",
    projectId: "project-1",
    sprintId: "sprint-23",
  },
  {
    id: "backlog-10",
    title: "Implement social sharing",
    description: "Add social sharing functionality",
    priority: "Low",
    sustainable: false,
    storyPoints: 3,
    sustainabilityScore: 1,
    status: "To Do",
    susafCategory: "Social",
    definitionOfDone: "Users can share content to major social platforms",
    projectId: "project-1",
    sprintId: "sprint-24",
  },
  {
    id: "backlog-11",
    title: "Add email notifications",
    description: "Send email notifications for important events",
    priority: "Medium",
    sustainable: false,
    storyPoints: 5,
    sustainabilityScore: 2,
    status: "To Do",
    susafCategory: "Communication",
    definitionOfDone: "Email notifications sent and delivered successfully",
    projectId: "project-1",
    sprintId: "sprint-24",
  },
  {
    id: "backlog-12",
    title: "Optimize database indexes",
    description: "Improve database performance with better indexes",
    priority: "High+",
    sustainable: true,
    storyPoints: 3,
    sustainabilityScore: 8,
    status: "To Do",
    susafCategory: "Technical",
    definitionOfDone: "Query performance improved by at least 50%",
    projectId: "project-1",
    sprintId: "sprint-24",
  },
]

// Cache the data to avoid creating new references on each call
const cachedProjects = [...mockProjects]
const cachedSprints = [...mockSprints]
const cachedTasks = [...mockTasks, ...mockPastTasks]
const cachedBacklogItems = [...mockBacklogItems]
const cachedUsers = [...mockUsers]

// Project-related functions
export function getAllProjects(): Project[] {
  return cachedProjects
}

export function getProjectById(projectId: string): Project | undefined {
  return cachedProjects.find((p) => p.id === projectId)
}

export function createProject(projectData: Omit<Project, "id" | "createdAt" | "teamMembers" | "sprints">): Promise<Project> {
  const newProject: Project = {
    id: `project-${cachedProjects.length + 1}`,
    createdAt: new Date().toISOString(),
    teamMembers: [],
    sprints: [],
    ...projectData,
  }

  cachedProjects.push(newProject)
  return Promise.resolve(newProject)
}

export function addTeamMember(projectId: string, email: string, role: string): Promise<void> {
  const project = cachedProjects.find((p) => p.id === projectId)
  if (!project) {
    return Promise.reject(new Error("Project not found"))
  }

  // Check if user exists
  const user = cachedUsers.find((u) => u.email === email)
  if (!user) {
    return Promise.reject(new Error("User not found"))
  }

  // Check if user is already a team member
  if (project.teamMembers.some((tm) => tm.userId === user.id)) {
    return Promise.reject(new Error("User is already a team member"))
  }

  const newTeamMember: TeamMember = {
    userId: user.id,
    email: user.email,
    role,
    joinedAt: new Date().toISOString(),
  }

  project.teamMembers.push(newTeamMember)
  return Promise.resolve()
}

// Sprint-related functions
export function useSprintData(sprintId?: string, projectId?: string): SprintDataResult {
  let targetSprintId = sprintId

  // If no sprintId is provided but projectId is, get the latest sprint for the project
  if (!targetSprintId && projectId) {
    const projectSprints = cachedSprints.filter((s) => s.projectId === projectId)
    if (projectSprints.length > 0) {
      targetSprintId = projectSprints[projectSprints.length - 1].id
    }
  }

  // Default to the latest sprint if no sprintId is provided
  if (!targetSprintId) {
    targetSprintId = cachedSprints[cachedSprints.length - 1].id
  }

  const sprint = cachedSprints.find((s) => s.id === targetSprintId)

  return {
    data: sprint || cachedSprints[cachedSprints.length - 1], // Return the latest sprint if not found
    loading: false,
    error: null,
  }
}

export function getAllSprints(projectId?: string): Sprint[] {
  if (projectId) {
    return cachedSprints.filter((s) => s.projectId === projectId)
  }
  return cachedSprints
}

export function useTasksData(sprintId: string, projectId?: string): TasksDataResult {
  // Filter tasks by sprintId and optionally by projectId
  let filteredTasks = cachedTasks.filter((task) => task.sprintId === sprintId)

  if (projectId) {
    filteredTasks = filteredTasks.filter((task) => task.projectId === projectId)
  }

  return {
    data: filteredTasks,
    loading: false,
    error: null,
  }
}

export function useBacklogData(projectId?: string): BacklogDataResult {
  let data = cachedBacklogItems

  if (projectId) {
    data = cachedBacklogItems.filter((item) => item.projectId === projectId)
  }

  return {
    data,
    loading: false,
    error: null,
  }
}

export function updateTaskStatus(taskId: string, newStatus: "To Do" | "In Progress" | "Done"): Promise<void> {
  console.log(`Updating task ${taskId} to ${newStatus}`)

  // Update the cached task
  const taskIndex = cachedTasks.findIndex((t) => t.id === taskId)
  if (taskIndex !== -1) {
    cachedTasks[taskIndex].status = newStatus
  }

  return Promise.resolve()
}

export function updateTaskOrder(taskId: string, newOrder: number): Promise<void> {
  console.log(`Updating task ${taskId} order to ${newOrder}`)

  // Update the cached task
  const taskIndex = cachedTasks.findIndex((t) => t.id === taskId)
  if (taskIndex !== -1) {
    cachedTasks[taskIndex].order = newOrder
  }

  return Promise.resolve()
}

export function completeSprintAndRedirect(): Promise<void> {
  console.log("Completing sprint")
  return Promise.resolve()
}

export function saveRetrospective(data: {
  sprintId: string;
  goalMet: "Yes" | "No" | "Partially";
  inefficientProcesses: string;
  improvements: string;
  teamNotes: string;
}): Promise<void> {
  console.log("Saving retrospective", data)

  // Update the cached sprint
  const sprintIndex = cachedSprints.findIndex((s) => s.id === data.sprintId)
  if (sprintIndex !== -1) {
    cachedSprints[sprintIndex].retrospective = {
      goalMet: data.goalMet,
      inefficientProcesses: data.inefficientProcesses,
      improvements: data.improvements,
      teamNotes: data.teamNotes,
    }
  }

  return Promise.resolve()
}

export function addBacklogItem(item: Omit<WorkItem, "id">): Promise<WorkItem> {
  console.log("Adding backlog item", item)

  // Add to cached backlog items
  const newItem = {
    id: `backlog-${cachedBacklogItems.length + 1}`,
    ...item,
  }
  cachedBacklogItems.push(newItem)

  return Promise.resolve(newItem)
}

export function addTask(task: Omit<WorkItem, "id" | "order">): Promise<WorkItem> {
  console.log("Adding task", task)

  // Add to cached tasks
  const newTask = {
    id: `task-${cachedTasks.length + 1}`,
    order: 999, // High number to ensure it's added at the end
    ...task,
  }
  cachedTasks.push(newTask)

  return Promise.resolve(newTask)
}

export function deleteTask(taskId: string): Promise<void> {
  console.log("Deleting task", taskId)
  // Remove from cached tasks
  const taskIndex = cachedTasks.findIndex((t) => t.id === taskId)
  if (taskIndex !== -1) {
    cachedTasks.splice(taskIndex, 1)
  }

  return Promise.resolve()
}

export function updateTask(taskId: string, updates: Partial<WorkItem>): Promise<void> {
  console.log("Updating task", taskId, updates)
  // Update the cached task
  const taskIndex = cachedTasks.findIndex((t) => t.id === taskId)
  if (taskIndex !== -1) {
    cachedTasks[taskIndex] = { ...cachedTasks[taskIndex], ...updates }
  }

  return Promise.resolve()
}

// Add new functions for project management
export function createSprint(sprint: Omit<Sprint, "id">): Promise<Sprint> {
  const newSprint = {
    id: `sprint-${cachedSprints.length + 25}`,
    ...sprint,
  }

  cachedSprints.push(newSprint)

  // Add sprint to project
  const project = cachedProjects.find((p) => p.id === sprint.projectId)
  if (project) {
    project.sprints.push(newSprint.id)
  }

  return Promise.resolve(newSprint)
}

export function getUserById(userId: string): User | null {
  return cachedUsers.find((user) => user.id === userId) || null
}

export function getAllUsers(): User[] {
  return cachedUsers
}

export function authenticateUser(email: string, password: string): Promise<User> {
  // Mock authentication 
  const user = cachedUsers.find((user) => user.email === email)
  if (user && password === "password") {
    return Promise.resolve(user)
  }
  return Promise.reject(new Error("Invalid credentials"))
}
