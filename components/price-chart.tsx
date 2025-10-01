"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

// Sample price data
const generatePriceData = (timeframe: string) => {
  const basePrice = 0.0045
  const dataPoints = timeframe === "1H" ? 60 : timeframe === "1D" ? 24 : 168
  const data = []

  for (let i = 0; i < dataPoints; i++) {
    const variation = (Math.random() - 0.5) * 0.0002
    const price = Math.max(0.001, basePrice + variation * (i / 10))
    data.push({
      time: timeframe === "1H" ? `${i}m` : timeframe === "1D" ? `${i}h` : `${Math.floor(i / 24)}d`,
      price: Number(price.toFixed(6)),
      volume: Math.floor(Math.random() * 10000) + 1000,
    })
  }

  return data
}

interface PriceChartProps {
  tokenName: string
  currentPrice?: string
  change24h?: number
  data?: { time: string | number; price: number }[]
  defaultTimeframe?: "1H" | "1D" | "1W"
}

export function PriceChart({ tokenName, currentPrice, change24h, data, defaultTimeframe = "1D" }: PriceChartProps) {
  const [timeframe, setTimeframe] = useState<"1H" | "1D" | "1W">(defaultTimeframe)
  const [chartData] = useState(() => (data && data.length ? data : generatePriceData(timeframe)))

  const timeframes = [
    { key: "1H", label: "1H" },
    { key: "1D", label: "1D" },
    { key: "1W", label: "1W" },
  ]

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <span>{tokenName} Price Chart</span>
          </CardTitle>
          <div className="flex space-x-1">
            {timeframes.map((tf) => (
              <Button
                key={tf.key}
                variant={timeframe === tf.key ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeframe(tf.key as any)}
                className={
                  timeframe === tf.key
                    ? "bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:text-foreground"
                }
              >
                {tf.label}
              </Button>
            ))}
          </div>
        </div>
<div className="flex items-center space-x-4">
          <div>
            <p className="text-2xl font-bold text-foreground">{currentPrice ?? "—"}</p>
            {typeof change24h === "number" ? (
              <p className={`text-sm ${change24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                {change24h >= 0 ? "+" : ""}
                {change24h.toFixed(2)}% (24h)
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">— (24h)</p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
              <XAxis dataKey="time" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #4b5563",
                  borderRadius: "8px",
                  color: "#ffffff",
                }}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#00c0ff"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "#00c0ff" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
