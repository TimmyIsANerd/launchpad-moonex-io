"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MultistepTokenForm } from "@/components/multistep-token-form"
import { useWallet } from "@/components/wallet-provider"
import { Wallet, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { parseEther, formatEther } from "viem"
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

export default function CreateTokenPage() {
  const [formData, setFormData] = useState<TokenFormData>({
    logo: null,
    name: "",
    ticker: "",
    description: "",
    raisedToken: "BNB",
    raiseAmount: "",
    website: "",
    twitter: "",
    telegram: "",
    category: "Meme",
    feeRecipient: "",
    feePercentage: 1.5,
  })

  const [errors, setErrors] = useState<Partial<TokenFormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [creationPhase, setCreationPhase] = useState<'idle' | 'validating' | 'uploading' | 'preparing' | 'deploying' | 'complete' | 'error'>('idle')
  const [tickerCheck, setTickerCheck] = useState<{
    loading: boolean
    available?: boolean
    message?: string
    suggestion?: string
  }>({ loading: false })
  const [estimatedCosts, setEstimatedCosts] = useState<{
    gasCost: string
    bnbCost: string
  } | null>(null)
  const { isConnected, address } = useWallet()

  // Auto-populate fee recipient with current wallet address
  useEffect(() => {
    if (address && !formData.feeRecipient) {
      setFormData({ ...formData, feeRecipient: address })
    }
  }, [address, formData.feeRecipient])

  // Check ticker availability when ticker changes
  useEffect(() => {
    const checkTicker = async () => {
      if (!formData.ticker || formData.ticker.length < 3) {
        setTickerCheck({ loading: false })
        return
      }

      setTickerCheck({ loading: true })
      try {
        const result = await moonexApi.checkTickerAvailability(formData.ticker)
        setTickerCheck({
          loading: false,
          available: result.available,
          message: result.available ? "Available!" : "Already taken",
          suggestion: result.suggestion
        })
        
        if (result.available && result.conflict) {
          toast.error(`Token "${result.conflict.existingName}" already uses ticker ${result.conflict.ticker}`)
        }
      } catch (error) {
        setTickerCheck({ 
          loading: false, 
          message: "Could not check availability" 
        })
      }
    }

    const timer = setTimeout(checkTicker, 500)
    return () => clearTimeout(timer)
  }, [formData.ticker])

  const validateForm = () => {
    const newErrors: Partial<TokenFormData> = {}

    // Debug logging for each validation
    console.log('Validating form data:', {
      name: formData.name,
      ticker: formData.ticker,
      description: formData.description,
      raiseAmount: formData.raiseAmount,
      feeRecipient: formData.feeRecipient,
      feePercentage: formData.feePercentage,
      logo: formData.logo ? 'File selected' : 'No file'
    })

    if (!formData.name.trim()) {
      newErrors.name = "Token name is required"
      console.log('❌ Name missing')
    } else {
      console.log('✅ Name valid')
    }

    if (!formData.ticker.trim()) {
      newErrors.ticker = "Token ticker is required"
      console.log('❌ Ticker missing')
    } else if (formData.ticker.length < 2) {
      newErrors.ticker = "Ticker must be at least 2 characters"
      console.log('❌ Ticker too short')
    } else {
      console.log('✅ Ticker valid')
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
      console.log('❌ Description missing')
    } else if (formData.description.length < 20) {
      newErrors.description = "Description must be at least 20 characters"
      console.log('❌ Description too short:', formData.description.length)
    } else {
      console.log('✅ Description valid')
    }

    if (!formData.raiseAmount || parseFloat(formData.raiseAmount) <= 0) {
      newErrors.raiseAmount = "Valid raise amount is required"
      console.log('❌ Raise amount invalid:', formData.raiseAmount)
    } else {
      try {
        // Convert ETH to Wei for validation - ensure it's a valid number
        const ethAmount = parseFloat(formData.raiseAmount)
        const weiAmount = parseEther(ethAmount.toString())
        console.log('✅ Raise amount valid:', `${ethAmount} ETH = ${weiAmount.toString()} Wei`)
      } catch (error) {
        newErrors.raiseAmount = "Invalid ETH amount format"
        console.log('❌ Raise amount parse error:', error)
      }
    }

    if (!formData.feeRecipient) {
      newErrors.feeRecipient = "Fee recipient address is required"
      console.log('❌ Fee recipient missing')
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(formData.feeRecipient)) {
      newErrors.feeRecipient = "Invalid wallet address format"
      console.log('❌ Fee recipient invalid format')
    } else {
      console.log('✅ Fee recipient valid')
    }

    if (formData.feePercentage < 1 || formData.feePercentage > 3) {
      newErrors.feePercentage = "Fee percentage must be between 1% and 3%"
      console.log('❌ Fee percentage invalid:', formData.feePercentage)
    } else {
      console.log('✅ Fee percentage valid')
    }

    setErrors(newErrors)
    const isValid = Object.keys(newErrors).length === 0
    console.log('Final validation result:', isValid ? '✅ VALID' : '❌ INVALID', 'Errors:', newErrors)
    return isValid
  }

  const estimateCosts = async () => {
    try {
      const raiseAmount = parseFloat(formData.raiseAmount)
      if (!raiseAmount) return

      const estimatedGasCost = "0.005" // Placeholder
      const platformFeeAmount = raiseAmount * 0.02 // 2% platform fee
      
      setEstimatedCosts({
        gasCost: estimatedGasCost,
        bnbCost: (platformFeeAmount + parseFloat(estimatedGasCost)).toFixed(4)
      })
    } catch (error) {
      console.error('Failed to estimate costs:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isConnected) {
      toast.error("Please connect your wallet first")
      return
    }

    const validationResult = validateForm()
    console.log('Form validation result:', validationResult)
    console.log('Current errors:', errors)
    console.log('Form data:', formData)
    
    if (!validationResult) {
      // Use setTimeout to ensure errors state is updated before showing toast
      setTimeout(() => {
        const errorMessages = Object.values(errors).filter(Boolean)
        console.log('Validation errors (after state update):', errorMessages)
        if (errorMessages.length > 0) {
          toast.error(`Please fix the errors above: ${errorMessages.join(', ')}`)
        } else {
          toast.error("Please complete all required fields")
        }
      }, 100)
      return
    }

    if (tickerCheck.available === false) {
      toast.error("Please choose a different ticker symbol")
      return
    }

    setIsSubmitting(true)
    setCreationPhase('validating')

    try {
      // Set phases
      setCreationPhase('uploading')
      
      // Prepare upload data
      const ethAmount = parseFloat(formData.raiseAmount)
      
      console.log(`Submitting raise amount: ${ethAmount} ETH`)
      console.log(`In Wei (for smart contracts): ${parseEther(ethAmount.toString()).toString()}`)
      
      setCreationPhase('preparing')
      
      // Upload logo first if provided
      let logoUri = null
      if (formData.logo) {
        try {
          console.log('Uploading logo file...')
          const uploadResult = await moonexApi.uploadFile(formData.logo)
          logoUri = uploadResult.data[0]?.url
          console.log('Logo uploaded:', logoUri)
        } catch (error) {
          console.warn('Failed to upload logo:', error)
          // Continue without logo rather than failing
        }
      }

      const launchData: LaunchPreparationData = {
        name: formData.name,
        ticker: formData.ticker,
        description: formData.description,
        logoUri: logoUri,
        feeRecipient: formData.feeRecipient,
        feePercentage: formData.feePercentage,
        category: formData.category,
        website: formData.website,
        twitter: formData.twitter,
        telegram: formData.telegram,
        creatorAddress: address || '',
      }

      console.log('Submitting launch data:', launchData)
      
      // Start token creation process
      const result = await moonexApi.prepareLaunch(launchData)
      
      setCreationPhase('deploying')
      
      // Continue with deployment (placeholder for actual deployment logic)
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate deployment
      
      setCreationPhase('complete')
      toast.success("Token created successfully!")
      
      // Redirect to token page or reset form
      console.log("Token creation complete:", result)
      
    } catch (error) {
      console.error("Token creation failed:", error)
      setCreationPhase('error')
      toast.error(error instanceof Error ? error.message : "Token creation failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Create Your Token
            </h1>
            <p className="text-lg text-muted-foreground">
              Launch your meme token on MoonEx with our easy-to-use platform
            </p>
          </div>

          {/* Wallet Connection Status */}
          <Card className="mb-8 border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Wallet className="h-6 w-6 text-primary" />
                  <div>
                    <h3 className="font-semibold text-foreground">Wallet Connection</h3>
                    <p className="text-sm text-muted-foreground">
                      {isConnected ? "Wallet connected successfully" : "Connect your wallet to launch tokens"}
                    </p>
                  </div>
                </div>
                {isConnected ? (
                  <Badge className="bg-green-500 text-white">Connected</Badge>
                ) : (
                  <Badge variant="secondary">Not Connected</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Multistep Token Creation Form */}
          <MultistepTokenForm
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            isSubmitting={isSubmitting}
            creationPhase={creationPhase}
            tickerCheck={tickerCheck}
            estimatedCosts={estimatedCosts}
            isConnected={isConnected}
            address={address}
            onSubmit={handleSubmit}
            onEstimateCosts={() => {
              if (formData.raiseAmount) {
                const estimatedCosts = {
                  gasCost: "0.005", // Placeholder value
                  bnbCost: "0.01"   // Placeholder value
                }
                setEstimatedCosts(estimatedCosts)
              }
            }}
          />

          {/* Important Notice */}
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mt-8">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <h4 className="font-semibold text-destructive mb-1">Important Notice</h4>
                <p className="text-sm text-destructive/80">
                  Token creation is irreversible. Please double-check all information before launching. Ensure you
                  have sufficient BNB for gas fees and initial liquidity.
                </p>
              </div>
            </div>
          </div>

          {/* Progress Indicator - Show when not idle */}
          {creationPhase !== 'idle' && (
            <Card className="border-border mt-8">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Token Creation Progress</span>
                    <span className="text-xs text-muted-foreground">
                      {creationPhase === 'validating' && 'Validating form...'}
                      {creationPhase === 'uploading' && 'Uploading logo...'}
                      {creationPhase === 'preparing' && 'Preparing launch data...'}
                      {creationPhase === 'deploying' && 'Deploying to blockchain...'}
                      {creationPhase === 'complete' && 'Complete!'}
                      {creationPhase === 'error' && 'Error occurred'}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        creationPhase === 'complete' ? 'bg-green-500 w-full' :
                        creationPhase === 'error' ? 'bg-red-500 w-full' :
                        'bg-primary'
                      }`}
                      style={{ 
                        width: creationPhase === 'validating' ? '20%' :
                               creationPhase === 'uploading' ? '40%' :
                               creationPhase === 'preparing' ? '70%' :
                               creationPhase === 'deploying' ? '90%' :
                               '100%'
                      }}
                    ></div>
                  </div>
                  {estimatedCosts && (
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Estimated Gas: {estimatedCosts.gasCost}</span>
                      <span>Estimated Cost: {estimatedCosts.bnbCost} BNB</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}