"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MessageCircle, Send, Users, Clock } from "lucide-react"
import type { TradeItem } from "@/src/types/trade"
import { useState, useEffect } from "react"
import { useChatSession, useRealTimeMessages, usePostMessage } from "@/src/hooks/useChatSession"

interface TradesCommentsProps {
  tokenTicker: string
  tokenAddress?: string
  isWalletConnected?: boolean
  trades?: TradeItem[]
}

export function TradesComments({ 
  tokenTicker, 
  tokenAddress, 
  isWalletConnected = false, 
  trades = [] 
}: TradesCommentsProps) {
  const [comment, setComment] = useState("")
  
  // Chat session hooks
  const { session, isLoading: sessionLoading } = useChatSession(tokenAddress || '')
  const { messages, meta, isLoading: messagesLoading } = useRealTimeMessages(
    session?.sessionId || '',
    1,
    50
  )
  const { postMessage, isLoading: postingMessage } = usePostMessage(session?.sessionId || '')

  const postComment = () => {
    if (!comment.trim() || !session?.sessionId) return
    
    postMessage({
      message: comment.trim()
    }, {
      onSuccess: () => {
        setComment("")
      },
      onError: (error) => {
        console.error('Failed to post message:', error)
      }
    })
  }

  const shorten = (addr: string) => (addr.length > 10 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr)

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Trades & Comments</span>
          <span className="text-xs text-muted-foreground">{tokenTicker}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="trades" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="trades">Trades</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
          </TabsList>

          <TabsContent value="trades" className="space-y-3 mt-4">
            {trades.length === 0 ? (
              <div className="text-sm text-muted-foreground">No trades yet.</div>
            ) : (
              <div className="space-y-2">
                {trades.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-card/50 px-3 py-2"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={
                          t.action === "buy"
                            ? "text-emerald-400 text-xs font-semibold"
                            : "text-red-400 text-xs font-semibold"
                        }
                      >
                        {t.action.toUpperCase()}
                      </span>
                      <span className="text-sm text-foreground font-mono truncate">{shorten(t.wallet)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-foreground">{t.amount}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="text-foreground">{t.tokenAmount}</span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{t.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="comments" className="space-y-4 mt-4">
            {isWalletConnected ? (
              <div className="space-y-2">
                <Textarea
                  placeholder={`Share your thoughts about ${tokenTicker}...`}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="min-h-[80px]"
                />
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={postComment} 
                    disabled={!comment.trim() || postingMessage}
                    className="flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {postingMessage ? 'Posting...' : 'Post'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-lg border border-border bg-card/50 p-3">
                <div className="text-sm text-muted-foreground">Connect your wallet to post comments.</div>
                <Button disabled variant="outline" className="border-border">
                  Connect Wallet
                </Button>
              </div>
            )}

            {/* Chat Session Info */}
            {session && meta && (
              <div className="flex items-center justify-between rounded-lg border border-border bg-blue-50 dark:bg-blue-950/20 p-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{meta.session.participantCount} participants</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" />
                    <span>{meta.session.messageCount} messages</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Live chat</span>
                </div>
              </div>
            )}

            {/* Loading State */}
            {messagesLoading && (
              <div className="flex justify-center py-4">
                <div className="text-sm text-muted-foreground">Loading chat messages...</div>
              </div>
            )}

            {/* Messages */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  {sessionLoading ? 'Creating chat session...' : 'No messages yet. Start the conversation!'}
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message._id} className="rounded-lg border border-border bg-card/50 p-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {message.userProfile.username || shorten(message.userProfile.address)}
                        </span>
                        <span className="px-1 py-0.5 bg-muted rounded text-[10px]">
                          {shorten(message.userProfile.address)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(message.messageTime).toLocaleString()}</span>
                      </div>
                    </div>
                    <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                      {message.message}
                    </p>
                    {message.isEdited && (
                      <div className="text-[10px] text-muted-foreground mt-1 italic">
                        edited {new Date(message.editedAt!).toLocaleString()}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
