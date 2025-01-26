"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import saveAs from "file-saver"
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from "docx"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import dynamic from "next/dynamic"
import { Suspense } from "react"
import { pdf } from "@react-pdf/renderer"
import type { ExportData, ExportButtonsProps, DesignConfig } from "@/types/export"
import ResumeDocument from "./ResumeDocument"

const DynamicExportButtons = dynamic(() => import("./ExportButtons").then((mod) => mod.ExportButtons), {
  ssr: false,
})

export function ExportButtonsWrapper(props: ExportButtonsProps) {
  return (
    <Suspense fallback={<div>Загрузка опций экспорта...</div>}>
      <DynamicExportButtons {...props} />
    </Suspense>
  )
}

export function ExportButtons({ data, username, design }: ExportButtonsProps) {
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleExport = useCallback(
    async (format: "PDF" | "DOCX") => {
      setExporting(true)
      setError(null)
      try {
        if (format === "PDF") {
          await exportToPDF(data, username, design)
        } else {
          await exportToDOCX(data, username, design)
        }
      } catch (error) {
        console.error(`Ошибка экспорта в ${format}:`, error)
        setError(`Не удалось экспортировать в ${format}. ${error instanceof Error ? error.message : String(error)}`)
      } finally {
        setExporting(false)
      }
    },
    [data, username, design],
  )

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold text-gray-800">Экспорт резюме</h3>
      <div className="flex space-x-2">
        <Button onClick={() => handleExport("PDF")} disabled={exporting}>
          {exporting ? "Экспорт..." : "Экспорт в PDF"}
        </Button>
        <Button onClick={() => handleExport("DOCX")} disabled={exporting}>
          {exporting ? "Экспорт..." : "Экспорт в DOCX"}
        </Button>
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Ошибка</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

async function exportToPDF(data: ExportData, username: string, design: string) {
  const designConfig = getDesignConfig(design)
  try {
    const blob = await pdf(<ResumeDocument data={data} username={username} designConfig={designConfig} />).toBlob()
    saveAs(blob, `${username}_resume_${design.toLowerCase()}.pdf`)
  } catch (error) {
    console.error("Error generating PDF:", error)
    throw new Error("Failed to generate PDF. Please try again.")
  }
}

async function exportToDOCX(data: ExportData, username: string, design: string) {
  try {
    const fontFamily = design === "Minimalist" ? "Arial" : design === "Classic" ? "Times New Roman" : "Calibri"
    const headingAlignment =
      design === "Minimalist" ? AlignmentType.LEFT : design === "Classic" ? AlignmentType.CENTER : AlignmentType.RIGHT

    const borderColor = design === "Classic" ? "000080" : design === "Creative" ? "800080" : "000000"

    const doc = new Document({
      styles: {
        default: {
          document: {
            run: {
              font: fontFamily,
            },
          },
        },
        paragraphStyles: [
          {
            id: "Heading1",
            name: "Heading 1",
            basedOn: "Normal",
            next: "Normal",
            quickFormat: true,
            run: {
              size: 28,
              bold: true,
              color: design === "Creative" ? "800080" : "000000",
            },
            paragraph: {
              spacing: {
                after: 120,
              },
            },
          },
          {
            id: "Heading2",
            name: "Heading 2",
            basedOn: "Normal",
            next: "Normal",
            quickFormat: true,
            run: {
              size: 26,
              bold: true,
              color: design === "Creative" ? "800080" : "000000",
            },
            paragraph: {
              spacing: {
                before: 240,
                after: 120,
              },
            },
          },
        ],
      },
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: `Резюме для ${username}`,
              heading: HeadingLevel.HEADING_1,
              alignment: headingAlignment,
            }),
            new Paragraph({
              text: "Навыки",
              heading: HeadingLevel.HEADING_2,
              alignment: headingAlignment,
            }),
            ...Object.entries(data.skills).map(
              ([skill, value]) =>
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${skill}: `,
                      bold: true,
                    }),
                    new TextRun({
                      text: `${value}%`,
                    }),
                  ],
                  alignment: AlignmentType.LEFT,
                  bullet: {
                    level: 0,
                  },
                }),
            ),
            new Paragraph({
              text: "Проекты",
              heading: HeadingLevel.HEADING_2,
              alignment: headingAlignment,
            }),
            ...data.projects.flatMap((project) => [
              new Paragraph({
                text: project.name,
                heading: HeadingLevel.HEADING_3,
                alignment: AlignmentType.LEFT,
                border: {
                  bottom: {
                    color: borderColor,
                    space: 1,
                    style: BorderStyle.SINGLE,
                    size: 6,
                  },
                },
              }),
              new Paragraph({
                text: project.description,
                alignment: AlignmentType.LEFT,
              }),
              ...(design === "Creative"
                ? [
                    new Paragraph({
                      children: [new TextRun({ text: "•••", color: "800080" })],
                      alignment: AlignmentType.CENTER,
                    }),
                  ]
                : []),
            ]),
            ...(design === "Classic" || design === "Creative"
              ? [
                  new Paragraph({
                    text:
                      design === "Classic"
                        ? `Сгенерировано ${new Date().toLocaleDateString()}`
                        : "Создано с помощью GitHub Resume Generator",
                    alignment: AlignmentType.CENTER,
                  }),
                ]
              : []),
          ],
        },
      ],
    })

    const blob = await Packer.toBlob(doc)
    saveAs(blob, `${username}_resume_${design.toLowerCase()}.docx`)
  } catch (error) {
    console.error("Ошибка в exportToDOCX:", error)
    throw new Error(`Не удалось сгенерировать DOCX: ${error instanceof Error ? error.message : String(error)}`)
  }
}

function getDesignConfig(design: string): DesignConfig {
  switch (design) {
    case "Minimalist":
      return {
        headerColor: "#000000",
        subHeaderColor: "#333333",
        textColor: "#000000",
        accentColor: "#CCCCCC",
      }
    case "Classic":
      return {
        headerColor: "#000080",
        subHeaderColor: "#000080",
        textColor: "#000000",
        accentColor: "#E6E6FA",
      }
    case "Creative":
      return {
        headerColor: "#800080",
        subHeaderColor: "#800080",
        textColor: "#000000",
        accentColor: "#E6E6FA",
      }
    default:
      return {
        headerColor: "#000000",
        subHeaderColor: "#333333",
        textColor: "#000000",
        accentColor: "#CCCCCC",
      }
  }
}

