"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"
import { Search } from "lucide-react"

interface TokenItem {
  rank: number
  name: string
  ticker: string
  baseAsset: string
  marketCap: string
  volume24h: string
  price: string
  change24h: number
  contractAddress: string
  onPancakeSwap: boolean
  createdAt: string
  tradingVolume: number
  logoURI?: string | null
  owner?: string | null
  raisedBase?: number | null
  lpThreshold?: number | null
}

interface TokenCardListProps {
  tokens: TokenItem[]
  title?: string
  showToggle?: boolean
}

const ITEMS_PER_PAGE = 12

export function TokenCardList({ tokens, title = "Live Token Explorer", showToggle = true }: TokenCardListProps) {
  const [activeTab, setActiveTab] = useState<"pancakeswap" | "unbonded">("unbonded")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterBy, setFilterBy] = useState("all")
  const [sortBy, setSortBy] = useState<"volume" | "created">("volume")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [currentPage, setCurrentPage] = useState(1)

  // 1) Tab filter
  const tabFiltered = useMemo(() => {
    return tokens.filter((t) => (activeTab === "pancakeswap" ? t.onPancakeSwap : !t.onPancakeSwap))
  }, [tokens, activeTab])

  // 2) Search + base filter
  const filtered = useMemo(() => {
    let arr = tabFiltered
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      arr = arr.filter((t) => t.name.toLowerCase().includes(q) || t.ticker.toLowerCase().includes(q))
    }
    if (filterBy !== "all") arr = arr.filter((t) => t.baseAsset === filterBy)
    return arr
  }, [tabFiltered, searchQuery, filterBy])

  // 3) Sorting
  const sorted = useMemo(() => {
    const arr = [...filtered]
    arr.sort((a, b) => {
      let cmp = 0
      if (sortBy === "volume") cmp = a.tradingVolume - b.tradingVolume
      else cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      return sortOrder === "asc" ? cmp : -cmp
    })
    return arr
  }, [filtered, sortBy, sortOrder])

  // 4) Pagination
  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE) || 1
  const pageStart = (currentPage - 1) * ITEMS_PER_PAGE
  const pageItems = sorted.slice(pageStart, pageStart + ITEMS_PER_PAGE)

  const tokenStatusPill = (onPancakeSwap: boolean) => (
    <Badge className={onPancakeSwap ? "bg-primary/20 text-primary" : "bg-secondary/20 text-secondary"}>
      {onPancakeSwap ? "PancakeSwap" : "Pre-Launch"}
    </Badge>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl md:text-3xl font-bold">
          <span className="gradient-cosmic">{title}</span>
        </h2>
      </div>

      {/* Toggle */}
      {showToggle && (
        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as any); setCurrentPage(1) }} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-card">
            <TabsTrigger value="unbonded" className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground w-full">
              🚀 Pre-Launch Tokens
            </TabsTrigger>
            <TabsTrigger value="pancakeswap" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground w-full">
              🥞 PancakeSwap Listed
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input placeholder="Search tokens..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }} className="pl-10" />
        </div>

        <Select value={filterBy} onValueChange={(v) => { setFilterBy(v); setCurrentPage(1) }}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter by asset" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Assets</SelectItem>
            <SelectItem value="BNB">BNB</SelectItem>
            <SelectItem value="USDT">USDT</SelectItem>
            <SelectItem value="CAKE">CAKE</SelectItem>
            <SelectItem value="USD1">USD1</SelectItem>
            <SelectItem value="USDC">USDC</SelectItem>
            <SelectItem value="ASTER">ASTER</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(v) => { setSortBy(v as any); setCurrentPage(1) }}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="volume">Trading Volume</SelectItem>
            <SelectItem value="created">Creation Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results */}
      <div className="text-sm text-muted-foreground">
        Showing {pageItems.length} of {sorted.length} tokens {activeTab === "pancakeswap" ? "listed on PancakeSwap" : "in pre-launch phase"}
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {pageItems.map((t) => (
          <Link key={t.contractAddress} href={`/token/${t.contractAddress}`}>
            <Card className="hover-glow-cyan transition-all duration-300 cursor-pointer h-full">
              <CardContent className="p-4 flex flex-col gap-3 h-full">
                {/* Header: Status + Base + Logo */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {tokenStatusPill(t.onPancakeSwap)}
                    <div className="text-xs text-muted-foreground">{t.baseAsset}</div>
                  </div>
                  {t.logoURI ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.logoURI} alt={`${t.ticker} logo`} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-muted border border-border" />
                  )}
                </div>

                {/* Ticker + change */}
                <div className="flex items-baseline justify-between">
                  <div className="text-xl font-extrabold text-foreground truncate">{t.ticker}</div>
                  <div className={`text-lg font-bold ${t.change24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {t.change24h ? `${t.change24h >= 0 ? "+" : ""}${t.change24h.toFixed(1)}%` : "—"}
                  </div>
                </div>

                {/* Name + tag */}
                <div className="flex items-center gap-2 min-w-0">
                  <div className="text-base font-semibold text-foreground truncate" title={t.name}>{t.name}</div>
                  <Badge className="bg-purple-600/20 text-purple-400">Meme</Badge>
                </div>
                <div className="text-sm text-muted-foreground line-clamp-2">—</div>

                {/* Progress + Metrics */}
                <div className="mt-1 grid grid-cols-2 gap-2 text-sm">
                  <div className="col-span-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div>Bonding Progress</div>
                      <div className="font-medium text-foreground">
                        {(() => {
                          const pct = t.raisedBase != null && t.lpThreshold ? Math.max(0, Math.min(100, (100 * t.raisedBase) / (t.lpThreshold || 1))) : null
                          return pct != null ? `${pct.toFixed(1)}%` : "—"
                        })()}
                      </div>
                    </div>
                    <div className="relative w-full h-2 rounded bg-muted border border-border overflow-hidden mt-1">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-300"
                        style={{ width: `${(() => { const pct = t.raisedBase != null && t.lpThreshold ? Math.max(0, Math.min(100, (100 * t.raisedBase) / (t.lpThreshold || 1))) : 0; return pct; })()}%` }}
                      />
                      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_1px_2px_rgba(0,0,0,0.35)]" />
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {t.raisedBase != null && t.lpThreshold != null ? (
                        <span className="font-mono text-foreground">{t.raisedBase.toLocaleString(undefined, { maximumFractionDigits: 4 })} / {t.lpThreshold.toLocaleString(undefined, { maximumFractionDigits: 4 })} BNB</span>
                      ) : (
                        "—"
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Market Cap</div>
                    <div className="font-medium text-foreground">{t.marketCap || "—"}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">24h Volume</div>
                    <div className="font-medium text-foreground">{t.volume24h || "—"}</div>
                  </div>
                </div>

                {/* Footer row: Creator address only + date */}
                <div className="mt-auto pt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <div className="min-w-0 truncate font-mono text-primary w-20" title={t.owner || "—"}>{t.owner || "—"}</div>
                  <div className="shrink-0">{new Date(t.createdAt).toLocaleDateString()}</div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); if (currentPage > 1) setCurrentPage(currentPage - 1) }} className={currentPage === 1 ? "pointer-events-none opacity-50" : ""} />
              </PaginationItem>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((n) => (
                <PaginationItem key={n}>
                  <PaginationLink href="#" isActive={currentPage === n} onClick={(e) => { e.preventDefault(); setCurrentPage(n) }}>
                    {n}
                  </PaginationLink>
                </PaginationItem>
              ))}
              {totalPages > 5 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              <PaginationItem>
                <PaginationNext href="#" onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) setCurrentPage(currentPage + 1) }} className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}
