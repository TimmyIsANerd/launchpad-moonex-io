"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatsCard } from "@/components/ui/stats-card"
import { DataTable } from "@/components/ui/data-table"
import { ProgressRing } from "@/components/ui/progress-ring"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import { 
  TrendingUp, 
  Volume2, 
  Clock, 
  TrendingDown,
  Zap,
  Globe,
  Shield,
  TrendingUp as GainersIcon,
  TrendingDown as LosersIcon
} from "lucide-react"
import { useTokens } from "@/src/hooks/useTokensWithAPI"

export function EnhancedRankingPage() {
  const [activeTab, setActiveTab] = useState<"marketcap" | "volume" | "gainers" | "losers">("marketcap")
  const [timeframe, setTimeframe] = useState<"1h" | "24h" | "7d">("24h")
  const { data: tokens, isLoading } = useTokens(200, 0)

  const processTokens = useMemo(() => {
    if (!tokens) return { marketCap: [], volume: [], gainers: [], losers: [] }

    return tokens.reduce((acc, token) => {
      const processedToken = {
        rank: 0, // Will be set after sorting
        name: token.displayName || token.name,
        ticker: token.symbol,
        baseAsset: "BNB",
        marketCap: token.isComplete ? "$—" : "$5,000",
        price: token.priceInBase != null ? `${Number(token.priceInBase).toFixed(6)} BNB` : "—",
        change24h: 0, // Mock data for now
        volume24h: token.volume24hBase != null ? `${Number(token.volume24hBase).toFixed(2)} BNB` : "—",
        contractAddress: token.id,
        onPancakeSwap: !!token.isComplete,
        holdersCount: token.holdersCount || 0,
        liquidity: "$—"
      }

      // Market cap ranking by holders (proxy for popularity)
      acc.marketCap.push(processedToken)
      
      // Volume ranking
      acc.volume.push(processedToken)
      
      // Gainers/Losers (mock data for now)
      const mockChange = (Math.random() - 0.3) * 300 // Slightly skewed toward gains
      const gainerToken = { ...processedToken, change24h: mockChange }
      const loserToken = { ...processedToken, change24h: -Math.abs(mockChange) }
      
      if (mockChange > 0) {
        acc.gainers.push(gainerToken)
      } else {
        acc.losers.push(loserToken)
      }

      return acc
    }, { marketCap: [] as any[], volume: [] as any[], gainers: [] as any[], losers: [] as any[] })
  }, [tokens])

  const rankings = useMemo(() => {
    const keys: (keyof typeof processTokens)[] = ['marketCap', 'volume', 'gainers', 'losers']
    const rankings: any = {}
    
    keys.forEach(key => {
      if (key === 'marketCap') {
        rankings[key] = processTokens[key]
          .sort((a, b) => (b.holdersCount || 0) - (a.holdersCount || 0))
          .map((token, i) => ({ ...token, rank: i + 1 }))

      } else if (key === 'volume') {
        rankings[key] = processTokens[key]
          .sort((a, b) => Number(b.volume24h.replace(/[^0-9.]/g, '')) - Number(a.volume24h.replace(/[^0-9.]/g, '')))
          .map((token, i) => ({ ...token, rank: i + 1 }))

      } else {
        rankings[key] = processTokens[key]
          .sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h))
          .map((token, i) => ({ ...token, rank: i + 1 }))
      }
    })

    return rankings
  }, [processTokens])

  const marketplaceStats = useMemo(() => {
    const totalTokens = tokens?.length || 0
    const totalVolume = tokens?.reduce((sum, token) => 
      sum + Number(token.volume24hBase || 0), 0) || 0
    const completedTokens = tokens?.filter(t => t.isComplete).length || 0
    const completionRate = totalTokens > 0 ? (completedTokens / totalTokens) * 100 : 0

    return {
      totalTokens,
      totalVolume,
      completedTokens,
      completionRate,
      activeTrading: Math.floor(totalTokens * 0.7) // Mock active trading
    }
  }, [tokens])

  const columns = [
    { key: 'rank', label: '#', width: '1' },
    { key: 'name', label: 'Token', width: '3', sortable: true },
    { key: 'baseAsset', label: 'Base', width: '1' },
    { key: 'marketCap', label: 'Market Cap', width: '2', sortable: true },
    ...(activeTab === 'volume' ? [{ key: 'volume24h', label: 'Volume', width: '2', sortable: true }] : []),
    { key: 'change24h', label: 'Change', width: '2', sortable: true },
  ]

  return (
    <div className="min-h-screen bg-background">
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
            
            {/* Timeframe Selector */}
            <div className="flex items-center justify-center space-x-4 mb-6">
              <span className="text-sm text-muted-foreground">Timeframe:</span>
              <div className="flex space-x-1 bg-card rounded-lg p-1 border border-border">
                {[
                  { key: "1h", label: "1H" },
                  { key: "24h", label: "24H" },
                  { key: "7d", label: "7D" },
                ].map((tf) => (
                  <Button
                    key={tf.key}
                    variant={timeframe === tf.key ? "default" : "ghost"}
                    onClick={() => setTimeframe(tf.key as any)}
                    className={
                      timeframe === tf.key
                        ? "bg-primary text-primary-foreground glow-cyan text-sm px-3 py-1"
                        : "text-muted-foreground hover:text-foreground text-sm px-3 py-1"
                    }
                  >
                    {tf.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <StatsCard
              title="Total Tokens"
              value={<AnimatedCounter value={marketplaceStats.totalTokens} />}
              description="Projects launching"
              icon={Globe}
              glowColor="cyan"
            />
            
            <StatsCard
              title="Active Trading"
              value={<AnimatedCounter value={marketplaceStats.activeTrading} />}
              description="Currently trading"
              icon={Zap}
              glowColor="pink"
            />
            
            <StatsCard
              title="Graduated"
              value={<AnimatedCounter value={marketplaceStats.completedTokens} />}
              description="On PancakeSwap"
              icon={Shield}
              glowColor="primary"
            />
            
            <StatsCard
              title="${marketplaceStats.totalVolume.toFixed(1)}M"
              value={<AnimatedCounter value={marketplaceStats.totalVolume} suffix="M" />}
              description="Total Volume"
              icon={Volume2}
              glowColor="secondary"
            />

            {/* Completion Rate Progress Ring */}
            <Card className="border-border transition-all duration-300 hover:scale-[1.02] hover-glow-cyan">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <ProgressRing
                    progress={marketplaceStats.completionRate}
                    size={80}
                    strokeWidth={6}
                    variant="success"
                  >
                    <span className="text-sm font-bold text-foreground">
                      {marketplaceStats.completionRate.toFixed(0)}%
                    </span>
                  </ProgressRing>
                </div>
                <div className="text-sm font-medium text-muted-foreground">
                  Completion Rate
                </div>
                <div className="text-xs text-muted-foreground/80 mt-1">
                  Tokens graduated to PCS
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
                { key: "gainers", label: "Top Gainers", icon: GainersIcon },
                { key: "losers", label: "Top Losers", icon: LosersIcon },
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
                {activeTab === "losers" && "Top Losers"}
              </h2>
              
              <Badge variant="outline" className="text-sm">
                {rankings[activeTab]?.length || 0} tokens
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
              <DataTable
                columns={columns}
                data={rankings[activeTab]?.slice(0, 50) || []}
                loading={isLoading}
                emptyMessage={`No ${activeTab} data available`}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
