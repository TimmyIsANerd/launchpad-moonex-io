"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X, ImageIcon } from 'lucide-react'

interface FileUploadProps {
  onFileSelect: (file: File | null) => void
  accept?: string
  maxSize?: number // in MB
  preview?: boolean
}

export function FileUpload({ onFileSelect, accept = "image/*", maxSize = 5, preview = true }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    setError(null)

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`)
      return
    }

    // Validate file type
    if (accept === "image/*" && !file.type.startsWith("image/")) {
      setError("Please select a valid image file")
      return
    }

    setSelectedFile(file)
    onFileSelect(file)

    // Create preview for images
    if (preview && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const clearFile = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setError(null)
    onFileSelect(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-2">
      <Card
        className={`border-2 border-dashed transition-colors cursor-pointer hover:border-primary ${
          error ? "border-destructive" : "border-border"
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileInputRef.current?.click()}
      >
        <CardContent className="p-6">
          {previewUrl ? (
            <div className="relative">
              <img src={previewUrl || "/placeholder.svg"} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
              <Button
                size="icon"
                variant="destructive"
                className="absolute top-2 right-2"
                onClick={(e) => {
                  e.stopPropagation()
                  clearFile()
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center mb-4">
                {accept === "image/*" ? <ImageIcon className="h-6 w-6" /> : <Upload className="h-6 w-6" />}
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Drop your file here, or{" "}
                <span className="text-primary font-medium">click to browse</span>
              </p>
              <p className="text-xs text-muted-foreground">
                {accept === "image/*" ? "PNG, JPEG, WEBP, GIF" : "All files"} up to {maxSize}MB
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedFile && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-foreground">{selectedFile.name}</span>
          <span className="text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)}MB</span>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  )
}
