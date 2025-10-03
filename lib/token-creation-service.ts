// Enhanced Token Creation Service
// Integrates smart contract deployment with off-chain data storage

import { parseEther, parseUnits, keccak256, toUtf8Bytes } from 'viem'
import { moonexApi, type LaunchPreparationData, type DeploymentResult } from './moonex-api'
import { useWallet } from '@/components/wallet-provider'

interface TokenCreationParams {
  name: string
  symbol: string
  description: string
  logoUri?: string
  feeRecipient: string
  feePercentage: number
  category?: string
  website?: string
  twitter?: string
  telegram?: string
  raisedToken?: string
  raiseAmount?: string
  // Smart contract parameters
  p0: string  // Initial price in wei
  k: string   // Curve slope
  lpThreshold: string  // LP threshold in wei
  maxSupply: string    // Max supply in wei
  saleStart?: number  // Sale start timestamp
}

interface TokenCreationResult {
  memeId: string
  tokenAddress: string
  curveAddress: string
  liquidityManagerAddress: string
  transactionHash: string
}

export class TokenCreationService {
  private factoryContract: any // Will be injected with wagmi contract
  private walletProvider: any   // Will be injected with wallet provider

  constructor(factoryContract: any, walletProvider: any) {
    this.factoryContract = factoryContract
    this.walletProvider = walletProvider
  }

  async createToken(params: TokenCreationParams): Promise<TokenCreationResult> {
    try {
      // Step 1: Prepare off-chain data
      const memeId = await this.prepareLaunchOffChain(params)
      
      // Step 2: Deploy smart contracts
      const deploymentResult = await this.deploySmartContracts(params, memeId)
      
      // Step 3: Update off-chain data with contract addresses
      await this.updateLaunchWithResults(memeId, deploymentResult)
      
      return {
        memeId,
        ...deploymentResult.contractAddresses!
      }
    } catch (error) {
      console.error('Token creation failed:', error)
      throw error
    }
  }

  private async prepareLaunchOffChain(params: TokenCreationParams): Promise<string> {
    const logoUri = params.logoUri ? await this.uploadLogo(params.logoUri) : undefined
    
    const preparationData: LaunchPreparationData = {
      name: params.name,
      ticker: params.symbol,
      desc: params.description,
      // Convert fee percentage to basis points for validation
      feePercentage: params.feePercentage,
      feeRecipient: params.feeRecipient,
      category: params.category || 'Meme',
      logoUri,
      displayName: params.name.toLowerCase().replace(/\s+/g, '-'),
      initialPrice: params.lpThreshold,
      curveSlope: params.lpThreshold,
      maxSupply: params.maxSupply,
      lpThreshold: params.lpThreshold,
      socialLinks: {
        website: params.website,
        twitter: params.twitter,
        telegram: params.telegram
      },
      creatorAddress: this.walletProvider.address
    }

    const response = await moonexApi.prepareLaunch(preparationData)
    return response.data._id
  }

