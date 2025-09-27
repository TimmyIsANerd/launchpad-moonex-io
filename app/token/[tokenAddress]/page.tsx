"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PriceChart } from "@/components/price-chart"
import { BuySellPanel } from "@/components/buy-sell-panel"
import { TradesComments } from "@/components/trades-comments"
import { HoldersTable } from "@/components/holders-table"
import { useWallet } from "@/components/wallet-provider"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Copy, ExternalLink, Globe, Twitter, MessageCircle } from "lucide-react"

// This would normally come from an API or database
const getTokenData = (tokenAddress: string) => {
  // Sample token data - in a real app, this would be fetched based on the tokenAddress
  return {
    name: "MoonDog",
    ticker: "MOONDOG",
    logo: "/moondog-token-logo.jpg",
    contractAddress: tokenAddress,
    price: "$0.0045",
    change24h: 156.7,
    marketCap: "$2.1M",
    volume24h: "$450K",
    liquidity: "$180K",
    holders: "1,247",
    totalSupply: "1,000,000,000",
    creator: "0x1234...5678",
    createdAt: "2 days ago",
    description:
      "MoonDog is the ultimate meme token for space enthusiasts and dog lovers. Join our pack as we journey to the moon and beyond! With a strong community and fair launch mechanics, MoonDog represents the future of decentralized meme culture.",
    socialLinks: {
      website: "https://moondog.space",
      twitter: "https://twitter.com/moondogtoken",
      telegram: "https://t.me/moondogcommunity",
    },
    onPancakeSwap: true,
    verified: true,
  }
}

interface TokenDetailPageProps {
  params: {
    tokenAddress: string
  }
}

export default function TokenDetailPage({ params }: TokenDetailPageProps) {
  const token = getTokenData(params.tokenAddress)
  const { isConnected } = useWallet()

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("Copied to clipboard!")
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Token Header */}
          <Card className="mb-8 border-border">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                {/* Token Identity */}
                <div className="flex items-center space-x-4">
                  <img
                    src={token.logo || "/placeholder.svg"}
                    alt={`${token.name} logo`}
                    className="w-16 h-16 rounded-full flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2 mb-1 flex-wrap">
                      <h1 className="text-2xl font-bold gradient-cosmic">{token.name}</h1>
                      <span className="text-lg text-muted-foreground">({token.ticker})</span>
                      {token.verified && <Badge className="bg-green-500 text-white">Verified</Badge>}
                      {token.onPancakeSwap && (
                        <Badge className="bg-secondary text-secondary-foreground">PancakeSwap</Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground font-mono truncate max-w-[200px] sm:max-w-none">
                        {token.contractAddress}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => copyToClipboard(token.contractAddress)}
                        className="h-6 w-6 flex-shrink-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-6 w-6 flex-shrink-0">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                <div className="flex items-center space-x-2 flex-shrink-0">
                  {token.socialLinks.website && (
                    <Button size="icon" variant="outline" className="border-border bg-transparent">
                      <Globe className="h-4 w-4" />
                    </Button>
                  )}
                  {token.socialLinks.twitter && (
                    <Button size="icon" variant="outline" className="border-border bg-transparent">
                      <Twitter className="h-4 w-4" />
                    </Button>
                  )}
                  {token.socialLinks.telegram && (
                    <Button size="icon" variant="outline" className="border-border bg-transparent">
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Token Description */}
              <div className="mt-4">
                <p className="text-muted-foreground text-pretty">{token.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Key Stats Dashboard */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
            <Card className="border-border">
              <CardContent className="p-4 text-center">
                <h3 className="text-lg font-bold text-foreground">{token.price}</h3>
                <p className="text-sm text-muted-foreground">Price</p>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-4 text-center">
                <h3 className={`text-lg font-bold ${token.change24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {token.change24h >= 0 ? "+" : ""}
                  {token.change24h.toFixed(2)}%
                </h3>
                <p className="text-sm text-muted-foreground">24h Change</p>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-4 text-center">
                <h3 className="text-lg font-bold text-foreground">{token.marketCap}</h3>
                <p className="text-sm text-muted-foreground">Market Cap</p>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-4 text-center">
                <h3 className="text-lg font-bold text-foreground">{token.volume24h}</h3>
                <p className="text-sm text-muted-foreground">24h Volume</p>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-4 text-center">
                <h3 className="text-lg font-bold text-foreground">{token.liquidity}</h3>
                <p className="text-sm text-muted-foreground">Liquidity</p>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-4 text-center">
                <h3 className="text-lg font-bold text-foreground">{token.holders}</h3>
                <p className="text-sm text-muted-foreground">Holders</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Chart and Trades/Comments */}
            <div className="lg:col-span-2 space-y-8">
              <PriceChart tokenName={token.name} currentPrice={token.price} change24h={token.change24h} />
              <TradesComments tokenTicker={token.ticker} isWalletConnected={isConnected} />
            </div>

            {/* Right Column - Trading Panel */}
            <div className="lg:col-span-1">
              <BuySellPanel
                tokenName={token.name}
                tokenTicker={token.ticker}
                currentPrice={token.price}
                isWalletConnected={isConnected}
              />
            </div>
          </div>

          {/* Additional Token Info */}
          <Card className="mt-8 border-border">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Token Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Supply</p>
                  <p className="font-medium text-foreground">{token.totalSupply}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Creator</p>
                  <p className="font-mono text-primary truncate">{token.creator}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Created</p>
                  <p className="font-medium text-foreground">{token.createdAt}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Network</p>
                  <p className="font-medium text-foreground">BNB Chain</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8">
            <HoldersTable tokenTicker={token.ticker} />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
