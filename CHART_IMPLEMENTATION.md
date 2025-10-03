# Trading Chart Implementation

## Overview
This document describes the implementation of the real-time trading chart feature for the MoonEx Launchpad. The chart displays candlestick (OHLCV) data from the subgraph and updates periodically to provide live market data visualization.

## Implementation Summary

### 1. Technology Stack
- **Chart Library**: [TradingView Lightweight Charts](https://www.tradingview.com/lightweight-charts/) v5.0.9
  - Professional-grade charting library optimized for financial data
  - Supports candlestick, OHLCV, and other chart types
  - Interactive features: zoom, pan, crosshair
  - Highly performant and responsive

### 2. Architecture

#### Components Created/Modified

**New Files:**
- `src/hooks/useTokenCandles.ts` - React Query hook for fetching candle data from subgraph
- `components/trading-chart.tsx` - Main chart component using TradingView Lightweight Charts

**Modified Files:**
- `app/token/[tokenAddress]/page.tsx` - Integrated `TradingChart` component, replaced old `PriceChart`

#### Data Flow

```
Subgraph (Goldsky) 
  ↓ (GraphQL Query)
useTokenCandles Hook (React Query)
  ↓ (Periodic refetch every 30s)
TradingChart Component
  ↓ (Data transformation)
TradingView Lightweight Charts
  ↓ (Render)
User Interface
```

### 3. Subgraph Integration

#### Candle Entities Used
The subgraph provides time-bucketed OHLCV data in four timeframes:
- `Candle1m` - 1-minute candles
- `Candle5m` - 5-minute candles
- `Candle1h` - 1-hour candles
- `Candle1d` - 1-day candles

#### Schema (from `moonex-io-contracts/subgraph/schema.graphql`)
```graphql
type Candle1h @entity {
  id: ID!
  token: Token!
  open: BigDecimal!
  high: BigDecimal!
  low: BigDecimal!
  close: BigDecimal!
  volumeBase: BigDecimal!
  trades: Int!
  startTimestamp: BigInt!
  endTimestamp: BigInt!
}
```

#### GraphQL Queries (in `src/queries/index.ts`)
```graphql
query Candles1h($token: ID!, $from: BigInt!, $to: BigInt!, $first: Int = 200) {
  candle1hs(
    where: { token: $token, startTimestamp_gte: $from, startTimestamp_lte: $to }
    orderBy: startTimestamp
    orderDirection: asc
    first: $first
  ) {
    id
    startTimestamp
    endTimestamp
    open
    high
    low
    close
    volumeBase
    trades
  }
}
```

### 4. Component Details

#### `useTokenCandles` Hook

**Purpose**: Fetches and caches candle data from the subgraph with automatic refresh

**Key Features**:
- Accepts timeframe parameter: `'1m' | '5m' | '1h' | '1d'`
- Fetches last 24 hours of data by default
- Auto-refetches every 30 seconds for real-time updates
- Returns data in a format ready for chart rendering

**Helper Functions**:
```typescript
// Convert candle data to TradingView format
convertCandlesToTradingView(candles: CandleData[])

// Get latest price from candle data
getLatestPrice(candles: CandleData[]): number | null

// Calculate 24h price change percentage
calculate24hChange(candles: CandleData[]): number | null
```

#### `TradingChart` Component

**Purpose**: Renders an interactive candlestick chart with timeframe selection

**Features**:
- **Multiple Timeframes**: 1m, 5m, 1h, 1d (switchable via buttons)
- **Real-time Updates**: Chart data refreshes every 30 seconds
- **Interactive Chart**:
  - Zoom: Mouse wheel or pinch gesture
  - Pan: Click and drag
  - Crosshair: Hover to see exact values
- **Loading States**: Shows loading/error/empty states
- **Price Display**: Current price and 24h change in header
- **Responsive Design**: Adapts to container width

**Color Scheme**:
- Up candles: Green (#10b981)
- Down candles: Red (#ef4444)
- Grid lines: Dark gray (#374151)
- Background: Transparent (matches app theme)

### 5. Integration Points

#### Token Detail Page (`app/token/[tokenAddress]/page.tsx`)

**Before:**
```tsx
<PriceChart
  tokenName={tokenName}
  currentPrice={formatUSD(price, 6)}
  change24h={change24h}
  data={chartData}
/>
```

**After:**
```tsx
<TradingChart
  tokenAddress={params.tokenAddress}
  tokenName={tokenName}
  tokenSymbol={tokenSymbol}
/>
```

The new component is self-contained and fetches its own data, simplifying the parent component.

### 6. Real-time Updates

The chart implements real-time updates through multiple mechanisms:

1. **React Query Refetch Interval**: 30 seconds
   ```typescript
   staleTime: 30_000,
   refetchInterval: 30_000,
   refetchIntervalInBackground: true,
   ```

2. **Data Transformation**: On each update, candle data is transformed to TradingView format
   ```typescript
   useEffect(() => {
     if (!seriesRef.current || !candles) return
     const tradingViewData = convertCandlesToTradingView(candles)
     seriesRef.current.setData(tradingViewData)
   }, [candles])
   ```

3. **Automatic Chart Updates**: TradingView library efficiently updates only changed data points

### 7. Performance Optimizations

1. **Data Caching**: React Query caches responses for 30 seconds
2. **Efficient Re-renders**: Chart only updates when candle data changes
3. **Lazy Loading**: Chart library is only loaded when component mounts
4. **Limited Data Range**: Fetches only last 24 hours (configurable)
5. **Debounced Resize**: Chart resize is handled efficiently by the library

### 8. Error Handling

The component handles multiple error scenarios:

```typescript
{isLoading ? (
  <div>Loading chart data...</div>
) : error ? (
  <div>Error loading chart data</div>
) : !candles || candles.length === 0 ? (
  <div>No chart data available</div>
) : (
  <div ref={chartContainerRef} />
)}
```

### 9. Future Enhancements

Potential improvements for the chart feature:

1. **Volume Chart**: Add a volume histogram below the price chart
2. **Technical Indicators**: RSI, MACD, Moving Averages
3. **Drawing Tools**: Trend lines, horizontal lines, annotations
4. **More Timeframes**: 15m, 30m, 4h, 1w
5. **Chart Types**: Line chart, area chart as alternatives
6. **Full-screen Mode**: Dedicated chart view
7. **Export**: Download chart as image
8. **Alerts**: Price/volume threshold notifications
9. **Compare**: Overlay multiple tokens
10. **Post-listing Data**: Integrate PancakeSwap data after bonding curve completion

### 10. Testing

To test the chart implementation:

1. **Start Development Server**:
   ```bash
   cd launchpad-moonex-io
   pnpm dev
   ```

2. **Navigate to Token Page**:
   - Go to `/token/[valid-token-address]`
   - Replace `[valid-token-address]` with an actual token address from your subgraph

3. **Test Scenarios**:
   - ✅ Chart loads and displays candles
   - ✅ Timeframe buttons switch data (1m, 5m, 1h, 1d)
   - ✅ Chart is interactive (zoom, pan, crosshair)
   - ✅ Price and 24h change display correctly
   - ✅ Chart updates every 30 seconds
   - ✅ Loading state shows during data fetch
   - ✅ Empty state shows when no data available
   - ✅ Chart is responsive to window resize

### 11. Dependencies

**New Package Added**:
```json
{
  "dependencies": {
    "lightweight-charts": "^5.0.9"
  }
}
```

**Installation Command**:
```bash
pnpm add lightweight-charts
```

### 12. Configuration

**Environment Variables Required**:
- `NEXT_PUBLIC_SYSTEM_SUBGRAPH` - Goldsky subgraph endpoint URL

**GraphQL Queries Location**:
- `src/queries/index.ts` - Contains all candle queries

**Contract Addresses**:
- Token addresses are passed as props from the parent page component

### 13. Browser Compatibility

TradingView Lightweight Charts supports:
- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

### 14. Accessibility

Current accessibility features:
- Keyboard navigation supported by library
- ARIA labels on timeframe buttons
- Semantic HTML structure

Areas for improvement:
- Add screen reader announcements for price changes
- Keyboard shortcuts for chart controls
- High contrast mode support

## Conclusion

The trading chart implementation provides a professional-grade, real-time visualization of token price data. It leverages the subgraph's pre-computed candle data for performance, updates automatically every 30 seconds, and offers an intuitive user interface with multiple timeframes and interactive features.

The implementation follows React best practices, uses TypeScript for type safety, and integrates seamlessly with the existing MoonEx Launchpad architecture.



