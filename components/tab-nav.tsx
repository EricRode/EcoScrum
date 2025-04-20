"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useProjectContext } from "./project-context"
import { BarChart3, Kanban, RotateCcw, ListTodo, Users, BookOpen } from "lucide-react"

export function TabNav() {
  const pathname = usePathname()
  const { selectedProjectId } = useProjectContext()

  // Don't show tabs if no project is selected or on login page
  if (!selectedProjectId || pathname === "/login" || pathname === "/profile") {
    return null
  }

  const tabs = [
    { name: "Dashboard", href: "/", icon: BarChart3 },
    { name: "Sprint Board", href: "/sprint-board", icon: Kanban },
    { name: "Retrospective", href: "/retrospective", icon: RotateCcw },
    { name: "Backlog", href: "/backlog", icon: ListTodo },
    { name: "Team", href: "/team", icon: Users },
    { name: "Education", href: "/education", icon: BookOpen },
    { name: "SuSAF", href: "/susaf", icon: BookOpen },
  ]

  return (
    <div className="border-b bg-gray-50">
      <div className="container mx-auto px-4">
        <nav className="flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href)

            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={cn(
                  "inline-flex items-center border-b-2 py-4 px-1 text-sm font-medium transition-colors",
                  isActive
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <tab.icon className="mr-2 h-4 w-4" />
                {tab.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
