import { SupportedCurrency } from "@/types/currency"

const API_KEY = process.env.NEXT_PUBLIC_EXCHANGE_RATE_API_KEY

interface ExchangeRateResponse {
  result: string
  documentation: string
  terms_of_use: string
  time_last_update_unix: number
  time_next_update_unix: number
  base_code: string
  conversion_rates: {
    [key: string]: number
  }
}

interface PairResponse {
  result: string;
  documentation: string;
  terms_of_use: string;
  time_last_update_unix: number;
  time_next_update_unix: number;
  base_code: string;
  target_code: string;
  conversion_rate: number;
  conversion_result: number;
}

let rateCache: {
  rates: { [key: string]: number }
  timestamp: number
} | null = null

const CACHE_DURATION = 1000 * 60 * 60 // 1 hour

export async function convertToVND(amount: number, fromCurrency: SupportedCurrency): Promise<number> {
  console.log(`Converting ${amount} ${fromCurrency} to VND`)

  if (fromCurrency === 'VND') {
    console.log('No conversion needed, returning original amount')
    return amount
  }
  if (isNaN(amount) || amount === 0) {
    console.log('[convertToVND] Returning 0 for NaN or 0 amount.');
    return 0;
  }

  try {
    // Use the ExchangeRate-API with your API key
    const url = `https://v6.exchangerate-api.com/v6/${API_KEY}/pair/${fromCurrency}/VND/${amount}`
    console.log(`Fetching exchange rate from ${url}`)

    const response = await fetch(url)
    console.log(`Received response with status ${response.status}`)

    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates')
    }

    const data: PairResponse = await response.json()
    console.log(`Received API response: ${JSON.stringify(data)}`)

    const conversionResult = data.conversion_result
    console.log(`Extracted conversion result: ${conversionResult}`)

    return conversionResult
  } catch (error) {
    console.error('Error converting currency:', error)
    // Fallback rates (as of April 2024)
    const fallbackRates = {
      USD: 25000,  // 1 USD ≈ 25,000 VND
      EUR: 26500,  // 1 EUR ≈ 26,500 VND
      JPY: 165,    // 1 JPY ≈ 165 VND
      SGD: 18500   // 1 SGD ≈ 18,500 VND
    }
    
    const rate = fallbackRates[fromCurrency]
    if (!rate) {
      throw new Error(`No fallback rate available for ${fromCurrency}`)
    }
    
    return Math.round(amount * rate)
  }
}

const currencySymbols: Record<SupportedCurrency, string> = {
  VND: "₫",
  USD: "$",
  EUR: "€",
  JPY: "¥",
  SGD: "S$"
}

const currencyFormats: Record<SupportedCurrency, Intl.NumberFormatOptions> = {
  VND: {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  },
  USD: {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  },
  EUR: {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  },
  JPY: {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  },
  SGD: {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }
}

export function formatCurrency(amount: number, currency: SupportedCurrency): string {
  const formatter = new Intl.NumberFormat("en-US", currencyFormats[currency])
  const formatted = formatter.format(amount)
  
  // For VND, show K for thousands and M for millions
  if (currency === "VND") {
    if (Math.abs(amount) >= 1_000_000) {
      return `${(amount / 1_000_000).toFixed(1)}M ${currencySymbols[currency]}`
    }
    if (Math.abs(amount) >= 1_000) {
      return `${(amount / 1_000).toFixed(1)}K ${currencySymbols[currency]}`
    }
  }

  // For other currencies, show the symbol before the amount
  if (currency === "VND") {
    return `${formatted} ${currencySymbols[currency]}`
  } else {
    return `${currencySymbols[currency]}${formatted}`
  }
} 