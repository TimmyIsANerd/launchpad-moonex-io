import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Fetch BNB price from CoinGecko API
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd',
      {
        next: { revalidate: 60 }, // Cache for 1 minute
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch BNB price')
    }

    const data = await response.json()
    const bnbPrice = data.binancecoin?.usd || 0

    return NextResponse.json({ 
      price: bnbPrice,
      symbol: 'BNB',
      timestamp: Date.now()
    })
  } catch (error) {
    console.error('Error fetching BNB price:', error)
    return NextResponse.json(
      { error: 'Failed to fetch BNB price' },
      { status: 500 }
    )
  }
}