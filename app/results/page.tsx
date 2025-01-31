"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SkillsChart } from "@/components/SkillsChart";
import { ProjectDescriptions } from "@/components/ProjectDescriptions";
import { DesignSelector } from "@/components/DesignSelector";
import { ExportButtonsWrapper } from "@/components/ExportButtons";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ReloadIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";

// 1. Типизация данных ================================================
interface ResumeData {
  skills: Record<string, number>;
  projects: Array<{
    name: string;
    description: string;
  }>;
}

// 2. Константы и утилиты =============================================
const DEFAULT_DESIGN = "Minimalist";
const ERROR_MESSAGES = {
  default:
    "An error occurred while generating the resume. Please try again later.",
  fetch: "Failed to fetch data",
};

// 3. Компоненты состояний ============================================
const LoadingState = ({ username }: { username: string }) => (
  <div className="flex items-center justify-center min-h-screen">
    <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
    <p>Generating resume for {username}...</p>
  </div>
);

const ErrorState = ({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) => (
  <div className="flex flex-col items-center justify-center min-h-screen">
    <Alert variant="destructive" className="max-w-md mx-auto mb-4">
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
    </Alert>
    <Button onClick={onRetry}>Try Another Username</Button>
  </div>
);

// 4. Основной компонент ==============================================
export default function ResultsPage({
  searchParams,
}: {
  searchParams: { username: string };
}) {
  const { username } = searchParams;
  const router = useRouter();
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDesign, setSelectedDesign] = useState(DEFAULT_DESIGN);

  // 5. Логика получения данных ========================================
  const fetchResumeData = async (username: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/generate-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || ERROR_MESSAGES.fetch);
      }

      const data: ResumeData = await response.json();
      setResumeData(data);
    } catch (err) {
      console.error("Data fetch error:", err);
      setError(err instanceof Error ? err.message : ERROR_MESSAGES.default);
    } finally {
      setIsLoading(false);
    }
  };

  // 6. Эффекты и обработчики ==========================================
  useEffect(() => {
    if (username?.trim()) {
      fetchResumeData(username.trim());
    }
  }, [username]);

  const handleRetry = () => router.push("/");

  // 7. Рендер состояний ===============================================
  if (isLoading) return <LoadingState username={username} />;
  if (error) return <ErrorState error={error} onRetry={handleRetry} />;

  // 8. Основной рендер ================================================
  return (
    <main className="flex min-h-screen flex-col items-center p-8 md:p-24 bg-gray-100">
      <header className="w-full max-w-4xl mb-8">
        <h1 className="text-3xl font-bold text-blue-600 text-center">
          Resume for {username}
        </h1>
      </header>

      <section className="w-full max-w-4xl space-y-8">
        <SkillsChart skills={resumeData!.skills} />
        <ProjectDescriptions projects={resumeData!.projects} />

        <div className="flex flex-col md:flex-row justify-between gap-8 w-full">
          <div className="flex-1">
            <DesignSelector onDesignChange={setSelectedDesign} />
          </div>

          <div className="flex-1">
            <ExportButtonsWrapper
              data={{
                skills: resumeData!.skills, // Теперь совпадает с типом
                projects: resumeData!.projects.map((p) => ({
                  name: p.name,
                  description: p.description,
                })),
              }}
              username={username}
              design={selectedDesign}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
