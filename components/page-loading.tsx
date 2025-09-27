"use client"

import { motion } from "framer-motion"
import { LoadingSpinner } from "./loading-spinner"

export function PageLoading() {
  return (
    <motion.div
      className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-card border border-border rounded-lg p-8 shadow-lg"
      >
        <LoadingSpinner size="lg" text="Loading..." />
      </motion.div>
    </motion.div>
  )
}
