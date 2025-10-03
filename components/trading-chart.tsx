"use client"

import { useEffect, useRef, useState } from "react"
import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickData, CandlestickSeriesOptions, CandlestickSeries } from "lightweight-charts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useTokenCandles, convertCandlesToTradingView, getLatestPrice, calculate24hChange, type Timeframe } from "@/src/hooks/useTokenCandles"

interface TradingChartProps {
  tokenAddress: string
  tokenName: string
  tokenSymbol: string
  className?: string
}

const timeframes: { key: Timeframe; label: string }[] = [
  { key: "1m", label: "1m" },
  { key: "5m", label: "5m" },
  { key: "1h", label: "1h" },
  { key: "1d", label: "1d" },
]

export function TradingChart({ tokenAddress, tokenName, tokenSymbol, className }: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null)
  const [timeframe, setTimeframe] = useState<Timeframe>("1h")

  const { data: candles, isLoading, error } = useTokenCandles(tokenAddress, timeframe)

  // Log errors for debugging
  useEffect(() => {
    if (error) {
      console.error('📊 TradingChart: Chart error detected:', error)
      console.error('📊 TradingChart: Error details:', {
        message: error.message,
        stack: error.stack,
        tokenAddress,
        timeframe
      })
    }
  }, [error, tokenAddress, timeframe])

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#6b7280",
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      grid: {
        vertLines: { color: "#374151" },
        horzLines: { color: "#374151" },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: "#374151",
        textColor: "#6b7280",
      },
      timeScale: {
        borderColor: "#374151",
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
    })

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#10b981",
      downColor: "#ef4444",
      borderDownColor: "#ef4444",
      borderUpColor: "#10b981",
      wickDownColor: "#ef4444",
      wickUpColor: "#10b981",
    })

    chartRef.current = chart
    seriesRef.current = candlestickSeries

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chart) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        })
      }
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      chart.remove()
    }
  }, [])

  // Update chart data when candles change
  useEffect(() => {
    if (!seriesRef.current || !candles) return

    console.log('📊 TradingChart: Received candles data:', candles)
    console.log('📊 TradingChart: Candles length:', candles.length)
    
    const tradingViewData = convertCandlesToTradingView(candles)
    console.log('📊 TradingChart: Converted TradingView data:', tradingViewData)
    console.log('📊 TradingChart: TradingView data length:', tradingViewData.length)
    
    if (tradingViewData.length > 0) {
      console.log('📊 TradingChart: Setting chart data with', tradingViewData.length, 'data points')
      seriesRef.current.setData(tradingViewData)
    } else {
      console.log('⚠️ TradingChart: No data to set - candles array is empty')
    }
  }, [candles])

  const latestPrice = getLatestPrice(candles || [])
  const change24h = calculate24hChange(candles || [])

  const formatPrice = (price: number | null) => {
    if (price === null) return "—"
    
    // Handle very small numbers (like 0.0000000575)
    if (price > 0 && price < 0.001) {
      const priceStr = price.toString()
      const decimalIndex = priceStr.indexOf('.')
      
      if (decimalIndex === -1) return price.toFixed(4)
      
      const afterDecimal = priceStr.substring(decimalIndex + 1)
      let firstNonZeroIndex = 0
      
      // Find first non-zero digit
      for (let i = 0; i < afterDecimal.length; i++) {
        if (afterDecimal[i] !== '0') {
          firstNonZeroIndex = i
          break
        }
      }
      
      // Extract zeros before significant digits and the significant digits
      const zerosBeforeSignificant = firstNonZeroIndex
      const significantPart = afterDecimal.substring(firstNonZeroIndex)
      
      // Take up to 4 significant digits
      const significantDigits = significantPart.substring(0, 4)
      
      // Create formatted string: 0.{zeros}{significant}
      return `0.${'0'.repeat(zerosBeforeSignificant)}${significantDigits}`
    }
    
    // For larger numbers, use standard formatting
    return price.toFixed(4)
  }

  const formatChange = (change: number | null) => {
    if (change === null) return "—"
    const sign = change >= 0 ? "+" : ""
    return `${sign}${change.toFixed(2)}%`
  }

  return (
    <Card className={`border-border ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <span>{tokenName} ({tokenSymbol}) Price Chart</span>
          </CardTitle>
          <div className="flex space-x-1">
            {timeframes.map((tf) => (
              <Button
                key={tf.key}
                variant={timeframe === tf.key ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeframe(tf.key)}
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
            <p className="text-2xl font-bold text-foreground">
              {formatPrice(latestPrice)} BNB
            </p>
            {change24h !== null ? (
              <p className={`text-sm ${change24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                {formatChange(change24h)} (24h)
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">— (24h)</p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-96 w-full">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-muted-foreground">Loading chart data...</div>
            </div>
          ) : error ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-red-400">Error loading chart data</div>
            </div>
          ) : !candles || candles.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-muted-foreground">No chart data available</div>
            </div>
          ) : (
            <div ref={chartContainerRef} className="h-full w-full" />
          )}
        </div>
      </CardContent>
    </Card>
  )
}