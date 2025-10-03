"use client"

import { Check, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

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
  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100

  return (
    <div className="w-full">
      {/* Desktop Layout - Modern Horizontal Stepper */}
      <div className="hidden lg:block">
        <div className="relative bg-card rounded-2xl p-8 border border-border/50 shadow-sm">
          <div className="relative flex justify-between items-center">
            {steps.map((step, index) => {
              const stepNumber = index + 1
              const isCompleted = index < currentStep
              const isCurrent = index === currentStep
              const isClickable = onStepClick && (isCompleted || index <= currentStep)

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className={`flex flex-col items-center group ${
                    isClickable ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => isClickable && onStepClick(index)}
                >
                  {/* Step Circle with Enhanced Design */}
                  <motion.div
                    className={`
                      relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg
                      ${isCompleted 
                        ? 'bg-gradient-to-br from-primary to-secondary text-white glow-cyan' 
                        : isCurrent 
                          ? 'bg-card border-2 border-primary text-primary glow-cyan' 
                          : 'bg-card border-2 border-border text-muted hover:border-primary/50'
                      }
                    `}
                    whileHover={isClickable ? { scale: 1.05, y: -2 } : {}}
                    whileTap={isClickable ? { scale: 0.98 } : {}}
                  >
                    {/* Glow Effect for Current Step */}
                    {isCurrent && (
                      <motion.div
                        className="absolute inset-0 rounded-full bg-primary/20 blur-md"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                    
                    <AnimatePresence mode="wait">
                      {isCompleted ? (
                        <motion.div
                          key="check"
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 180 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Check className="h-6 w-6" />
                        </motion.div>
                      ) : step.icon ? (
                        <motion.div
                          key="icon"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="relative z-10"
                        >
                          {step.icon}
                        </motion.div>
                      ) : (
                        <motion.span
                          key="number"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="text-lg font-bold relative z-10"
                        >
                          {stepNumber}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Step Content */}
                  <motion.div 
                    className="mt-4 text-center max-w-[140px]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                  >
                    <h3 className={`text-sm font-semibold transition-colors ${
                      isCompleted || isCurrent ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {step.title}
                    </h3>
                    {step.description && (
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {step.description}
                      </p>
                    )}
                    
                    {/* Status Indicator */}
                    <div className="mt-2">
                      {isCompleted && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="inline-flex items-center text-xs text-primary font-medium"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Complete
                        </motion.div>
                      )}
                      {isCurrent && (
                        <motion.div
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="inline-flex items-center text-xs text-primary font-medium"
                        >
                          <div className="w-2 h-2 bg-primary rounded-full mr-2" />
                          In Progress
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Tablet Layout - Compact Horizontal */}
      <div className="hidden md:block lg:hidden">
        <div className="bg-card rounded-xl p-6 border border-border/50 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-medium text-foreground">
              Step {currentStep} of {steps.length}
            </div>
            <div className="text-xs text-muted-foreground">
              {Math.round(progressPercentage)}% Complete
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-border/30 rounded-full h-2 mb-6 overflow-hidden">
            <motion.div 
              className="gradient-cosmic h-full rounded-full shadow-sm glow-cyan"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>

          {/* Compact Steps */}
          <div className="flex items-center space-x-4 overflow-x-auto pb-2">
            {steps.map((step, index) => {
              const isCompleted = index < currentStep
              const isCurrent = index === currentStep
              const isClickable = onStepClick && (isCompleted || index <= currentStep)

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap ${
                    isCurrent ? 'bg-primary/10 border border-primary/30 glow-cyan' : 
                    isCompleted ? 'bg-card border border-primary/20' : 'bg-card border border-border'
                  } ${isClickable ? 'cursor-pointer hover:bg-primary/5' : ''}`}
                  onClick={() => isClickable && onStepClick(index)}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                    isCompleted ? 'bg-gradient-to-br from-primary to-secondary text-white' :
                    isCurrent ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-border text-muted-foreground'
                  }`}>
                    {isCompleted ? <Check className="h-3 w-3" /> : index + 1}
                  </div>
                  <span className={`text-sm font-medium ${
                    isCurrent || isCompleted ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {step.title}
                  </span>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Mobile Layout - Enhanced Vertical */}
      <div className="md:hidden">
        <div className="bg-card rounded-xl p-6 border border-border/50 shadow-sm">
          {/* Header with Progress */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-lg font-semibold text-foreground">
                {steps[currentStep - 1]?.title}
              </div>
              <div className="text-sm text-muted-foreground">
                Step {currentStep} of {steps.length}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {Math.round(progressPercentage)}%
              </div>
              <div className="text-xs text-muted-foreground">Complete</div>
            </div>
          </div>
          
          {/* Enhanced Progress Bar */}
          <div className="relative mb-6">
            <div className="w-full bg-border/30 rounded-full h-3 overflow-hidden">
              <motion.div 
                className="gradient-cosmic h-full rounded-full shadow-sm relative glow-cyan"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <motion.div
                  className="absolute inset-0 bg-white/20 rounded-full"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>
            </div>
          </div>

          {/* Current Step Icon */}
          <div className="text-center mb-6">
            <motion.div
              className="mx-auto w-16 h-16 bg-card rounded-2xl flex items-center justify-center border-2 border-primary shadow-lg glow-cyan"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {steps[currentStep - 1]?.icon || (
                <span className="text-xl font-bold text-primary">{currentStep}</span>
              )}
            </motion.div>
            
            <p className="text-sm text-muted-foreground mt-3">
              {steps[currentStep - 1]?.description}
            </p>
          </div>

          {/* Step Navigation List */}
          <div className="space-y-2">
            {steps.map((step, index) => {
              const stepNumber = index + 1
              const isCompleted = index < currentStep
              const isCurrent = index === currentStep
              const isClickable = onStepClick && (isCompleted || index <= currentStep)

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center space-x-3 p-3 rounded-xl transition-all ${
                    isCurrent ? 'bg-primary/10 border border-primary/30 glow-cyan' :
                    isCompleted ? 'bg-card border border-primary/20' : 'bg-card border border-border'
                  } ${isClickable ? 'cursor-pointer hover:bg-primary/10' : ''}`}
                  onClick={() => isClickable && onStepClick(index)}
                >
                  {/* Status Indicator */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                    isCompleted 
                      ? 'bg-gradient-to-br from-primary to-secondary text-white shadow-md glow-cyan' 
                      : isCurrent 
                        ? 'bg-primary/20 text-primary border-2 border-primary' 
                        : 'bg-border text-muted-foreground border border-border'
                  }`}>
                    {isCompleted ? (
                      <Check className="h-4 w-4" />
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
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {step.description}
                      </p>
                    )}
                  </div>

                  {/* Action Indicator */}
                  {isClickable && !isCurrent && (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                  
                  {isCurrent && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-2 h-2 bg-primary rounded-full"
                    />
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
