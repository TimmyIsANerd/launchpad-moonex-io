"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  trend?: {
    value: number
    label: string
    isPositive?: boolean
  }
  glowColor?: "cyan" | "pink" | "primary" | "secondary"
  className?: string
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  glowColor = "cyan",
  className
}: StatsCardProps) {
  const glowClasses = {
    cyan: "hover-glow-cyan",
    pink: "hover-glow-pink", 
    primary: "hover:shadow-primary/30",
    secondary: "hover:shadow-secondary/30"
  }

  return (
    <Card className={cn(
      "border-border transition-all duration-300 hover:scale-[1.02] group",
      glowClasses[glowColor],
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          {Icon && (
            <div className={cn(
              "flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 group-hover:scale-110",
              glowColor === "cyan" && "bg-gradient-to-br from-cyan-500/20 to-blue-600/20",
              glowColor === "pink" && "bg-gradient-to-br from-pink-500/20 to-purple-600/20",
              glowColor === "primary" && "bg-gradient-to-br from-primary/20 to-primary/10",
              glowColor === "secondary" && "bg-gradient-to-br from-secondary/20 to-secondary/10"
            )}>
              <Icon className={cn(
                "h-6 w-6",
                glowColor === "cyan" && "text-cyan-400",
                glowColor === "pink" && "text-pink-400", 
                glowColor === "primary" && "text-primary",
                glowColor === "secondary" && "text-secondary"
              )} />
            </div>
          )}
          
          {trend && (
            <div className={cn(
              "text-right",
              trend.isPositive ? "text-green-400" : "text-red-400"
            )}>
              <div className="text-sm font-medium">
                {trend.isPositive ? "+" : ""}{trend.value.toFixed(1)}%
              </div>
              <span className="text-xs text-muted-foreground">{trend.label}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="text-2xl font-bold text-foreground">
            {value}
          </div>
          <div className="text-sm font-medium text-muted-foreground">
            {title}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground/80 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
