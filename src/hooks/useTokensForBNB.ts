import { useReadContract } from "wagmi"
import { BondingCurveLaunchABI } from "@/abis"
import { formatEther, parseEther } from "viem"

/**
 * Calculate approximately how many tokens can be bought for given BNB amount
 * This performs inverse calculation since getPriceForAmount expects token amount
 */
export function useTokensForBNB(curveAddress?: string, bnbAmount?: string) {
  const cleanAmount = bnbAmount ? bnbAmount.replace(/,/g, '') : undefined
  
  // First, get curve parameters to do manual calculation
  const { data: curveData, isLoading: paramsLoading } = useReadContract({
    address: curveAddress as `0x${string}`,
    abi: BondingCurveLaunchABI.abi,
    functionName: "getCurrentPrice",
    query: {
      enabled: !!curveAddress,
      refetchInterval: 10000,
    },
  })

  const { data: p0Data } = useReadContract({
    address: curveAddress as `0x${string}`,
    abi: BondingCurveLaunchABI.abi,
    functionName: "p0",
    query: {
      enabled: !!curveAddress,
      refetchInterval: 10000,
    },
  })

  const { data: kData } = useReadContract({
    address: curveAddress as `0x${string}`,
    abi: BondingCurveLaunchABI.abi,
    functionName: "k",
    query: {
      enabled: !!curveAddress,
      refetchInterval: 10000,
    },
  })

  const { data: soldData } = useReadContract({
    address: curveAddress as `0x${string}`,
    abi: BondingCurveLaunchABI.abi,
    functionName: "sold",
    query: {
      enabled: !!curveAddress,
      refetchInterval: 10000,
    },
  })

  const { data: feeBpsData } = useReadContract({
    address: curveAddress as `0x${string}`,
    abi: BondingCurveLaunchABI.abi,
    functionName: "tradeFeeBps",
    query: {
      enabled: !!curveAddress,
      refetchInterval: 10000,
    },
  })

  const isLoading = paramsLoading || !curveData || !p0Data || !kData || !soldData || !feeBpsData

  let tokensReceived: number | null = null
  let feeAmount: number | null = null

  // Debug logging
  if (process.env.NODE_ENV === 'development' && cleanAmount) {
    console.log("useTokensForBNB:", {
      isLoading,
      cleanAmount,
      hasData: !!curveData && !!p0Data && !!kData && !!soldData && !!feeBpsData
    })
  }

  if (!isLoading && cleanAmount) {
    try {
      const bnbValue = parseFloat(cleanAmount)
      const p0 = parseFloat(formatEther(p0Data as bigint))
      const k = parseFloat(formatEther(kData as bigint))
      const sold = parseFloat(formatEther(soldData as bigint))
      const feeBps = Number(feeBpsData)
      
      if (process.env.NODE_ENV === 'development') {
        console.log("Contract values:", { bnbValue, p0, k, sold, feeBps })
      }
      
      // Calculate platform fee (subtract from available BNB)
      const feeRate = feeBps / 10000
      feeAmount = bnbValue * feeRate
      const bnbForTrading = bnbValue - feeAmount

      if (k === 0) {
        // Constant price: tokens = bnb / price
        tokensReceived = bnbForTrading / p0
        if (process.env.NODE_ENV === 'development') {
          console.log("Tokens received:", Math.floor(tokensReceived))
        }
      } else {
        // Quadratic curve calculation
        // We need to solve: A = a*t + (b/2)*((q0 + t)² - q0²)
        // For constant k curve: cost = p0*t + (k/2)*t²
        // Rearranging: (k/2)*t² + p0*t - A = 0
        
        const a = p0
        const b = k / 2
        const c = -bnbForTrading
        
        // Quadratic formula: t = (-b + sqrt(b² - 4*a*c)) / (2*a)
        const discriminant = a * a + 8 * b * bnbForTrading
        if (discriminant >= 0) {
          tokensReceived = (-a + Math.sqrt(discriminant)) / (2 * b)
        }
      }
    } catch (error) {
      console.error("Error calculating tokens for BNB:", error)
    }
  }

  return {
    tokensReceived,
    feeAmount,
    isLoading,
  }
}
