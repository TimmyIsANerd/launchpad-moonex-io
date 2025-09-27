"use client"

import { motion } from "framer-motion"
import { LoadingSpinner } from "./loading-spinner"

interface SectionLoadingProps {
  title?: string
  description?: string
}

export function SectionLoading({ title = "Loading", description }: SectionLoadingProps) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-16 px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <LoadingSpinner size="lg" />
      <motion.h3
        className="text-xl font-semibold mt-4 mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {title}
      </motion.h3>
      {description && (
        <motion.p
          className="text-muted-foreground text-center max-w-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {description}
        </motion.p>
      )}
    </motion.div>
  )
}
