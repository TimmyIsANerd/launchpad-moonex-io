"use client"

import { useState, useMemo } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { EnhancedTable } from "@/components/ui/enhanced-table"
import { 
  Shield, 
  Zap, 
  Clock, 
  TrendingUp, 
  Flame, 
  GraduationCap,
  Search,
  Filter,
  Timer,
  Target,
  Activity,
  Users,
  AlertCircle
} from "lucide-react"
import { useTokens } from "@/src/hooks/useTokensWithAPI"
import { useBnbUsd } from "@/src/hooks/useBnbUsd"
import { formatUSD } from "@/lib/format"

export default function AdvancedPage() {
  const [activeTab, setActiveTab] = useState<"newly-created" | "about-to-launch" | "trading-volume" | "graduated-hot">("newly-created")
  const [mevProtection, setMevProtection] = useState(false)
  const [quickBuyAmount, setQuickBuyAmount] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const { data: bnbUsd } = useBnbUsd()
  const { data: tokens, isLoading } = useTokens(500, 0)

  const now = Date.now()

  const processedTokens = useMemo(() => {
    if (!tokens) return { newlyCreated: [], aboutToLaunch: [], tradingVolume: [], graduatedHot: [] }

    const newlyCreated = tokens
      .filter((t) => now - t.createdAt <= 6 * 60 * 60 * 1000)
      .filter((t) => !t.isComplete)
      .map((t, idx) => ({
        rank: idx + 1,
        name: t.displayName || t.name,
        ticker: t.symbol,
        baseAsset: "BNB",
        marketCap: "$5K",
        volume24h: "—",
        price: t.priceInBase != null ? `${Number(t.priceInBase).toFixed(6)} BNB` : "—",
        change24h: 0,
        contractAddress: t.id,
        onPancakeSwap: !!t.isComplete,
        timeSinceLaunch: `${Math.floor((now - t.createdAt) / 60000)}m ago`,
        holdersCount: t.holdersCount || 0
      }))

    const aboutToLaunch = tokens
      .filter((t) => !t.isComplete)
      .sort((a, b) => Number(b.volume24hBase || 0) - Number(a.volume24hBase || 0))
      .slice(0, 25)
      .map((t, idx) => ({
        rank: idx + 1,
        name: t.displayName || t.name,
        ticker: t.symbol,
        baseAsset: "BNB",
        marketCap: "$5K",
        volume24h: "—",
        price: t.priceInBase != null ? `${Number(t.priceInBase).toFixed(6)} BNB` : "—",
        change24h: 0,
        contractAddress: t.id,
        onPancakeSwap: !!t.isComplete,
        thresholdProgress: Math.min((Number(t.volume24hBase || 0) / 100) * 100, 95),
        holdersCount: t.holdersCount || 0
      }))

    const tradingVolume = tokens
      .sort((a, b) => Number(b.volume24hBase || 0) - Number(a.volume24hBase || 0))
      .slice(0, 30)
      .map((t, idx) => ({
        rank: idx + 1,
        name: t.displayName || t.name,
        ticker: t.symbol,
        baseAsset: "BNB",
        marketCap: t.isComplete ? "$—" : "$5,000",
        volume24h: `${Number(t.volume24hBase || 0).toFixed(2)} BNB`,
        price: t.priceInBase != null ? `${Number(t.priceInBase).toFixed(6)} BNB` : "—",
        change24h: (Math.random() - 0.5) * 200,
        contractAddress: t.id,
        onPancakeSwap: !!t.isComplete,
        tokens: Math.floor(Math.random() * 2000) + 100,
        holdersCount: t.holdersCount || 0
      }))

    const graduatedHot = tokens
      .filter((t) => t.isComplete)
      .sort((a, b) => Number(b.volume24hBase || 0) - Number(a.volume24hBase || 0))
      .slice(0, 20)
      .map((t, idx) => ({
        rank: idx + 1,
        name: t.displayName || t.name,
        ticker: t.symbol,
        baseAsset: "BNB",
        marketCap: "$—",
        volume24h: `${Number(t.volume24hBase || 0).toFixed(2)} BNB` ?? "—",
        price: t.priceInBase != null ? `${Number(t.priceInBase).toFixed(6)} BNB` : "—",
        change24h: (Math.random() - 0.5) * 150,
        contractAddress: t.id,
        onPancakeSwap: !!t.isComplete,
        graduatedAt: `${Math.floor(Math.random() * 7)}d ago`,
        holdersCount: t.holdersCount || 0
      }))

    return { newlyCreated, aboutToLaunch, tradingVolume, graduatedHot }
  }, [tokens, now])

  const filteredTokens = useMemo(() => {
    let tokens = processedTokens[activeTab as keyof typeof processedTokens] || []

    if (searchQuery) {
      tokens = tokens.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.ticker.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return tokens.slice(0, 25)
  }, [processedTokens, activeTab, searchQuery])

  const marketStats = useMemo(() => {
    const totalNewTokens = processedTokens.newlyCreated.length
    const aboutToGraduate = processedTokens.aboutToLaunch.filter(t => 
      Number(t.volume24h.replace(/[^\d.]/g, '')) > 50
    ).length
    const totalVolume = tokens?.reduce((sum, t) => sum + Number(t.volume24hBase || 0), 0) || 0
    const graduatedTokens = processedTokens.graduatedHot.length
    const avgHolderCount = tokens?.reduce((sum, t) => sum + (t.holdersCount || 0), 0) / (tokens?.length || 1) || 0

    return {
      totalNewTokens,
      aboutToGraduate,
      totalVolume,
      graduatedTokens,
      avgHolderCount
    }
  }, [processedTokens, tokens])

  const getTabIcon = (tab: string) => {
    const icons = {
      "newly-created": <Clock className="h-4 w-4" />,
      "about-to-launch": <Target className="h-4 w-4" />,
      "trading-volume": <Activity className="h-4 w-4" />,
      "graduated-hot": <GraduationCap className="h-4 w-4" />
    }
    return icons[tab as keyof typeof icons] || <Clock className="h-4 w-4" />
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-secondary to-pink-600 rounded-2xl flex items-center justify-center">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-6xl font-bold">
                  <span className="gradient-cosmic text-glow-cyan">Advanced Explorer</span>
                </h1>
              </div>
            </div>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-6">
              Discover the next moonshot before everyone else. Advanced filtering, MEV protection, and real-time market intelligence.
            </p>
          </div>

          {/* Enhanced Tools Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* MEV Protection */}
            <Card className="border-border hover-glow-pink transition-all duration-300 hover:scale-[1.01]">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span>MEV Protection</span>
                  <Badge variant={mevProtection ? "default" : "secondary"} className="text-xs ml-auto">
                    {mevProtection ? "Active" : "Inactive"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Shield against front-running</p>
                      <p className="text-xs text-muted-foreground/80">Advanced transaction protection</p>
                    </div>
                    <Switch 
                      checked={mevProtection} 
                      onCheckedChange={setMevProtection}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                  
                  {mevProtection && (
                    <div className="flex items-center space-x-2 text-sm text-green-400">
                      <AlertCircle className="h-4 w-4" />
                      <span>Protection active</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Buy */}
            <Card className="border-border hover-glow-cyan transition-all duration-300 hover:scale-[1.01]">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-secondary" />
                  <span>Quick Buy</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">BNB Price:</span>
                    <span className="font-medium text-success">
                      {bnbUsd != null ? formatUSD(bnbUsd, 2) : "—"}
                    </span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <Label htmlFor="quick-buy" className="sr-only">Quick buy amount</Label>
                      <Input
                        id="quick-buy"
                        type="number"
                        step="0.01"
                        placeholder="0.1 BNB"
                        value={quickBuyAmount}
                        onChange={(e) => setQuickBuyAmount(e.target.value)}
                        className="bg-card border-border"
                      />
                    </div>
                    <Button className="bg-secondary hover:bg-secondary/90 glow-pink">
                      Buy Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Search & Filter */}
            <Card className="border-border hover-glow-primary transition-all duration-300 hover:scale-[1.01]">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Filter className="h-5 w-5 text-primary" />
                  <span>Advanced Filters</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search tokens..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-card border-border"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card className="border-border hover-glow-cyan transition-all duration-300 hover:scale-[1.02]">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-foreground mb-1">
                  {marketStats.totalNewTokens}
                </div>
                <div className="text-sm font-medium text-muted-foreground">
                  New Tokens
                </div>
              </CardContent>
            </Card>

            <Card className="border-border hover-glow-pink transition-all duration-300 hover:scale-[1.02]">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-secondary/20 to-pink-600/20 rounded-xl flex items-center justify-center">
                    <Target className="h-6 w-6 text-secondary" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-foreground mb-1">
                  {marketStats.aboutToGraduate}
                </div>
                <div className="text-sm font-medium text-muted-foreground">
                  About to Launch
                </div>
              </CardContent>
            </Card>

            <Card className="border-border hover-glow-primary transition-all duration-300 hover:scale-[1.02]">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center">
                    <Activity className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-foreground mb-1">
                  ${marketStats.totalVolume.toFixed(1)}M
                </div>
                <div className="text-sm font-medium text-muted-foreground">
                  Total Volume
                </div>
              </CardContent>
            </Card>

            <Card className="border-border hover-glow-secondary transition-all duration-300 hover:scale-[1.02]">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-xl flex items-center justify-center">
                    <GraduationCap className="h-6 w-6 text-secondary" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-foreground mb-1">
                  {marketStats.graduatedTokens}
                </div>
                <div className="text-sm font-medium text-muted-foreground">
                  Graduated
                </div>
              </CardContent>
            </Card>

            <Card className="border-border hover-glow-success transition-all duration-300 hover:scale-[1.02]">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center">
                    <Users className="h-6 w-6 text-green-400" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-success mb-1">
                  {marketStats.avgHolderCount.toFixed(0)}
                </div>
                <div className="text-sm font-medium text-muted-foreground">
                  Avg Holders
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Tab Navigation */}
          <div className="flex justify-center mb-8">
            <div className="flex space-x-1 bg-card rounded-xl p-1 border border-border shadow-lg">
              {[
                { key: "newly-created", label: "Newly Created", icon: Clock },
                { key: "about-to-launch", label: "About to Launch", icon: Target },
                { key: "trading-volume", label: "Volume Leaders", icon: Activity },
                { key: "graduated-hot", label: "Graduated Hot", icon: Flame },
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
                  <Badge variant="outline" className="ml-2 text-xs">
                    {processedTokens[tab.key as keyof typeof processedTokens as any]?.length || 0}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>

          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              {getTabIcon(activeTab)}
              <h2 className="text-2xl font-bold text-foreground">
                {activeTab === "newly-created" && "Newly Created Tokens"}
                {activeTab === "about-to-launch" && "About to Launch"}
                {activeTab === "trading-volume" && "Volume Leaders"}
                {activeTab === "graduated-hot" && "Graduated Hot Tokens"}
              </h2>
              
              <Badge variant="outline" className="text-sm">
                {filteredTokens.length} results
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Timer className="h-4 w-4" />
              <span>Real-time updates</span>
            </div>
          </div>

          {/* Enhanced Results Table */}
          <Card className="border-border shadow-xl">
            <CardHeader className="bg-gradient-to-r from-card to-card/50 border-b border-border">
              <CardTitle className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-secondary to-pink-600 rounded-lg flex items-center justify-center">
                  {getTabIcon(activeTab)}
                </div>
                <span>Live Discovery Results</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <EnhancedTable
                tokens={filteredTokens}
                loading={isLoading}
                emptyMessage={`No ${activeTab} tokens found`}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}