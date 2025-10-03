"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { SquareImageUpload } from "@/components/square-image-upload"
import { EnhancedStepIndicator } from "@/components/enhanced-step-indicator"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Wallet, 
  Rocket, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight,
  Image,
  Type,
  DollarSign,
  Globe,
  Settings,
  CheckCircle,
  Sparkles,
  Shield,
  TrendingUp
} from "lucide-react"
import { toast } from "sonner"
import { parseEther } from "viem"
import { moonexApi, type LaunchPreparationData } from "@/lib/moonex-api"

interface TokenFormData {
  logo: File | null
  name: string
  ticker: string
  description: string
  raisedToken: string
  raiseAmount: string
  website: string
  twitter: string
  telegram: string
  category: string
  feeRecipient: string
  feePercentage: number
}

const formSteps = [
  {
    id: 'wallet',
    title: 'Wallet',
    description: 'Connect wallet',
    icon: <Wallet className="h-5 w-5" />
  },
  {
    id: 'logo',
    title: 'Logo',
    description: 'Upload image',
    icon: <Image className="h-5 w-5" />
  },
  {
    id: 'details',
    title: 'Details',
    description: 'Basic info',
    icon: <Type className="h-5 w-5" />
  },
  {
    id: 'funding',
    title: 'Funding',
    description: 'Raise goals',
    icon: <DollarSign className="h-5 w-5" />
  },
  {
    id: 'social',
    title: 'Social',
    description: 'Links',
    icon: <Globe className="h-5 w-5" />
  },
  {
    id: 'config',
    title: 'Config',
    description: 'Fees',
    icon: <Settings className="h-5 w-5" />
  },
  {
    id: 'review',
    title: 'Review',
    description: 'Final check',
    icon: <CheckCircle className="h-5 w-5" />
  }
]

interface MultistepTokenFormProps {
  formData: TokenFormData
  setFormData: (data: TokenFormData) => void
  errors: Partial<TokenFormData>
  isSubmitting: boolean
  creationPhase: 'idle' | 'validating' | 'uploading' | 'preparing' | 'deploying' | 'complete' | 'error'
  tickerCheck: { loading: boolean; available?: boolean; message?: string; suggestion?: string }
  estimatedCosts: { gasCost: string; bnbCost: string } | null
  isConnected: boolean
  address?: string
  onSubmit: (e: React.FormEvent) => void
  onEstimateCosts: () => void
}

