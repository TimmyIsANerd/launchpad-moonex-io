import { useQuery } from '@tanstack/react-query'
import { fetchGraphQL } from '@/lib/subgraphClient'
import { Q_CANDLES_1M, Q_CANDLES_5M, Q_CANDLES_1H, Q_CANDLES_1D } from '@/src/queries'

export type Timeframe = '1m' | '5m' | '1h' | '1d'

export interface CandleData {
  id: string
  startTimestamp: string
  endTimestamp: string
  open: string
  high: string
  low: string
  close: string
  volumeBase: string
  trades: number
}

export interface CandlesResponse {
  candle1Ms?: CandleData[]
  candle5Ms?: CandleData[]
  candle1Hs?: CandleData[]
  candle1Ds?: CandleData[]
}

// Convert timeframe to seconds for timestamp calculations
const timeframeToSeconds = (timeframe: Timeframe): number => {
  switch (timeframe) {
    case '1m': return 60
    case '5m': return 300
    case '1h': return 3600
    case '1d': return 86400
    default: return 3600
  }
}

// Get the appropriate query based on timeframe
const getQueryForTimeframe = (timeframe: Timeframe) => {
  switch (timeframe) {
    case '1m': return Q_CANDLES_1M
    case '5m': return Q_CANDLES_5M
    case '1h': return Q_CANDLES_1H
    case '1d': return Q_CANDLES_1D
    default: return Q_CANDLES_1H
  }
}

// Get the appropriate field name for the response
const getFieldNameForTimeframe = (timeframe: Timeframe): keyof CandlesResponse => {
  switch (timeframe) {
    case '1m': return 'candle1Ms'
    case '5m': return 'candle5Ms'
    case '1h': return 'candle1Hs'
    case '1d': return 'candle1Ds'
    default: return 'candle1Hs'
  }
}

export function useTokenCandles(
  tokenAddress: string,
  timeframe: Timeframe = '1h',
  limit: number = 200
) {
  return useQuery({
    queryKey: ['tokenCandles', tokenAddress, timeframe, limit],
    queryFn: async (): Promise<CandleData[]> => {
      if (!tokenAddress) return []

      try {
        console.log('🔍 useTokenCandles: Starting fetch for token:', tokenAddress, 'timeframe:', timeframe)
        
        // Calculate time range - get last 24 hours of data
        const now = Math.floor(Date.now() / 1000)
        const intervalSeconds = timeframeToSeconds(timeframe)
        const from = now - (24 * 3600) // 24 hours ago
        const to = now

        console.log('🔍 useTokenCandles: Time range:', { from, to, timeframe })

        const query = getQueryForTimeframe(timeframe)
        const fieldName = getFieldNameForTimeframe(timeframe)
        
        console.log('🔍 useTokenCandles: GraphQL query:', query)
        console.log('🔍 useTokenCandles: Variables:', {
          token: tokenAddress.toLowerCase(),
          from: from.toString(),
          to: to.toString(),
          first: limit
        })

        const response = await fetchGraphQL<CandlesResponse>(query, {
          token: tokenAddress.toLowerCase(),
          from: from.toString(),
          to: to.toString(),
          first: limit
        })

        console.log('🔍 useTokenCandles: GraphQL response:', response)
        console.log('🔍 useTokenCandles: Field name:', fieldName)
        console.log('🔍 useTokenCandles: Candles data:', response[fieldName])

        const candles = response[fieldName] || []
        console.log('🔍 useTokenCandles: Final candles:', candles)
        console.log('🔍 useTokenCandles: Candles length:', candles.length)
        
        if (candles.length === 0) {
          console.log('⚠️ useTokenCandles: No candles returned - checking token address:', tokenAddress)
          console.log('⚠️ useTokenCandles: Full response keys:', Object.keys(response))
          console.log('⚠️ useTokenCandles: Checking all potential field names:')
          console.log('  - candle1Hs:', response['candle1Hs'] || 'undefined')
          console.log('  - candle1Ms:', response['candle1Ms'] || 'undefined') 
          console.log('  - candle5Ms:', response['candle5Ms'] || 'undefined')
          console.log('  - candle1Ds:', response['candle1Ds'] || 'undefined')
        }
        
        return candles
      } catch (error) {
        console.error('❌ useTokenCandles: Error fetching candle data:', error)
        throw error
      }
    },
    enabled: !!tokenAddress,
    staleTime: 30_000, // 30 seconds
    refetchInterval: 30_000, // Refetch every 30 seconds for real-time updates
    refetchIntervalInBackground: true,
  })
}

// Helper function to convert candle data to TradingView format
export function convertCandlesToTradingView(candles: CandleData[]) {
  console.log('🔄 convertCandlesToTradingView: Input candles:', candles)
  
  const converted = candles.map(candle => {
    const convertedCandle = {
      time: Math.floor(parseInt(candle.startTimestamp)) as any,
      open: parseFloat(candle.open),
      high: parseFloat(candle.high),
      low: parseFloat(candle.low),
      close: parseFloat(candle.close),
      volume: parseFloat(candle.volumeBase)
    }
    
    console.log('🔄 convertCandlesToTradingView: Converting candle:', candle, '→', convertedCandle)
    return convertedCandle
  })
  
  console.log('🔄 convertCandlesToTradingView: Final converted data:', converted)
  return converted
}

// Helper function to get the latest price from candles
export function getLatestPrice(candles: CandleData[]): number | null {
  if (!candles.length) return null
  const latest = candles[candles.length - 1]
  return parseFloat(latest.close)
}

// Helper function to calculate 24h change percentage
export function calculate24hChange(candles: CandleData[]): number | null {
  if (candles.length < 2) return null
  
  const first = parseFloat(candles[0].open)
  const last = parseFloat(candles[candles.length - 1].close)
  
  if (first === 0) return null
  
  return ((last - first) / first) * 100
}
