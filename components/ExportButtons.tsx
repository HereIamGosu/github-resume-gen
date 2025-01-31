// ExportButtons.tsx
"use client";

import { useState, useCallback, memo } from "react";
import { saveAs } from "file-saver";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
} from "docx";
import { pdf } from "@react-pdf/renderer";
import type {
  ExportData,
  ExportButtonsProps,
  DesignConfig,
} from "@/types/export";
import { ResumeDocument } from "./ResumeDocument";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import dynamic from "next/dynamic";
import { FileText, File, Download } from "lucide-react";
import { ReloadIcon } from "@radix-ui/react-icons";

const buttonStyle = (design: string) =>
  `group flex items-center gap-2 transition-all h-10 px-6 rounded-lg 
  shadow-sm hover:shadow-md border hover:translate-y-[-2px]
  ${
    design === "Minimalist"
      ? "bg-background hover:bg-accent/20 border-border"
      : design === "Classic"
      ? "bg-blue-50 hover:bg-blue-100 border-blue-200"
      : "bg-purple-50 hover:bg-purple-100 border-purple-200"
  }`;

// Мемоизированный компонент
const ExportButtonsCore = memo(
  ({
    exporting,
    error,
    handleExport,
    design,
  }: {
    exporting: boolean;
    error: string | null;
    handleExport: (format: "PDF" | "DOCX") => void;
    design: string;
  }) => (
    <div className="space-y-4 w-full h-full">
      <div className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold text-foreground/90">
          Export Options
        </h3>
        <div className="flex gap-3 flex-col sm:flex-row">
          <button
            onClick={() => handleExport("PDF")}
            disabled={exporting}
            className={buttonStyle(design)}
          >
            <FileText className="h-5 w-5 text-red-600" />
            <span className="text-foreground/90">PDF</span>
            <Download className="h-4 w-4 ml-1 opacity-70 group-hover:opacity-100" />
          </button>

          <button
            onClick={() => handleExport("DOCX")}
            disabled={exporting}
            className={buttonStyle(design)}
          >
            <File className="h-5 w-5 text-blue-600" />
            <span className="text-foreground/90">Word</span>
            <Download className="h-4 w-4 ml-1 opacity-70 group-hover:opacity-100" />
          </button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Export Error</AlertTitle>
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
      )}

      {exporting && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ReloadIcon className="h-4 w-4 animate-spin" />
          <span>Generating file...</span>
        </div>
      )}
    </div>
  )
);

// Исправление типов для AlignmentType
type Alignment = (typeof AlignmentType)[keyof typeof AlignmentType];

const getDocxStyles = (design: string) => ({
  fontFamily:
    design === "Minimalist"
      ? "Arial"
      : design === "Classic"
      ? "Times New Roman"
      : "Calibri",
  headingAlignment:
    design === "Minimalist"
      ? AlignmentType.LEFT
      : design === "Classic"
      ? AlignmentType.CENTER
      : AlignmentType.RIGHT,
  borderColor:
    design === "Classic"
      ? "000080"
      : design === "Creative"
      ? "800080"
      : "000000",
});

