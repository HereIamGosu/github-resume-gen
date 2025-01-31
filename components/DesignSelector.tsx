// DesignSelector.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Paintbrush, LayoutTemplate, Sparkles } from "lucide-react";

const DESIGNS = ["Minimalist", "Classic", "Creative"] as const;
export type DesignType = (typeof DESIGNS)[number];

const DESIGN_CONFIG = {
  Minimalist: {
    color: "hsl(240 5.9% 10%)",
    icon: <LayoutTemplate className="h-5 w-5" />,
  },
  Classic: {
    color: "hsl(221.2 83.2% 53.3%)",
    icon: <Paintbrush className="h-5 w-5" />,
  },
  Creative: {
    color: "hsl(262.1 83.3% 57.8%)",
    icon: <Sparkles className="h-5 w-5" />,
  },
} as const;

interface DesignSelectorProps {
  onDesignChange: (design: DesignType) => void;
}

export function DesignSelector({ onDesignChange }: DesignSelectorProps) {
  const [selectedDesign, setSelectedDesign] =
    useState<DesignType>("Minimalist");

  const handleDesignChange = (design: DesignType) => {
    setSelectedDesign(design);
    onDesignChange(design);
  };

  return (
    <div className="space-y-4 h-full">
      <h3 className="text-lg font-semibold text-foreground/90">
        Choose Design Style
      </h3>
      <div className="flex flex-col sm:flex-row gap-2 w-full">
        {DESIGNS.map((design) => (
          <Button
            key={design}
            variant="outline"
            onClick={() => handleDesignChange(design)}
            aria-label={`Select ${design} design`}
            className={cn(
              "design-button-container w-full sm:w-auto h-14 px-4 flex-col sm:flex-row",
              "w-full sm:w-auto h-14 px-4 flex-col sm:flex-row",
              "transition-all duration-300 hover:scale-[1.02]",
              "hover:border-primary/30",
              selectedDesign === design
                ? "border-primary bg-primary/5 shadow-lg"
                : "border-muted/50 bg-transparent"
            )}
            style={{
              borderColor:
                selectedDesign === design
                  ? DESIGN_CONFIG[design].color
                  : undefined,
            }}
          >
            <span className="text-muted-foreground">
              {DESIGN_CONFIG[design].icon}
            </span>
            <span className="ml-2 text-base font-medium text-foreground/90">
              {design}
            </span>
            {selectedDesign === design && (
              <div
                className="absolute -bottom-px inset-x-0 h-[2px] animate-in fade-in"
                style={{
                  backgroundColor: DESIGN_CONFIG[design].color,
                  bottom: "-1px", // Корректировка позиции
                  width: "calc(100% - 2px)", // Уменьшение ширины
                  left: "1px", // Центрирование
                }}
              />
            )}
          </Button>
        ))}
      </div>
      <p className="text-sm text-muted-foreground/80 pt-2 border-t border-border/20">
        Selected style:{" "}
        <span
          className="font-medium"
          style={{ color: DESIGN_CONFIG[selectedDesign].color }}
        >
          {selectedDesign}
        </span>
      </p>
    </div>
  );
}
