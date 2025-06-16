"use client"

import { useMemo } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts"
import { Transaction } from "@/lib/storage"
import { SupportedCurrency } from "@/lib/storage"

interface SpendingTrendsChartProps {
  transactions: Transaction[]
  filterPeriod: "day" | "week" | "month"
  viewMode?: "day" | "week" | "month" // Optional override for the view mode
  onFilterChange: (dateFrom: string, dateTo: string) => void
}

export function SpendingTrendsChart({
  transactions,
  filterPeriod,
  viewMode,
  onFilterChange
}: SpendingTrendsChartProps) {
  // Use viewMode if provided, otherwise use filterPeriod
  const effectiveViewMode = viewMode || filterPeriod
  const chartData = useMemo(() => {
    const now = new Date()
    const data: { date: string; amount: number }[] = []
    
    // Group transactions by period
    const groups: Record<string, number> = {}
    
    transactions.forEach(tx => {
      const date = new Date(tx.date)
      let key = ""
      
      if (effectiveViewMode === "day") {
        // Format as "May 20" for daily view
        key = date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
      } else if (effectiveViewMode === "week") {
        // Get the Monday of the week
        const monday = new Date(date)
        monday.setDate(date.getDate() - date.getDay() + 1)
        key = monday.toLocaleDateString(undefined, { month: "short", day: "numeric" }) + 
              " - " + 
              new Date(monday.getTime() + 6 * 24 * 60 * 60 * 1000)
                .toLocaleDateString(undefined, { month: "short", day: "numeric" })
      } else {
        // Format as "May 2025" for monthly view
        key = date.toLocaleDateString(undefined, { month: "short", year: "numeric" })
      }
      
      // Convert to VND if needed
      const amountInVND = tx.currency === "VND" ? tx.amount : tx.amount * 25000
      if (!groups[key]) groups[key] = 0
      groups[key] += amountInVND
    })
    
    // Convert groups to array and store original dates for sorting
    const dataWithDates = Object.entries(groups).map(([date, amount]) => {
      // Find the first transaction that matches this group
      const matchingTx = transactions.find(tx => {
        const txDate = new Date(tx.date)
        let formattedDate
        
        if (effectiveViewMode === "day") {
          formattedDate = txDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })
        } else if (effectiveViewMode === "week") {
          // Get Monday of the week
          const monday = new Date(txDate)
          monday.setDate(txDate.getDate() - txDate.getDay() + 1)
          formattedDate = monday.toLocaleDateString(undefined, { month: "short", day: "numeric" }) +
            " - " +
            new Date(monday.getTime() + 6 * 24 * 60 * 60 * 1000)
              .toLocaleDateString(undefined, { month: "short", day: "numeric" })
        } else {
          formattedDate = txDate.toLocaleDateString(undefined, { month: "short", year: "numeric" })
        }
        return formattedDate === date
      })
      
      // Calculate filter dates based on the period
      let filterFrom, filterTo
      if (effectiveViewMode === "day" && matchingTx) {
        filterFrom = filterTo = matchingTx.date
      } else if (effectiveViewMode === "week" && matchingTx) {
        const txDate = new Date(matchingTx.date)
        const monday = new Date(txDate)
        monday.setDate(txDate.getDate() - txDate.getDay() + 1)
        const sunday = new Date(monday)
        sunday.setDate(monday.getDate() + 6)
        filterFrom = monday.toISOString().split("T")[0]
        filterTo = sunday.toISOString().split("T")[0]
      } else if (effectiveViewMode === "month" && matchingTx) {
        const txDate = new Date(matchingTx.date)
        const firstDay = new Date(txDate.getFullYear(), txDate.getMonth(), 1)
        const lastDay = new Date(txDate.getFullYear(), txDate.getMonth() + 1, 0)
        filterFrom = firstDay.toISOString().split("T")[0]
        filterTo = lastDay.toISOString().split("T")[0]
      }
      
      // For weekly view, get the Monday date
      let originalDate
      if (effectiveViewMode === "week" && matchingTx) {
        const txDate = new Date(matchingTx.date)
        originalDate = new Date(txDate)
        originalDate.setDate(txDate.getDate() - txDate.getDay() + 1) // Set to Monday
      } else {
        originalDate = matchingTx ? new Date(matchingTx.date) : new Date()
      }
      
      return {
        date,
        amount,
        originalDate,
        filterFrom,
        filterTo
      }
    })

    // Sort by date and include filter dates in the data
    return dataWithDates
      .sort((a, b) => a.originalDate.getTime() - b.originalDate.getTime())
      .map(({ date, amount, filterFrom, filterTo }) => ({
        date,
        amount,
        filterFrom,
        filterTo
      }))
  }, [transactions, filterPeriod, effectiveViewMode])

  const formatYAxis = (value: number) => {
    // Format VND with K/M/B suffixes for readability
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)}B`
    } else if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`
    }
    return value.toString()
  }

  // Adjust margins based on screen size and view mode
  const margins = useMemo(() => {
    const base = {
      top: 20,
      right: 10,
      left: 0,
      bottom: effectiveViewMode === "week" ? 20 : 10
    }

    // Add more right margin and left margin for desktop
    return {
      ...base,
      right: typeof window !== "undefined" && window.innerWidth > 640 ? 30 : 10,
      left: typeof window !== "undefined" && window.innerWidth > 640 ? 20 : 0
    }
  }, [effectiveViewMode])

  return (
    <div className="w-full h-[300px] mt-4 -ml-2 sm:ml-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={margins}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="date"
            tick={(props) => {
              const { x, y, payload } = props
              const isMobile = typeof window !== "undefined" && window.innerWidth <= 640
              const fontSize = isMobile ? 10 : 12
              return (
                <g transform={`translate(${x},${y})`}>
                  <text
                    x={0}
                    y={0}
                    dy={16}
                    textAnchor="end"
                    fill="currentColor"
                    fontSize={fontSize}
                    transform="rotate(-45)"
                  >
                    {payload.value}
                  </text>
                </g>
              )
            }}
            className="text-muted-foreground"
            height={60}
            interval={typeof window !== "undefined" && window.innerWidth <= 640 ? 1 : 0} // Skip some labels on mobile
          />
          <YAxis
            tickFormatter={formatYAxis}
            className="text-muted-foreground"
            fontSize={typeof window !== "undefined" && window.innerWidth <= 640 ? 10 : 12}
            width={typeof window !== "undefined" && window.innerWidth <= 640 ? 35 : 45}
          />
          <Tooltip
            formatter={(value: number) => [
              new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(value),
              "Spending"
            ]}
          />
          <Bar
            dataKey="amount"
            fill="#CE839C"
            onClick={(data: any) => {
              console.log('Bar clicked:', data);
              // Data comes directly in the payload
              const { filterFrom, filterTo } = data;
              if (filterFrom && filterTo) {
                onFilterChange(filterFrom, filterTo);
              }
            }}
            style={{ cursor: "pointer" }}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
