"use client"

import { motion } from "framer-motion"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ErrorBoundaryProps {
  error?: Error
  reset?: () => void
  title?: string
  description?: string
}

export function ErrorBoundary({
  error,
  reset,
  title = "Something went wrong",
  description = "An unexpected error occurred. Please try again.",
}: ErrorBoundaryProps) {
  return (
    <motion.div
      className="flex items-center justify-center min-h-[400px] px-4"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="w-full max-w-md border-destructive/20">
        <CardHeader className="text-center">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            className="flex justify-center mb-2"
          >
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </motion.div>
          <CardTitle className="text-destructive">{title}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">{description}</p>
          {error && (
            <details className="text-xs text-left bg-muted p-2 rounded">
              <summary className="cursor-pointer">Error details</summary>
              <pre className="mt-2 whitespace-pre-wrap">{error.message}</pre>
            </details>
          )}
          {reset && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={reset} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
