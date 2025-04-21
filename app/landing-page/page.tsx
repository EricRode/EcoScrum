"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Leaf, BarChart3, Kanban, RotateCcw, CheckCircle, FileText } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push("/")
    }
  }, [loading, user, router])

  if (loading) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="relative pt-20 pb-32 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900 mb-6">
              <Leaf className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
              EcoScrum
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mb-10">
              Integrate sustainability into your agile development process with our comprehensive scrum management
              platform.
            </p>
            
            {/* User Manual Download Button */}
            <div className="mb-8 flex items-center justify-center bg-amber-50 px-6 py-4 rounded-lg border border-amber-200 w-full max-w-xl">
              <FileText className="h-6 w-6 mr-2 text-amber-600" />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between flex-grow">
                <span className="text-amber-800 font-medium">New to EcoScrum? Get started quickly:</span>
                <a 
                  href="https://drive.google.com/file/d/1uaIvMfqU1hH9VARSO8UDWEmmvFB1LR-1/view?usp=sharing" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 sm:mt-0 flex items-center bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  View User Manual
                </a>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/login">
                <Button size="lg" className="px-8">
                  Get Started
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="px-8">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16 text-gray-900 dark:text-white">
            Sustainable Agile Development
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900 mb-4">
                <Kanban className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Sprint Management</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Organize your work into sprints with sustainability metrics built in from the start.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900 mb-4">
                <BarChart3 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Sustainability Metrics</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Track and improve your project's sustainability score with every sprint.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900 mb-4">
                <RotateCcw className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Retrospectives</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Conduct sprint retrospectives with a focus on sustainability improvements.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16 text-gray-900 dark:text-white">
            Benefits of Sustainable Development
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-4">
                <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Reduced Resource Usage</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Optimize your applications to use fewer server resources and less energy.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-4">
                <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Better Performance</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Sustainable code often means more efficient code, leading to better performance.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-4">
                <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Lower Costs</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Reduce infrastructure costs by building more efficient applications.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-4">
                <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Environmental Impact</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Make a positive contribution to reducing the tech industry's carbon footprint.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-emerald-600 dark:bg-emerald-800">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to make your development more sustainable?</h2>
          <p className="text-xl text-emerald-100 mb-10 max-w-2xl mx-auto">
            Join EcoScrum today and start tracking your sustainability metrics while managing your agile projects.
          </p>
          <Link href="/login">
            <Button size="lg" variant="secondary" className="px-8">
              Get Started Now
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-10 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Leaf className="h-6 w-6 text-emerald-600 dark:text-emerald-400 mr-2" />
              <span className="font-bold text-gray-900 dark:text-white">EcoScrum</span>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} EcoScrum. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
