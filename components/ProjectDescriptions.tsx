"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, CodeIcon, GithubIcon } from "lucide-react";
import type { Project } from "@/types/project";
import Link from "next/link";

const STYLES = {
  container: "space-y-6",
  heading:
    "text-2xl font-semibold mb-6 text-primary border-b pb-2 border-border/50",
  card: "flex flex-col h-full shadow-sm hover:shadow-lg transition-all duration-300 border border-border/20 bg-card/50 backdrop-blur-sm",
  content: "prose prose-sm dark:prose-invert max-w-none text-foreground/90",
  techBadge:
    "mr-2 mb-2 text-sm bg-accent/20 border border-border/30 rounded-lg px-3 py-1.5 shadow-sm",
  emptyState: "flex flex-col items-center justify-center py-12 space-y-4",
  expandButton:
    "mt-auto pt-4 w-full flex justify-center border-t border-border/20 bg-gradient-to-t from-background/80 via-background/50 to-transparent",
  iconContainer:
    "flex items-center gap-2 text-muted-foreground/80 hover:text-primary transition-colors",
  gradientBar:
    "absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-80",
} as const;

const ProjectRow = ({ projects }: { projects: Project[] }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {projects.map((project) => (
        <ProjectCard
          key={project.name}
          {...project}
          isExpanded={isExpanded}
          toggleExpand={() => setIsExpanded(!isExpanded)}
        />
      ))}
    </div>
  );
};

const ProjectCard = ({
  name,
  description,
  htmlUrl,
  isExpanded,
  toggleExpand,
}: Project & { isExpanded: boolean; toggleExpand: () => void }) => {
  const technologies = extractTechnologies(description);
  const cleanDescription = cleanProjectDescription(description);

  return (
    <motion.div
      layout
      transition={{ duration: 0.2, type: "tween" }}
      className="h-full"
    >
      <Card className={STYLES.card}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CodeIcon className="h-5 w-5 text-muted-foreground" />
              {name}
              {htmlUrl && (
                <Link
                  href={htmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors ml-2"
                  aria-label={`View ${name} on GitHub`}
                >
                  <GithubIcon className="h-5 w-5" />
                </Link>
              )}
            </CardTitle>
          </div>

          {technologies.length > 0 && (
            <div className="flex flex-wrap mt-2">
              {technologies.map((tech) => (
                <Badge
                  key={tech}
                  variant="outline"
                  className={STYLES.techBadge}
                >
                  {tech.trim()}
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>

        <CardContent className="flex-1 relative">
          <motion.div
            animate={{ height: isExpanded ? "auto" : 100, opacity: 1 }}
            initial={{ height: 100, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div
              className={STYLES.content}
              dangerouslySetInnerHTML={{
                __html: cleanDescription
                  .replace(
                    /## (Описание|Технологии|Детали реализации)/g,
                    '<h3 class="font-semibold mt-4 mb-2 text-primary">$1</h3>'
                  )
                  .replace(/\n/g, "<br/>"),
              }}
            />
          </motion.div>

          {!isExpanded && (
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent" />
          )}
        </CardContent>

        <div className={STYLES.expandButton}>
          <button
            onClick={toggleExpand}
            className="w-full py-2 flex items-center justify-center gap-2 text-primary hover:bg-accent/20 transition-colors"
            aria-label={isExpanded ? "Collapse section" : "Expand section"}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-5 w-5" />
                <span>Show Less</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-5 w-5" />
                <span>Show More</span>
              </>
            )}
          </button>
        </div>
      </Card>
    </motion.div>
  );
};

// Вынесение логики обработки технологий
const extractTechnologies = (description: string): string[] => {
  const techMatch = description.match(/## Технологии\n([^#]+)/);
  return techMatch?.[1]?.split(", ").filter(Boolean) || [];
};

// Вынесение логики очистки описания
const cleanProjectDescription = (description: string): string => {
  return description
    .replace(/^# .+\n/, "")
    .replace(/\n{2,}/g, "\n")
    .trim();
};

export function ProjectDescriptions({
  projects,
}: {
  projects: Project[];
}): JSX.Element {
  const projectRows = [];
  for (let i = 0; i < projects.length; i += 2) {
    projectRows.push(projects.slice(i, i + 2));
  }

  return (
    <div className={STYLES.container}>
      <h2 className={STYLES.heading}>Featured Projects</h2>

      <AnimatePresence mode="wait">
        {projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
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
          <div className="space-y-6">
            {projectRows.map((row, index) => (
              <ProjectRow key={`row-${index}`} projects={row} />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
