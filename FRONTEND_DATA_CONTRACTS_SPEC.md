# Frontend Data + Smart Contracts Integration Spec

Purpose
- Define the on-chain contracts, events, and subgraph entities/queries the frontend requires.
- Map each page/component in this Next.js app to the data it needs and the contract calls it invokes.
- Specify TradingView-compatible candlestick requirements and fundraising/bond completion tracking, including the cosmetic $5,000 USD market cap rule pre-completion.

Target chain
- BNB Chain (as implied by UI copy). Token pairs may later be listed on PancakeSwap after bond completion.

High-level data flow
1) Smart contracts (Factory + BondingCurve + ERC20 + optional LiquidityLocker) emit events and expose view/mutating functions.
2) A custom MoonEx Launchpad Subgraph indexes these contracts and materializes:
   - Token lifecycle (created → bonding → listed)
   - Fundraising progress and contributions
   - Holders, trades, and aggregate stats (price, volume, market cap proxies)
   - Candlesticks (OHLCV) per token/pair/timeframe to drive TradingView
3) Optionally, read from PancakeSwap subgraphs (or index your own router/pair) to compute prices and volumes after listing.
4) The frontend queries subgraphs for data, and calls contracts for actions (buy/sell/finalize/etc.). For USD values, the frontend multiplies token/base-asset prices by a base-asset→USD rate fetched off-chain or from a stable-quoted pair subgraph.

Important constraints
- Subgraphs cannot fetch off-chain prices. USD conversions must be done in the client or via a separate service.
- Before bond completion, the UI must display a cosmetic market cap of $5,000 USD. This is a frontend rule unless you choose to emit/display it via events.

Contracts overview (proposed)
- LaunchpadFactory
  - createLaunch(params) → (token, curve)
    - params: name, symbol, decimals, baseAsset (address), targetRaise (base units), curveParams, treasury, feeBps, metadataURI (optional)
  - events:
    - TokenLaunched(token, curve, creator, baseAsset, targetRaise, curveParams, timestamp, metadataURI)
- BondingCurvePool (one per token during raise)
  - buy(minTokensOut, to) payable/approve-based
  - sell(tokenAmount, minBaseOut, to)
  - quoteBuy(baseIn) view → tokensOut
  - quoteSell(tokensIn) view → baseOut
  - getProgress() view → { raisedBase, targetRaise, tokensSold, totalSupply }
  - isComplete() view → bool
  - finalizeAndList(router, amountToken, amountBase, minToken, minBase, to, deadline)
    - Creates pair, adds liquidity (e.g., PancakeSwap), may lock LP tokens.
  - events:
    - Contribution(buyer, baseIn, tokensOut, price, timestamp)
    - Redemption(seller, tokensIn, baseOut, price, timestamp)
    - BondCompleted(totalRaised, timestamp)
    - ListedOnDex(router, pair, tokenAmount, baseAmount, lpLock)
- ERC20 Token (standard)
  - Mint/burn controlled by BondingCurvePool during raise
  - Transfer events indexed for holder balances
- LiquidityLocker (optional)
  - Lock LP tokens upon listing; emit LiquidityLocked(token, pair, amount, unlockTime)

Subgraph architecture (MoonEx Launchpad Subgraph)
- Networks: BNB Chain
- Data sources/handlers:
  - LaunchpadFactory: handleTokenLaunched → create Token + BondingCurve entities
  - BondingCurvePool: handleContribution, handleRedemption, handleBondCompleted, handleListedOnDex
  - ERC20 Token: handleTransfer for balances/holders
  - Optional: your own indexed Router/Pair events for post-listing trades, or rely on PancakeSwap’s official subgraphs

Core entities
- Token
  - id: tokenAddress
  - name, symbol, decimals
  - creator: address
  - baseAsset: address (BNB or an ERC20 like USDT)
  - createdAt: BigInt
  - status: enum { CURVE, LISTED, FINALIZED }
  - curve: BondingCurve! (derived)
  - pair: Pair (optional, set when listed)
  - metadataURI: string (optional)
  - stats: TokenStats (derived latest)
