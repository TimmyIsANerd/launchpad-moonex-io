"use client"

import { Check } from 'lucide-react'
import { motion } from 'framer-motion'

interface Step {
  id: string
  title: string
  description?: string
  icon?: React.ReactNode
}

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
  onStepClick?: (stepIndex: number) => void
}

export function StepIndicator({ steps, currentStep, onStepClick }: StepIndicatorProps) {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between relative">
        {/* Connection Lines */}
        {steps.slice(0, -1).map((_, index) => (
          <div
            key={`line-${index}`}
            className={`absolute top-6 left-0 right-0 h-0.5 z-0 ${
              index < currentStep ? 'bg-primary' : 'bg-border'
            }`}
            style={{
              left: `calc(16px + ${(100 / (steps.length - 1)) * index}%)`,
              width: `calc(${100 / (steps.length - 1)}% - 32px)`,
            }}
          />
        ))}

        {/* Steps */}
        {steps.map((step, index) => {
          const isCompleted = index < currentStep
          const isCurrent = index === currentStep
          const isUpcoming = index > currentStep

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`relative z-10 flex flex-col items-center cursor-pointer ${
                onStepClick ? '' : 'pointer-events-none'
              }`}
              onClick={() => onStepClick?.(index)}
            >
              {/* Step Circle */}
              <motion.div
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-200
                  ${isCompleted 
                    ? 'bg-primary border-primary text-primary-foreground' 
                    : isCurrent 
                      ? 'bg-primary/10 border-primary text-primary animate-pulse' 
                      : 'bg-background border-border text-muted-foreground'
                  }
                `}
                whileHover={onStepClick ? { scale: 1.1 } : {}}
                whileTap={onStepClick ? { scale: 0.95 } : {}}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : step.icon ? (
                  step.icon
                ) : (
                  <span className="text-sm font-semibold">{index + 1}</span>
                )}
              </motion.div>

              {/* Step Content */}
              <div className="mt-3 text-center max-w-[120px]">
                <h3 className={`text-sm font-medium ${
                  isCompleted || isCurrent ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {step.title}
                </h3>
                {step.description && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
