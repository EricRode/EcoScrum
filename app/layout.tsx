import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import { SprintProvider } from "@/components/sprint-context"
import { ProjectProvider } from "@/components/project-context"
import Navbar from "@/components/navbar"
import { TabNav } from "@/components/tab-nav"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "EcoScrum",
  description: "Integrating sustainability into agile development processes",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <ProjectProvider>
              <SprintProvider>
                <div className="min-h-screen bg-background flex flex-col">
                  <Navbar />
                  <TabNav />
                  <main className="flex-1">{children}</main>
                  <Toaster />
                </div>
              </SprintProvider>
            </ProjectProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}


import './globals.css'