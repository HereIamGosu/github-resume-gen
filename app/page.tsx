import { GithubForm } from "@/components/GithubForm";

// Константы интерфейса
const PAGE_STYLES = {
  main: "flex min-h-screen flex-col items-center justify-center p-4 md:p-8 lg:p-24 bg-gray-100",
  heading:
    "text-3xl md:text-4xl font-bold mb-6 md:mb-8 text-blue-600 text-center",
} as const;

const CONTENT = {
  title: "GitHub Resume Generator",
  ariaLabel: "Generate your developer resume using GitHub data",
} as const;

// Основной компонент
export default function HomePage() {
  return (
    <main
      className={PAGE_STYLES.main}
      role="main"
      aria-label={CONTENT.ariaLabel}
    >
      <h1 className={PAGE_STYLES.heading}>{CONTENT.title}</h1>
      <GithubForm />
    </main>
  );
}
