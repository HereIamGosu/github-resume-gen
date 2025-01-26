"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { Project } from "@/types/project"

// Конфигурация стилей и текстов
const STYLES = {
  container: "space-y-6",
  heading: "text-2xl font-semibold mb-4 text-foreground",
  card: "transition-shadow hover:shadow-lg",
  textarea: "min-h-[100px] bg-muted/50 font-mono text-sm",
} as const;

const CONTENT = {
  title: "Project Descriptions",
  emptyState: "No projects available for this user",
} as const;

// Подкомпонент карточки проекта
const ProjectCard = ({ name, description }: Project) => (
  <Card className={STYLES.card}>
    <CardHeader>
      <CardTitle className="text-lg">{name}</CardTitle>
    </CardHeader>
    <CardContent>
      <Textarea
        value={description}
        readOnly
        className={STYLES.textarea}
        aria-label={`Description for ${name}`}
      />
    </CardContent>
  </Card>
);

export function ProjectDescriptions({ projects }: { projects: Project[] }) {
  return (
    <div className={STYLES.container}>
      <h2 className={STYLES.heading}>{CONTENT.title}</h2>

      {projects.length === 0 ? (
        <p className="text-muted-foreground">{CONTENT.emptyState}</p>
      ) : (
        projects.map((project) => (
          <ProjectCard key={project.name} {...project} />
        ))
      )}
    </div>
  );
}
