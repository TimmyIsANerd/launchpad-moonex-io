"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X, ImageIcon, Camera } from 'lucide-react'
import { motion, AnimatePresence } from "framer-motion"

interface SquareImageUploadProps {
  onFileSelect: (file: File | null) => void
  accept?: string
  maxSize?: number // in MB
  recommendedSize?: { width: number; height: number }
}

export function SquareImageUpload({ 
  onFileSelect, 
  accept = "image/*", 
  maxSize = 5,
  recommendedSize = { width: 500, height: 500 }
}: SquareImageUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
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
    if (file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
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
    <div className="space-y-4">
      {/* Main Upload Area */}
      <div
        className={`
          relative aspect-square w-full max-w-md mx-auto
          border-2 border-dashed rounded-xl transition-all duration-200
          cursor-pointer hover:border-primary hover:bg-accent/50
          ${isDragging ? 'border-primary bg-primary/10 scale-105' : 'border-border'}
          ${error ? 'border-destructive bg-destructive/10' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <AnimatePresence>
          {previewUrl ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full h-full"
            >
              <img 
                src={previewUrl} 
                alt="Token logo preview" 
                className="w-full h-full object-cover rounded-xl"
              />
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center"
              >
                <div className="text-white text-center space-y-2">
                  <Camera className="h-8 w-8 mx-auto" />
                  <p className="text-sm font-medium">Click to change image</p>
                </div>
              </motion.div>
              
              <Button
                size="icon"
                variant="destructive"
                className="absolute top-3 right-3 h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation()
                  clearFile()
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-6"
            >
              <div className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="mx-auto w-16 h-16 bg-muted rounded-xl flex items-center justify-center"
                >
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                </motion.div>
                
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-foreground">
                    Upload Token Logo
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Drop your image here or{" "}
                    <span className="text-primary font-medium">click to browse</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Recommended: {recommendedSize.width}×{recommendedSize.height}px
                  </p>
                </div>

                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={(e) => {
                    e.stopPropagation()
                    fileInputRef.current?.click()
                  }}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* File Info */}
      {selectedFile && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between text-sm bg-muted/50 rounded-lg p-3"
        >
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground truncate max-w-48">{selectedFile.name}</span>
          </div>
          <span className="text-muted-foreground text-xs">
            {(selectedFile.size / 1024 / 1024).toFixed(1)}MB
          </span>
        </motion.div>
      )}

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3"
        >
          {error}
        </motion.div>
      )}

      {/* Upload Progress / Status */}
      {!selectedFile && !error && (
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Supported formats: PNG, JPEG, WEBP, GIF • Max size: {maxSize}MB
          </p>
        </div>
      )}

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
