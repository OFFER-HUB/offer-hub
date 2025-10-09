// src/app/test-upload/page.tsx (or wherever you want to test)
"use client"

import { FileUpload } from "@/components/ui/file-upload"
import { useState } from "react"

export default function TestUploadPage() {
  const [files, setFiles] = useState<File[]>([])

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">File Upload Test</h1>
      
      <FileUpload
        onFilesChange={setFiles}
        maxSize={5 * 1024 * 1024} // 5MB
        accept="image/*,.pdf,.doc,.docx"
        multiple
      />

      {files.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-neutral-600">
            {files.length} file(s) selected
          </p>
        </div>
      )}
    </div>
  )
}