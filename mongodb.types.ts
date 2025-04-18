// Constants
export const PRIORITY_LEVELS = ["Low", "Medium", "Medium+", "High", "High+"] as const;
export const TASK_STATUSES = ["To Do", "In Progress", "Done"] as const;

export type SusafCategory = "Technical" | "Environmental" | "Social" | "Human" | "Communication";

// User-related types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface TeamMember {
  userId: string;
  role: string;
  email: string;
  joinedAt: string;
}

// Project-related types
export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  createdBy: string;
  teamMembers: TeamMember[];
  sprints: string[];
}

/* // Task-related types
export interface Task {
  id: string;
  title: string;
  description: string;
  priority: (typeof PRIORITY_LEVELS)[number];
  sustainabilityContext: string;
  status: (typeof TASK_STATUSES)[number];
  comments: number;
  subtasks: number;
  sustainabilityScore: number;
  assignedTo?: string;
  sprintId: string;
  storyPoints: number;
  sustainabilityPoints: number;
  relatedSusafEffects?: string[];
  definitionOfDone?: string;
  tags?: string[];
  sustainable: boolean;
  susafCategory?: SusafCategory;
  order: number;
  projectId: string;
} */

// Sprint-related types
export interface Sprint {
  id: string;
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
  progress: number;
  sustainabilityScore: number;
  previousScore: number;
  effectsTackled: number;
  tasks: string[];
  projectId: string;
  retrospective?: {
    goalMet: "Yes" | "No" | "Partially";
    inefficientProcesses: string;
    improvements: string;
    teamNotes: string;
  };
}

// Backlog-related types
/* export interface BacklogItem {
  id: string;
  title: string;
  description: string;
  priority: (typeof PRIORITY_LEVELS)[number];
  sustainable: boolean;
  storyPoints: number;
  sustainabilityScore: number;
  status: (typeof TASK_STATUSES)[number];
  susafCategory?: SusafCategory;
  assignedTo?: string;
  sprintId?: string;
  projectId: string;
  sustainabilityPoints?: number;
  relatedSusafEffects?: string[];
  definitionOfDone?: string;
  tags?: string[];
}
 */
// WorkItem type
export interface WorkItem {
  id: string;
  title: string;
  description: string;
  priority: (typeof PRIORITY_LEVELS)[number];
  sustainable: boolean;
  storyPoints: number;
  status: (typeof TASK_STATUSES)[number];
  projectId: string;
  
  // Optional fields
  sustainabilityScore?: number;
  sustainabilityContext?: string;
  
  sprintId?: string;
  assignedTo?: string;
  susafCategory?: SusafCategory;
  relatedSusafEffects?: string[];
  definitionOfDone?: string;
  tags?: string[];
  
  // Task-specific properties
  comments?: number;
  subtasks?: number;
  order?: number;
  }

// Function return types
export interface SprintDataResult {
  data: Sprint;
  loading: boolean;
  error: null | Error;
}

export interface TasksDataResult {
  data: WorkItem[];
  loading: boolean;
  error: null | Error;
}

export interface BacklogDataResult {
  data: WorkItem[];
  loading: boolean;
  error: null | Error;
}