export function MultistepTokenForm({
  formData,
  setFormData,
  errors,
  isSubmitting,
  creationPhase,
  tickerCheck,
  estimatedCosts,
  isConnected,
  address,
  onSubmit,
  onEstimateCosts
}: MultistepTokenFormProps) {
  const [currentStep, setCurrentStep] = useState(1) // Start from step 1 (logo)

  const canProceed = () => {
    // Use simplified validation for UI state (no toast messages)
    switch (currentStep) {
      case 1: return isConnected
      case 2: return formData.logo !== null
      case 3: return formData.name?.trim() && formData.ticker?.trim() && formData.description?.trim() && formData.ticker.length >= 2 && formData.description.length >= 20 && tickerCheck.available !== false
      case 4: return true // Fixed raise amount of 18 BNB
      case 5: return true
      case 6: return formData.feeRecipient && /^0x[a-fA-F0-9]{40}$/.test(formData.feeRecipient) && formData.feePercentage >= 1 && formData.feePercentage <= 3
      case 7: return true
      default: return true
    }
  }

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1: // Wallet step
        if (!isConnected) {
          toast.error("🔗 Please connect your wallet to continue")
          return false
        }
        return true

      case 2: // Logo step
        if (!formData.logo) {
          toast.error("📷 Please upload a token logo to continue")
          return false
        }
        return true

      case 3: // Details step
        if (!formData.name?.trim()) {
          toast.error("📝 Please enter a token name to continue")
          return false
        }
        if (!formData.ticker?.trim()) {
          toast.error("🏷️ Please enter a token symbol to continue")
          return false
        } else if (formData.ticker.length < 2) {
          toast.error("🏷️ Token symbol must be at least 2 characters")
          return false
        }
        if (!formData.description?.trim()) {
          toast.error("📄 Please enter a token description to continue")
          return false
        } else if (formData.description.length < 20) {
          toast.error("📄 Please enter a description with at least 20 characters")
          return false
        }
        if (tickerCheck.available === false) {
          toast.error("🚫 This token symbol is already taken, please choose another")
          return false
        }
        return true

      case 4: // Funding step
        // Fixed raise amount of 18 BNB - always valid
        return true

      case 5: // Social step
        return true // Social links are optional

      case 6: // Config step
        if (!formData.feeRecipient) {
          toast.error("🏦 Please enter a fee recipient address to continue")
          return false
        } else if (!/^0x[a-fA-F0-9]{40}$/.test(formData.feeRecipient)) {
          toast.error("🏦 Please enter a valid wallet address (0x...)")
          return false
        }
        if (formData.feePercentage < 1 || formData.feePercentage > 3) {
          toast.error("⚙️ Please set a fee percentage between 1% and 3%")
          return false
        }
        return true

      case 7: // Review step
        return true

      default:
        return true
    }
  }

  const nextStep = () => {
    if (!validateCurrentStep()) {
      return // Block navigation if validation fails
    }
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Wallet Connection Status
        return (
          <div className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-6"
            >
              <motion.div 
                className="mx-auto w-24 h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center border border-primary/20 shadow-lg"
                animate={{ 
                  boxShadow: isConnected 
                    ? "0 0 30px rgba(34, 197, 94, 0.3)" 
                    : "0 0 20px rgba(59, 130, 246, 0.2)" 
                }}
                transition={{ duration: 0.5 }}
              >
                <Wallet className="h-12 w-12 text-primary" />
              </motion.div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-foreground">
                  {isConnected ? "Wallet Connected!" : "Connect Your Wallet"}
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                  {isConnected 
                    ? "Great! Your wallet is connected and ready to create tokens on MoonEx" 
                    : "Connect your wallet to create and launch tokens on the MoonEx platform"
                  }
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className={`border-2 transition-all duration-300 ${
                isConnected 
                  ? "border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20" 
                  : "border-border/50 bg-card/50"
              }`}>
                <CardContent className="p-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        isConnected 
                          ? "bg-green-100 dark:bg-green-900/30" 
                          : "bg-primary/10"
                      }`}>
                        {isConnected ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3, type: "spring" }}
                          >
                            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                          </motion.div>
                        ) : (
                          <Wallet className="h-6 w-6 text-primary" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground text-lg">
                          {isConnected ? "Wallet Connected" : "Wallet Connection"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {isConnected 
                            ? `Connected to ${address?.slice(0, 6)}...${address?.slice(-4)}` 
                            : "Connect your wallet to launch tokens"
                          }
                        </p>
                      </div>
                    </div>
                    
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      {isConnected ? (
                        <Badge className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 text-sm font-medium">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Connected
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="px-4 py-2 text-sm">
                          Not Connected
                        </Badge>
                      )}
                    </motion.div>
                  </div>
                  
                  {isConnected && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ delay: 0.5 }}
                      className="mt-6 pt-6 border-t border-border/50"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center space-x-2 text-sm">
                          <Shield className="h-4 w-4 text-green-500" />
                          <span className="text-muted-foreground">Secure Connection</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <TrendingUp className="h-4 w-4 text-blue-500" />
                          <span className="text-muted-foreground">Ready to Deploy</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <Sparkles className="h-4 w-4 text-purple-500" />
                          <span className="text-muted-foreground">MoonEx Platform</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {!isConnected && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-center"
              >
                <p className="text-sm text-muted-foreground">
                  Don't have a wallet? We recommend{" "}
                  <a href="https://metamask.io" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    MetaMask
                  </a>{" "}
                  or{" "}
                  <a href="https://walletconnect.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    WalletConnect
                  </a>
                </p>
              </motion.div>
            )}
          </div>
        )

      case 2: // Logo Upload
        return (
          <div className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-6"
            >
              <motion.div 
                className="mx-auto w-24 h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center border border-primary/20 shadow-lg"
                animate={{ 
                  boxShadow: formData.logo 
                    ? "0 0 30px rgba(34, 197, 94, 0.3)" 
                    : "0 0 20px rgba(59, 130, 246, 0.2)" 
                }}
                transition={{ duration: 0.5 }}
              >
                <Image className="h-12 w-12 text-primary" />
              </motion.div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-foreground">Upload Token Logo</h3>
                <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Upload a high-quality logo that represents your token. This will be displayed across the platform.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="max-w-md mx-auto"
            >
              <SquareImageUpload
                onFileSelect={(file) => setFormData({ ...formData, logo: file })}
                accept="image/*"
                maxSize={5}
                recommendedSize={{ width: 500, height: 500 }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-muted/30 rounded-xl p-6 border border-border/30"
            >
              <h4 className="font-semibold text-foreground mb-3 flex items-center">
                <Sparkles className="h-5 w-5 text-primary mr-2" />
                Logo Guidelines
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Square format (1:1 ratio)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Minimum 500×500px</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>PNG, JPG, or SVG format</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span>High contrast design</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span>Clear and recognizable</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span>Maximum 5MB file size</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )

      case 3: // Basic Details
        return (
          <div className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-6"
            >
              <motion.div 
                className="mx-auto w-24 h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center border border-primary/20 shadow-lg"
                animate={{ 
                  boxShadow: (formData.name && formData.ticker && formData.description.length >= 20)
                    ? "0 0 30px rgba(34, 197, 94, 0.3)" 
                    : "0 0 20px rgba(59, 130, 246, 0.2)" 
                }}
                transition={{ duration: 0.5 }}
              >
                <Type className="h-12 w-12 text-primary" />
              </motion.div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-foreground">Token Details</h3>
                <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Provide essential information about your token that will be displayed to potential investors.
                </p>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-6"
              >
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-base font-semibold flex items-center">
                    Token Name *
                    <span className="ml-2 text-xs text-muted-foreground">(Public display name)</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Moon Doge"
                    className={`h-12 text-lg ${errors.name ? "border-destructive focus:border-destructive" : "border-border/50 focus:border-primary"} transition-all duration-200`}
                  />
                  {errors.name && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-destructive flex items-center"
                    >
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.name}
                    </motion.p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="ticker" className="text-base font-semibold flex items-center">
                    Token Symbol *
                    <span className="ml-2 text-xs text-muted-foreground">(Trading symbol)</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="ticker"
                      value={formData.ticker}
                      onChange={(e) => setFormData({ ...formData, ticker: e.target.value.toUpperCase() })}
                      placeholder="e.g., MOONDOGE"
                      className={`h-12 text-lg font-mono ${
                        errors.ticker ? "border-destructive focus:border-destructive" : 
                        tickerCheck.available ? "border-green-500 focus:border-green-500" : 
                        tickerCheck.available === false ? "border-destructive focus:border-destructive" : 
                        "border-border/50 focus:border-primary"
                      } transition-all duration-200`}
                    />
                    {tickerCheck.loading && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full"
                        />
                      </div>
                    )}
                  </div>
                  
                  <AnimatePresence>
                    {errors.ticker && (
                      <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-sm text-destructive flex items-center"
                      >
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.ticker}
                      </motion.p>
                    )}
                    
                    {tickerCheck.message && (
                      <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`text-sm flex items-center ${
                          tickerCheck.available ? 'text-green-600' : 'text-destructive'
                        }`}
                      >
                        {tickerCheck.available ? (
                          <CheckCircle className="h-4 w-4 mr-1" />
                        ) : (
                          <AlertCircle className="h-4 w-4 mr-1" />
                        )}
                        {tickerCheck.message}
                      </motion.p>
                    )}
                    
                    {tickerCheck.suggestion && (
                      <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-sm text-blue-600 flex items-center"
                      >
                        <Sparkles className="h-4 w-4 mr-1" />
                        Suggestion: {tickerCheck.suggestion}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-6"
              >
                <div className="space-y-3">
                  <Label htmlFor="description" className="text-base font-semibold flex items-center">
                    Token Description *
                    <span className="ml-2 text-xs text-muted-foreground">(Min. 20 characters)</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your token's purpose, utility, and what makes it unique. This will help investors understand your project..."
                    className={`min-h-[120px] text-base resize-none ${
                      errors.description ? "border-destructive focus:border-destructive" : "border-border/50 focus:border-primary"
                    } transition-all duration-200`}
                  />
                  <div className="flex justify-between items-center">
                    {errors.description ? (
                      <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-destructive flex items-center"
                      >
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.description}
                      </motion.p>
                    ) : (
                      <div />
                    )}
                    <p className={`text-xs transition-colors ${
                      formData.description.length >= 20 ? 'text-green-600' : 'text-muted-foreground'
                    }`}>
                      {formData.description.length}/20 characters
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="category" className="text-base font-semibold">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className="h-12 text-base border-border/50 focus:border-primary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Meme">🎭 Meme Coin</SelectItem>
                      <SelectItem value="Utility">🔧 Utility Token</SelectItem>
                      <SelectItem value="DeFi">💰 DeFi Protocol</SelectItem>
                      <SelectItem value="NFT">🎨 NFT Collection</SelectItem>
                      <SelectItem value="Gaming">🎮 Gaming</SelectItem>
                      <SelectItem value="Other">📦 Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>
            </div>
          </div>
        )

      case 4: // Funding
        return (
          <div className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-6"
            >
              <motion.div 
                className="mx-auto w-24 h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center border border-primary/20 shadow-lg"
                animate={{ 
                  boxShadow: "0 0 30px rgba(34, 197, 94, 0.3)"
                }}
                transition={{ duration: 0.5 }}
              >
                <DollarSign className="h-12 w-12 text-primary" />
              </motion.div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-foreground">Funding Configuration</h3>
                <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Standard funding configuration for MoonEx token launches
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="max-w-2xl mx-auto"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="raisedToken" className="text-base font-semibold flex items-center">
                    Raised Token
                    <span className="ml-2 text-xs text-muted-foreground">(Fixed)</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="raisedToken"
                      value="BNB"
                      disabled
                      className="h-12 text-lg font-semibold bg-muted/50 cursor-not-allowed"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-white">B</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    All MoonEx tokens raise funds in BNB (Binance Coin)
                  </p>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="raiseAmount" className="text-base font-semibold flex items-center">
                    Raise Amount
                    <span className="ml-2 text-xs text-muted-foreground">(Standard)</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="raiseAmount"
                      value="18"
                      disabled
                      className="h-12 text-lg font-semibold bg-muted/50 cursor-not-allowed"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <span className="text-sm font-medium text-muted-foreground">BNB</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Standard raise amount for fair token distribution
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Enhanced Information Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-border/50 bg-gradient-to-br from-card to-card/80">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3 text-lg">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-primary" />
                    </div>
                    <span>Funding Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                        <span className="text-sm font-medium">Total Raise Goal:</span>
                        <span className="text-lg font-bold text-primary">18 BNB</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                        <span className="text-sm font-medium">Platform Fee:</span>
                        <span className="text-sm font-semibold">{formData.feePercentage}%</span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                        <span className="text-sm font-medium">Estimated Gas:</span>
                        <span className="text-sm font-semibold">~0.005 BNB</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                        <span className="text-sm font-medium">Network:</span>
                        <span className="text-sm font-semibold">BSC Mainnet</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50/50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200/50 dark:border-blue-800/50">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Why 18 BNB?
                    </h4>
                    <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                      The 18 BNB standard ensures fair token distribution, provides sufficient initial liquidity, 
                      and maintains consistency across all MoonEx launches for a better user experience.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )

      case 5: // Social Links
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <Globe className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">Social Links</h3>
                <p className="text-muted-foreground">
                  Add your token's social presence (Optional)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <Label htmlFor="website">Website URL</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://yourtoken.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter Handle</Label>
                <Input
                  id="twitter"
                  value={formData.twitter}
                  onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                  placeholder="@yourtoken"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telegram">Telegram Link</Label>
                <Input
                  id="telegram"
                  value={formData.telegram}
                  onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
                  placeholder="https://t.me/yourtoken"
                />
              </div>
            </div>
          </div>
        )

      case 6: // Configuration
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <Settings className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">Fee Configuration</h3>
                <p className="text-muted-foreground">
                  Configure platform fees and recipient address
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="feeRecipient">Fee Recipient Address *</Label>
                  {address && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData({ ...formData, feeRecipient: address })}
                      className="text-xs"
                    >
                      Use Wallet
                    </Button>
                  )}
                </div>
                <Input
                  id="feeRecipient"
                  value={formData.feeRecipient}
                  onChange={(e) => setFormData({ ...formData, feeRecipient: e.target.value })}
                  placeholder="0x..."
                  className={errors.feeRecipient ? "border-destructive" : ""}
                />
                {errors.feeRecipient && (
                  <p className="text-sm text-destructive">{errors.feeRecipient}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="feePercentage">Platform Fee Percentage *</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="feePercentage"
                    type="number"
                    step="0.1"
                    value={formData.feePercentage}
                    onChange={(e) => setFormData({ ...formData, feePercentage: parseFloat(e.target.value) })}
                    className={`flex-1 ${errors.feePercentage ? "border-destructive" : ""}`}
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
                {errors.feePercentage && (
                  <p className="text-sm text-destructive">{errors.feePercentage}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Default: 1.5% (Recommended range: 0.5% - 5%)
                </p>
              </div>
            </div>
          </div>
        )

      case 7: // Review & Submit
        return (
          <div className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-6"
            >
              <motion.div 
                className="mx-auto w-24 h-24 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-2xl flex items-center justify-center border border-green-200 dark:border-green-800 shadow-lg"
                animate={{ 
                  boxShadow: "0 0 30px rgba(34, 197, 94, 0.3)"
                }}
                transition={{ duration: 0.5 }}
              >
                <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
              </motion.div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-foreground">Ready to Launch!</h3>
                <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Review your token details one final time before deploying to the blockchain.
                </p>
              </div>
            </motion.div>

            {/* Enhanced Review Summary */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-border/50 shadow-lg bg-gradient-to-br from-card to-card/80">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-3 text-xl">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                      <Rocket className="h-5 w-5 text-primary" />
                    </div>
                    <span>Token Summary</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Token Identity Section */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-foreground border-b border-border/50 pb-2">Token Identity</h4>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {formData.logo && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 }}
                          className="space-y-3"
                        >
                          <Label className="text-sm font-medium text-muted-foreground">Logo</Label>
                          <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted shadow-md border border-border/50">
                            <img 
                              src={URL.createObjectURL(formData.logo)} 
                              alt="Token logo" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </motion.div>
                      )}
                      
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-muted-foreground">Token Name</Label>
                        <p className="text-lg font-semibold text-foreground">{formData.name}</p>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-muted-foreground">Symbol</Label>
                        <div className="inline-flex items-center bg-primary/10 border border-primary/20 px-3 py-2 rounded-lg">
                          <span className="text-sm font-mono font-bold text-primary">{formData.ticker}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Token Details Section */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-foreground border-b border-border/50 pb-2">Token Details</h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-muted-foreground">Category</Label>
                        <div className="inline-flex items-center bg-muted/50 px-3 py-2 rounded-lg">
                          <span className="text-sm font-medium">{formData.category}</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-muted-foreground">Raise Goal</Label>
                        <p className="text-lg font-semibold text-foreground">
                          {formData.raiseAmount} {formData.raisedToken}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                      <div className="bg-muted/30 rounded-lg p-4 border border-border/30">
                        <p className="text-sm text-foreground leading-relaxed">
                          {formData.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Configuration Section */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-foreground border-b border-border/50 pb-2">Configuration</h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-muted-foreground">Platform Fee</Label>
                        <p className="text-lg font-semibold text-foreground">{formData.feePercentage}%</p>
                      </div>
                      
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-muted-foreground">Fee Recipient</Label>
                        <p className="text-sm font-mono text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
                          {formData.feeRecipient.slice(0, 6)}...{formData.feeRecipient.slice(-4)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Social Links Section */}
                  {(formData.website || formData.twitter || formData.telegram) && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-foreground border-b border-border/50 pb-2">Social Presence</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {formData.website && (
                          <div className="flex items-center space-x-2 text-sm bg-muted/30 px-3 py-2 rounded-lg">
                            <Globe className="h-4 w-4 text-blue-500" />
                            <span className="truncate">{formData.website}</span>
                          </div>
                        )}
                        {formData.twitter && (
                          <div className="flex items-center space-x-2 text-sm bg-muted/30 px-3 py-2 rounded-lg">
                            <span className="text-blue-400">🐦</span>
                            <span className="truncate">{formData.twitter}</span>
                          </div>
                        )}
                        {formData.telegram && (
                          <div className="flex items-center space-x-2 text-sm bg-muted/30 px-3 py-2 rounded-lg">
                            <span className="text-blue-500">💬</span>
                            <span className="truncate">{formData.telegram}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Enhanced Launch Button */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center space-y-4"
            >
              <Button
                type="button"
                onClick={onSubmit}
                disabled={!canProceed() || isSubmitting}
                className="px-12 py-4 text-lg bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg hover:shadow-xl transition-all duration-200 group"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3"
                    />
                    {creationPhase === 'validating' && 'Validating Details...'}
                    {creationPhase === 'uploading' && 'Uploading Assets...'}
                    {creationPhase === 'preparing' && 'Preparing Launch...'}
                    {creationPhase === 'deploying' && 'Deploying to Blockchain...'}
                    {(creationPhase === 'complete' || creationPhase === 'idle') && 'Creating Token...'}
                  </>
                ) : (
                  <>
                    <Rocket className="h-5 w-5 mr-3 group-hover:translate-y-[-2px] transition-transform" />
                    Launch Token on MoonEx
                  </>
                )}
              </Button>
              
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                By launching your token, you agree to MoonEx's terms of service and confirm that all information provided is accurate.
              </p>
            </motion.div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Step Indicator */}
      <EnhancedStepIndicator 
        steps={formSteps} 
        currentStep={currentStep}
        onStepClick={(stepIndex) => {
          // Only allow clicking on completed steps or the next immediate step
          if (stepIndex <= currentStep || (stepIndex === currentStep + 1 && canProceed())) {
            setCurrentStep(stepIndex)
          }
        }}
      />

      {/* Step Content with Enhanced Animation */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <Card className="border-border/50 shadow-lg bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
          <CardContent className="p-8 lg:p-12">
            {renderStepContent()}
          </CardContent>
        </Card>
      </motion.div>

      {/* Enhanced Navigation */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1 || isSubmitting}
          className="px-8 py-3 border-border/50 hover:bg-muted/50 transition-all duration-200 group"
        >
          <ChevronLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          <span className="hidden sm:inline">Previous Step</span>
          <span className="sm:hidden">Back</span>
        </Button>

        {currentStep < 7 ? (
          <Button
            type="button"
            onClick={nextStep}
            disabled={!canProceed() || isSubmitting}
            className="px-8 py-3 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg hover:shadow-xl transition-all duration-200 flex-1 sm:flex-none sm:min-w-[200px] group"
          >
            <span className="hidden sm:inline">Continue to {formSteps[currentStep]?.title}</span>
            <span className="sm:hidden">Next Step</span>
            <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        ) : null}
      </div>

      {/* Enhanced Mobile Helper */}
      {currentStep < 7 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-gradient-to-r from-muted/30 to-muted/50 rounded-xl p-4 border border-border/30"
        >
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <p className="text-sm text-muted-foreground">
              {canProceed() 
                ? `Ready to continue to ${formSteps[currentStep]?.title}` 
                : "Complete all required fields to proceed"
              }
            </p>
          </div>
        </motion.div>
      )}
    </div>
  )
}
