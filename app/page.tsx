"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { TradingMarquee } from "@/components/trading-marquee"
import { TokenCardList } from "@/components/token-card-list"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useTokens } from "@/src/hooks/useTokens"

// const sampleTokens = [
//   {
//     rank: 1,
//     name: "MoonDog",
//     ticker: "MOONDOG",
//     baseAsset: "BNB",
//     price: "$0.0045",
//     change24h: 156.7,
//     marketCap: "$2.1M",
//     volume24h: "$450K",
//     creator: "0x1234...5678",
//     onPancakeSwap: true,
//     contractAddress: "0x1234567890abcdef1234567890abcdef12345678",
//     createdAt: "2024-01-15T10:30:00Z",
//     tradingVolume: 450000,
//   },
//   {
//     rank: 2,
//     name: "RocketCat",
//     ticker: "ROCKETCAT",
//     baseAsset: "USDT",
//     price: "$0.0032",
//     change24h: 89.3,
//     marketCap: "$1.8M",
//     volume24h: "$320K",
//     creator: "0xabcd...efgh",
//     onPancakeSwap: true,
//     contractAddress: "0xabcdef1234567890abcdef1234567890abcdef12",
//     createdAt: "2024-01-14T15:45:00Z",
//     tradingVolume: 320000,
//   },
//   {
//     rank: 3,
//     name: "SpaceDoge",
//     ticker: "SPACEDOGE",
//     baseAsset: "CAKE",
//     price: "$0.0028",
//     change24h: -12.4,
//     marketCap: "$1.5M",
//     volume24h: "$180K",
//     creator: "0x9876...5432",
//     onPancakeSwap: false,
//     contractAddress: "0x9876543210fedcba9876543210fedcba98765432",
//     createdAt: "2024-01-16T08:20:00Z",
//     tradingVolume: 180000,
//   },
//   {
//     rank: 4,
//     name: "LunaPepe",
//     ticker: "LUNAPEPE",
//     baseAsset: "USD1",
//     price: "$0.0019",
//     change24h: 45.2,
//     marketCap: "$1.2M",
//     volume24h: "$290K",
//     creator: "0xfedc...ba98",
//     onPancakeSwap: true,
//     contractAddress: "0xfedcba9876543210fedcba9876543210fedcba98",
//     createdAt: "2024-01-13T12:15:00Z",
//     tradingVolume: 290000,
//   },
//   {
//     rank: 5,
//     name: "CosmicShib",
//     ticker: "COSMICSHIB",
//     baseAsset: "USDC",
//     price: "$0.0015",
//     change24h: 23.8,
//     marketCap: "$980K",
//     volume24h: "$150K",
//     creator: "0x1111...2222",
//     onPancakeSwap: false,
//     contractAddress: "0x1111222233334444555566667777888899990000",
//     createdAt: "2024-01-17T14:30:00Z",
//     tradingVolume: 150000,
//   },
//   {
//     rank: 6,
//     name: "StellarFloki",
//     ticker: "STELLARFLOKI",
//     baseAsset: "ASTER",
//     price: "$0.0012",
//     change24h: 67.9,
//     marketCap: "$750K",
//     volume24h: "$380K",
//     creator: "0x3333...4444",
//     onPancakeSwap: true,
//     contractAddress: "0x3333444455556666777788889999aaaabbbbcccc",
//     createdAt: "2024-01-12T09:45:00Z",
//     tradingVolume: 380000,
//   },
//   {
//     rank: 7,
//     name: "GalaxyWolf",
//     ticker: "GALAXYWOLF",
//     baseAsset: "BNB",
//     price: "$0.0089",
//     change24h: 234.5,
//     marketCap: "$3.2M",
//     volume24h: "$680K",
//     creator: "0x5555...6666",
//     onPancakeSwap: true,
//     contractAddress: "0x5555666677778888999900001111222233334444",
//     createdAt: "2024-01-11T16:20:00Z",
//     tradingVolume: 680000,
//   },
//   {
//     rank: 8,
//     name: "NebulaFrog",
//     ticker: "NEBULAFROG",
//     baseAsset: "USDT",
//     price: "$0.0067",
//     change24h: -8.7,
//     marketCap: "$2.8M",
//     volume24h: "$420K",
//     creator: "0x7777...8888",
//     onPancakeSwap: false,
//     contractAddress: "0x7777888899990000111122223333444455556666",
//     createdAt: "2024-01-18T11:10:00Z",
//     tradingVolume: 420000,
//   },
//   {
//     rank: 9,
//     name: "AstroBear",
//     ticker: "ASTROBEAR",
//     baseAsset: "CAKE",
//     price: "$0.0034",
//     change24h: 78.2,
//     marketCap: "$1.9M",
//     volume24h: "$310K",
//     creator: "0x9999...0000",
//     onPancakeSwap: true,
//     contractAddress: "0x9999000011112222333344445555666677778888",
//     createdAt: "2024-01-10T13:55:00Z",
//     tradingVolume: 310000,
//   },
//   {
//     rank: 10,
//     name: "VoidPanda",
//     ticker: "VOIDPANDA",
//     baseAsset: "USD1",
//     price: "$0.0023",
//     change24h: 12.6,
//     marketCap: "$1.4M",
//     volume24h: "$220K",
//     creator: "0xbbbb...cccc",
//     onPancakeSwap: false,
//     contractAddress: "0xbbbbccccddddeeeeffffgggghhhhiiiijjjjkkkk",
//     createdAt: "2024-01-19T07:40:00Z",
//     tradingVolume: 220000,
//   },
//   {
//     rank: 11,
//     name: "OrionLion",
//     ticker: "ORIONLION",
//     baseAsset: "USDC",
//     price: "$0.0056",
//     change24h: 145.3,
//     marketCap: "$2.6M",
//     volume24h: "$590K",
//     creator: "0xdddd...eeee",
//     onPancakeSwap: true,
//     contractAddress: "0xddddeeeeffffgggghhhhiiiijjjjkkkkllllmmmm",
//     createdAt: "2024-01-09T18:25:00Z",
//     tradingVolume: 590000,
//   },
//   {
//     rank: 12,
//     name: "CometRabbit",
//     ticker: "COMETRABBIT",
//     baseAsset: "ASTER",
//     price: "$0.0041",
//     change24h: -15.8,
//     marketCap: "$2.3M",
//     volume24h: "$340K",
//     creator: "0xffff...gggg",
//     onPancakeSwap: false,
//     contractAddress: "0xffffgggghhhhiiiijjjjkkkkllllmmmmnnnnooo",
//     createdAt: "2024-01-20T05:15:00Z",
//     tradingVolume: 340000,
//   },
// ]

