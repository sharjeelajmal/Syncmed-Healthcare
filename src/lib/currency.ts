export const CURRENCY_CODE = "NGN" as const
export const CURRENCY_SYMBOL = "₦" as const

export function formatNaira(amount: number, locale = "en-NG"): string {
  return `${CURRENCY_SYMBOL}${amount.toLocaleString(locale)}`
}

export function formatNairaCompactThousands(amount: number): string {
  return `${CURRENCY_SYMBOL}${(amount / 1000).toFixed(1)}k`
}
