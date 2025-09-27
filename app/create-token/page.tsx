"use client"

import type React from "react"

import { useState } from "react"
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
  })

  const [errors, setErrors] = useState<Partial<TokenFormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { isConnected } = useWallet()

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

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isConnected) {
      alert("Please connect your wallet first")
      return
    }

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    // Simulate token creation
    setTimeout(() => {
      setIsSubmitting(false)
      alert(`Token ${formData.name} (${formData.ticker}) created successfully!`)
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
      })
    }, 2000)
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
                    <Input
                      id="ticker"
                      value={formData.ticker}
                      onChange={(e) => setFormData({ ...formData, ticker: e.target.value.toUpperCase() })}
                      placeholder="e.g., MOONDOG"
                      className={errors.ticker ? "border-destructive" : ""}
                    />
                    {errors.ticker && <p className="text-sm text-destructive">{errors.ticker}</p>}
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

                {/* Submit Button */}
                <div className="flex justify-center pt-6">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={!isConnected || isSubmitting}
                    className="bg-secondary hover:bg-secondary/90 glow-pink hover-glow-pink text-lg px-12 py-4"
                  >
                    {isSubmitting ? "Launching Token..." : "Launch Token"}
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
