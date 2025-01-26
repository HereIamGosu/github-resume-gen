"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

interface Project {
  name: string
  description: string
}

export function ProjectDescriptions({ projects }: { projects: Project[] }) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Project Descriptions</h2>
      {projects.map((project, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle>{project.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea value={project.description} readOnly className="min-h-[100px]" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

