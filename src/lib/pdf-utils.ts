// import { PDFDocument } from "pdf-lib"
// import { Annotation } from "./types"

// export async function saveAnnotatedPdf(originalPdf: File, annotations: Annotation[]): Promise<void> {
//   try {
//     // Read the original PDF file
//     const arrayBuffer = await originalPdf.arrayBuffer()
//     const pdfDoc = await PDFDocument.load(arrayBuffer)

//     // Process annotations
    
//     // Note: This is a simplified implementation
//     // In a production app, you would need to properly embed annotations
//     // using the PDF specification

//     // For now, we'll just save the original PDF
//     // In a real implementation, you would modify the PDF here

//     // Save the PDF
//     const pdfBytes = await pdfDoc.save()

//     // Create a blob from the PDF bytes
//     const blob = new Blob([pdfBytes], { type: "application/pdf" })

//     // Create a download link
//     const url = URL.createObjectURL(blob)
//     const link = document.createElement("a")
//     link.href = url
//     link.download = `annotated-${originalPdf.name}`

//     // Trigger the download
//     document.body.appendChild(link)
//     link.click()

//     // Clean up
//     document.body.removeChild(link)
//     URL.revokeObjectURL(url)
//   } catch (error) {
//     console.error("Error saving PDF:", error)
//     throw error
//   }
// }

import { PDFDocument, rgb, degrees } from "pdf-lib";
import { Annotation } from "./types";

export async function saveAnnotatedPdf(
  originalPdf: File,
  annotations: Annotation[]
): Promise<void> {
  try {
    const arrayBuffer = await originalPdf.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);

    for (const annotation of annotations) {
      const pages = pdfDoc.getPages();
      const page = pages[annotation.position.page - 1]; 

      const { x, y, width, height } = annotation.position;
      const pageHeight = page.getHeight();

      const pdfY = pageHeight - y - height;

      switch (annotation.type) {
        case "highlight":
          page.drawRectangle({
            x,
            y: pdfY,
            width,
            height,
            color: rgb(
              parseInt(annotation.color?.substring(1, 3) || "FF", 16) / 255,
              parseInt(annotation.color?.substring(3, 5) || "EB", 16) / 255,
              parseInt(annotation.color?.substring(5, 7) || "3B", 16) / 255
            ),
            opacity: 0.3,
          });
          break;

        case "underline":
          page.drawLine({
            start: { x, y: pdfY + height },
            end: { x: x + width, y: pdfY + height },
            thickness: 2,
            color: rgb(
              parseInt(annotation.color?.substring(1, 3) || "00", 16) / 255,
              parseInt(annotation.color?.substring(3, 5) || "00", 16) / 255,
              parseInt(annotation.color?.substring(5, 7) || "00", 16) / 255
            ),
          });
          break;

        case "comment":
          page.drawRectangle({
            x,
            y: pdfY,
            width: 10,
            height: 10,
            color: rgb(
              parseInt(annotation.color?.substring(1, 3) || "00", 16) / 255,
              parseInt(annotation.color?.substring(3, 5) || "00", 16) / 255,
              parseInt(annotation.color?.substring(5, 7) || "00", 16) / 255
            ),
          });
          break;

        case "signature":
          if (annotation.content.startsWith("data:image")) {
            const imageBytes = await fetch(annotation.content)
              .then((res) => res.arrayBuffer());
            const image = await pdfDoc.embedPng(imageBytes);
            page.drawImage(image, {
              x,
              y: pdfY,
              width,
              height,
            });
          }
          break;
      }
    }

    const pdfBytes = await pdfDoc.save();

    const blob = new Blob([pdfBytes], { type: "application/pdf" });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `annotated-${originalPdf.name}`;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error saving PDF:", error);
    throw error;
  }
}