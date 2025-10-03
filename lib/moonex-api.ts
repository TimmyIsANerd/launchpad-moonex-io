// MoonEx API Client for hono-terminal-api integration

export interface LaunchPreparationData {
  name: string
  ticker: string
  desc: string
  logoUri?: string
  displayName?: string
  feeRecipient: string
  feePercentage: number
  category: string
  website?: string
  twitter?: string
  telegram?: string
  initialPrice?: string
  curveSlope?: string
  maxSupply?: string
  lpThreshold?: string
  socialLinks?: {
    website?: string
    twitter?: string
    telegram?: string
  }
  creatorAddress: string
}

export interface DeploymentResult {
  transactionHash: string
  status: 'SUCCESS' | 'FAILED'
  blockNumber?: number
  gasUsed?: string
  contractAddresses?: {
    token: string
    curve: string
    liquidityManager: string
  }
  errorMessage?: string
}

export interface TradingActivityData {
  userAddress: string
  transactionHash: string
  action: 'BUY' | 'SELL' | 'CLAIM'
  amount: string
  paymentAmount: string
  price: string
  fees?: {
    platformFee?: string
    tokenFee?: string
    burnAmount?: string
  }
  status?: 'PENDING' | 'SUCCESS' | 'FAILED'
  blockNumber?: number
  gasUsed?: string
  curveSnapshot?: {
    tokensSold: string
    baseRaised: string
    currentPrice: string
  }
  errorMessage?: string
}

class MoonExAPIClient {
  private baseURL: string
  private token: string | null = null

  constructor(base_URL?: string) {
    this.baseURL = base_URL || process.env.NEXT_PUBLIC_TERMINAL_API_URL || 'http://localhost:2000'
  }

  setToken(token: string) {
    this.token = token
  }

  clearToken() {
    this.token = null
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // Public request method for external use
  async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    return this.request<T>(endpoint, options)
  }

  // Authentication
  async authenticateWallet(address: string, signature: string, message: string, timestamp?: number) {
    const data = await this.request<{
      jwt: string
      user: {
        walletAddress: string
        username?: string
        profilePicture?: string
        authType: 'wallet'
      }
    }>('/api/auth/wallet-sign', {
      method: 'POST',
      body: JSON.stringify({
        address,
        signature,
        message,
        timestamp: timestamp || Date.now()
      })
    })

    this.setToken(data.jwt)
    return data
  }

  async getWalletUser() {
    return this.request<{
      walletAddress: string
      username?: string
      profilePicture?: string
      hasEmailAccount: boolean
      authType: 'wallet'
    }>('/api/auth/me/wallet')
  }

  // Launch Management
  async prepareLaunch(data: LaunchPreparationData) {
    return this.request<{
      data: {
        _id: string
        name: string
        ticker: string
        desc: string
        address: string
        feeRecipient: string
        feePercentage: number
        category: string
        launchStatus: {
          type: 'PREPARING'
          preparedAt: string
          estimatedGasCost: string
          estimatedBNBCost: string
        }
        createdAt: string
        updatedAt: string
      }
    }>('/api/launches/prepare', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateDeployment(memeId: string, result: DeploymentResult) {
    return this.request<{
      data: {
        meme: any
        launchTransaction: any
      }
    }>(`/api/launches/${memeId}/deploy`, {
      method: 'PUT',
      body: JSON.stringify(result)
    })
  }

  async updateLaunchStatus(memeId: string, status: {
    type: 'BONDING' | 'LISTED' | 'COMPLETED' | 'FAILED'
    totalRaised?: string
    tokensSold?: string
    listedAt?: string
    completedAt?: string
  }) {
    return this.request<{
      data: any
    }>(`/api/launches/${memeId}/status`, {
      method: 'PUT',
      body: JSON.stringify(status)
    })
  }

  // Trading Activity
  async recordTradingActivity(memeId: string, data: TradingActivityData) {
    return this.request<{
      data: any
    }>(`/api/launches/${memeId}/trading-activity`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async getTradingActivity(
    memeId: string,
    params?: {
      page?: number
      limit?: number
      action?: 'BUY' | 'SELL' | 'CLAIM'
      user?: string
    }
  ) {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.action) searchParams.set('action', params.action)
    if (params?.user) searchParams.set('user', params.user)

    const queryString = searchParams.toString()
    const endpoint = `/api/launches/${memeId}/trading-activity${queryString ? `?${queryString}` : ''}`

    return this.request<{
      data: any[]
      meta: {
        pagination: {
          page: number
          limit: number
          total: number
          pages: number
        }
      }
    }>(endpoint)
  }

  // User Profiles
  async getUserProfile(address: string) {
    return this.request<{
      data: {
        _id: string
        address: string
        username?: string
        profilePicture?: string
        createdAt: string
        updatedAt: string
      }
    }>(`/api/user-profiles/address/${address}`)
  }

  async createUserProfile(data: {
    address: string
    username?: string
    profilePicture?: string
  }) {
    return this.request<{
      data: any
    }>('/api/user-profiles', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  // Uploads
  async uploadFile(file: File) {
    const formData = new FormData()
    formData.append('files', file)

    // Remove content-type header for multipart
    const headers: HeadersInit = {}
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    const response = await fetch(`${this.baseURL}/api/upload`, {
      method: 'POST',
      headers,
      body: formData
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // Check ticker availability
  async checkTickerAvailability(ticker: string) {
    return this.request<{
      available: boolean
      ticker?: string
      suggestion?: string
      error?: string
      conflict?: {
        ticker: string
        existingAddress: string
        existingName: string
        existingStatus: string
      }
    }>(`/api/launches/check-ticker/${ticker}`)
  }

  // Memes/Tokens
  async getMemeByAddress(address: string) {
    return this.request<{
      data: any
    }>(`/api/memes/address/${address}`)
  }

  async updateMeme(id: string, data: any) {
    return this.request<{
      data: any
    }>(`/api/memes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async getUserLaunches(address: string) {
    return this.request<{
      data: any[]
      meta: any
    }>(`/api/memes`, {
      method: 'GET'
    }).then(response => {
      // Filter by user profile address
      const userMemes = response.data.filter((meme: any) => 
        meme.userProfile.address.toLowerCase() === address.toLowerCase()
      )
      return {
        ...response,
        data: userMemes
      }
    })
  }
}

// Export singleton instance
export const moonexApi = new MoonExAPIClient()

// Export React hooks for easy integration
export const useMoonexApi = () => {
  const setWalletAuth = (address: string, signature: string, message: string) => {
    return moonexApi.authenticateWallet(address, signature, message)
  }

  const ensureWalletAuth = async (address?: string) => {
    try {
      await moonexApi.getWalletUser()
      return true
    } catch {
      return false
    }
  }

  return {
    ...moonexApi,
    setWalletAuth,
    ensureWalletAuth
  }
}
