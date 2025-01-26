"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { SkillsChart } from "@/components/SkillsChart"
import { ProjectDescriptions } from "@/components/ProjectDescriptions"
import { DesignSelector } from "@/components/DesignSelector"
import { ExportButtonsWrapper } from "@/components/ExportButtons"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ReloadIcon } from "@radix-ui/react-icons"
import { Button } from "@/components/ui/button"

export default function Results({ searchParams }: { searchParams: { username: string } }) {
  const { username } = searchParams
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDesign, setSelectedDesign] = useState("Minimalist")
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch("/api/generate-resume", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }),
        })

        const result = await response.json()
        if (!response.ok) {
          throw new Error(result.error || result.details || "Failed to fetch data")
        }
        setData(result)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError(
          err instanceof Error ? err.message : "An error occurred while generating the resume. Please try again later.",
        )
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [username])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
        <p>Generating resume for {username}...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Alert variant="destructive" className="max-w-md mx-auto mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => router.push("/")}>Try Another Username</Button>
      </div>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-24 bg-gray-100">
      <h1 className="text-3xl font-bold mb-8 text-blue-600">Resume for {username}</h1>
      <div className="w-full max-w-4xl space-y-8">
        <SkillsChart skills={data.skills} />
        <ProjectDescriptions projects={data.projects} />
        <div className="flex justify-between items-center">
          <DesignSelector onDesignChange={setSelectedDesign} />
          <ExportButtonsWrapper data={data} username={username} design={selectedDesign} />
        </div>
      </div>
    </main>
  )
}

