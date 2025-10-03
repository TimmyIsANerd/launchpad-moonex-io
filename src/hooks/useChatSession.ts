import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ChatSessionApi, ChatSession, ChatMessage } from '@/lib/chatSessionApi'
import { useWallet } from '@/components/wallet-provider'

export function useChatSession(tokenAddress: string) {
  const queryClient = useQueryClient()
  const { address: userAddress } = useWallet()
  
  // Query for chat session
  const {
    data: session,
    isLoading: sessionLoading,
    error: sessionError
  } = useQuery({
    queryKey: ['chatSession', tokenAddress],
    queryFn: () => ChatSessionApi.getSessionByToken(tokenAddress),
    select: (response) => response.data,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Mutation to create or get session
  const createOrGetSession = useMutation({
    mutationFn: ({ 
      tokenAddress, 
      sessionName, 
      description 
    }: { 
      tokenAddress: string
      sessionName?: string
      description?: string 
    }) => ChatSessionApi.createOrGetSession(tokenAddress, sessionName, description),
    onSuccess: (response) => {
      queryClient.setQueryData(['chatSession', tokenAddress], response.data)
    }
  })

  // Auto-create session if it doesn't exist
  useEffect(() => {
    if (!sessionLoading && !session && tokenAddress) {
      createOrGetSession.mutate({ tokenAddress })
    }
  }, [sessionLoading, session, tokenAddress])

  return {
    session,
    isLoading: sessionLoading || createOrGetSession.isPending,
    error: sessionError || createOrGetSession.error,
    createOrGetSession: createOrGetSession.mutate
  }
}

export function useChatMessages(sessionId: string, page: number = 1, pageSize: number = 50) {
  const queryKey = ['chatMessages', sessionId, page, pageSize]
  
  const {
    data: response,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey,
    queryFn: () => ChatSessionApi.getMessages(sessionId, page, pageSize),
    enabled: !!sessionId,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 10 * 1000, // Refetch every 10 seconds for live updates
  })

  const messages = response?.data || []
  const meta = response?.meta

  return {
    messages,
    meta,
    isLoading,
    error,
    refetch
  }
}

export function usePostMessage(sessionId: string) {
  const queryClient = useQueryClient()
  const { address: userAddress } = useWallet()

  const mutation = useMutation({
    mutationFn: ({ message, messageImage, repliedTo }: {
      message: string
      messageImage?: string
      repliedTo?: string
    }) => {
      if (!userAddress) {
        throw new Error('User address is required')
      }
      
      return ChatSessionApi.postMessage(
        sessionId,
        message,
        userAddress,
        messageImage,
        repliedTo
      )
    },
    onSuccess: () => {
      // Invalidate messages query to refetch latest messages
      queryClient.invalidateQueries({ 
        queryKey: ['chatMessages', sessionId] 
      })
      
      // Invalidate session query to update message count
      queryClient.invalidateQueries({ 
        queryKey: ['chatSession'] 
      })
    }
  })

  return {
    postMessage: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess
  }
}

export function useRealTimeMessages(
  sessionId: string, 
  page: number = 1, 
  pageSize: number = 50
) {
  const { messages, meta, isLoading, error, refetch } = useChatMessages(sessionId, page, pageSize)
  
  // Auto-refresh for real-time updates
  useEffect(() => {
    if (!sessionId) return
    
    const interval = setInterval(() => {
      refetch()
    }, 15000) // Refetch every 15 seconds
    
    return () => clearInterval(interval)
  }, [sessionId, refetch])

  return {
    messages,
    meta,
    isLoading,
    error,
    refetch
  }
}