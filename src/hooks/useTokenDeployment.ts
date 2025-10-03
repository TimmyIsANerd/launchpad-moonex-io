import { useState } from 'react'
import { useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi'
import { parseEther } from 'viem'
import { 
  TokenDeploymentConfig, 
  DeploymentResult, 
  DeploymentParameters,
  mapFormToContractParams,
  validateDeploymentParams,
  DEFAULT_CONFIG,
  estimateDeploymentCost
} from '@/src/services/token-deployment'
import { moonexApi } from '@/lib/moonex-api'

// Import the contract ABI
import MoonExFactoryABI from '@/abis/MoonExFactory.json'

export interface UseTokenDeploymentOptions {
  onSubmit?: (result: DeploymentResult) => void
  onSuccess?: (addresses: { token: string, curve: string, lm: string }) => void
  onError?: (error: string) => void
}

export function useTokenDeployment() {
  const [isDeploying, setIsDeploying] = useState(false)
  const [deploymentProgress, setDeploymentProgress] = useState<string>('')
  const [currentTransactionHash, setCurrentTransactionHash] = useState<string>('')
  
  const { writeContractAsync, status } = useWriteContract()
  const publicClient = usePublicClient()
  
  const { 
    data: txReceipt,
    isLoading: isConfirming,
    error: txError 
  } = useWaitForTransactionReceipt({
    hash: currentTransactionHash as `0x${string}`,
    enabled: !!currentTransactionHash
  })

  /**
   * Deploy fair launch token via MoonEx Factory
   */
  const deployToken = async (
    config: TokenDeploymentConfig,
    creatorAddress: `0x${string}`
  ): Promise<DeploymentResult> => {
    try {
      setIsDeploying(true)
      setDeploymentProgress('Preparing deployment parameters...')
      
      // Map form data to contract parameters
      const params = mapFormToContractParams(config, creatorAddress)
      
      // Validate parameters
      const validation = validateDeploymentParams(params)
      if (!validation.isValid) {
        return {
          success: false,
          error: `Validation failed: ${validation.errors.join(', ')}`
        }
      }
      
      setDeploymentProgress('Estimating gas costs...')
      
      // Estimate gas and costs
      const gasEstimate = await estimateDeploymentCost(params)
      console.log('📊 Gas Estimate:', {
        gasLimit: gasEstimate.gasLimit.toString(),
        costBNB: gasEstimate.gasCostBNB
      })
      
      setDeploymentProgress('Deploying smart contract...')
      
      // Execute deployment transaction
      const txHash = await writeContractAsync({
        address: DEFAULT_CONFIG.MOONEX_FACTORY_ADDRESS,
        abi: MoonExFactoryABI,
        functionName: 'deployFairLaunch',
        args: [
          params.name,
          params.symbol,
          params.salt,
          params.logoURI,
          params.displayName,
          BigInt(params.p0),
          BigInt(params.k),
          BigInt(params.lpThreshold),
          params.tradeFeeBps,
          params.feeRecipient,
          params.saleStart,
          params.router,
          BigInt(params.maxSupply),
          params.tokenFeeBps
        ],
        gas: gasEstimate.gasLimit
      })
      
      setCurrentTransactionHash(txHash)
      setDeploymentProgress(`Transaction submitted: ${txHash}`)
      
      // Wait for confirmation (this will be handled by useWaitForTransactionReceipt)
      return {
        success: true,
        transactionHash: txHash
      }
      
    } catch (error: any) {
      console.error('Deployment error:', error)
      setIsDeploying(false)
      return {
        success: false,
        error: error.message || 'Deployment failed'
      }
    }
  }

  /**
   * Update API with deployment result after transaction confirms
   */
  const updateDeploymentStatus = async (
    memeId: string,
    txHash: string,
    receipt: any
  ) => {
    try {
      setDeploymentProgress('Updating launch status...')
      
      // Extract contract addresses from transaction receipt
      const tokenAddress = extractContractAddresses(receipt)
      
      // Update API with deployment result
      await moonexApi.updateDeployment(memeId, {
        status: 'SUCCESS',
        transactionHash: txHash,
        blockNumber: Number(receipt.blockNumber),
        gasUsed: receipt.gasUsed?.toString() || '0',
        contractAddresses: tokenAddress,
        status: 'SUCCESS'
      })
      
      // Update launch status to BONDING
      await moonexApi.updateLaunchStatus(memeId, {
        type: 'BONDING',
        listedAt: new Date().toISOString()
      })
      
      setDeploymentProgress('Deployment completed successfully! 🎉')
      
      return {
        success: true,
        tokenAddress: tokenAddress.token,
        curveAddress: tokenAddress.curve,
        liquidityManagerAddress: tokenAddress.liquidityManager
      }
      
    } catch (error: any) {
      console.error('Failed to update deployment status:', error)
      
      // Still update API with failure
      await moonexApi.updateDeployment(memeId, {
        status: 'FAILED',
        transactionHash: txHash,
        errorMessage: error.message
      })
      
      return {
        success: false,
        error: error.message
      }
    } finally {
      setIsDeploying(false)
    }
  }

  /**
   * Extract contract addresses from transaction receipt logs
   */
  function extractContractAddresses(receipt: any): {
    token: string
    curve: string
    liquidityManager: string
  } {
    // The MoonExFactory emits events that contain the contract addresses
    // We'll look for FairLaunchDeployed event
    const fairLaunchEvent = receipt.logs?.find((log: any) => 
      log.topics[0] === '0x...' // FairLaunchDeployed event topic
    )
    
    if (fairLaunchEvent) {
      // Extract addresses from event data
      // This would need to be updated based on actual event structure
      return {
        token: '0x' + fairLaunchEvent.data.slice(26, 66), // Placeholder extraction
        curve: '0x' + fairLaunchEvent.data.slice(66, 106),
        liquidityManager: '0x' + fairLaunchEvent.data.slice(106, 146)
      }
    }
    
    // Fallback: try to extract from deployed contracts
    return {
      token: receipt.contractAddress || '',
      curve: '',
      liquidityManager: ''
    }
  }

  return {
    deployToken,
    updateDeploymentStatus,
    isDeploying,
    isConfirming,
    deploymentProgress,
    currentTransactionHash,
    transactionReceipt: txReceipt,
    txError,
    status
  }
}

/**
 * Hook specifically for handling the complete deployment flow
 */
export function useDeploymentFlow(options: UseTokenDeploymentOptions = {}) {
  const deploymentHook = useTokenDeployment()
  
  const deployCompleteFlow = async (
    memeId: string,
    config: TokenDeploymentConfig,
    creatorAddress: `0x${string}`
  ) => {
    try {
      // Start deployment
      const initialResult = await deploymentHook.deployToken(config, creatorAddress)
      
      if (!initialResult.success || !initialResult.transactionHash) {
        options.onError?.(initialResult.error || 'Deployment failed')
        return initialResult
      }
      
      // Wait for user confirmation or auto-process
      return initialResult
      
    } catch (error: any) {
      const errorResult = {
        success: false,
        error: error.message
      }
      options.onError?.(error.message)
      return errorResult
    }
  }
  
  return {
    ...deploymentHook,
    deployCompleteFlow
  }
}
