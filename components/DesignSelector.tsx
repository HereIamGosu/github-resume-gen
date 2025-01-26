"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

const designs = ["Minimalist", "Classic", "Creative"]

export function DesignSelector({ onDesignChange }: { onDesignChange: (design: string) => void }) {
  const [selectedDesign, setSelectedDesign] = useState("Minimalist")

  const handleDesignChange = (design: string) => {
    setSelectedDesign(design)
    onDesignChange(design)
  }

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold text-gray-800">Select Design</h3>
      <div className="flex space-x-2">
        {designs.map((design) => (
          <Button
            key={design}
            variant={selectedDesign === design ? "default" : "outline"}
            onClick={() => handleDesignChange(design)}
          >
            {design}
          </Button>
        ))}
      </div>
    </div>
  )
}

