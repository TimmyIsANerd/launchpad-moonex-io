import { 
  parseEther, 
  formatEther, 
  encodeBytes32String,
  type Address,
  type Hash
} from 'viem'

export interface TokenDeploymentConfig {
  name: string
  symbol: string
  logoUri: string
  displayName?: string
  feeRecipient: Address
  feePercentage: number
  raiseAmount: number // ETH amount
}

export interface DeploymentResult {
  success: boolean
  tokenAddress?: Address
  curveAddress?: Address
  liquidityManagerAddress?: Address
  transactionHash?: Hash
  error?: string
  gasUsed?: string
}

export interface DeploymentParameters {
  name: string
  symbol: string
  salt: Hash
  logoURI: string
  displayName: string
  p0: string // Initial price in wei
  k: string // Slope parameter
  lpThreshold: string // Liquidity threshold in wei
  tradeFeeBps: number // Trade fee in basis points
  feeRecipient: Address
  saleStart: number // Unix timestamp (0 = immediate)
  router: Address
  maxSupply: string // Max supply in wei
  tokenFeeBps: number // Token transfer fee in basis points (100-300)
}

// Default values based on the test files and contract specifications
export const DEFAULT_CONFIG = {
  // Pricing curve parameters
  INITIAL_PRICE_BNB: 0.00000625, // Default starting price in BNB per token
  SLOPE_COEFFICIENT: 0.0000001250985, // Default slope for linear pricing curve
  TRADE_FEE_BPS: 100, // 1% trade fee
  
  // Token supply and liquidity
  MAX_SUPPLY_TOKENS: 1000000000, // 1 billion tokens
  LIQUIDITY_THRESHOLD_BNB: 50, // 50 BNB threshold before creating PancakeSwap liquidity
  
  // Token transfer settings
  TOKEN_FEE_BPS: 150, // 1.5% token transfer fee (default)
  
  // Sale timing
  SALES_START_IMMEDIATE: 0, // 0 means starts immediately
  
  // Network configuration
  PANCAKESWAP_ROUTER_BSC_TESTNET: '0xD99D1c33F9fC3444f8101754aBC46c52416550D1' as Address,
  MOONEX_FACTORY_ADDRESS: '0xDf686F4dD229DBa0E1A7E06A8e720384c30aE809' as Address,
  
  // Salt generation
  UNIQUE_SUFFIX_LENGTH: 8
}

/**
 * Generate unique salt for CREATE2 deterministic deployment
 */
export function generateUniqueSalt(symbol: string, creatorAddress: Address): Hash {
  const timestamp = Math.floor(Date.now() / 1000)
  const randomSuffix = Math.random().toString(36).substring(2, 2 + DEFAULT_CONFIG.UNIQUE_SUFFIX_LENGTH)
  const saltString = `${symbol.toUpperCase()}-${timestamp}-${randomSuffix}-${creatorAddress.slice(2, 10)}`
  return encodeBytes32String(saltString)
}

/**
 * Map form configuration to smart contract deployment parameters
 */
export function mapFormToContractParams(
  config: TokenDeploymentConfig,
  creatorAddress: Address
): DeploymentParameters {
  const salt = generateUniqueSalt(config.symbol, creatorAddress)
  
  // Calculate initial price: raiseAmount / maxSupply
  const raiseAmountWei = parseEther(config.raiseAmount.toString())
  const maxSupplyWei = parseEther(DEFAULT_CONFIG.MAX_SUPPLY_TOKENS.toString())
  
  // If raiseAmount is 0 or very small, use default pricing
  const initialPriceWei = config.raiseAmount > 0 && config.raiseAmount < 1000 
    ? parseEther((raiseAmountWei * BigInt(1000) / maxSupplyWei).toString())
    : parseEther(DEFAULT_CONFIG.INITIAL_PRICE_BNB.toString())
  
  return {
    name: config.name,
    symbol: config.symbol.toUpperCase(),
    salt,
    logoURI: config.logoUri || '',
    displayName: config.displayName || '',
    p0: initialPriceWei.toString(),
    k: parseEther(DEFAULT_CONFIG.SLOPE_COEFFICIENT.toString()).toString(),
    lpThreshold: parseEther(DEFAULT_CONFIG.LIQUIDITY_THRESHOLD_BNB.toString()).toString(),
    tradeFeeBps: DEFAULT_CONFIG.TRADE_FEE_BPS,
    feeRecipient: config.feeRecipient,
    saleStart: DEFAULT_CONFIG.SALES_START_IMMEDIATE,
    router: DEFAULT_CONFIG.PANCAKESWAP_ROUTER_BSC_TESTNET,
    maxSupply: maxSupplyWei.toString(),
    tokenFeeBps: Math.max(100, Math.min(300, config.feePercentage * 100)) // Convert percentage to bps, clamp to valid range
  }
}

/**
 * Estimate gas for fair launch deployment
 */
export function estimateDeploymentGas(
  params: DeploymentParameters,
  factoryAddress: Address = DEFAULT_CONFIG.MOONEX_FACTORY_ADDRESS
): bigint {
  // Based on the test deployment gas costs from bsc-testnet-deployments.json
  // Factory deployment gas: ~6M gas units
  // Each fair launch creates: BondingCurveLaunch (~2.3M) + LiquidityManager (~0.5M) + Token init (~0.2M)
  const estimatedGas = BigInt(3500000) // Conservative estimate
  
  return estimatedGas
}

/**
 * Estimate BNB cost for deployment based on current gas price
 */
export async function estimateDeploymentCost(
  params: DeploymentParameters,
  gasPriceGwei: number = 5 // Default 5 gwei for BSC testnet
): Promise<{
  gasLimit: bigint
  gasCostBNB: string
  gasCostUSD?: number
}> {
  const gasLimit = estimateDeploymentGas(params)
  const gasCostWei = gasLimit * BigInt(Math.floor(gasPriceGwei * 1e9))
  const gasCostBNB = formatEther(gasCostWei)
  
  return {
    gasLimit,
    gasCostBNB,
    // USD cost can be added later with BNB price feed
  }
}

/**
 * Validate deployment parameters before attempting deployment
 */
export function validateDeploymentParams(params: DeploymentParameters): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (!params.name.trim()) {
    errors.push('Token name is required')
  }
  
  if (!params.symbol.trim() || params.symbol.length < 2) {
    errors.push('Token symbol must be at least 2 characters')
  }
  
  if (!params.feeRecipient || params.feeRecipient === '0x0000000000000000000000000000000000000000') {
    errors.push('Valid fee recipient address is required')
  }
  
  if (params.tokenFeeBps < 100 || params.tokenFeeBps > 300) {
    errors.push('Token fee must be between 1% and 3%')
  }
  
  // Validate numeric parameters
  try {
    BigInt(params.p0)
    BigInt(params.k)
    BigInt(params.lpThreshold)
    BigInt(params.maxSupply)
  } catch {
    errors.push('Invalid numeric parameters')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Format deployment summary for user display
 */
export function formatDeploymentSummary(params: DeploymentParameters): string {
  return `
🚀 Fair Launch Deployment Summary:
   📛 Token: ${params.name} (${params.symbol})
   💰 Initial Price: ${formatEther(BigInt(params.p0))} BNB
   🎯 Liquidity Threshold: ${formatEther(BigInt(params.lpThreshold))} BNB
   📊 Max Supply: ${formatEther(BigInt(params.maxSupply))} tokens
   💸 Token Fee: ${(params.tokenFeeBps / 100).toFixed(1)}%
   🔗 PancakeSwap Router: ${params.router}
  `
}
