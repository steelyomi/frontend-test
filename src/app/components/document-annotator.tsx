"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { saveAnnotatedPdf } from "@/lib/pdf-utils"
import DocumentUploader from "./document-uploader"
import AnnotationToolbar from "./annotation-toolbar"
import DocumentViewer from "./document-viewer"
import { Annotation, AnnotationType } from "@/lib/types"

export default function DocumentAnnotator() {
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [currentTool, setCurrentTool] = useState<AnnotationType>("highlight")
  const [currentColor, setCurrentColor] = useState<string>("#FFEB3B") // Default yellow for highlights
  const [isExporting, setIsExporting] = useState(false)
  const viewerRef = useRef<HTMLDivElement>(null)
 

  const handleFileUpload = (file: File) => {
    try {
      setPdfFile(file)
      setAnnotations([])
    } catch (error) {
      console.error("Error handling file upload:", error)
      toast("`Error uploading file`")
    }
  }

  const handleAddAnnotation = (annotation: Annotation) => {
    setAnnotations((prev) => [...prev, annotation])
  }

  const handleExportPdf = async () => {
    if (!pdfFile) {
      toast("No document to export")
      return
    }

    setIsExporting(true)
    try {
      await saveAnnotatedPdf(pdfFile, annotations)
      toast('Export successful!')
    } catch (error) {
      console.error("Export failed:", error)
      toast('Export failed')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="w-full max-w-7xl flex flex-col gap-4">
      {!pdfFile ? (
        <DocumentUploader onFileUpload={handleFileUpload} />
      ) : (
        <>
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <div className="w-full md:w-auto flex-shrink-0">
              <Tabs defaultValue="tools" className="w-full md:w-[250px]">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="tools">Tools</TabsTrigger>
                  <TabsTrigger value="properties">Properties</TabsTrigger>
                </TabsList>
                <TabsContent value="tools" className="space-y-4">
                  <AnnotationToolbar
                    currentTool={currentTool}
                    setCurrentTool={setCurrentTool}
                    currentColor={currentColor}
                    setCurrentColor={setCurrentColor}
                  />
                </TabsContent>
                <TabsContent value="properties" className="space-y-4">
                  <div className="p-4 border rounded-md">
                    <h3 className="font-medium mb-2">Color</h3>
                    <div className="flex flex-wrap gap-2">
                      {["#FFEB3B", "#4CAF50", "#2196F3", "#F44336", "#9C27B0"].map((color) => (
                        <button
                          key={color}
                          className={`w-8 h-8 rounded-full border-2 ${
                            currentColor === color ? "border-black dark:border-white" : "border-transparent"
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setCurrentColor(color)}
                          aria-label={`Select color ${color}`}
                        />
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              <div className="mt-4 space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setPdfFile(null)
                    setAnnotations([])
                  }}
                >
                  Upload New Document
                </Button>
                <Button className="w-full" onClick={handleExportPdf} disabled={isExporting}>
                  {isExporting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    "Export Annotated PDF"
                  )}
                </Button>
              </div>
            </div>
            <div className="flex-grow w-full" ref={viewerRef}>
              <DocumentViewer
                pdfFile={pdfFile}
                annotations={annotations}
                currentTool={currentTool}
                currentColor={currentColor}
                onAddAnnotation={handleAddAnnotation}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

