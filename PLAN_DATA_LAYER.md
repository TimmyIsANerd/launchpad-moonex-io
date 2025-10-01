Task: Design and implement a cohesive read-data layer for MoonEx that uses the Goldsky-hosted subgraph for all on-chain reads and the Hono Terminal API for off-chain content, with clear coverage for every page/component. Include gap-handling where the subgraph doesn’t (and shouldn’t) provide data. Deliver a step-by-step plan and milestones.

Primary objectives
- Centralize on-chain reads via the subgraph (GraphQL) using NEXT_PUBLIC_SYSTEM_SUBGRAPH.
- Centralize off-chain reads via the Terminal API (REST) for user-generated content & token metadata that’s not on-chain.
- Replace all demo/sample data in Next.js components/pages with live data sourced from the above.
- Clarify and document where subgraph coverage ends (e.g., post-listing DEX price/liquidity) and how to bridge via DEX subgraphs or interim client logic.

Environment anchors (from repo)
- Subgraph endpoint (Next env):
  - File: launchpad-moonex-io/.env
  - Key: NEXT_PUBLIC_SYSTEM_SUBGRAPH (Goldsky; provided).
- Subgraph schema/entities (local source-of-truth):
  - moonex-io-contracts/subgraph/schema.graphql
  - Key entities: Token, TokenStats, TokenHolder, BondingCurve, Contribution, Redemption, Candle1m/5m/1h/1d, UserTokenStats.
  - Subgraph mappings: factory.ts, bondingCurve.ts, registry.ts, token.ts.
  - Notably present: LPThresholdReached (isComplete). Not present: pair/trade post-listing.
- Terminal API (Hono) routes/models (off-chain):
  - Routes: src/routes/{meme,post,comment,userProfile,upload}.js
  - Models: Meme (address,ticker,desc,telegram,image), Post, Comment, PostComment, UserProfile.
  - Base URL: default http://localhost:1337 (PORT env); expose via NEXT_PUBLIC_TERMINAL_API_URL.
- Frontend pages and components currently using sample data:
  - app/page.tsx (landing), app/ranking/page.tsx, app/advanced/page.tsx, app/token/[tokenAddress]/page.tsx
  - Components: EnhancedTokenTable, PriceChart, BondingCurveProgress, HoldersTable, TradesComments.
- Spec doc that maps UI → data: launchpad-moonex-io/FRONTEND_DATA_CONTRACTS_SPEC.md

What the subgraph covers (and how to query it)
- Token core: Token { id,name,symbol,decimals,owner,createdAt,displayName,logoURI }
- Rolling stats: TokenStats { priceInBase, volume24hBase, cumulativeVolumeBase, holdersCount, lastUpdated }
- Curve progress: BondingCurve { isComplete, completedAt, raisedBase, tokensSold, p0,k,lpThreshold,fee fields, saleStart }
- Activity feeds: Contribution and Redemption (priceInBase, base/token amounts, user, timestamp)
- Candles: Candle1m/5m/1h/1d { open,high,low,close,volumeBase,trades,startTimestamp,endTimestamp }
- Holders: TokenHolder { user,balance } with monotonic holdersCount tracked in TokenStats
- Per-user aggregates: UserTokenStats { buys/sells in base/tokens, lastUpdated }

Known gaps (not in subgraph)
- Post-listing stats (pair reserves, liquidityBase, trades) are not modeled. Future options:
  1) Integrate official DEX subgraph (e.g., PancakeSwap) post-listing; or
  2) Extend current subgraph schema to capture “Listed” event and pair/trade indexing.
- USD conversion: subgraphs cannot hit off-chain APIs. Do client-side conversion (or add a tiny Terminal API proxy to a price service).
- Rich token profile content (description, social links, avatars, posts, comments) is intentionally off-chain → Terminal API.

Page-by-page data plan (reads only)
- Landing (EnhancedTokenTable)
  - Subgraph: list Tokens with TokenStats fields { priceInBase, volume24hBase, holdersCount, lastUpdated }. Sort by volume24hBase or createdAt.
  - Terminal API: merge optional Meme metadata by token address (name overrides, desc, telegram, image) via GET /api/memes/address/:address.
- Ranking
  - Subgraph: same as Landing but sorted views; apply cosmetic $5,000 USD market cap rule pre-completion on display.
  - Client: market cap proxy = priceInBase × totalSupply; since totalSupply isn’t in schema, either call ERC20 totalSupply via viem or extend subgraph in a later milestone. Until then, keep $5k rule pre-completion.