  private async deploySmartContracts(params: TokenCreationParams, memeId: string): Promise<DeploymentResult> {
    const { address: creatorAddress } = this.walletProvider
    
    // Generate salt for deterministic deployment
    const salt = keccak256(toUtf8Bytes(`${params.name}-${params.symbol}-${creatorAddress}-${Date.now()}`))
    
    // Default parameters based on the implemented tokenomics
    const contractParams = [
      params.name,
      params.symbol,
      salt,
      params.logoUri || "",
      params.name.toLowerCase().replace(/\s+/g, '-'),
      parseEther("0.00000000625"), // 0.000000005625 BNB per token
      0,                           // Linear curve slope
      parseEther("0.05"),          // 0.05 BNB LP threshold
      100,                         // 1% trade fee BPS
      params.feeRecipient,
      params.saleStart || 0,       // Sale start timestamp
      "0xD99D1c33F9fC3444f8101754aBC46c52416550D1", // Pancake router
      parseEther("1000000000"),    // 1B token supply
      Math.round(params.feePercentage * 100)] as const // Convert % to basis points

    try {
      console.log('Deploying token contracts with params:', contractParams)
      
      const txHash = await this.factoryContract.writeContractAsync({
        address: this.factoryContract.address,
        abi: this.factoryContract.abi,
        functionName: 'deployFairLaunch',
        args: contractParams
      })
      
      console.log('Transaction sent:', txHash)
      
      // Wait for transaction confirmation
      const receipt = await this.factoryContract.waitForTransactionReceipt({
        hash: txHash,
        confirmations: 1
      })
      
      if (receipt.status !== 'success') {
        throw new Error('Transaction failed')
      }
      
      // Parse transaction result to get contract addresses
      const event = receipt.logs.find(log => {
        try {
          const decoded = this.factoryContract.interface.parseLog(log)
          return decoded?.name === 'FairLaunchDeployed'
        } catch {
          return false
        }
      })
      
      if (!event) {
        throw new Error('Failed to find deployment event')
      }
      
      const decoded = this.factoryContract.interface.parseLog(event)
      
      return {
        transactionHash: txHash,
        status: 'SUCCESS',
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        contractAddresses: {
          token: decoded?.args[0] || '',
          curve: decoded?.args[1] || '',
          liquidityManager: decoded?.args[2] || ''
        }
      }
      
    } catch (error) {
      console.error('Smart contract deployment failed:', error)
      
      return {
        transactionHash: '',
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  private async updateLaunchWithResults(memeId: string, result: DeploymentResult): Promise<void> {
    await moonexApi.updateDeployment(memeId, result)
    
    if (result.status === 'SUCCESS') {
      // Update launch status to BONDING
      await moonexApi.updateLaunchStatus(memeId, {
        type: 'BONDING'
      })
    }
  }

  private async uploadLogo(logoUri: string): Promise<string> {
    try {
      // If it's a data URL, convert to file
      if (logoUri.startsWith('data:')) {
        const response = await fetch(logoUri)
        const blob = await response.blob()
        const file = new File([blob], 'logo.png', { type: blob.type })
        
        const uploadResult = await moonexApi.uploadFile(file)
        return `${moonexApi.baseURL}/api/upload/${uploadResult.filename || uploadResult.name}`
      }
      
      return logoUri
    } catch (error) {
      console.error('Logo upload failed:', error)
      return logoUri // Fallback to original URI
    }
  }

  async recordTradingActivity(
    tokenAddress: string, 
    action: 'BUY' | 'SELL' | 'CLAIM',
    amount: string,
    paymentAmount: string,
    price: string,
    transactionHash: string,
    fees?: { platformFee?: string; tokenFee?: string; burnAmount?: string }
  ) {
    try {
      // Get meme by token address
      const meme = await moonexApi.getMemeByAddress(tokenAddress)
      
      await moonexApi.recordTradingActivity(meme.data._id, {
        userAddress: this.walletProvider.address,
        transactionHash,
        action,
        paymentAmount,
        fees,
        status: 'SUCCESS',
        blockNumber: 0, // You'll need to get this from transaction receipt
        gasUsed: '0'    // You'll need to get this from transaction receipt
      })
    } catch (error) {
      console.error('Failed to record trading activity:', error)
      // Don't throw - trading should succeed even if activity logging fails
    }
  }
}

// React hook for easy integration
export const useTokenCreationService = () => {
  const { address, connect } = useWallet()
  
  // Mock implementation - replace with actual contract and provider injection
  const factoryContract = {
    address: "0x...", // Your factory address
    abi: [], // Your factory ABI
    writeContractAsync: async (params: any) => {
      // Mock - implement with actual wagmi contract call
      throw new Error('Implement with actual wagmi contract')
    },
    waitForTransactionReceipt: async (params: any) => {
      // Mock - implement with actual wagmi contract call
      throw new Error('Implement with actual wagmi contract')
    },
    interface: {
      parseLog: (log: any) => ({ name: string, args: any })
    }
  }
  
  const tokenCreationService = new TokenCreationService(
    factoryContract,
    { address }
  )
  
  return {
    tokenCreationService,
    isWalletConnected: !!address,
    connectWallet: connect,
    walletAddress: address
  }
}
