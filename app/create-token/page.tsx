"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileUpload } from "@/components/file-upload"
import { Badge } from "@/components/ui/badge"
import { useWallet } from "@/components/wallet-provider"
import { Wallet, Rocket, AlertCircle } from "lucide-react"
import { toast } from "sonner"
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

    const debounceTimer = setTimeout(checkTicker, 500)
    return () => clearTimeout(debounceTimer)
  }, [formData.ticker])

  const validateForm = () => {
    const newErrors: Partial<TokenFormData> = {}

    if (!formData.name.trim()) newErrors.name = "Token name is required"
    if (!formData.ticker.trim()) newErrors.ticker = "Ticker symbol is required"
    if (!formData.description.trim()) newErrors.description = "Description is required"
    if (!formData.raiseAmount.trim()) newErrors.raiseAmount = "Raise amount is required"

    // Validate ticker format (uppercase, no spaces, 3-10 chars)
    if (formData.ticker && !/^[A-Z]{3,10}$/.test(formData.ticker)) {
      newErrors.ticker = "Ticker must be 3-10 uppercase letters"
    }

    // Validate raise amount is a number
    if (formData.raiseAmount && isNaN(Number(formData.raiseAmount))) {
      newErrors.raiseAmount = "Raise amount must be a valid number"
    }

    // Validate fee recipient address
    if (!formData.feeRecipient.trim()) {
      newErrors.feeRecipient = "Fee recipient address is required"
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(formData.feeRecipient)) {
      newErrors.feeRecipient = "Invalid Ethereum address format"
    }

    // Validate fee percentage (1-3%)
    if (formData.feePercentage < 1 || formData.feePercentage > 3) {
      newErrors.feePercentage = "Fee percentage must be between 1% and 3%"
    }

    // Check ticker availability
    if (formData.ticker && tickerCheck.available === false) {
      newErrors.ticker = "Ticker is not available"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isConnected) {
      toast.error("Please connect your wallet first")
      return
    }

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setCreationPhase('validating')

    try {
      // Step 1: Validate and check ticker availability
      if (tickerCheck.available === false) {
        throw new Error("Selected ticker is not available")
      }

      setCreationPhase('uploading')
      let logoUri: string | undefined

      // Step 2: Upload logo if provided
      if (formData.logo) {
        toast.info("Uploading token logo...")
        try {
          const uploadResult = await moonexApi.uploadFile(formData.logo)
          logoUri = uploadResult.data[0]?.url
          toast.success("Logo uploaded successfully!")
        } catch (uploadError) {
          toast.warning("Logo upload failed, continuing without logo...")
          console.warn("Logo upload failed:", uploadError)
        }
      }

      setCreationPhase('preparing')
      toast.info("Preparing token launch data...")

      // Step 3: Prepare launch data offline
      const launchData: LaunchPreparationData = {
        name: formData.name.trim(),
        ticker: formData.ticker.trim().toUpperCase(),
        desc: formData.description.trim(),
        logoUri,
        feeRecipient: formData.feeRecipient.toLowerCase(),
        feePercentage: formData.feePercentage,
        category: formData.category,
        website: formData.website.trim() || undefined,
        twitter: formData.twitter.trim() || undefined,
        telegram: formData.telegram.trim() || undefined,
        creatorAddress: address!
      }

      console.log('Preparing launch with data:', launchData)
      
      // Prepare the launch
      const preparationResult = await moonexApi.prepareLaunch(launchData)
      const memeData = preparationResult.data
      
      // Set estimated costs from preparation
      const launchStatus = memeData.launchStatus as any
      if (launchStatus?.estimatedGasCost && launchStatus?.estimatedBNBCost) {
        setEstimatedCosts({
          gasCost: launchStatus.estimatedGasCost,
          bnbCost: launchStatus.estimatedBNBCost
        })
      }

      setCreationPhase('deploying')
      toast.info("Token prepared! Ready for blockchain deployment.", {
        description: `Estimated cost: ${estimatedCosts?.bnbCost || '0.015'} BNB`,
        action: {
          label: "Continue with deployment",
          onClick: () => {
            setCreationPhase('complete')
            toast.success(`Token ${formData.name} (${formData.ticker}) prepared successfully!`)
            
            console.log("Launch data prepared:", {
              ...memeData,
              nextSteps: "Smart contract deployment and blockchain integration",
              estimatedCosts
            })
          }
        }
      })
      
      setCreationPhase('complete')
      
      // Reset form
      setFormData({
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
      
      // Reset states
      setEstimatedCosts(null)
      setTickerCheck({ loading: false })
      
    } catch (error: any) {
      setCreationPhase('error')
      
      // Handle specific error types
      if (error.message.includes('409') || error.message.includes('conflict')) {
        toast.error("Token ticker is already in use. Please choose a different ticker.")
        setTickerCheck({ loading: false, available: false, message: "Already taken" })
      } else if (error.message.includes('Missing required fields')) {
        toast.error("Please fill in all required fields.")
      } else {
        toast.error("Failed to prepare token launch. Please try again.")
        console.error("Launch preparation failed:", error)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-cosmic text-glow-cyan">Launch Your Token</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Create and launch your meme token on BNB Chain. Fair launch, community-driven, pump to the moon.
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

          {/* Token Creation Form */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Rocket className="h-6 w-6 text-secondary" />
                <span>Token Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Logo Upload */}
                <div className="space-y-2">
                  <Label htmlFor="logo">Token Logo</Label>
                  <FileUpload
                    onFileSelect={(file) => setFormData({ ...formData, logo: file })}
                    accept="image/*"
                    maxSize={5}
                  />
                  <p className="text-xs text-muted-foreground">
                    Upload your token logo (PNG, JPEG, WEBP, GIF, max 5MB)
                  </p>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Token Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., MoonDog"
                      className={errors.name ? "border-destructive" : ""}
                    />
                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ticker">Ticker Symbol *</Label>
                    <div className="relative">
                      <Input
                        id="ticker"
                        value={formData.ticker}
                        onChange={(e) => setFormData({ ...formData, ticker: e.target.value.toUpperCase() })}
                        placeholder="e.g., MOONDOG"
                        className={errors.ticker ? "border-destructive" : ""}
                      />
                      {/* Ticker availability indicator */}
                      {formData.ticker && tickerCheck.loading && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                      {formData.ticker && !tickerCheck.loading && tickerCheck.available !== undefined && (
                        <div className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full ${
                          tickerCheck.available ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                      )}
                    </div>
                    {errors.ticker && <p className="text-sm text-destructive">{errors.ticker}</p>}
                    {formData.ticker && !tickerCheck.loading && tickerCheck.message && (
                      <p className={`text-sm ${
                        tickerCheck.available ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {tickerCheck.message}
                      </p>
                    )}
                    {formData.ticker && tickerCheck.suggestion && !tickerCheck.available && (
                      <p className="text-sm text-muted-foreground">
                        Suggested: {tickerCheck.suggestion}
                      </p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your token and its purpose..."
                    rows={4}
                    className={errors.description ? "border-destructive" : ""}
                  />
                  {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                </div>

                {/* Fundraising */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="raisedToken">Raised Token</Label>
                    <Select
                      value={formData.raisedToken}
                      onValueChange={(value) => setFormData({ ...formData, raisedToken: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BNB">BNB</SelectItem>
                        <SelectItem value="USDT">USDT</SelectItem>
                        <SelectItem value="BUSD">BUSD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="raiseAmount">Raise Amount *</Label>
                    <Input
                      id="raiseAmount"
                      type="number"
                      step="0.01"
                      value={formData.raiseAmount}
                      onChange={(e) => setFormData({ ...formData, raiseAmount: e.target.value })}
                      placeholder="e.g., 100"
                      className={errors.raiseAmount ? "border-destructive" : ""}
                    />
                    {errors.raiseAmount && <p className="text-sm text-destructive">{errors.raiseAmount}</p>}
                  </div>
                </div>

                {/* Social Links */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Social Links (Optional)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

                {/* Fee Configuration */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Fee Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="feeRecipient">Fee Recipient Address</Label>
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
                      <p className="text-xs text-muted-foreground">
                        Address that will receive transaction fees (1-3% of transfers)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="feePercentage">Fee Percentage (%)</Label>
                      <Input
                        id="feePercentage"
                        type="number"
                        min="1"
                        max="3"
                        step="0.1"
                        value={formData.feePercentage}
                        onChange={(e) => setFormData({ ...formData, feePercentage: parseFloat(e.target.value) || 0 })}
                        placeholder="1.5"
                        className={errors.feePercentage ? "border-destructive" : ""}
                      />
                      {errors.feePercentage && (
                        <p className="text-sm text-destructive">{errors.feePercentage}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Transaction fee (1-3%). Only applied after bonding phase.
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 dark:bg-blue-950 dark:border-blue-800">
                    <div className="flex items-start space-x-3">
                      <Wallet className="h-5 w-5 text-blue-600 mt-0.5 dark:text-blue-400" />
                      <div>
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Fee Structure</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          • Platform fee: 2% of all trading volume (BNB)
                          • Token fee: {formData.feePercentage}% on transfers (disabled during bonding phase)
                          • Burn: 0.006% of all transfers sent to dead address
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Meme">Meme</SelectItem>
                      <SelectItem value="Gaming">Gaming</SelectItem>
                      <SelectItem value="DeFi">DeFi</SelectItem>
                      <SelectItem value="NFT">NFT</SelectItem>
                      <SelectItem value="Utility">Utility</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Warning */}
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
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

                {/* Progress Indicator */}
                {creationPhase !== 'idle' && (
                  <div className="bg-muted/30 rounded-lg p-4 space-y-3">
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
                )}

                {/* Submit Button */}
                <div className="flex justify-center pt-6">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={!isConnected || isSubmitting || tickerCheck.available === false}
                    className="bg-secondary hover:bg-secondary/90 glow-pink hover-glow-pink text-lg px-12 py-4"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        <span>
                          {creationPhase === 'validating' && 'Validating...'}
                          {creationPhase === 'uploading' && 'Uploading...'}
                          {creationPhase === 'preparing' && 'Preparing...'}
                          {creationPhase === 'deploying' && 'Deploying...'}
                        </span>
                      </div>
                    ) : (
                      "Launch Token"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}
