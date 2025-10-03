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
import { StepIndicator } from "@/components/step-indicator"
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
  CheckCircle
} from "lucide-react"
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
    switch (currentStep) {
      case 1: return isConnected // Wallet step
      case 2: return formData.logo !== null // Logo step
      case 3: return formData.name && formData.ticker && formData.description // Details step
      case 4: return formData.raiseAmount && parseFloat(formData.raiseAmount) > 0 // Funding step
      case 5: return true // Social links are optional
      case 6: return formData.feeRecipient && formData.feePercentage >= 0 // Config step
      default: return true
    }
  }

  const nextStep = () => {
    if (currentStep < 6 && canProceed()) {
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
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <Wallet className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">Connect Your Wallet</h3>
                <p className="text-muted-foreground">
                  Connect your wallet to create and launch tokens on MoonEx
                </p>
              </div>
            </div>

            <Card className="border-border">
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
          </div>
        )

      case 2: // Logo Upload
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <Image className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">Upload Token Logo</h3>
                <p className="text-muted-foreground">
                  Upload a high-quality logo for your token (Recommended: 500×500px)
                </p>
              </div>
            </div>

            <SquareImageUpload
              onFileSelect={(file) => setFormData({ ...formData, logo: file })}
              accept="image/*"
              maxSize={5}
              recommendedSize={{ width: 500, height: 500 }}
            />
          </div>
        )

      case 3: // Basic Details
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <Type className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">Token Details</h3>
                <p className="text-muted-foreground">
                  Provide basic information about your token
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Token Name *</Label>
                <Input
                id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Moon Doge"
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ticker">Token Symbol *</Label>
                <div className="relative">
                  <Input
                    id="ticker"
                    value={formData.ticker}
                    onChange={(e) => setFormData({ ...formData, ticker: e.target.value.toUpperCase() })}
                    placeholder="e.g., MOONDOGE"
                    className={`${errors.ticker ? "border-destructive" : ""} ${tickerCheck.available ? "border-green-500" : tickerCheck.available === false ? "border-destructive" : ""}`}
                  />
                  {tickerCheck.loading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    </div>
                  )}
                </div>
                {errors.ticker && <p className="text-sm text-destructive">{errors.ticker}</p>}
                {tickerCheck.message && (
                  <p className={`text-sm ${tickerCheck.available ? 'text-green-600' : 'text-destructive'}`}>
                    {tickerCheck.message}
                  </p>
                )}
                {tickerCheck.suggestion && (
                  <p className="text-sm text-blue-600">
                    Try: {tickerCheck.suggestion}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Token Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your token, its purpose, and why people should invest..."
                  className={`min-h-[100px] ${errors.description ? "border-destructive" : ""}`}
                />
                {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                <p className="text-xs text-muted-foreground">
                  {formData.description.length} characters
                </p>
              </div>

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
                    <SelectItem value="Meme">Meme Coin</SelectItem>
                    <SelectItem value="Utility">Utility Token</SelectItem>
                    <SelectItem value="DeFi">DeFi Protocol</SelectItem>
                    <SelectItem value="NFT">NFT Collection</SelectItem>
                    <SelectItem value="Gaming">Gaming</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )

      case 4: // Funding
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <DollarSign className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">Funding Goals</h3>
                <p className="text-muted-foreground">
                  Set your fundraising targets and tokenomics
                </p>
              </div>
            </div>

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

            {/* Cost Estimation */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-sm">Estimated Costs</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {estimatedCosts ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Gas Cost:</span>
                      <span className="font-medium">{estimatedCosts.gasCost} BNB</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Platform Fee:</span>
                      <span className="font-medium">{estimatedCosts.bnbCost} BNB</span>
                    </div>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onEstimateCosts}
                    disabled={!formData.raiseAmount}
                  >
                    Estimate Costs
                  </Button>
                )}
              </CardContent>
            </Card>
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
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">Review & Launch</h3>
                <p className="text-muted-foreground">
                  Review your token details before launching
                </p>
              </div>
            </div>

            {/* Review Summary */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Rocket className="h-5 w-5 text-primary" />
                  <span>Token Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.logo && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Logo</Label>
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                        <img 
                          src={URL.createObjectURL(formData.logo)} 
                          alt="Token logo" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Name</Label>
                    <p className="text-sm">{formData.name}</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Symbol</Label>
                    <p className="text-sm font-mono bg-muted px-2 py-1 rounded text-xs">
                      {formData.ticker}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Category</Label>
                    <p className="text-sm">{formData.category}</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Description</Label>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {formData.description}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Raise Goal</Label>
                    <p className="text-sm">
                      {formData.raiseAmount} {formData.raisedToken}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Platform Fee</Label>
                    <p className="text-sm">{formData.feePercentage}%</p>
                  </div>
                </div>

                {(formData.website || formData.twitter || formData.telegram) && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Social Links</Label>
                    <div className="space-y-1">
                      {formData.website && <p className="text-sm">🌐 {formData.website}</p>}
                      {formData.twitter && <p className="text-sm">🐦 {formData.twitter}</p>}
                      {formData.telegram && <p className="text-sm">💬 {formData.telegram}</p>}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Launch Button */}
            <div className="text-center">
              <Button
                type="button"
                onClick={onSubmit}
                disabled={!canProceed() || isSubmitting}
                className="px-8 py-3"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {creationPhase === 'validating' && 'Validating...'}
                    {creationPhase === 'uploading' && 'Uploading...'}
                    {creationPhase === 'preparing' && 'Preparing...'}
                    {creationPhase === 'deploying' && 'Deploying...'}
                    {(creationPhase === 'complex' || creationPhase === 'idle') && 'Creating...'}
                  </>
                ) : (
                  <>
                    <Rocket className="h-5 w-5 mr-2" />
                    Launch Token
                  </>
                )}
              </Button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-8">
      {/* Step Indicator */}
      <StepIndicator 
        steps={formSteps} 
        currentStep={currentStep}
        onStepClick={setCurrentStep}
      />

      {/* Step Content */}
      <Card className="border-border">
        <CardContent className="p-8">
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1 || isSubmitting}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        {currentStep < 7 ? (
          <Button
            type="button"
            onClick={nextStep}
            disabled={!canProceed() || isSubmitting}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        ) : null}
      </div>
    </div>
  )
}
