"use client"

import { useState, useEffect, useRef } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from "lucide-react"
import AnnotationLayer from "./annotation-layer"
import SignatureCanvas from "./signature-canvas"
import type { Annotation, AnnotationType, Position } from "@/lib/types"


if (typeof window !== "undefined") {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
  }


interface DocumentViewerProps {
  pdfFile: File
  annotations: Annotation[]
  currentTool: AnnotationType
  currentColor: string
  onAddAnnotation: (annotation: Annotation) => void
}

export default function DocumentViewer({
  pdfFile,
  annotations,
  currentTool,
  currentColor,
  onAddAnnotation,
}: DocumentViewerProps) {
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [scale, setScale] = useState<number>(1.0)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [pdfError, setPdfError] = useState<string | null>(null)
  const [selectedText, setSelectedText] = useState<string>("")
  const [selectionPosition, setSelectionPosition] = useState<Position | null>(null)
  const [showSignatureCanvas, setShowSignatureCanvas] = useState<boolean>(false)
  const [commentText, setCommentText] = useState<string>("")
  const [showCommentInput, setShowCommentInput] = useState<boolean>(false)
  const [containerWidth, setContainerWidth] = useState<number>(800)

  const containerRef = useRef<HTMLDivElement>(null)
  const pageRef = useRef<HTMLDivElement>(null)

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth - 40) // 40px padding
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Create object URL for the PDF file
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  useEffect(() => {
    if (!pdfFile) return

    const url = URL.createObjectURL(pdfFile)
    setPdfUrl(url)

    return () => {
      URL.revokeObjectURL(url)
    }
  }, [pdfFile])

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setIsLoading(false)
  }

  const onDocumentLoadError = (error: Error) => {
    console.error("PDF load error:", error)
    setPdfError("Failed to load PDF document")
    setIsLoading(false)
  }

  const handleTextSelection = () => {
    const selection = window.getSelection()
    if (!selection || selection.toString().trim() === "") return

    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    
    if (!pageRef.current) return
    
    const pageRect = pageRef.current.getBoundingClientRect()
    
    const position: Position = {
      x: rect.left - pageRect.left,
      y: rect.top - pageRect.top,
      width: rect.width,
      height: rect.height,
      page: pageNumber,
    }

    setSelectedText(selection.toString())
    setSelectionPosition(position)

    if (currentTool === "comment") {
      setShowCommentInput(true)
    }
  }

  const handlePageClick = (e: React.MouseEvent) => {
    if (currentTool === "signature") {
      if (!pageRef.current) return
      
      const pageRect = pageRef.current.getBoundingClientRect()
      const position: Position = {
        x: e.clientX - pageRect.left,
        y: e.clientY - pageRect.top,
        width: 200,
        height: 100,
        page: pageNumber,
      }

      setSelectionPosition(position)
      setShowSignatureCanvas(true)
    }
  }

  const handleAddHighlightOrUnderline = () => {
    if (!selectionPosition || !selectedText) return

    const newAnnotation: Annotation = {
      id: Date.now().toString(),
      type: currentTool === "highlight" ? "highlight" : "underline",
      content: selectedText,
      position: selectionPosition,
      color: currentColor,
      page: pageNumber,
      relatedText: selectedText,
    }

    onAddAnnotation(newAnnotation)
    setSelectedText("")
    setSelectionPosition(null)
    window.getSelection()?.removeAllRanges()
  }

  useEffect(() => {
    if (currentTool === "highlight" || currentTool === "underline") {
      if (selectedText && selectionPosition) {
        handleAddHighlightOrUnderline()
      }
    }
  }, [currentTool, selectedText, selectionPosition])

  const pageAnnotations = annotations.filter((annotation) => annotation.page === pageNumber)

  return (
    <Card className="w-full overflow-hidden">
      <div className="p-4 border-b flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span>PDF Viewer</span>
          <span className="text-sm text-muted-foreground">
            Page {pageNumber} of {numPages}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageNumber(p => Math.max(1, p - 1))}
            disabled={pageNumber <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageNumber(p => Math.min(numPages, p + 1))}
            disabled={pageNumber >= numPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setScale(prev => Math.max(0.5, prev - 0.1))}
            disabled={scale <= 0.5}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setScale(prev => Math.min(2.0, prev + 0.1))}
            disabled={scale >= 2.0}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div 
        className="relative overflow-auto h-[calc(100vh-300px)]" 
        ref={containerRef}
        onMouseUp={handleTextSelection}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}
        {pdfError && (
          <div className="h-[800px] flex items-center justify-center text-destructive">
            {pdfError}
          </div>
        )}
        {pdfUrl && !pdfError && (
          <div 
            ref={pageRef} 
            className="relative flex justify-center"
            onClick={handlePageClick}
          >
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={<div className="h-[800px]"></div>}
              error={
                <div className="h-[800px] flex items-center justify-center text-destructive">
                  Error loading PDF. Please try a different file.
                </div>
              }
            >
              <Page
                pageNumber={pageNumber}
                width={containerWidth}
                scale={scale}
                renderTextLayer={true}
                renderAnnotationLayer={false}
                className="border"
              />
            </Document>
            
            <AnnotationLayer 
              annotations={pageAnnotations} 
              scale={scale} 
            />

            {showCommentInput && selectionPosition && (
              <div
                className="absolute bg-background border rounded-md p-2 shadow-md z-20 min-w-[200px]"
                style={{
                  left: `${selectionPosition.x}px`,
                  top: `${selectionPosition.y + selectionPosition.height + 5}px`,
                }}
              >
                <textarea
                  className="w-full min-w-[200px] p-2 border rounded-md mb-2"
                  placeholder="Add your comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowCommentInput(false)
                      setSelectedText("")
                      setSelectionPosition(null)
                      window.getSelection()?.removeAllRanges()
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      if (!selectionPosition || !commentText.trim()) return

                      const newAnnotation: Annotation = {
                        id: Date.now().toString(),
                        type: "comment",
                        content: commentText,
                        position: selectionPosition,
                        color: currentColor,
                        page: pageNumber,
                        relatedText: selectedText,
                      }

                      onAddAnnotation(newAnnotation)
                      setCommentText("")
                      setShowCommentInput(false)
                      setSelectedText("")
                      setSelectionPosition(null)
                      window.getSelection()?.removeAllRanges()
                    }}
                  >
                    Add Comment
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showSignatureCanvas && (
        <SignatureCanvas 
          onComplete={(signatureDataUrl) => {
            if (!selectionPosition) return

            const newAnnotation: Annotation = {
              id: Date.now().toString(),
              type: "signature",
              content: signatureDataUrl,
              position: selectionPosition,
              page: pageNumber,
            }

            onAddAnnotation(newAnnotation)
            setShowSignatureCanvas(false)
            setSelectionPosition(null)
          }} 
          onCancel={() => setShowSignatureCanvas(false)} 
        />
      )}
    </Card>
  )
}