export function ExportButtons({ data, username, design }: ExportButtonsProps) {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = useCallback(
    async (format: "PDF" | "DOCX") => {
      setExporting(true);
      setError(null);

      try {
        if (format === "PDF") {
          const blob = await pdf(
            <ResumeDocument
              data={data}
              username={username}
              designConfig={getDesignConfig(design)}
            />
          ).toBlob();
          saveAs(blob, `${username}_resume_${design.toLowerCase()}.pdf`);
        } else {
          const doc = createDocxDocument(data, username, design);
          const blob = await Packer.toBlob(doc);
          saveAs(blob, `${username}_resume_${design.toLowerCase()}.docx`);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        console.error(`Export error (${format}):`, errorMessage);
        setError(`Export failed: ${errorMessage}`);
      } finally {
        setExporting(false);
      }
    },
    [data, username, design]
  );

  return (
    <ExportButtonsCore
      exporting={exporting}
      error={error}
      handleExport={handleExport}
      design={design} // Передаем текущий дизайн
    />
  );
}

// Исправление структуры документа
const createDocxDocument = (
  data: ExportData,
  username: string,
  design: string
) => {
  const { fontFamily, headingAlignment, borderColor } = getDocxStyles(design);

  return new Document({
    styles: {
      default: { document: { run: { font: fontFamily } } },
      paragraphStyles: [
        createHeadingStyle("Heading1", 28, design),
        createHeadingStyle("Heading2", 26, design),
      ],
    },
    sections: [
      {
        properties: {}, // Добавлено обязательное свойство
        children: [
          // Исправлена структура children
          new Paragraph({
            text: `Resume for ${username}`,
            heading: HeadingLevel.HEADING_1,
            alignment: headingAlignment,
          }),
          ...createSkillsSection(data, headingAlignment),
          ...createProjectsSection(data, design, borderColor),
          ...createFooter(design),
        ],
      },
    ],
  });
};

const createHeadingStyle = (id: string, size: number, design: string) => ({
  id,
  name: id,
  basedOn: "Normal",
  quickFormat: true,
  run: {
    size,
    bold: true,
    color: design === "Creative" ? "800080" : "000000",
  },
  paragraph: {
    spacing: { before: id === "Heading2" ? 240 : 0, after: 120 },
  },
});

// Исправление возвращаемого типа для секций
const createSkillsSection = (data: ExportData, alignment: Alignment) => [
  new Paragraph({
    text: "Skills",
    heading: HeadingLevel.HEADING_2,
    alignment,
  }),
  ...Object.entries(data.skills).map(
    ([skill, value]) =>
      new Paragraph({
        children: [
          new TextRun({ text: `${skill}: `, bold: true }),
          new TextRun(`${value}%`),
        ],
        alignment: AlignmentType.LEFT,
        bullet: { level: 0 },
      })
  ),
];

const createProjectsSection = (
  data: ExportData,
  design: string,
  borderColor: string
) => [
  new Paragraph({
    text: "Projects",
    heading: HeadingLevel.HEADING_2,
    alignment: AlignmentType.LEFT,
  }),
  ...data.projects.flatMap((project) => [
    new Paragraph({
      text: project.name,
      heading: HeadingLevel.HEADING_3,
      border: {
        bottom: { color: borderColor, style: BorderStyle.SINGLE, size: 6 },
      },
    }),
    new Paragraph(project.description),
    ...(design === "Creative"
      ? [new Paragraph({ children: [new TextRun("•••")] })]
      : []),
  ]),
];

const createFooter = (design: string) =>
  design === "Classic" || design === "Creative"
    ? [
        new Paragraph({
          text:
            design === "Classic"
              ? `Generated ${new Date().toLocaleDateString()}`
              : "Created with GitHub Resume Generator",
          alignment: AlignmentType.CENTER,
        }),
      ]
    : [];

const getDesignConfig = (design: string): DesignConfig =>
  ({
    Minimalist: {
      headerColor: "#000000",
      subHeaderColor: "#333333",
      textColor: "#000000",
      accentColor: "#CCCCCC",
    },
    Classic: {
      headerColor: "#000080",
      subHeaderColor: "#000080",
      textColor: "#000000",
      accentColor: "#E6E6FA",
    },
    Creative: {
      headerColor: "#800080",
      subHeaderColor: "#800080",
      textColor: "#000000",
      accentColor: "#E6E6FA",
    },
  }[design] || {
    headerColor: "#000000",
    subHeaderColor: "#333333",
    textColor: "#000000",
    accentColor: "#CCCCCC",
  });

export const ExportButtonsWrapper = dynamic(
  () => import("./ExportButtons").then((mod) => mod.ExportButtons),
  {
    ssr: false,
    loading: () => <div>Loading export options...</div>,
  }
);
