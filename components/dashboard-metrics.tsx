"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { storage } from "@/lib/storage"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

// Time period options for filtering
const TIME_PERIODS = {
  "7D": 7,
  "30D": 30,
  "90D": 90,
  "ALL": 0
} as const

type TimePeriod = keyof typeof TIME_PERIODS

interface CategoryTotal {
  name: string
  value: number
  color: string
}

// Category colors for the pie chart
const CATEGORY_COLORS = [
  "#D282A6", // Our primary pink
  "#E8B4BC", // Lighter pink
  "#6E4555", // Our dark color
  "#F5E3E0", // Our background color
  "#FFB5A7",
  "#FCD5CE",
  "#F8EDEB",
  "#F9DCC4",
  "#FEC89A",
]

export function DashboardMetrics() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("30D")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Initialize storage if needed
    storage.initialize()
    setIsLoading(false)
  }, [])

  // Calculate category totals based on selected time period
  const categoryTotals = useMemo(() => {
    if (isLoading) return []
    
    const transactions = storage.getTransactions()
    console.log('Current transactions:', transactions)
    
    const days = TIME_PERIODS[timePeriod]
    const cutoffDate = days ? new Date(Date.now() - days * 24 * 60 * 60 * 1000) : new Date(0)
    
    const totals: { [key: string]: number } = {}
    
    transactions.forEach(transaction => {
      if (new Date(transaction.date) >= cutoffDate) {
        const categoryName = transaction.categoryName
        totals[categoryName] = (totals[categoryName] || 0) + (transaction.vndAmount || transaction.amount)
      }
    })

    console.log('Category totals:', totals)

    // Convert to array format for the pie chart
    return Object.entries(totals)
      .map(([name, value], index) => ({
        name,
        value,
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length]
      }))
      .sort((a, b) => b.value - a.value) // Sort by value descending
  }, [timePeriod, isLoading])

  const totalSpending = useMemo(() => {
    return categoryTotals.reduce((sum, category) => sum + category.value, 0)
  }, [categoryTotals])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (categoryTotals.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Spending Analytics</h2>
          <Select value={timePeriod} onValueChange={(value: TimePeriod) => setTimePeriod(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7D">Last 7 days</SelectItem>
              <SelectItem value="30D">Last 30 days</SelectItem>
              <SelectItem value="90D">Last 90 days</SelectItem>
              <SelectItem value="ALL">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-2 py-12 text-center">
              <p className="text-sm text-muted-foreground">No transactions found for this time period</p>
              <p className="text-xs text-muted-foreground">Add some transactions to see your spending analytics</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Spending Analytics</h2>
        <Select value={timePeriod} onValueChange={(value: TimePeriod) => setTimePeriod(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7D">Last 7 days</SelectItem>
            <SelectItem value="30D">Last 30 days</SelectItem>
            <SelectItem value="90D">Last 90 days</SelectItem>
            <SelectItem value="ALL">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Total Spending by Category</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryTotals}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={160}
                  paddingAngle={2}
                >
                  {categoryTotals.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                    maximumFractionDigits: 0,
                  }).format(value as number)}
                />
                <Legend 
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{ paddingTop: "20px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Spending Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Spending</p>
                <p className="text-2xl font-bold">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                    maximumFractionDigits: 0,
                  }).format(totalSpending)}
                </p>
              </div>
              <div className="space-y-2">
                {categoryTotals.map((category) => (
                  <div key={category.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-sm font-medium">{category.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                        maximumFractionDigits: 0,
                      }).format(category.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 