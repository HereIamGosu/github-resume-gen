import { Inter } from "next/font/google";
import type { Metadata } from "next";
import "@/styles/globals.css";

// Конфигурация шрифта
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

// Метаданные
export const metadata: Metadata = {
  title: {
    default: "AI Resume Generator",
    template: "%s | GitHub Resume",
  },
  description: "Generate professional developer resumes using GitHub data",
  keywords: ["GitHub", "Resume", "Developer", "CV", "Portfolio"],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://yourdomain.com",
    siteName: "GitHub Resume Generator",
  },
};

// Основной лейаут
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
