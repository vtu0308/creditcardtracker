import { TimeFilterPeriod } from "@/components/time-filter"

export function getDateRangeForPeriod(period: TimeFilterPeriod): { from: Date | null; to: Date | null } {
  if (period === "all") {
    return { from: null, to: null }
  }

  const now = new Date()
  const to = now

  if (period === "week") {
    // Get the start of current week (Monday)
    const from = new Date(now)
    const day = from.getDay()
    const diff = from.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is sunday
    from.setDate(diff)
    from.setHours(0, 0, 0, 0)
    return { from, to }
  }

  if (period === "month") {
    // Get the start of current month
    const from = new Date(now.getFullYear(), now.getMonth(), 1)
    return { from, to }
  }

  if (period === "year") {
    // Get the start of current year
    const from = new Date(now.getFullYear(), 0, 1)
    return { from, to }
  }

  return { from: null, to: null }
}

export function isTransactionInPeriod(
  transactionDate: string,
  period: TimeFilterPeriod
): boolean {
  const { from, to } = getDateRangeForPeriod(period)
  if (!from || !to) return true // "all" period

  const txDate = new Date(transactionDate)
  return txDate >= from && txDate <= to
}
