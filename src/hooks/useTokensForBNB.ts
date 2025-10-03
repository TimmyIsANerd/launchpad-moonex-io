import { useReadContract } from "wagmi"
import { BondingCurveLaunchABI } from "@/abis"
import { formatEther, parseEther } from "viem"

/**
 * Calculate how many tokens can be bought for given BNB amount
 * Uses the exact same math as the smart contract's buy() function
 */
export function useTokensForBNB(curveAddress?: string, bnbAmount?: string) {
  const cleanAmount = bnbAmount ? bnbAmount.replace(/,/g, '') : undefined
  
  // Get all required contract parameters
  const { data: p0Data, isLoading: p0Loading } = useReadContract({
    address: curveAddress as `0x${string}`,
    abi: BondingCurveLaunchABI.abi,
    functionName: "p0",
    query: {
      enabled: !!curveAddress,
      refetchInterval: 5000,
    },
  })

  const { data: kData, isLoading: kLoading } = useReadContract({
    address: curveAddress as `0x${string}`,
    abi: BondingCurveLaunchABI.abi,
    functionName: "k",
    query: {
      enabled: !!curveAddress,
      refetchInterval: 5000,
    },
  })

  const { data: soldData, isLoading: soldLoading } = useReadContract({
    address: curveAddress as `0x${string}`,
    abi: BondingCurveLaunchABI.abi,
    functionName: "sold",
    query: {
      enabled: !!curveAddress,
      refetchInterval: 5000,
    },
  })

  const { data: feeBpsData, isLoading: feeLoading } = useReadContract({
    address: curveAddress as `0x${string}`,
    abi: BondingCurveLaunchABI.abi,
    functionName: "tradeFeeBps",
    query: {
      enabled: !!curveAddress,
      refetchInterval: 5000,
    },
  })

  const isLoading = p0Loading || kLoading || soldLoading || feeLoading

  let tokensReceived: number | null = null
  let feeAmount: number | null = null

  if (!isLoading && cleanAmount && p0Data && kData !== undefined && soldData && feeBpsData !== undefined) {
    try {
      const bnbValue = parseFloat(cleanAmount)
      if (bnbValue <= 0) return { tokensReceived: null, feeAmount: null, isLoading: false }

      // Calculate platform fee first (same as contract)
      const feeBps = Number(feeBpsData)
      const feeRate = feeBps / 10000
      feeAmount = bnbValue * feeRate
      const bnbForTrading = bnbValue - feeAmount

      // Work directly with wei values to match contract exactly
      const p0Wei = Number(p0Data as bigint)
      const kWei = Number(kData as bigint)
      const soldWei = Number(soldData as bigint)
      const bnbForTradingWei = Math.floor(bnbForTrading * 1e18)

      let deltaWei = 0

      if (kWei === 0) {
        // Constant price: deltaWei = (bnbForTrading * 1e18) / p0
        deltaWei = Math.floor((bnbForTradingWei * 1e18) / p0Wei)
      } else {
        // Linear bonding curve: solve quadratic equation
        // k*Δq² + 2*(p0 + k*q₀)*Δq - 2*A = 0
        const W = 1e18
        const a = p0Wei
        const b = kWei
        const q0 = Math.floor(soldWei / W) // Current quantity in token units
        
        const B = 2 * (a + b * q0)
        const discriminant = B * B + 8 * b * bnbForTradingWei
        
        if (discriminant >= 0) {
          const sqrtD = Math.sqrt(discriminant)
          if (sqrtD >= B) {
            deltaWei = Math.floor((sqrtD - B) / (2 * b))
          }
        }
      }

      // Convert deltaWei to tokens (divide by 1e18)
      tokensReceived = deltaWei / 1e18

      // Ensure we don't return negative values
      if (tokensReceived < 0) {
        tokensReceived = 0
      }

    } catch (error) {
      console.error("Error calculating tokens for BNB:", error)
      tokensReceived = null
      feeAmount = null
    }
  }

  return {
    tokensReceived,
    feeAmount,
    isLoading,
  }
}
