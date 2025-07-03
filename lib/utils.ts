import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type SupportedCurrency = "VND" | "USD" | "EUR" | "JPY" | "SGD";

export function formatCompactNumber(value: number): string {
  const absValue = Math.abs(value);
  if (absValue >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M';
  } else if (absValue >= 1000) {
    return (value / 1000).toFixed(1) + 'K';
  }
  return value.toString();
}

export function formatCurrency(amount: number, currency: SupportedCurrency = 'VND', options?: Intl.NumberFormatOptions) {
  const currencyConfig: Record<SupportedCurrency, { digits: number }> = {
    VND: { digits: 0 },
    USD: { digits: 2 },
    EUR: { digits: 2 },
    JPY: { digits: 0 },
    SGD: { digits: 2 }
  };

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: currencyConfig[currency].digits,
    maximumFractionDigits: currencyConfig[currency].digits,
    ...options
  });
  return formatter.format(amount);
}
