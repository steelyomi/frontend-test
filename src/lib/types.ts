export type AnnotationType = "highlight" | "underline" | "comment" | "signature"

export interface Position {
  x: number
  y: number
  width: number
  height: number
  page: number
}

export interface Annotation {
  id: string
  type: AnnotationType
  content: string
  position: Position
  color?: string
  page: number
  relatedText?: string
}

