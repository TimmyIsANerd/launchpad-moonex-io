"use client"

import type { Variants } from "framer-motion"

// Core animation variants for consistent timing and easing
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, ease: "easeOut" },
  },
}

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
}

export const slideDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: "easeOut" },
  },
}

export const cosmicGlow: Variants = {
  initial: {
    boxShadow: "0 0 0 rgba(0, 192, 255, 0)",
  },
  hover: {
    boxShadow: "0 0 20px rgba(0, 192, 255, 0.3), 0 0 40px rgba(0, 192, 255, 0.1)",
    transition: { duration: 0.3, ease: "easeOut" },
  },
}

export const pulseGlow: Variants = {
  animate: {
    boxShadow: ["0 0 5px rgba(0, 192, 255, 0.2)", "0 0 15px rgba(0, 192, 255, 0.4)", "0 0 5px rgba(0, 192, 255, 0.2)"],
    transition: {
      duration: 2,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
    },
  },
}

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
}

// Button animations
export const buttonPress: Variants = {
  initial: { scale: 1 },
  tap: { scale: 0.98 },
  hover: { scale: 1.02 },
}

export const buttonGlow: Variants = {
  initial: {
    boxShadow: "0 0 0 rgba(0, 192, 255, 0)",
  },
  hover: {
    boxShadow: "0 0 15px rgba(0, 192, 255, 0.4), 0 0 30px rgba(0, 192, 255, 0.2)",
    transition: { duration: 0.2 },
  },
  tap: {
    boxShadow: "0 0 10px rgba(0, 192, 255, 0.6)",
    transition: { duration: 0.1 },
  },
}

// Card animations
export const cardHover: Variants = {
  initial: {
    y: 0,
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  },
  hover: {
    y: -4,
    boxShadow: "0 10px 25px -3px rgba(0, 192, 255, 0.1), 0 4px 6px -2px rgba(0, 192, 255, 0.05)",
    transition: { duration: 0.2, ease: "easeOut" },
  },
}

// Modal animations
export const modalBackdrop: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
}

export const modalContent: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
      delay: 0.1,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.2 },
  },
}

// Loading animations
export const spinnerRotate = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Number.POSITIVE_INFINITY,
      ease: "linear",
    },
  },
}

export const loadingDots: Variants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 0.6,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
    },
  },
}

// Page transition animations
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.3, ease: "easeIn" },
  },
}

// Utility functions
export const createStaggerDelay = (index: number, baseDelay = 0.1) => ({
  delay: baseDelay * index,
})

export const createSpringTransition = (stiffness = 300, damping = 30) => ({
  type: "spring",
  stiffness,
  damping,
})
