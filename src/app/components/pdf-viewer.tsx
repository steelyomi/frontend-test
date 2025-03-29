"use client"

import { useEffect } from "react"
import { Document, Page, pdfjs } from "react-pdf"

interface PDFViewerProps {
  pdfData: ArrayBuffer
  pageNumber: number
  pageWidth: number
  scale: number
  onLoadSuccess: ({ numPages }: { numPages: number }) => void
  onLoadError: (error: Error) => void
  onPageSuccess: (page: unknown) => void
}

export default function PDFViewer({
  pdfData,
  pageNumber,
  pageWidth,
  scale,
  onLoadSuccess,
  onLoadError,
  onPageSuccess,
}: PDFViewerProps) {
  useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js"
  }, [])

  return (
    <Document
      file={{ data: pdfData }}
      onLoadSuccess={onLoadSuccess}
      onLoadError={onLoadError}
      loading={<div className="h-[800px]"></div>}
      error={
        <div className="h-[800px] flex items-center justify-center text-destructive">
          Error loading PDF. Please try a different file.
        </div>
      }
      options={{
        cMapUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.4.120/cmaps/",
        cMapPacked: true,
      }}
    >
      <Page
        pageNumber={pageNumber}
        width={pageWidth}
        scale={scale}
        renderTextLayer={true}
        renderAnnotationLayer={true}
        onLoadSuccess={onPageSuccess}
      />
    </Document>
  )
}