export default function HomePage() {
  const { data: tokens, isLoading } = useTokens(200, 0)

  const mapped = (tokens || [])
    .map((t, idx) => ({
      rank: idx + 1,
      name: t.displayName || t.name,
      ticker: t.symbol,
      baseAsset: "BNB",
      price: t.priceInBase != null ? `${Number(t.priceInBase).toFixed(6)} BNB` : "—",
      change24h: 0,
      marketCap: t.isComplete ? "—" : "$5,000",
      volume24h: t.volume24hBase != null ? `${Number(t.volume24hBase).toFixed(2)} BNB` : "—",
      creator: "",
      onPancakeSwap: !!t.isComplete, // placeholder until listing status available
      contractAddress: t.id,
      createdAt: new Date(t.createdAt).toISOString(),
      tradingVolume: Number(t.volume24hBase?.toFixed(3) || 0),
      logoURI: t.logoURI || null,
      owner: t.owner || null,
      raisedBase: t.raisedBase ?? null,
      lpThreshold: t.lpThreshold ?? null,
    }))
    // sort by tradingVolume desc by default
    .sort((a, b) => b.tradingVolume - a.tradingVolume)


  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {/* Trading Marquee */}
      <TradingMarquee />

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 min-h-[600px] flex items-center">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/images/moonex-rover-hero.png')",
          }}
        />
        {/* Dark Overlay for text contrast */}
        <div className="absolute inset-0 bg-black/80" />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto text-center w-full">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
            <span className="gradient-cosmic text-glow-cyan">MoonEx:</span>
            <br />
            The Future of Meme Launchpads
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto text-pretty">
            The Fair Launch Meme Platform. Pump to the Moon on BNB Chain.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/create-token">
              <Button size="lg" className="bg-primary hover:bg-primary/90 glow-cyan hover-glow-cyan text-lg px-8 py-4">
                Create Token
              </Button>
            </Link>
            <Link href="/ranking">
              <Button
                size="lg"
                variant="outline"
                className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground bg-transparent text-lg px-8 py-4"
              >
                Explore Tokens
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <TokenCardList tokens={mapped} title="Live Token Explorer" showToggle={true} />
        </div>
      </section>

      {/* Hero Image Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            <span className="gradient-cosmic">Ready for Launch?</span>
          </h3>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of creators and traders building the future of meme tokens on BNB Chain.
          </p>
          <Link href="/create-token">
            <Button
              size="lg"
              className="bg-secondary hover:bg-secondary/90 glow-pink hover-glow-pink text-lg px-8 py-4"
            >
              Launch Your Token
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
