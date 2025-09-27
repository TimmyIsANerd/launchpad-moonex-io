"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { TokenTable } from "@/components/token-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, Volume2, Clock } from "lucide-react"

// Sample ranking data
const marketCapTokens = [
  {
    rank: 1,
    name: "MoonDog",
    ticker: "MOONDOG",
    baseAsset: "BNB",
    marketCap: "$2.1M",
    price: "$0.0045",
    change24h: 156.7,
    contractAddress: "0x1234567890abcdef1234567890abcdef12345678",
    onPancakeSwap: true,
  },
  {
    rank: 2,
    name: "RocketCat",
    ticker: "ROCKETCAT",
    baseAsset: "BNB",
    marketCap: "$1.8M",
    price: "$0.0032",
    change24h: 89.3,
    contractAddress: "0xabcdef1234567890abcdef1234567890abcdef12",
    onPancakeSwap: true,
  },
  {
    rank: 3,
    name: "SpaceDoge",
    ticker: "SPACEDOGE",
    baseAsset: "BNB",
    marketCap: "$1.5M",
    price: "$0.0028",
    change24h: -12.4,
    contractAddress: "0x9876543210fedcba9876543210fedcba98765432",
    onPancakeSwap: false,
  },
  {
    rank: 4,
    name: "LunaPepe",
    ticker: "LUNAPEPE",
    baseAsset: "USDT",
    marketCap: "$1.2M",
    price: "$0.0019",
    change24h: 45.2,
    contractAddress: "0xfedcba9876543210fedcba9876543210fedcba98",
    onPancakeSwap: true,
  },
  {
    rank: 5,
    name: "CosmicShib",
    ticker: "COSMICSHIB",
    baseAsset: "BNB",
    marketCap: "$980K",
    price: "$0.0015",
    change24h: 23.8,
    contractAddress: "0x1111222233334444555566667777888899990000",
    onPancakeSwap: false,
  },
]

const volumeTokens = [
  {
    rank: 1,
    name: "RocketCat",
    ticker: "ROCKETCAT",
    baseAsset: "BNB",
    marketCap: "$1.8M",
    volume24h: "$450K",
    price: "$0.0032",
    change24h: 89.3,
    contractAddress: "0xabcdef1234567890abcdef1234567890abcdef12",
    onPancakeSwap: true,
  },
  {
    rank: 2,
    name: "MoonDog",
    ticker: "MOONDOG",
    baseAsset: "BNB",
    marketCap: "$2.1M",
    volume24h: "$380K",
    price: "$0.0045",
    change24h: 156.7,
    contractAddress: "0x1234567890abcdef1234567890abcdef12345678",
    onPancakeSwap: true,
  },
  {
    rank: 3,
    name: "LunaPepe",
    ticker: "LUNAPEPE",
    baseAsset: "USDT",
    marketCap: "$1.2M",
    volume24h: "$290K",
    price: "$0.0019",
    change24h: 45.2,
    contractAddress: "0xfedcba9876543210fedcba9876543210fedcba98",
    onPancakeSwap: true,
  },
  {
    rank: 4,
    name: "SpaceDoge",
    ticker: "SPACEDOGE",
    baseAsset: "BNB",
    marketCap: "$1.5M",
    volume24h: "$180K",
    price: "$0.0028",
    change24h: -12.4,
    contractAddress: "0x9876543210fedcba9876543210fedcba98765432",
    onPancakeSwap: false,
  },
  {
    rank: 5,
    name: "CosmicShib",
    ticker: "COSMICSHIB",
    baseAsset: "BNB",
    marketCap: "$980K",
    volume24h: "$120K",
    price: "$0.0015",
    change24h: 23.8,
    contractAddress: "0x1111222233334444555566667777888899990000",
    onPancakeSwap: false,
  },
]

export default function RankingPage() {
  const [activeTab, setActiveTab] = useState<"marketcap" | "volume">("marketcap")
  const [lastUpdated] = useState(new Date())

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-cosmic text-glow-cyan">Token Rankings</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
              Discover the top-performing meme tokens on MoonEx. Rankings updated in real-time.
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-border">
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-foreground">127</h3>
                <p className="text-muted-foreground">Active Tokens</p>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-6 text-center">
                <Volume2 className="h-8 w-8 text-secondary mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-foreground">$2.4M</h3>
                <p className="text-muted-foreground">24H Volume</p>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-6 text-center">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary mx-auto mb-2 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">$</span>
                </div>
                <h3 className="text-2xl font-bold text-foreground">$8.7M</h3>
                <p className="text-muted-foreground">Total Market Cap</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-8">
            <div className="flex space-x-1 bg-card rounded-lg p-1 border border-border">
              <Button
                variant={activeTab === "marketcap" ? "default" : "ghost"}
                onClick={() => setActiveTab("marketcap")}
                className={
                  activeTab === "marketcap"
                    ? "bg-primary text-primary-foreground glow-cyan"
                    : "text-muted-foreground hover:text-foreground"
                }
              >
                MarketCap Ranking
              </Button>
              <Button
                variant={activeTab === "volume" ? "default" : "ghost"}
                onClick={() => setActiveTab("volume")}
                className={
                  activeTab === "volume"
                    ? "bg-secondary text-secondary-foreground glow-pink"
                    : "text-muted-foreground hover:text-foreground"
                }
              >
                24H Volume Ranking
              </Button>
            </div>
          </div>

          {/* Token Table */}
          <Card className="border-border">
            <CardContent className="p-6">
              <TokenTable
                tokens={activeTab === "marketcap" ? marketCapTokens : volumeTokens}
                showVolume={activeTab === "volume"}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}
