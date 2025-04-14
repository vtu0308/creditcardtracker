import { SupportedCurrency } from "./storage"

const API_KEY = process.env.NEXT_PUBLIC_EXCHANGE_RATE_API_KEY

interface ExchangeRateResponse {
  rates: {
    [key: string]: number
  }
  base: string
  timestamp: number
}

let rateCache: {
  rates: { [key: string]: number }
  timestamp: number
} | null = null

const CACHE_DURATION = 1000 * 60 * 60 // 1 hour

export async function convertToVND(amount: number, fromCurrency: SupportedCurrency): Promise<number> {
  if (fromCurrency === 'VND') {
    return amount
  }

  // Check cache first
  if (rateCache && Date.now() - rateCache.timestamp < CACHE_DURATION) {
    const rate = rateCache.rates[fromCurrency]
    if (rate) {
      return Math.round(amount * rate)
    }
  }

  try {
    // Fetch new rates with the source currency as base
    const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`
    )
    
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates')
    }

    const data: ExchangeRateResponse = await response.json()
    
    // Cache the new rates
    rateCache = {
      rates: data.rates,
      timestamp: Date.now()
    }

    // Get the VND rate directly
    const vndRate = data.rates['VND']
    return Math.round(amount * vndRate)
  } catch (error) {
    console.error('Error converting currency:', error)
    throw new Error('Failed to convert currency')
  }
}

export function formatCurrency(amount: number, currency: SupportedCurrency): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount)
} 