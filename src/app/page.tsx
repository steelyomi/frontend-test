import DocumentAnnotator from "./components/document-annotator";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-8">PDF Annotator & Signer</h1>
      <DocumentAnnotator />
    </main>
  )
}