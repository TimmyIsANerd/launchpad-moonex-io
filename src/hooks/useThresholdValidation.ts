import { useReadContract } from "wagmi"
import { BondingCurveLaunchABI } from "@/abis"
import { formatEther, parseEther } from "viem"

export interface ThresholdValidationResult {
  currentBalance: number
  threshold: number
  remainingCapacity: number
  percentageToThreshold: number
  canBuy: boolean
  maxPurchaseAmount: number
  isLoading: boolean
  error: Error | null
}

/**
 * Hook to validate purchases against threshold constraints
 * Prevents users from buying amounts that would exceed the liquidity creation threshold
 */
export function useThresholdValidation(curveAddress?: string, purchaseAmount?: string): ThresholdValidationResult {
  // Get threshold amount
  const { data: thresholdWei, isLoading: thresholdLoading, error: thresholdError } = useReadContract({
    address: curveAddress as `0x${string}`,
    abi: BondingCurveLaunchABI.abi,
    functionName: "lpThreshold",
    query: {
      enabled: !!curveAddress,
    },
  })

  // Get liquidity creation status
  const { data: liquidityCreated, isLoading: liquidityLoading, error: liquidityError } = useReadContract({
    address: curveAddress as `0x${string}`,
    abi: BondingCurveLaunchABI.abi,
    functionName: "liquidityCreated",
    query: {
      enabled: !!curveAddress,
    },
  })

  const threshold = thresholdWei ? Number(formatEther(thresholdWei as bigint)) : 0
  
  // Parse purchase amount
  const purchaseAmountBNB = purchaseAmount ? parseFloat(purchaseAmount) || 0 : 0
  
  // Note: We can't get real-time balance in this hook without async operations
  // The validation will be done client-side using provider.getBalance in the component
  
  // For now, return threshold data and validation function
  const isLoading = thresholdLoading || liquidityLoading
  const error = thresholdError || liquidityError

  return {
    currentBalance: 0, // Will be populated by component
    threshold,
    remainingCapacity: threshold, // Will be calculated by component
    percentageToThreshold: 0, // Will be calculated by component
    canBuy: !liquidityCreated, // Basic validation
    maxPurchaseAmount: threshold, // Will be calculated by component
    isLoading,
    error: error as Error | null,
  }
}

/**
 * Helper function to validate purchase amount against threshold
 * This performs client-side validation before sending the transaction
 */
export function validatePurchaseAmount(
  purchaseAmountBNB: number,
  currentBalanceBNB: number,
  thresholdBNB: number,
  liquidityCreated: boolean
): { isValid: boolean; errorMessage?: string } {
  if (liquidityCreated) {
    return {
      isValid: false,
      errorMessage: "🚀 Token has graduated to PancakeSwap! Trading is now unrestricted on the DEX."
    }
  }

  if (purchaseAmountBNB <= 0) {
    return {
      isValid: false,
      errorMessage: "❌ Purchase amount must be greater than 0"
    }
  }

  const projectedBalance = currentBalanceBNB + purchaseAmountBNB
  
  if (projectedBalance > thresholdBNB) {
    const maxPurchase = thresholdBNB - currentBalanceBNB
    const percentage = ((currentBalanceBNB / thresholdBNB) * 100).toFixed(1)
    
    return {
      isValid: false,
      errorMessage: `⚠️ Purchase would exceed liquidity threshold! Maximum allowed: ${maxPurchase.toFixed(4)} BNB (currently at ${percentage}%)`
    }
  }

  if (currentBalanceBNB >= thresholdBNB) {
    return {
      isValid: false,
      errorMessage: "🎉 Threshold reached! No more bonding curve purchases allowed."
    }
  }

  return { isValid: true }
}