- BondingCurve
  - id: curveAddress
  - token: Token!
  - baseAsset: address
  - targetRaise: BigInt
  - raisedBase: BigInt
  - tokensSold: BigInt
  - isComplete: Boolean
  - completedAt: BigInt (nullable)
- Contribution
  - id: txHash-logIndex
  - token: Token!
  - user: address
  - baseIn: BigInt
  - tokensOut: BigInt
  - priceInBase: BigDecimal (quote at time of trade)
  - timestamp: BigInt
- Redemption
  - id: txHash-logIndex
  - token: Token!
  - user: address
  - tokensIn: BigInt
  - baseOut: BigInt
  - priceInBase: BigDecimal
  - timestamp: BigInt
- Pair (optional if you manage post-listing in your subgraph)
  - id: pairAddress
  - token: Token!
  - baseAsset: address
- Trade (post-listing swaps; either from your router/pair or imported from a DEX subgraph)
  - id: txHash-logIndex
  - token: Token!
  - side: enum { BUY, SELL }
  - baseAmount: BigDecimal
  - tokenAmount: BigDecimal
  - priceInBase: BigDecimal
  - timestamp: BigInt
- TokenHolder
  - id: tokenAddress-userAddress
  - token: Token!
  - user: address
  - balance: BigInt
  - updatedAt: BigInt
- TokenStats (rolling/latest)
  - id: tokenAddress
  - token: Token!
  - priceInBase: BigDecimal (see pricing rules below)
  - priceChange24hPct: BigDecimal
  - volume24hBase: BigDecimal
  - liquidityBase: BigDecimal (post-listing; from pair reserves)
  - marketCapInBase: BigDecimal (proxy)
  - holdersCount: Int
  - lastUpdated: BigInt
- DailySnapshot (optional, for ranking/time-series)
  - id: tokenAddress-dayId
  - token: Token!
  - open/high/low/closeInBase: BigDecimal
  - volumeBase: BigDecimal
  - startTimestamp: BigInt
- CandleX (candlestick buckets for TradingView)
  - Candle1m / Candle5m / Candle1h / Candle1d
  - id: tokenAddress-intervalStart
  - token: Token!
  - open, high, low, close: BigDecimal (in base asset)
  - volumeBase: BigDecimal
  - trades: Int
  - startTimestamp: BigInt
  - endTimestamp: BigInt

Pricing and USD conversions
- During bonding: priceInBase should be computed from the curve’s formula at the moment of trade (or via quote functions in events). marketCapInBase ≈ priceInBase × totalSupply.
- After listing: priceInBase should reflect pair price (token/base) from last trade or reserves.
- USD conversions must be done client-side: priceInUSD = priceInBase × baseUSD. Obtain baseUSD via:
  - A separate subgraph query to a stable-quoted pair (e.g., BNB/USDT on PancakeSwap), or
  - A trusted off-chain price service.
- Cosmetic $5,000 USD market cap rule: Before BondingCurve.isComplete == true, the UI displays marketCapUSDDisplay = 5,000, regardless of computed cap. After completion (and/or listing), switch to computed market cap.

Frontend component → data mapping
- Navbar / Wallet
  - No subgraph dependency. Uses wallet connection only.

- Landing (app/page.tsx) – EnhancedTokenTable
  - Query Token list with TokenStats fields needed for columns:
    - rank (computed client-side from sort), name, symbol, baseAsset
    - priceInBase (convert to USD in client), priceChange24hPct, marketCapInBase, volume24hBase
    - creator, createdAt, onPancakeSwap (status === LISTED), contractAddress
    - tradingVolume (use volume24hBase; convert to USD in client if desired)
  - Sorting: by volume24hBase (desc) or createdAt.

