"use client"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Copy, ExternalLink, LogOut, Settings, ChevronDown } from "lucide-react"
import { useWallet } from "@/components/wallet-provider"

export function WalletDropdown() {
  const { address, balance, disconnect, isCorrectNetwork, switchNetwork } = useWallet()

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      alert("Address copied to clipboard!")
    }
  }

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
        >
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>{address ? truncateAddress(address) : "Connected"}</span>
            <ChevronDown className="h-4 w-4" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 bg-card border-border" align="end">
        {/* Wallet Info */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Wallet Address</span>
            <div className="flex items-center space-x-1">
              <Button variant="ghost" size="icon" onClick={copyAddress} className="h-6 w-6">
                <Copy className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <p className="font-mono text-sm text-foreground">{address}</p>
        </div>

        {/* Network Status */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Network</span>
            {isCorrectNetwork ? (
              <Badge className="bg-green-500 text-white">BNB Chain</Badge>
            ) : (
              <Badge variant="destructive">Wrong Network</Badge>
            )}
          </div>
          {!isCorrectNetwork && (
            <Button size="sm" onClick={switchNetwork} className="w-full mt-2 bg-primary hover:bg-primary/90">
              Switch to BNB Chain
            </Button>
          )}
        </div>

        {/* Balance */}
        <div className="p-4 border-b border-border">
          <h4 className="text-sm font-medium text-foreground mb-2">Balance</h4>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">BNB</span>
              <span className="font-medium text-foreground">{balance.bnb}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">USDT</span>
              <span className="font-medium text-foreground">{balance.usdt}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-2">
          <DropdownMenuItem className="cursor-pointer">
            <Settings className="h-4 w-4 mr-2" />
            Wallet Settings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={disconnect} className="cursor-pointer text-red-400 focus:text-red-400">
            <LogOut className="h-4 w-4 mr-2" />
            Disconnect
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
