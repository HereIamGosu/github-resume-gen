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

// Мемоизированный компонент
const ExportButtonsCore = memo(
  ({
    exporting,
    error,
    handleExport,
  }: {
    exporting: boolean;
    error: string | null;
    handleExport: (format: "PDF" | "DOCX") => void;
  }) => (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold text-gray-800">Export Resume</h3>
      <div className="flex gap-2">
        <Button onClick={() => handleExport("PDF")} disabled={exporting}>
          {exporting ? "Exporting..." : "PDF"}
        </Button>
        <Button onClick={() => handleExport("DOCX")} disabled={exporting}>
          {exporting ? "Exporting..." : "DOCX"}
        </Button>
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
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