// "use client"

// import type React from "react"
// import { useState, useEffect, useRef } from "react"
// import type { Annotation, AnnotationType, Position } from "@/lib/types"
// import { Card } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Loader2 } from "lucide-react"
// import SignatureCanvas from "./signature-canvas"
// import AnnotationLayer from "./annotation-layer"

// interface DocumentViewerProps {
//   pdfFile: File
//   annotations: Annotation[]
//   currentTool: AnnotationType
//   currentColor: string
//   onAddAnnotation: (annotation: Annotation) => void
// }

// export default function DocumentViewer({
//   pdfFile,
//   annotations,
//   currentTool,
//   currentColor,
//   onAddAnnotation,
// }: DocumentViewerProps) {
//   const [objectUrl, setObjectUrl] = useState<string | null>(null)
//   const [isLoading, setIsLoading] = useState<boolean>(true)
//   const [selectedText, setSelectedText] = useState<string>("")
//   const [selectionPosition, setSelectionPosition] = useState<Position | null>(null)
//   const [showSignatureCanvas, setShowSignatureCanvas] = useState<boolean>(false)
//   const [commentText, setCommentText] = useState<string>("")
//   const [showCommentInput, setShowCommentInput] = useState<boolean>(false)
//   const [pdfError, setPdfError] = useState<string | null>(null)

//   const containerRef = useRef<HTMLDivElement>(null)
//   const documentRef = useRef<HTMLDivElement>(null)
//   const iframeRef = useRef<HTMLIFrameElement>(null)

//   // Create an object URL for the PDF file
//   useEffect(() => {
//     if (!pdfFile) return

//     try {
//       setIsLoading(true)
//       setPdfError(null)

//       // Create a URL for the PDF file
//       const url = URL.createObjectURL(pdfFile)
//       setObjectUrl(url)
//       setIsLoading(false)

//       // Clean up the URL when the component unmounts or when the file changes
//       return () => {
//         if (url) URL.revokeObjectURL(url)
//       }
//     } catch (error) {
//       console.error("Error creating object URL:", error)
//       setPdfError("Failed to load the PDF file")
//       setIsLoading(false)
//     }
//   }, [pdfFile])

