// DesignSelector.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

// Вынесено в константу для централизованного управления вариантами
const DESIGNS = ["Minimalist", "Classic", "Creative"] as const;
export type DesignType = (typeof DESIGNS)[number];

interface DesignSelectorProps {
  onDesignChange: (design: DesignType) => void;
}

export function DesignSelector({ onDesignChange }: DesignSelectorProps) {
  const [selectedDesign, setSelectedDesign] =
    useState<DesignType>("Minimalist");

  // Оптимизирован обработчик: добавлена проверка типа
  const handleDesignChange = (design: DesignType) => {
    setSelectedDesign(design);
    onDesignChange(design);
  };

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold text-gray-800">Select Design</h3>
      <div className="flex gap-2">
        {" "}
        {/* Заменен space-x на gap для лучшей читаемости */}
        {DESIGNS.map((design) => (
          <Button
            key={design}
            variant={selectedDesign === design ? "default" : "outline"}
            onClick={() => handleDesignChange(design)}
            aria-label={`Select ${design} design`} // Добавлена доступность
          >
            {design}
          </Button>
        ))}
      </div>
    </div>
  );
}
