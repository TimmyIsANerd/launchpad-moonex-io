"use client"

import { Check } from 'lucide-react'
import { motion } from 'framer-motion'

interface Step {
  id: string
  title: string
  description?: string
  icon?: React.ReactNode
}

interface EnhancedStepIndicatorProps {
  steps: Step[]
  currentStep: number
  onStepClick?: (stepIndex: number) => void
}

export function EnhancedStepIndicator({ steps, currentStep, onStepClick }: EnhancedStepIndicatorProps) {
  return (
    <div className="w-full">
      {/* Desktop Layout - Horizontal */}
      <div className="hidden md:block w-full max-w-4xl mx-auto">
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
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Mobile Layout - Vertical Timeline & Current Step Bubble */}
      <div className="md:hidden space-y-6">
        {/* Progress Bar */}
        <div className="relative">
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm font-medium text-foreground">
              Step {currentStep} of {steps.length}
            </div>
            <div className="text-xs text-muted-foreground">
              {Math.round(((currentStep - 1) / (steps.length - 1)) * 100)}%
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-muted/30 rounded-full h-2 overflow-hidden">
            <motion.div 
              className="bg-gradient-to-r from-primary to-secondary h-full rounded-full"
              style={{ 
                width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` 
              }}
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Current Step Bubble */}
        <div className="text-center">
          <motion.div
            className="mx-auto w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center border-2 border-primary/20"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {steps[currentStep - 1]?.icon || (
              <span className="text-2xl font-bold text-primary">{currentStep}</span>
            )}
          </motion.div>
          
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-foreground mb-1">
              {steps[currentStep - 1]?.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {steps[currentStep - 1]?.description}
            </p>
          </div>
        </div>

        {/* Compact Step List for Reference */}
        <div className="space-y-2">
          {steps.map((step, index) => {
            const stepNumber = index + 1
            const isCompleted = index < currentStep
            const isCurrent = index === currentStep
            const isUpcoming = index > currentStep

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${
                  onStepClick ? 'cursor-pointer hover:bg-muted/50' : ''
                }`}
                onClick={() => onStepClick?.(index)}
              >
                {/* Mini Status Indicator */}
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border text-xs font-semibold ${
                  isCompleted 
                    ? 'bg-primary border-primary text-primary-foreground' 
                    : isCurrent 
                      ? 'bg-primary/20 border-primary text-primary' 
                      : 'bg-background border-border text-muted-foreground'
                }`}>
                  {isCompleted ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    stepNumber
                  )}
                </div>

                {/* Step Info */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${
                    isCompleted || isCurrent ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {step.title}
                  </p>
                  {step.description && (
                    <p className="text-xs text-muted-foreground truncate">
                      {step.description}
                    </p>
                  )}
                </div>

                {/* Status Badge */}
                {isCurrent && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2 h-2 bg-primary rounded-full animate-pulse"
                  />
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
