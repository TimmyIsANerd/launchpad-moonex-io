"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { TradeItem } from "@/src/types/trade"
import { useState } from "react"

interface TradesCommentsProps {
  tokenTicker: string
  isWalletConnected?: boolean
  trades?: TradeItem[]
}

export function TradesComments({ tokenTicker, isWalletConnected = false, trades = [] }: TradesCommentsProps) {
  const [comment, setComment] = useState("")
  const [comments, setComments] = useState<Array<{ id: string; user: string; text: string; timestamp: string }>>([])

  const postComment = () => {
    if (!comment.trim()) return
    // Local-only mock; replace with backend or on-chain comments later
    setComments((prev) => [
      {
        id: Math.random().toString(36).slice(2),
        user: "you",
        text: comment.trim(),
        timestamp: new Date().toLocaleString(),
      },
      ...prev,
    ])
    setComment("")
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
                  <Input placeholder="Optional username (local only)" disabled className="max-w-xs" />
                  <Button onClick={postComment} disabled={!comment.trim()}>
                    Post
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

            <div className="space-y-2">
              {comments.length === 0 ? (
                <div className="text-sm text-muted-foreground">No comments yet.</div>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="rounded-lg border border-border bg-card/50 p-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{c.user}</span>
                      <span>{c.timestamp}</span>
                    </div>
                    <p className="mt-1 text-sm text-foreground whitespace-pre-wrap">{c.text}</p>
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
