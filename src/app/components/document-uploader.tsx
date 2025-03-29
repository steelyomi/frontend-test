"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FileUp, File } from "lucide-react"
import { toast } from "sonner"

interface DocumentUploaderProps {
  onFileUpload: (file: File) => void
}

export default function DocumentUploader({ onFileUpload }: DocumentUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
 

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return

      const file = acceptedFiles[0]

      if (file.type !== "application/pdf") {
        toast('Invalid file type. Please upload a PDF.')
        return
      }

      onFileUpload(file)
    },
    [onFileUpload, toast],
  )

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    multiple: false,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    onDropAccepted: () => setIsDragging(false),
    onDropRejected: () => setIsDragging(false),
  })

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center cursor-pointer transition-colors ${
            isDragging ? "border-primary bg-primary/10" : "border-muted-foreground/25 hover:border-primary/50"
          }`}
        >
          <input {...getInputProps()} />
          <FileUp className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Upload your PDF document</h3>
          <p className="text-muted-foreground text-center mb-4">Drag and drop your file here, or click to browse</p>
          <Button onClick={open} type="button">
            <File className="mr-2 h-4 w-4" />
            Select PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

