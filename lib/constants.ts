// SuSAF Categories
export const SUSAF_CATEGORIES = [
  "Technical",
  "Human",
  "Environmental",
  "Social",
  "Economical",
  "Communication",
] as const

export type SusafCategory = (typeof SUSAF_CATEGORIES)[number]

// SuSAF Effects by Category
export const SUSAF_EFFECTS = {
  Technical: [
    "Resource Optimization",
    "Energy Efficiency",
    "Performance Improvement",
    "Code Quality",
    "Technical Debt Reduction",
  ],
  Human: ["Accessibility", "Inclusivity", "User Experience", "Cognitive Load Reduction", "Digital Wellbeing"],
  Environmental: [
    "Energy Consumption",
    "Resource Conservation",
    "Carbon Footprint Reduction",
    "E-waste Reduction",
    "Sustainable Infrastructure",
  ],
  Social: ["Digital Inclusion", "Community Building", "Privacy Protection", "Ethical Data Usage", "Transparency"],
  Economical: [
    "Cost Efficiency",
    "Long-term Sustainability",
    "Resource Allocation",
    "Operational Efficiency",
    "Value Creation",
  ],
  Communication: [
    "Clear Documentation",
    "Knowledge Sharing",
    "Stakeholder Engagement",
    "Transparent Reporting",
    "Collaborative Decision Making",
  ],
}

// Task Statuses
export const TASK_STATUSES = ["To Do", "In Progress", "Done"] as const

// Priority Levels
export const PRIORITY_LEVELS = ["Low", "Low+", "Medium", "Medium+", "High", "High+"] as const
