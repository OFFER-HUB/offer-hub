import * as React from "react"
import { cn } from "@/lib/utils"
import { Upload, X, File } from "lucide-react"

export interface FileUploadProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Callback when files are selected */
  onFilesChange?: (files: File[]) => void
  /** Maximum file size in bytes */
  maxSize?: number
  /** Accepted file types (e.g., "image/*", ".pdf") */
  accept?: string
  /** Allow multiple files */
  multiple?: boolean
  /** Disabled state */
  disabled?: boolean
}

const FileUpload = React.forwardRef<HTMLDivElement, FileUploadProps>(
  (
    {
      className,
      onFilesChange,
      maxSize,
      accept,
      multiple = false,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const [isDragging, setIsDragging] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const [selectedFiles, setSelectedFiles] = React.useState<File[]>([])
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const validateFiles = (files: File[]): { valid: File[]; error: string | null } => {
      if (maxSize) {
        const oversizedFiles = files.filter(file => file.size > maxSize)
        if (oversizedFiles.length > 0) {
          const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2)
          return {
            valid: [],
            error: `File size exceeds ${maxSizeMB}MB limit`
          }
        }
      }
      return { valid: files, error: null }
    }

    const handleFiles = (files: FileList | null) => {
      if (!files || files.length === 0) return

      const fileArray = Array.from(files)
      const { valid, error: validationError } = validateFiles(fileArray)

      if (validationError) {
        setError(validationError)
        return
      }

      setError(null)
      setSelectedFiles(valid)
      onFilesChange?.(valid)
    }

    const handleDragEnter = (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (!disabled) {
        setIsDragging(true)
      }
    }

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
    }

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
    }

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      if (disabled) return

      const files = e.dataTransfer.files
      handleFiles(files)
    }

    const handleClick = () => {
      if (!disabled) {
        fileInputRef.current?.click()
      }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files)
    }

    const handleRemoveFile = (index: number) => {
      const newFiles = selectedFiles.filter((_, i) => i !== index)
      setSelectedFiles(newFiles)
      onFilesChange?.(newFiles)
      
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }

    const formatFileSize = (bytes: number): string => {
      if (bytes === 0) return "0 Bytes"
      const k = 1024
      const sizes = ["Bytes", "KB", "MB", "GB"]
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
    }

    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleChange}
          accept={accept}
          multiple={multiple}
          disabled={disabled}
        />

        <div
          onClick={handleClick}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative flex flex-col items-center justify-center w-full px-6 py-10 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 ease-in-out",
            isDragging && !disabled
              ? "border-primary-500 bg-primary-50 dark:bg-primary-950/20 scale-[1.02]"
              : "border-neutral-400 hover:border-primary-400 hover:bg-neutral-300 dark:hover:bg-neutral-800",
            disabled && "opacity-50 cursor-not-allowed hover:border-neutral-400 hover:bg-transparent",
            error && "border-destructive bg-destructive/5"
          )}
        >
          <Upload
            className={cn(
              "w-12 h-12 mb-3 transition-colors duration-200",
              isDragging && !disabled ? "text-primary-500" : "text-neutral-500"
            )}
          />

          <p className="mb-2 text-sm text-neutral-800 dark:text-foreground">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-neutral-600 dark:text-muted-foreground">
            {accept ? `Accepted formats: ${accept}` : "Any file type"}
            {maxSize && ` (Max ${formatFileSize(maxSize)})`}
          </p>
        </div>

        {error && (
          <div className="mt-2 flex items-center gap-2 text-sm text-destructive">
            <X className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {selectedFiles.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium text-neutral-800 dark:text-foreground">
              Selected {multiple ? "files" : "file"}:
            </p>
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg transition-all duration-200",
                  "bg-neutral-300 dark:bg-card border border-neutral-400 dark:border-border",
                  "hover:shadow-md hover:scale-[1.01]"
                )}
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <File className="w-5 h-5 text-primary-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-800 dark:text-foreground truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-neutral-600 dark:text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemoveFile(index)
                  }}
                  className={cn(
                    "ml-3 p-1 rounded-md transition-all duration-200 flex-shrink-0",
                    "text-neutral-500 hover:text-destructive hover:bg-destructive/10",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  )}
                  aria-label="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }
)

FileUpload.displayName = "FileUpload"

export { FileUpload }