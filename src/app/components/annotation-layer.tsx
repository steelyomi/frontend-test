"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Annotation } from "@/lib/types"

interface AnnotationLayerProps {
  annotations: Annotation[]
  scale: number
}

export default function AnnotationLayer({ annotations, scale }: AnnotationLayerProps) {
  const [expandedComment, setExpandedComment] = useState<string | null>(null)

  const renderAnnotation = (annotation: Annotation) => {
    const { type, position, color, content, id } = annotation

    const scaledPosition = {
      x: position.x * scale,
      y: position.y * scale,
      width: position.width * scale,
      height: position.height * scale,
    }

    switch (type) {
      case "highlight":
        return (
          <div
            key={id}
            className="absolute pointer-events-none"
            style={{
              left: `${scaledPosition.x}px`,
              top: `${scaledPosition.y}px`,
              width: `${scaledPosition.width}px`,
              height: `${scaledPosition.height}px`,
              backgroundColor: color || "#FFEB3B",
              opacity: 0.3,
              mixBlendMode: "multiply",
            }}
          />
        )

      case "underline":
        return (
          <div
            key={id}
            className="absolute pointer-events-none"
            style={{
              left: `${scaledPosition.x}px`,
              top: `${scaledPosition.y + scaledPosition.height - 2}px`,
              width: `${scaledPosition.width}px`,
              height: "2px",
              backgroundColor: color || "#000000",
            }}
          />
        )

      case "comment":
        return (
          <div
            key={id}
            className="absolute"
            style={{
              left: `${scaledPosition.x}px`,
              top: `${scaledPosition.y}px`,
            }}
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center cursor-pointer"
              style={{ backgroundColor: color || "#3B82F6" }}
              onClick={() => setExpandedComment(expandedComment === id ? null : id)}
            >
              <span className="text-xs text-white">💬</span>
            </div>

            {expandedComment === id && (
              <div 
                className="absolute top-7 left-0 bg-background border rounded-md p-3 shadow-md z-20 min-w-[200px] max-w-[300px]"
                style={{ transform: `scale(${1 / scale})` }}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-medium">Comment</span>
                  <button
                    onClick={() => setExpandedComment(null)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
                <p className="text-sm whitespace-pre-wrap">{content}</p>
                {annotation.relatedText && (
                  <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
                    <span className="font-medium">Selected text:</span>
                    <p className="italic mt-1">{annotation.relatedText}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )

      case "signature":
        return (
          <div
            key={id}
            className="absolute"
            style={{
              left: `${scaledPosition.x}px`,
              top: `${scaledPosition.y}px`,
              width: `${scaledPosition.width}px`,
              height: `${scaledPosition.height}px`,
            }}
          >
            <img 
              src={content || "/placeholder.svg"} 
              alt="Signature" 
              className="w-full h-full object-contain border border-dashed border-gray-300 bg-white" 
            />
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
      {annotations.map((annotation) => (
        <div key={annotation.id} className="pointer-events-auto">
          {renderAnnotation(annotation)}
        </div>
      ))}
    </div>
  )
}