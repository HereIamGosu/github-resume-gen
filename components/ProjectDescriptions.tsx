"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, CodeIcon, GithubIcon } from "lucide-react";
import type { Project } from "@/types/project";
import Link from "next/link";

const STYLES = {
  container: "space-y-6",
  heading: "text-2xl font-semibold mb-6 text-primary",
  card: "relative group transition-all hover:shadow-lg dark:hover:bg-card/80",
  content: "prose prose-sm dark:prose-invert max-w-none",
  techBadge: "mr-2 mb-2 text-sm",
  emptyState: "flex flex-col items-center justify-center py-12 space-y-4",
} as const;

const MotionCard = motion(Card);

const ProjectCard = ({ name, description, htmlUrl }: Project) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasLongDescription = description.length > 300;

  // Парсим описание
  const techMatch = description.match(/## Технологии\n([^#]+)/);
  const technologies = techMatch?.[1].split(", ").filter(Boolean) || [];
  const cleanDescription = description
    .replace(/^# .+\n/, "") // Удаляем заголовок проекта
    .replace(/## Технологии\n[^#]+/, "")
    .replace(/\n{2,}/g, "\n");

  return (
    <MotionCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={STYLES.card}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CodeIcon className="h-5 w-5 text-muted-foreground" />
            {name}
          </CardTitle>
          {hasLongDescription && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-muted-foreground hover:text-primary"
            >
              {isExpanded ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>
          )}
        </div>

        {technologies.length > 0 && (
          <div className="flex flex-wrap mt-2">
            {technologies.map((tech: string) => (
              <Badge key={tech} variant="outline" className={STYLES.techBadge}>
                {tech.trim()}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent>
        <ScrollArea className={isExpanded ? "h-full" : "h-[200px]"}>
          <div
            className={STYLES.content}
            dangerouslySetInnerHTML={{
              __html: cleanDescription
                .replace(
                  /## (.*?)\n/g,
                  '<h3 class="font-semibold mt-4 mb-2">$1</h3>'
                )
                .replace(/\n/g, "<br/>"),
            }}
          />
        </ScrollArea>

        {htmlUrl && (
          <div className="flex items-center gap-4 mt-4">
            <Link
              href={htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
            >
              <GithubIcon className="h-4 w-4" />
              <span className="text-sm">View Code</span>
            </Link>
          </div>
        )}
      </CardContent>

      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </MotionCard>
  );
};

export function ProjectDescriptions({ projects }: { projects: Project[] }) {
  return (
    <div className={STYLES.container}>
      <h2 className={STYLES.heading}>Featured Projects</h2>

      <AnimatePresence>
        {projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={STYLES.emptyState}
          >
            <div className="text-center space-y-2">
              <CodeIcon className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">No projects found</p>
              <p className="text-sm text-muted-foreground">
                This user hasn't created any public repositories yet
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {projects.map((project) => (
              <ProjectCard key={project.name} {...project} />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
