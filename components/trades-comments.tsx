"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MessageSquare, TrendingUp } from "lucide-react"

// Sample trades data
const sampleTrades = [
  {
    id: "1",
    wallet: "0x1234...5678",
    action: "buy" as const,
    amount: "2.5 BNB",
    tokenAmount: "5,555 MOONDOG",
    timestamp: "2 minutes ago",
  },
  {
    id: "2",
    wallet: "0xabcd...efgh",
    action: "sell" as const,
    amount: "1.8 BNB",
    tokenAmount: "4,000 MOONDOG",
    timestamp: "5 minutes ago",
  },
  {
    id: "3",
    wallet: "0x9876...5432",
    action: "buy" as const,
    amount: "0.75 BNB",
    tokenAmount: "1,666 MOONDOG",
    timestamp: "8 minutes ago",
  },
]

// Sample comments data
const sampleComments = [
  {
    id: "1",
    wallet: "0x1234...5678",
    avatar: "JD",
    comment: "This token is going to the moon! 🚀 Great community and solid fundamentals.",
    timestamp: "10 minutes ago",
  },
  {
    id: "2",
    wallet: "0xabcd...efgh",
    avatar: "AS",
    comment: "Just bought the dip. Diamond hands! 💎",
    timestamp: "25 minutes ago",
  },
  {
    id: "3",
    wallet: "0x9876...5432",
    avatar: "MK",
    comment: "Love the tokenomics on this one. HODL for life!",
    timestamp: "1 hour ago",
  },
]

interface TradesCommentsProps {
  tokenTicker: string
  isWalletConnected?: boolean
}

export function TradesComments({ tokenTicker, isWalletConnected = false }: TradesCommentsProps) {
  const [newComment, setNewComment] = useState("")
  const [comments, setComments] = useState(sampleComments)

  const handleSubmitComment = () => {
    if (!isWalletConnected) {
      alert("Please connect your wallet to comment")
      return
    }

    if (!newComment.trim()) return

    const comment = {
      id: Date.now().toString(),
      wallet: "0x1111...2222",
      avatar: "YU",
      comment: newComment,
      timestamp: "just now",
    }

    setComments([comment, ...comments])
    setNewComment("")
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Community Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="trades" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="trades" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Trades</span>
            </TabsTrigger>
            <TabsTrigger value="comments" className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>Comments</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trades" className="space-y-4">
            <div className="space-y-3">
              {sampleTrades.map((trade) => (
                <div
                  key={trade.id}
                  className="flex items-center justify-between p-3 bg-card rounded-lg border border-border"
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold">{trade.wallet.slice(2, 4).toUpperCase()}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">
                        <span className="text-muted-foreground font-mono text-xs sm:text-sm truncate block sm:inline">
                          {trade.wallet}
                        </span>
                        <span className={`ml-2 ${trade.action === "buy" ? "text-green-400" : "text-red-400"}`}>
                          {trade.action === "buy" ? "bought" : "sold"}
                        </span>
                        <span className="ml-1 text-foreground break-words">{trade.tokenAmount}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">for {trade.amount}</p>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground flex-shrink-0 ml-2 text-right">
                    <span className="hidden sm:inline">{trade.timestamp}</span>
                    <span className="sm:hidden">{trade.timestamp.split(" ")[0]}</span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="comments" className="space-y-4">
            {/* Comment Input */}
            <div className="space-y-3">
              <Textarea
                placeholder={
                  isWalletConnected
                    ? `Share your thoughts about ${tokenTicker}...`
                    : "Connect your wallet to leave a comment"
                }
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={!isWalletConnected}
                rows={3}
              />
              <Button
                onClick={handleSubmitComment}
                disabled={!isWalletConnected || !newComment.trim()}
                className="bg-primary hover:bg-primary/90"
              >
                Post Comment
              </Button>
            </div>

            {/* Comments List */}
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3 p-3 bg-card rounded-lg border border-border">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-xs">
                      {comment.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1 flex-wrap">
                      <span className="text-sm font-medium text-foreground font-mono truncate">{comment.wallet}</span>
                      <span className="text-xs text-muted-foreground flex-shrink-0">{comment.timestamp}</span>
                    </div>
                    <p className="text-sm text-foreground break-words">{comment.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