- Advanced Explorer
  - Subgraph: filters via createdAt and BondingCurve.isComplete/raisedBase. Use TokenStats.volume24hBase for Trading Volume tab.
  - Client: “Quick Buy” remains UI-level; no on-chain execution handled here.
- Token Detail
  - Subgraph:
    - token(id): { name,symbol,decimals,owner,createdAt,displayName,logoURI }
    - token.stats: { priceInBase, volume24hBase, holdersCount, lastUpdated }
    - bondingCurve(token): { isComplete, completedAt, raisedBase, tokensSold, p0,k,lpThreshold,... }
    - contributions/redemptions (recent N) for activity feed.
    - candles for selected interval: Candle1m/5m/1h/1d with time-bounded query.
    - holders: top N TokenHolder by balance.
  - Terminal API:
    - GET /api/memes/address/:address to enrich profile (desc, image, socials),
    - GET/POST /api/comments?meme=<id> for token comment feed.
  - Post-listing price/liquidity: follow-up integration with DEX subgraph.

Concrete GraphQL queries to author (names are illustrative)
- tokensForLanding(first,skip,orderBy):
  - Token { id,name,symbol,decimals,createdAt, displayName,logoURI, stats { priceInBase, volume24hBase, holdersCount, lastUpdated }, bondingCurve { isComplete } }
- tokenDetail(tokenId):
  - token(id)
  - token.stats
  - bondingCurve(token)
- tokenCandles(tokenId, interval, from, to):
  - candle1m/5m/1h/1d with where: { token: tokenId, startTimestamp_gte: from, startTimestamp_lte: to } ordered asc
- tokenTrades(tokenId):
  - contributions(where: { token: tokenId }, orderBy: timestamp, orderDirection: desc, first: N)
  - redemptions(where: { token: tokenId }, orderBy: timestamp, orderDirection: desc, first: N)
- tokenHoldersTop(tokenId, first):
  - tokenHolders(where: { token: tokenId }, orderBy: balance, orderDirection: desc, first)
- userTokenAggregates(tokenId, user):
  - userTokenStats(id: `${token}-${user}`)
- bondingCurveProgress(curveId or tokenId):
  - bondingCurve { isComplete, raisedBase, tokensSold, completedAt }

Terminal API endpoints to use (from code)
- GET /api/memes (page,pageSize), GET /api/memes/address/:address, POST /api/memes
- GET /api/comments (page,pageSize,meme), POST /api/comments
- GET /api/comments/post-comments (page,pageSize,post), POST /api/comments/post-comments
- GET /api/posts (page,pageSize), POST /api/posts
- GET /api/user-profiles/address/:address, POST /api/user-profiles
- POST /api/upload (multipart form-data: files)

Implementation milestones
1) Env + clients
   - Add NEXT_PUBLIC_TERMINAL_API_URL and verify NEXT_PUBLIC_SYSTEM_SUBGRAPH is set.
   - Build lib/subgraphClient.ts: fetchGraphQL(query, variables) with retry/abort.
   - Build lib/terminalApi.ts: get/post helpers with query serialization, zod validation.
2) Queries + hooks (TanStack Query)
   - src/queries/*.gql (or .ts strings) for all queries above.
   - Hooks: useTokens, useTokenDetail, useTokenCandles(interval), useTokenTrades, useTokenHolders, useMemes, useComments, useUserProfile.
3) Wire pages/components
   - app/page.tsx → EnhancedTokenTable: replace sample array with useTokens; merge Meme by address.
   - app/ranking/page.tsx → TokenTable: source from useTokens with alt sort; apply $5k market cap display rule pre-completion.
   - app/advanced/page.tsx → source tabs from filtered useTokens + BondingCurve fields.
   - app/token/[tokenAddress]/page.tsx → stitch tokenDetail, candles, trades, holders; comments via Terminal API.
4) Derived data & USD
   - Implement client-side USD conversion using baseUSD from an external service or add a thin /prices proxy in Terminal API (optional).
   - Market cap proxy: for now, display $5k pre-completion; post-completion compute when supply source exists.
5) Tests & docs
   - Unit tests for clients and hooks (mocked fetch).
   - README section “Data layer”: when to use subgraph vs Terminal API; known gaps and roadmap.

Open confirmations needed
- Which network(s) are canonical right now? Repo mentions BNB in copy, but env points to Rise Testnet. Confirm target(s) for subgraph and UI.
- Terminal API base URL for Next (e.g., http://localhost:1337) and CORS domains for deployment.
- Post-listing data source: should we integrate an official DEX subgraph in this phase or defer to a follow-up ticket?
