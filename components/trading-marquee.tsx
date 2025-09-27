"use client"

import { useEffect, useState } from "react"

interface Trade {
  id: string
  wallet: string
  action: "bought" | "sold"
  amount: string
  asset: string
  token: string
  timestamp: Date
}

// Sample trading data
const sampleTrades: Trade[] = [
  {
    id: "1",
    wallet: "0x1234...5678",
    action: "bought",
    amount: "2.5",
    asset: "BNB",
    token: "MOONDOG",
    timestamp: new Date(),
  },
  {
    id: "2",
    wallet: "0xabcd...efgh",
    action: "sold",
    amount: "1.8",
    asset: "BNB",
    token: "ROCKETCAT",
    timestamp: new Date(),
  },
  {
    id: "3",
    wallet: "0x9876...5432",
    action: "bought",
    amount: "5.2",
    asset: "BNB",
    token: "SPACEDOGE",
    timestamp: new Date(),
  },
  {
    id: "4",
    wallet: "0xfedc...ba98",
    action: "sold",
    amount: "0.75",
    asset: "BNB",
    token: "LUNAPEPE",
    timestamp: new Date(),
  },
  {
    id: "5",
    wallet: "0x1111...2222",
    action: "bought",
    amount: "3.1",
    asset: "BNB",
    token: "COSMICSHIB",
    timestamp: new Date(),
  },
  {
    id: "6",
    wallet: "0x3333...4444",
    action: "bought",
    amount: "1.2",
    asset: "BNB",
    token: "STELLARFLOKI",
    timestamp: new Date(),
  },
]

export function TradingMarquee() {
  const [trades, setTrades] = useState<Trade[]>(sampleTrades)
  const [isPaused, setIsPaused] = useState(false)

  // Simulate new trades
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPaused) {
        const newTrade: Trade = {
          id: Math.random().toString(),
          wallet: `0x${Math.random().toString(16).substr(2, 4)}...${Math.random().toString(16).substr(2, 4)}`,
          action: Math.random() > 0.5 ? "bought" : "sold",
          amount: (Math.random() * 10).toFixed(2),
          asset: "BNB",
          token: ["MOONDOG", "ROCKETCAT", "SPACEDOGE", "LUNAPEPE", "COSMICSHIB"][Math.floor(Math.random() * 5)],
          timestamp: new Date(),
        }
        setTrades((prev) => [newTrade, ...prev.slice(0, 9)])
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [isPaused])

  return (
    <div className="bg-card border-y border-border py-4 overflow-hidden">
      <div
        className="flex space-x-8 animate-marquee"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        style={{
          animation: isPaused ? "none" : "marquee 60s linear infinite",
        }}
      >
        {[...trades, ...trades].map((trade, index) => (
          <div key={`${trade.id}-${index}`} className="flex-shrink-0 text-sm">
            <span className="text-muted-foreground">{trade.wallet}</span>
            <span className="mx-2">→</span>
            <span className={trade.action === "bought" ? "text-green-400" : "text-red-400"}>
              {trade.action === "bought" ? "Bought" : "Sold"}
            </span>
            <span className="mx-1 text-foreground font-medium">
              {trade.amount} {trade.asset}
            </span>
            <span className="text-muted-foreground">of</span>
            <span className="ml-1 text-primary font-medium">{trade.token}</span>
          </div>
        ))}
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 60s linear infinite;
        }
      `}</style>
    </div>
  )
}
