"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface AnimatedCounterProps {
  value: number
  duration?: number
  decimals?: number
  className?: string
  prefix?: string
  suffix?: string
}

export function AnimatedCounter({
  value,
  duration = 2000,
  decimals = 0,
  className,
  prefix = "",
  suffix = ""
}: AnimatedCounterProps) {
  const [animatedValue, setAnimatedValue] = useState(0)
  const frameRef = useRef<number>()

  useEffect(() => {
    const start = animatedValue
    const startTime = Date.now()
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3)
      const currentValue = start + (value - start) * easeOutCubic
      
      setAnimatedValue(currentValue)
      
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate)
      }
    }
    
    frameRef.current = requestAnimationFrame(animate)
    
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [value, duration])

  const formatValue = (num: number) => {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })
  }

  return (
    <span className={cn("font-mono", className)}>
      {prefix}{formatValue(animatedValue)}{suffix}
    </span>
  )
}
