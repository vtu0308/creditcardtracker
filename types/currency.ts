export type SupportedCurrency = "VND" | "USD" | "EUR" | "JPY" | "SGD"

export interface ExchangeRate {
  base: SupportedCurrency
  target: SupportedCurrency
  rate: number
  timestamp: number
} 