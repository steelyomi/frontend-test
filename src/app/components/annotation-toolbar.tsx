"use client"

import { Button } from "@/components/ui/button"
import type { AnnotationType } from "@/lib/types"
import { Highlighter, Underline, MessageSquare, PenTool } from "lucide-react"

interface AnnotationToolbarProps {
  currentTool: AnnotationType
  setCurrentTool: (tool: AnnotationType) => void
  currentColor: string
  setCurrentColor: (color: string) => void
}

export default function AnnotationToolbar({
  currentTool,
  setCurrentTool,
//   currentColor,
//   setCurrentColor,
}: AnnotationToolbarProps) {
  const tools = [
    {
      id: "highlight" as AnnotationType,
      name: "Highlight",
      icon: <Highlighter className="h-4 w-4" />,
    },
    {
      id: "underline" as AnnotationType,
      name: "Underline",
      icon: <Underline className="h-4 w-4" />,
    },
    {
      id: "comment" as AnnotationType,
      name: "Comment",
      icon: <MessageSquare className="h-4 w-4" />,
    },
    {
      id: "signature" as AnnotationType,
      name: "Signature",
      icon: <PenTool className="h-4 w-4" />,
    },
  ]

  return (
    <div className="space-y-2">
      {tools.map((tool) => (
        <Button
          key={tool.id}
          variant={currentTool === tool.id ? "default" : "outline"}
          className="w-full justify-start"
          onClick={() => setCurrentTool(tool.id)}
        >
          {tool.icon}
          <span className="ml-2">{tool.name}</span>
        </Button>
      ))}
    </div>
  )
}

