// Placeholder module to collect GraphQL queries.
// Fill these with real documents based on PLAN_DATA_LAYER.md and schema.graphql.

export const Q_TOKENS_FOR_LANDING = /* GraphQL */ `
  query TokensForLanding($first: Int!, $skip: Int!) {
    tokens(first: $first, skip: $skip, orderBy: createdAt, orderDirection: desc) {
      id
      name
      symbol
      decimals
      createdAt
      displayName
      logoURI
      owner
      stats {
        priceInBase
        volume24hBase
        holdersCount
        lastUpdated
      }
      bondingCurve {
        isComplete
        raisedBase
        lpThreshold
      }
    }
  }
`

export const Q_TOKEN_DETAIL = /* GraphQL */ `
  query TokenDetail($id: ID!, $firstTrades: Int = 50, $firstHolders: Int = 30) {
    token(id: $id) {
      id
      name
      symbol
      decimals
      owner
      createdAt
      displayName
      logoURI
      stats {
        priceInBase
        volume24hBase
        cumulativeVolumeBase
        holdersCount
        lastUpdated
      }
    }
    bondingCurves(where: { token: $id }, first: 1) {
      id
      isComplete
      completedAt
      raisedBase
      tokensSold
      p0
      k
      lpThreshold
      tradeFeeBps
      feeRecipient
      liquidityManager
      owner
      saleStart
    }
    contributions(where: { token: $id }, orderBy: timestamp, orderDirection: desc, first: $firstTrades) {
      id
      user
      baseIn
      tokensOut
      priceInBase
      timestamp
    }
    redemptions(where: { token: $id }, orderBy: timestamp, orderDirection: desc, first: $firstTrades) {
      id
      user
      tokensIn
      baseOut
      priceInBase
      timestamp
    }
    tokenHolders(where: { token: $id }, orderBy: balance, orderDirection: desc, first: $firstHolders) {
      id
      user
      balance
      updatedAt
    }
  }
`

export const Q_CANDLES_1M = /* GraphQL */ `
  query Candles1m($token: ID!, $from: BigInt!, $to: BigInt!, $first: Int = 200) {
    candle1ms(
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
`

export const Q_CANDLES_5M = /* GraphQL */ `
  query Candles5m($token: ID!, $from: BigInt!, $to: BigInt!, $first: Int = 200) {
    candle5ms(
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
`

export const Q_CANDLES_1H = /* GraphQL */ `
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
`

export const Q_CANDLES_1D = /* GraphQL */ `
  query Candles1d($token: ID!, $from: BigInt!, $to: BigInt!, $first: Int = 200) {
    candle1ds(
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
`