- Ranking (app/ranking/page.tsx)
  - For MarketCap ranking: sort Tokens by marketCapInBase (convert to USD client-side). Apply $5K override for CURVE stage when displaying.
  - For 24H Volume ranking: sort by volume24hBase.
  - Optional: use DailySnapshot for day-boundary accuracy.

- Advanced Explorer (app/advanced/page.tsx)
  - Newly Created: Tokens where createdAt is recent and status = CURVE.
  - About to Launch: Tokens where (targetRaise – raisedBase) is small (e.g., ≤ X%) and status = CURVE.
  - Trading Volume: Tokens with high volume24hBase regardless of status.
  - Quick Buy: Uses the same buy flow as token detail (see BuySellPanel) against BondingCurvePool if status = CURVE, or a DEX swap post-listing.

- Create Token (app/create-token/page.tsx)
  - Contract calls:
    - LaunchpadFactory.createLaunch(params)
    - Optionally emit metadata (website/twitter/telegram) via TokenLaunched metadataURI, or keep off-chain.
  - Subgraph:
    - Reflect new Token and BondingCurve after TokenLaunched.
  - UI gating: requires wallet connected.

- Token Detail (app/token/[tokenAddress]/page.tsx)
  - Header/Stats
    - Query Token + TokenStats
      - name, symbol, decimals, status, creator, createdAt
      - priceInBase, priceChange24hPct, marketCapInBase, volume24hBase, liquidityBase (if listed)
      - holdersCount
    - USD conversions client-side; apply $5K override if status = CURVE.
  - TradingView Price Chart
    - Fetch CandleX entities (time-bucketed OHLCV) for the selected timeframe (1m/5m/1h/1d). The frontend’s TradingView datafeed adapter transforms CandleX rows into TV bars [{time, open, high, low, close, volume}].
    - Token pre-listing: candles derive from BondingCurve Contribution/Redemption events.
    - Post-listing: candles derive from Trade events (router/pair) or PancakeSwap subgraph.
  - BondingCurveProgress widget
    - Query BondingCurve for { targetRaise, raisedBase, tokensSold, isComplete }
    - Compute progressPercent = raisedBase / targetRaise.
    - remainingToken = totalSupplyTarget – tokensSold (if applicable to your curve model).
    - targetMarketCap: display cosmetic $5,000 until isComplete, then computed.
  - HoldersTable
    - Query top N TokenHolder ordered by balance desc, with balance and percentage = balance / totalSupply.
  - Trades/Comments
    - Trades: show recent Contribution/Trade events from subgraph, normalized to a common display.
    - Comments: off-chain (not subgraph); maintain separate service if needed.
  - Buy/Sell Panel
    - Pre-listing (status = CURVE): call BondingCurvePool.buy / sell and show quotes via quoteBuy / quoteSell.
    - Post-listing: route through a DEX router (e.g., PancakeSwap) swaps.
    - Handle approvals when baseAsset is ERC20.

TradingView integration details
- Subgraph must materialize OHLCV by timeframe; avoid client-side aggregation for performance.
- Recommended intervals: 1m, 5m, 1h, 1d.
- Candle entity creation/update logic (in mappings):
  - Derive intervalStart = floor(timestamp / interval) * interval
  - If first trade in bucket, set open = price; always update high/low; set close = price; sum volumeBase; increment trades
  - Maintain separate Candle stores per interval to avoid expensive recalculation
- The frontend uses a TradingView datafeed adapter that queries CandleX and converts to bars format { time: ms, open, high, low, close, volume }.

Queries (indicative)
- List tokens (for tables/landing)
  - fields: id, name, symbol, baseAsset, createdAt, status, stats { priceInBase, priceChange24hPct, marketCapInBase, volume24hBase, liquidityBase }