//   // Handle text selection for highlight and underline tools
//   useEffect(() => {
//     const handleSelectionChange = () => {
//       if (currentTool !== "highlight" && currentTool !== "underline") return

//       const selection = window.getSelection()
//       if (!selection || selection.rangeCount === 0 || selection.toString().trim() === "") {
//         setSelectedText("")
//         setSelectionPosition(null)
//         return
//       }

//       // Get the selected text
//       const selectedStr = selection.toString().trim()
//       setSelectedText(selectedStr)

//       // Get the position of the selection
//       const range = selection.getRangeAt(0)
//       const rect = range.getBoundingClientRect()

//       if (!documentRef.current) return
//       const docRect = documentRef.current.getBoundingClientRect()

//       // Calculate position relative to the document container
//       const position: Position = {
//         x: rect.left - docRect.left,
//         y: rect.top - docRect.top,
//         width: rect.width,
//         height: rect.height,
//         page: 1, // For iframe implementation, we'll use page 1
//       }

//       setSelectionPosition(position)
//     }

//     // Add mouseup event for text selection
//     const handleMouseUp = (event: MouseEvent) => {
//       // Small timeout to allow the selection to complete
//       setTimeout(handleSelectionChange, 100)
//     }

//     document.addEventListener("mouseup", handleMouseUp)
//     return () => document.removeEventListener("mouseup", handleMouseUp)
//   }, [currentTool])

//   // Handle document click for annotations
//   const handleDocumentClick = (event: React.MouseEvent) => {
//     if (!selectionPosition) return
    
//     // Handle different annotation types
//     switch (currentTool) {
//       case "highlight":
//         if (!selectedText) return
        
//         const highlightAnnotation: Annotation = {
//           id: Date.now().toString(),
//           type: "highlight",
//           content: selectedText,
//           position: selectionPosition,
//           color: currentColor,
//           page: 1,
//         }
        
//         onAddAnnotation(highlightAnnotation)
//         window.getSelection()?.removeAllRanges()
//         setSelectedText("")
//         setSelectionPosition(null)
//         break
        
//       case "underline":
//         if (!selectedText) return
        
//         const underlineAnnotation: Annotation = {
//           id: Date.now().toString(),
//           type: "underline",
//           content: selectedText,
//           position: selectionPosition,
//           color: currentColor,
//           page: 1,
//         }
        
//         onAddAnnotation(underlineAnnotation)
//         window.getSelection()?.removeAllRanges()
//         setSelectedText("")
//         setSelectionPosition(null)
//         break
        
//       case "comment":
//         if (selectedText) {
//           setShowCommentInput(true)
//         }
//         break
        
//       default:
//         break
//     }
//   }

//   const handleCanvasClick = (event: React.MouseEvent) => {
//     if (currentTool !== "signature") return

//     if (!documentRef.current) return
//     const docRect = documentRef.current.getBoundingClientRect()

//     const position: Position = {
//       x: event.clientX - docRect.left,
//       y: event.clientY - docRect.top,
//       width: 200,
//       height: 100,
//       page: 1, // Since we're using an iframe, we'll just use page 1 for all annotations
//     }

//     setSelectionPosition(position)
//     setShowSignatureCanvas(true)
//   }

//   const handleSignatureComplete = (signatureDataUrl: string) => {
//     if (!selectionPosition) return

//     const newAnnotation: Annotation = {
//       id: Date.now().toString(),
//       type: "signature",
//       content: signatureDataUrl,
//       position: selectionPosition,
//       page: 1,
//     }

//     onAddAnnotation(newAnnotation)
//     setShowSignatureCanvas(false)
//     setSelectionPosition(null)
//   }

//   // Setup iframe message communication for text selection in embedded PDF
//   useEffect(() => {
//     const handleIframeLoad = () => {
//       if (!iframeRef.current || !iframeRef.current.contentWindow) return
      
//       // Attempt to inject a script into the iframe to handle text selection
//       // Note: This may not work if the PDF viewer doesn't allow script injection
//       try {
//         const iframeDocument = iframeRef.current.contentWindow.document
        
//         // Inject script to communicate selections back to parent
//         const script = iframeDocument.createElement('script')
//         script.textContent = `
//           document.addEventListener('mouseup', function(e) {
//             const selection = window.getSelection();
//             if (selection && selection.toString().trim() !== '') {
//               const range = selection.getRangeAt(0);
//               const rect = range.getBoundingClientRect();
//               window.parent.postMessage({
//                 type: 'textSelection',
//                 text: selection.toString(),
//                 rect: {
//                   left: rect.left,
//                   top: rect.top,
//                   width: rect.width,
//                   height: rect.height
//                 }
//               }, '*');
//             }
//           });
//         `
//         iframeDocument.body.appendChild(script)
//       } catch (error) {
//         console.warn('Could not inject script into iframe:', error)
//       }
//     }
    
