import { useWallet } from "@/components/wallet-provider"

const API_BASE_URL = process.env.NEXT_PUBLIC_TERMINAL_API_URL || 'http://localhost:1337/api'

export interface ChatSession {
  _id: string
  sessionId: string
  tokenAddress: string
  sessionName: string
  description: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  lastActivity: string
  participantCount: number
  messageCount: number
  createdBy?: {
    _id: string
    username: string
    address: string
    profilePicture?: string
  }
}

export interface ChatMessage {
  _id: string
  message: string
  messageImage?: string
  messageTime: string
  session: string
  userProfile: {
    _id: string
    username: string
    address: string
    profilePicture?: string
  }
  tokenAddress: string
  publishedAt: string
  isDeleted: boolean
  deletedAt?: string
  repliedTo?: string
  isEdited: boolean
  editedAt?: string
  reactions?: Array<{
    userId: string
    emoji: string
    createdAt: string
  }>
}

export interface ChatSessionResponse {
  data: ChatSession
  success: boolean
  message: string
}

export interface ChatMessagesResponse {
  data: ChatMessage[]
  meta: {
    pagination: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
    session: {
      sessionId: string
      tokenAddress: string
      participantCount: number
      messageCount: number
    }
  }
}

export class ChatSessionApi {
  private static async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}/chat-sessions${endpoint}`
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  /**
   * Create or get chat session for a token
   */
  static async createOrGetSession(
    tokenAddress: string, 
    sessionName?: string, 
    description?: string
  ): Promise<ChatSessionResponse> {
    return this.makeRequest('/create-or-get', {
      method: 'POST',
      body: JSON.stringify({
        tokenAddress,
        sessionName,
        description
      })
    })
  }

  /**
   * Get chat session by token address
   */
  static async getSessionByToken(tokenAddress: string): Promise<ChatSessionResponse> {
    return this.makeRequest(`/by-token/${tokenAddress}`)
  }

  /**
   * Get chat session by session ID
   */
  static async getSessionById(sessionId: string): Promise<ChatSessionResponse> {
    return this.makeRequest(`/${sessionId}`)
  }

  /**
   * Get messages for a chat session
   */
  static async getMessages(
    sessionId: string, 
    page: number = 1, 
    pageSize: number = 50
  ): Promise<ChatMessagesResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString()
    })
    
    return this.makeRequest(`/${sessionId}/messages?${params}`)
  }

  /**
   * Post message to chat session
   */
  static async postMessage(
    sessionId: string,
    message: string,
    userAddress: string,
    messageImage?: string,
    repliedTo?: string
  ): Promise<{ data: ChatMessage; success: boolean; message: string }> {
    return this.makeRequest(`/${sessionId}/messages`, {
      method: 'POST',
      body: JSON.stringify({
        message,
        userAddress,
        messageImage,
        repliedTo
      })
    })
  }

  /**
   * Update chat session information
   */
  static async updateSession(
    sessionId: string,
    sessionName?: string,
    description?: string,
    isActive?: boolean
  ): Promise<ChatSessionResponse> {
    return this.makeRequest(`/${sessionId}`, {
      method: 'PUT',
      body: JSON.stringify({
        sessionName,
        description,
        isActive
      })
    })
  }

  /**
   * Deactivate chat session
   */
  static async deleteSession(sessionId: string): Promise<{ success: boolean; message: string }> {
    return this.makeRequest(`/${sessionId}`, {
      method: 'DELETE'
    })
  }
}
