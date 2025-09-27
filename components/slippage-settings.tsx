"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Settings } from "lucide-react"

interface SlippageSettingsProps {
  slippage: number
  onSlippageChange: (slippage: number) => void
}

export function SlippageSettings({ slippage, onSlippageChange }: SlippageSettingsProps) {
  const [customSlippage, setCustomSlippage] = useState("")
  const presetSlippages = [0.1, 0.5, 1.0, 3.0]

  const handlePresetSlippage = (value: number) => {
    onSlippageChange(value)
    setCustomSlippage("")
  }

  const handleCustomSlippage = () => {
    const value = Number.parseFloat(customSlippage)
    if (!isNaN(value) && value > 0 && value <= 50) {
      onSlippageChange(value)
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="border-border bg-transparent">
          <Settings className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-card border-border">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-foreground mb-2">Slippage Tolerance</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Your transaction will revert if the price changes unfavorably by more than this percentage.
            </p>
          </div>

          {/* Preset Slippages */}
          <div className="grid grid-cols-4 gap-2">
            {presetSlippages.map((preset) => (
              <Button
                key={preset}
                variant={slippage === preset ? "default" : "outline"}
                size="sm"
                onClick={() => handlePresetSlippage(preset)}
                className={
                  slippage === preset
                    ? "bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:text-foreground"
                }
              >
                {preset}%
              </Button>
            ))}
          </div>

          {/* Custom Slippage */}
          <div className="space-y-2">
            <Label htmlFor="custom-slippage">Custom Slippage (%)</Label>
            <div className="flex space-x-2">
              <Input
                id="custom-slippage"
                type="number"
                step="0.1"
                min="0.1"
                max="50"
                placeholder="1.0"
                value={customSlippage}
                onChange={(e) => setCustomSlippage(e.target.value)}
              />
              <Button onClick={handleCustomSlippage} size="sm" className="bg-primary hover:bg-primary/90">
                Set
              </Button>
            </div>
          </div>

          {/* Current Setting */}
          <div className="pt-2 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Current slippage: <span className="text-foreground font-medium">{slippage}%</span>
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
