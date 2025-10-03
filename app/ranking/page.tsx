"use client"

import { useState, useMemo } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EnhancedTable } from "@/components/ui/enhanced-table"
import { 
  TrendingUp, 
  Volume2, 
  Clock, 
  Globe,
  Shield,
  Zap,
  Activity
} from "lucide-react"
import { useTokens } from "@/src/hooks/useTokensWithAPI"

export default function RankingPage() {
  const [activeTab, setActiveTab] = useState<"marketcap" | "volume" | "gainers">("marketcap")
  const { data: tokens, isLoading } = useTokens(200, 0)

  const processedTokens = useMemo(() => {
    if (!tokens) return []

    return tokens.map((token, index) => ({
      rank: index + 1,
      name: token.displayName || token.name,
      ticker: token.symbol,
      baseAsset: "BNB",
      marketCap: token.isComplete ? "$—" : "$5,000",
      volume24h: token.isComplete ? "—" : "—",
      price: token.priceInBase != null ? `${Number(token.priceInBase).toFixed(6)} BNB` : "—",
      change24h: (Math.random() - 0.5) * 200, // Mock data
      contractAddress: token.id,
      onPancakeSwap: !!token.isComplete,
      holdersCount: token.holdersCount || 0,
    }))
  }, [tokens])

  const sortedTokens = useMemo(() => {
    let sorted = [[...processedTokens], [...processedTokens], [...processedTokens]]
    
    // Market cap by holders
    sorted[0].sort((a, b) => (b.holdersCount || 0) - (a.holdersCount || 0))
    
    // Volume (no sorting for now)
    sorted[1] = sorted[1]
    
    // Gainers (highest change)
    sorted[2].sort((a, b) => b.change24h - a.change24h)
    
    return sorted.map((x, i) => x.map((t, j) => ({ ...t, rank: j + 1 })))
  }, [processedTokens])

  const getTokensForTab = () => {
    switch (activeTab) {
      case "marketcap":
        return sortedTokens[0]
      case "volume":
        return sortedTokens[1]
      case "gainers":
        return sortedTokens[2]
      default:
        return sortedTokens[0]
    }
  }

  const marketplaceStats = {
    totalTokens: tokens?.length || 0,
    activeTrading: Math.floor((tokens?.length || 0) * 0.7),
    completedTokens: tokens?.filter(t => t.isComplete).length || 0,
    totalVolume: tokens?.reduce((sum, t) => sum + Number(t.volume24hBase || 0), 0) || 0,
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-6xl font-bold">
                  <span className="gradient-cosmic text-glow-cyan">Token Rankings</span>
                </h1>
              </div>
            </div>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-6">
              Real-time rankings of the hottest meme tokens on MoonEx. Track market leaders, volume champions, and discover emerging gems.
            </p>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-border hover-glow-cyan transition-all duration-300 hover:scale-[1.02]">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center">
                    <Globe className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-foreground mb-1">
                  {marketplaceStats.totalTokens}
                </div>
                <div className="text-sm font-medium text-muted-foreground">
                  Total Tokens
                </div>
              </CardContent>
            </Card>

            <Card className="border-border hover-glow-pink transition-all duration-300 hover:scale-[1.02]">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-secondary/20 to-pink-600/20 rounded-xl flex items-center justify-center">
                    <Zap className="h-6 w-6 text-secondary" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-foreground mb-1">
                  {marketplaceStats.activeTrading}
                </div>
                <div className="text-sm font-medium text-muted-foreground">
                  Active Trading
                </div>
              </CardContent>
            </Card>

            <Card className="border-border hover-glow-primary transition-all duration-300 hover:scale-[1.02]">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-foreground mb-1">
                  {marketplaceStats.completedTokens}
                </div>
                <div className="text-sm font-medium text-muted-foreground">
                  Graduated
                </div>
              </CardContent>
            </Card>

            <Card className="border-border hover-glow-secondary transition-all duration-300 hover:scale-[1.02]">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-xl flex items-center justify-center">
                    <Volume2 className="h-6 w-6 text-secondary" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-foreground mb-1">
                  ${marketplaceStats.totalVolume.toFixed(1)}M
                </div>
                <div className="text-sm font-medium text-muted-foreground">
                  Total Volume
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Tab Navigation */}
          <div className="flex justify-center mb-8">
            <div className="flex space-x-1 bg-card rounded-xl p-1 border border-border shadow-lg">
              {[
                { key: "marketcap", label: "Market Cap", icon: TrendingUp },
                { key: "volume", label: "Volume", icon: Volume2 },
                { key: "gainers", label: "Top Gainers", icon: Activity },
              ].map((tab) => (
                <Button
                  key={tab.key}
                  variant={activeTab === tab.key ? "default" : "ghost"}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={
                    activeTab === tab.key
                      ? "bg-primary text-primary-foreground glow-cyan px-6 py-2"
                      : "text-muted-foreground hover:text-foreground px-6 py-2"
                  }
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Ranking Title */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-bold text-foreground">
                {activeTab === "marketcap" && "Market Cap Leaders"}
                {activeTab === "volume" && "Volume Champions"}
                {activeTab === "gainers" && "Top Gainers"}
              </h2>
              
              <Badge variant="outline" className="text-sm">
                {getTokensForTab().length} tokens
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Updated just now</span>
            </div>
          </div>

          {/* Enhanced Data Table */}
          <Card className="border-border shadow-xl">
            <CardHeader className="bg-gradient-to-r from-card to-card/50 border-b border-border">
              <CardTitle className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                <span>Live Rankings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <EnhancedTable
                tokens={getTokensForTab().slice(0, 50)}
                loading={isLoading}
                emptyMessage={`No ${activeTab} data available`}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}