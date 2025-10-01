export function formatBNB(value?: number | null, digits = 6): string {
  if (value == null || Number.isNaN(value)) return "—"
  return `${Number(value).toFixed(digits)} BNB`
}

export function formatNumber(value?: number | null, digits = 2): string {
  if (value == null || Number.isNaN(value)) return "—"
  return Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  })
}

export function formatUSD(value?: number | null, digits = 2): string {
  if (value == null || Number.isNaN(value)) return "—"
  try {
    return Number(value).toLocaleString(undefined, {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: Math.min(2, digits),
      maximumFractionDigits: digits,
    })
  } catch {
    // Fallback if locale currency formatting is not available
    const fixed = Number(value).toFixed(digits)
    return `$${fixed}`
  }
}
