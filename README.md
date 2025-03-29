# PDF Annotator & Signer

A modern web application built with Next.js that allows users to upload, annotate, and sign PDF documents.

![PDF Annotator Screenshot](/placeholder.svg?height=400&width=800)

## Features

- **Document Upload**: Drag-and-drop or file selection for PDF documents
- **Annotation Tools**:
  - Highlight text with customizable colors
  - Underline text with customizable colors
  - Add comments to specific parts of the document
  - Draw signatures anywhere on the document
- **Document Export**: Download annotated PDFs with all modifications
- **Responsive Design**: Works well on different screen sizes
- **Modern UI/UX**: Clean, intuitive interface with visual feedback


## Technologies Used

### Core Framework

- **Next.js**: For server-side rendering and routing
- **React**: For building the user interface


### UI Components

- **shadcn/ui**: For consistent, accessible UI components
- **Tailwind CSS**: For utility-first styling
- **Lucide React**: For high-quality icons


### PDF Handling

- **Browser's native PDF viewer**: For displaying PDFs reliably
- **pdf-lib**: For PDF manipulation and export
- **react-dropzone**: For drag-and-drop file uploads


### State Management

- **React Hooks**: For component state and side effects


## Architecture

The application follows a component-based architecture:

- `DocumentAnnotator`: Main component that orchestrates the application
- `DocumentUploader`: Handles file uploads with drag-and-drop
- `DocumentViewer`: Displays the PDF and manages annotations
- `AnnotationToolbar`: Provides tools for annotating the document
- `AnnotationLayer`: Renders annotations on top of the PDF
- `SignatureCanvas`: Allows users to draw signatures


## Challenges and Solutions

### PDF Rendering Issues

**Challenge**: Initially, we attempted to use PDF.js with react-pdf for rendering PDFs, but encountered persistent issues with the PDF.js worker setup in the Next.js environment.

**Solution**: We switched to using the browser's native PDF viewer via an iframe, which provides reliable PDF rendering without the complexity of external libraries. This approach leverages the browser's built-in capabilities and avoids cross-origin and worker initialization issues.

### Annotation Positioning

**Challenge**: Accurately positioning annotations on the PDF, especially when zooming or on different screen sizes.

**Solution**: We implemented a coordinate system that calculates positions relative to the document container, ensuring annotations stay in the correct position regardless of zoom level or screen size.

### PDF Export with Annotations

**Challenge**: Embedding annotations into the exported PDF while maintaining the original document quality.

**Solution**: We use pdf-lib to modify the PDF document, adding annotations as overlay elements. This preserves the original document while adding the user's annotations.

## Future Enhancements

With more time, the following features could be added:

1. **Advanced Text Selection**: Improve text selection for more accurate highlighting and underlining
2. **Multi-page Annotation Support**: Better handling of annotations across multiple pages
3. **Collaboration Features**: Real-time collaboration with multiple users
4. **Annotation History**: Undo/redo functionality and annotation history
5. **Custom Stamps**: Allow users to create and use custom stamps
6. **Form Filling**: Support for filling out PDF forms
7. **Cloud Storage Integration**: Save annotated documents to cloud storage services
8. **OCR Integration**: Extract text from scanned documents for annotation
9. **Mobile Optimization**: Enhanced touch support for mobile devices
10. **Annotation Templates**: Save and reuse common annotations