- Token detail
  - token(id) { id, name, symbol, decimals, status, creator, createdAt, pair { id }, stats { ... } }
  - bondingCurve(id or token) { targetRaise, raisedBase, tokensSold, isComplete, completedAt }
  - holders(first: N, orderBy: balance, orderDirection: desc) { user, balance }
- Candles
  - candle1h(token: $token, startTime: $from, endTime: $to) { startTimestamp, open, high, low, close, volumeBase }
- Rankings
  - tokens(orderBy: stats.marketCapInBase, orderDirection: desc) … or daily snapshots for precise day boundaries

Actions and contract calls by component
- Create Token
  - Approvals: none (factory deploys new curve/token)
  - Call: LaunchpadFactory.createLaunch(params)
- Buy on curve
  - If baseAsset is native (BNB): send value with buy(minOut, to)
  - If baseAsset is ERC20: ensure allowance for curve; then buy(minOut, to)
  - Quote: quoteBuy(baseIn)
- Sell on curve (if allowed pre-listing)
  - Approve token to curve; then sell(tokenAmount, minBaseOut, to)
  - Quote: quoteSell(tokensIn)
- Finalize and list
  - Call finalizeAndList(router, amountToken, amountBase, …) once isComplete
  - Events set pair and status = LISTED
- Post-listing trades
  - Use router swaps; UI handles slippage and path; subgraph reads trades from router/pair events (or PancakeSwap subgraph)

Market cap display logic ($5,000 cosmetic rule)
- If Token.status = CURVE and !BondingCurve.isComplete: displayMarketCapUSD = 5,000
- Else:
  - marketCapUSD = (priceInBase × totalSupply) × baseUSD
  - Obtain baseUSD separately (BNB/USDT price); do not attempt in mapping.

Holders and balances
- Index Transfer events for each token.
- Maintain TokenHolder.balance; recompute holdersCount by counting holders with balance > 0 (careful with performance; maintain a counter in mappings).

24h change and volume
- In mappings, maintain rolling windows or daily snapshots.
- For priceChange24hPct: compare latest close with close 24h ago (from Candle1h/1d or snapshot).
- For volume24hBase: sum trades within last 24h window; keep running totals and decay old buckets.

Advanced/Explorer views
- “Newly Created”: Tokens createdAt within last X hours (configurable), status = CURVE
- “About to Launch”: status = CURVE and raisedBase / targetRaise ≥ threshold (e.g., ≥ 80%)
- “Trading Volume”: sort by volume24hBase (all statuses)
- MEV Protection toggle: UI-only; no on-chain dependency unless integrating a private relay.

Approvals and UX
- When baseAsset is ERC20: prompt for approve(baseAsset, curve, amount) before buy
- When selling on curve: approve(token, curve, amount)
- Respect slippage set in panel; use quotes for minOut

Security and integrity notes
- Validate inputs (slippage, deadlines) in router/curve calls
- Consider fee model and treasury collection via events for subgraph accounting
- If listing liquidity is locked, index LiquidityLocker events and expose lock status in TokenStats

Open questions / implementation choices
- Exact bonding curve formula (linear, exponential, Bancor-style) dictates how quoteBuy/quoteSell are implemented and how priceInBase is computed in events.
- Whether redemptions are allowed pre-listing (sell on curve); the UI supports it but behavior is contract-defined.
- Whether to index DEX trades in our subgraph or rely entirely on PancakeSwap subgraphs (recommended: use official DEX subgraph for post-listing price/volume, and only handle pre-listing trades locally).

Deliverables
- Contracts: LaunchpadFactory, BondingCurvePool, ERC20 Token, optional LiquidityLocker
- Subgraph: MoonEx Launchpad Subgraph with the entities and handlers above (plus schema and mappings)
- Frontend:
  - TradingView datafeed adapter that queries CandleX entities and outputs TradingView bars
  - Queries for Token lists, Token detail, BondingCurve progress, Holders, Candles, and Rankings
  - USD conversion via baseUSD rate from a stable pair subgraph or a price service
