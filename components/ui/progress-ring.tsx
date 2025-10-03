"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressRingProps {
  progress: number // 0-100
  size?: number
  strokeWidth?: number
  className?: string
  children?: React.ReactNode
  variant?: "primary" | "success" | "warning" | "danger"
}

export function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 8,
  className

, children,
  variant = "primary"
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (progress / 100) * circumference

  const colors = {
    primary: {
      stroke: "#00c0ff",
      glow: "rgba(0, 192, 255, 0.3)"
    },
    success: {
      stroke: "#10b981", 
      glow: "rgba(16, 185, 129, 0.3)"
    },
    warning: {
      stroke: "#f59e0b",
      glow: "rgba(245, 158, 11, 0.3)"
    },
    danger: {
      stroke: "#ef4444",
      glow: "rgba(239, 68, 68, 0.3)"
    }
  }

  const color = colors[variant]

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-border/30"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color.stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out drop-shadow-lg"
          style={{
            filter: `drop-shadow(0 0 8px ${color.glow})`
          }}
        />
      </svg>
      
      {/* Content */}
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  )
}
