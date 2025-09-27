"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Shield, Zap, Clock, TrendingUp, Flame, GraduationCap } from "lucide-react"

// Sample token data for different categories
const newlyCreatedTokens = [
  {
    rank: 1,
    name: "AlphaMoon",
    ticker: "ALPHAMOON",
    baseAsset: "BNB",
    marketCap: "$45K",
    price: "$0.00012",
    change24h: 234.5,
    contractAddress: "0xnew1234567890abcdef1234567890abcdef123456",
    onPancakeSwap: false,
    timeSinceLaunch: "2 minutes ago",
  },
  {
    rank: 2,
    name: "BetaRocket",
    ticker: "BETAROCKET",
    baseAsset: "BNB",
    marketCap: "$32K",
    price: "$0.00089",
    change24h: 189.2,
    contractAddress: "0xnew2345678901bcdef2345678901bcdef234567",
    onPancakeSwap: false,
    timeSinceLaunch: "5 minutes ago",
  },
]

const aboutToLaunchTokens = [
  {
    rank: 1,
    name: "GammaSpace",
    ticker: "GAMMASPACE",
    baseAsset: "BNB",
    marketCap: "$0",
    price: "$0.00000",
    change24h: 0,
    contractAddress: "0xlaunch1234567890abcdef1234567890abcdef12",
    onPancakeSwap: false,
    launchTime: "in 15 minutes",
  },
]

const tradingVolumeTokens = [
  {
    rank: 1,
    name: "RocketCat",
    ticker: "ROCKETCAT",
    baseAsset: "BNB",
    marketCap: "$1.8M",
    volume24h: "$450K",
    price: "$0.0032",
    change24h: 89.3,
    contractAddress: "0xvolume1234567890abcdef1234567890abcdef1",
    onPancakeSwap: true,
    txCount: 1247,
  },
]

const graduatedHotTokens = [
  {
    rank: 1,
    name: "MoonDog",
    ticker: "MOONDOG",
    baseAsset: "BNB",
    marketCap: "$2.1M",
    price: "$0.0045",
    change24h: 156.7,
    contractAddress: "0xgrad1234567890abcdef1234567890abcdef123",
    onPancakeSwap: true,
    graduatedAt: "2 days ago",
  },
]

export default function AdvancedPage() {
  const [activeTab, setActiveTab] = useState<"newly-created" | "about-to-launch" | "trading-volume" | "graduated-hot">(
    "newly-created",
  )
  const [mevProtection, setMevProtection] = useState(false)
  const [quickBuyAmount, setQuickBuyAmount] = useState("")
  const [currentBnbPrice] = useState("$645.32")

  const getTabData = () => {
    switch (activeTab) {
      case "newly-created":
        return newlyCreatedTokens
      case "about-to-launch":
        return aboutToLaunchTokens
      case "trading-volume":
        return tradingVolumeTokens
      case "graduated-hot":
        return graduatedHotTokens
      default:
        return newlyCreatedTokens
    }
  }

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case "newly-created":
        return <Clock className="h-4 w-4" />
      case "about-to-launch":
        return <Zap className="h-4 w-4" />
      case "trading-volume":
        return <TrendingUp className="h-4 w-4" />
      case "graduated-hot":
        return <GraduationCap className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-cosmic text-glow-cyan">Advanced Explorer</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real-time token discovery with advanced filtering and MEV protection. Find the next moonshot before
              everyone else.
            </p>
          </div>

          {/* Top Tools */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* MEV Protection */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span>MEV Protection</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Protect your trades from front-running and sandwich attacks
                    </p>
                    <Badge variant={mevProtection ? "default" : "secondary"} className="text-xs">
                      {mevProtection ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <Switch checked={mevProtection} onCheckedChange={setMevProtection} />
                </div>
              </CardContent>
            </Card>

            {/* Quick Buy Widget */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-secondary" />
                  <span>Quick Buy</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Current BNB Price:</span>
                    <span className="font-medium text-foreground">{currentBnbPrice}</span>
                  </div>
                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <Label htmlFor="quick-buy" className="sr-only">
                        Quick buy amount
                      </Label>
                      <Input
                        id="quick-buy"
                        type="number"
                        step="0.01"
                        placeholder="0.1 BNB"
                        value={quickBuyAmount}
                        onChange={(e) => setQuickBuyAmount(e.target.value)}
                      />
                    </div>
                    <Button className="bg-secondary hover:bg-secondary/90 glow-pink">Buy</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {[
              { key: "newly-created", label: "Newly Created", icon: <Clock className="h-4 w-4" /> },
              { key: "about-to-launch", label: "About to Launch", icon: <Zap className="h-4 w-4" /> },
              { key: "trading-volume", label: "Trading Volume", icon: <TrendingUp className="h-4 w-4" /> },
              { key: "graduated-hot", label: "Graduated Hot", icon: <Flame className="h-4 w-4" /> },
            ].map((tab) => (
              <Button
                key={tab.key}
                variant={activeTab === tab.key ? "default" : "outline"}
                onClick={() => setActiveTab(tab.key as any)}
                className={
                  activeTab === tab.key
                    ? "bg-primary text-primary-foreground glow-cyan"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-primary"
                }
              >
                {tab.icon}
                <span className="ml-2">{tab.label}</span>
              </Button>
            ))}
          </div>

          {/* Token Discovery Results */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {getTabIcon(activeTab)}
                <span>
                  {activeTab === "newly-created" && "Newly Created Tokens"}
                  {activeTab === "about-to-launch" && "About to Launch"}
                  {activeTab === "trading-volume" && "High Trading Volume"}
                  {activeTab === "graduated-hot" && "Graduated Hot Tokens"}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {getTabData().length > 0 ? (
                <div className="space-y-4">
                  {getTabData().map((token, index) => (
                    <Card key={index} className="hover-glow-cyan transition-all duration-300 hover:scale-[1.02]">
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                          {/* Token Info */}
                          <div className="lg:col-span-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                                <span className="text-sm font-bold">{token.ticker.slice(0, 2)}</span>
                              </div>
                              <div>
                                <h3 className="font-semibold text-foreground">{token.name}</h3>
                                <div className="flex items-center space-x-2">
                                  <p className="text-sm text-muted-foreground">{token.ticker}</p>
                                  {token.onPancakeSwap && (
                                    <Badge variant="secondary" className="text-xs">
                                      PCS
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="lg:col-span-8 grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Market Cap</p>
                              <p className="font-medium text-foreground">{token.marketCap}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Price</p>
                              <p className="font-medium text-foreground">{token.price}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">24h Change</p>
                              <p className={`font-medium ${token.change24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                                {token.change24h >= 0 ? "+" : ""}
                                {token.change24h.toFixed(2)}%
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">
                                {activeTab === "newly-created" && "Time Since Launch"}
                                {activeTab === "about-to-launch" && "Launch Time"}
                                {activeTab === "trading-volume" && "Tx Count"}
                                {activeTab === "graduated-hot" && "Graduated"}
                              </p>
                              <p className="font-medium text-primary">
                                {"timeSinceLaunch" in token && token.timeSinceLaunch}
                                {"launchTime" in token && token.launchTime}
                                {"txCount" in token && token.txCount}
                                {"graduatedAt" in token && token.graduatedAt}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No tokens found in this category.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}