//     // Listen for messages from the iframe
//     const handleMessage = (event: MessageEvent) => {
//       if (event.data.type === 'textSelection') {
//         setSelectedText(event.data.text)
        
//         if (!documentRef.current) return
//         const docRect = documentRef.current.getBoundingClientRect()
//         const iframeRect = iframeRef.current?.getBoundingClientRect() || { left: 0, top: 0 }
        
//         // Calculate position relative to the document
//         const position: Position = {
//           x: event.data.rect.left + iframeRect.left - docRect.left,
//           y: event.data.rect.top + iframeRect.top - docRect.top,
//           width: event.data.rect.width,
//           height: event.data.rect.height,
//           page: 1,
//         }
        
//         setSelectionPosition(position)
//       }
//     }
    
//     window.addEventListener('message', handleMessage)
    
//     if (iframeRef.current) {
//       iframeRef.current.addEventListener('load', handleIframeLoad)
//     }
    
//     return () => {
//       window.removeEventListener('message', handleMessage)
//       if (iframeRef.current) {
//         iframeRef.current.removeEventListener('load', handleIframeLoad)
//       }
//     }
//   }, [])

//   // For now, we'll just show all annotations on the first page
//   const pageAnnotations = annotations.filter((annotation) => annotation.page === 1)

//   return (
//     <Card className="w-full overflow-hidden">
//       <div className="p-4 border-b flex justify-between items-center">
//         <div className="flex items-center gap-2">
//           <span>PDF Viewer</span>
//         </div>
//         <div className="flex items-center gap-2">
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() => {
//               if (iframeRef.current) {
//                 iframeRef.current.contentWindow?.print()
//               }
//             }}
//           >
//             Print
//           </Button>
//         </div>
//       </div>
//       <div className="relative overflow-auto h-[calc(100vh-300px)]" ref={containerRef}>
//         {isLoading && (
//           <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
//             <Loader2 className="h-8 w-8 animate-spin" />
//           </div>
//         )}
//         {pdfError && <div className="h-[800px] flex items-center justify-center text-destructive">{pdfError}</div>}
//         <div ref={documentRef} className="relative" onClick={handleCanvasClick}>
//           {objectUrl && !pdfError && (
//             <iframe
//               ref={iframeRef}
//               src={objectUrl}
//               className="w-full h-[calc(100vh-300px)]"
//               title="PDF Viewer"
//               onLoad={() => setIsLoading(false)}
//               onError={() => {
//                 setPdfError("Failed to load the PDF file")
//                 setIsLoading(false)
//               }}
//             />
//           )}

//           <AnnotationLayer annotations={pageAnnotations} scale={1} />

//           {showCommentInput && selectionPosition && (
//             <div
//               className="absolute bg-background border rounded-md p-2 shadow-md z-10"
//               style={{
//                 left: selectionPosition.x + "px",
//                 top: selectionPosition.y + selectionPosition.height + 5 + "px",
//               }}
//             >
//               <textarea
//                 className="w-full min-w-[200px] p-2 border rounded-md mb-2"
//                 placeholder="Add your comment..."
//                 value={commentText}
//                 onChange={(e) => setCommentText(e.target.value)}
//                 autoFocus
//               />
//               <div className="flex justify-end gap-2">
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => {
//                     setShowCommentInput(false)
//                     setSelectedText("")
//                     setSelectionPosition(null)
//                   }}
//                 >
//                   Cancel
//                 </Button>
//                 <Button
//                   size="sm"
//                   onClick={() => {
//                     if (!selectionPosition || !commentText.trim()) return

//                     const newAnnotation: Annotation = {
//                       id: Date.now().toString(),
//                       type: "comment",
//                       content: commentText,
//                       position: selectionPosition,
//                       color: currentColor,
//                       page: 1,
//                       relatedText: selectedText,
//                     }

//                     onAddAnnotation(newAnnotation)
//                     setCommentText("")
//                     setShowCommentInput(false)
//                     setSelectedText("")
//                     setSelectionPosition(null)
//                   }}
//                 >
//                   Add Comment
//                 </Button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {showSignatureCanvas && (
//         <SignatureCanvas onComplete={handleSignatureComplete} onCancel={() => setShowSignatureCanvas(false)} />
//       )}
//     </Card>
//   )
// }

