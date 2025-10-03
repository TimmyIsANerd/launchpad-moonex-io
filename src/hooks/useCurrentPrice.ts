import { useReadContract } from "wagmi"
import { BondingCurveLaunchABI } from "@/abis"
import { formatEther } from "viem"

/**
 * Get the current price per token from the bonding curve contract
 * Uses the getCurrentPrice() function which returns price * 1e18 (scaled price factor)
 */
export function useCurrentPrice(curveAddress?: string) {
  const { data: priceScaled, isLoading, error } = useReadContract({
    address: curveAddress as `0x${string}`,
    abi: BondingCurveLaunchABI.abi,
    functionName: "getCurrentPrice",
    query: {
      enabled: !!curveAddress,
      refetchInterval: 5000, // Refetch every 5 seconds for real-time pricing
    },
  })

  // The contract returns priceFactor = price * 1e18
  // To get price in BNB per token: priceFactor / (1e18 * 1e18) = priceFactor / 1e36
  const priceInBNB = priceScaled ? Number(priceScaled as bigint) / 1e36 : null

  return {
    priceWei: priceScaled,
    priceInBNB,
    isLoading,
    error,
  }
}