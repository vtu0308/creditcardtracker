import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { storage } from "@/lib/storage"
import { formatCurrency } from "@/lib/currency"
import { ResponsivePie } from "@nivo/pie"

interface DashboardAnalyticsProps {
  className?: string
}

export function DashboardAnalytics({ className }: DashboardAnalyticsProps) {
  const [spendingByCategory, setSpendingByCategory] = useState<Array<{ category: string; amount: number }>>([])
  const [totalSpending, setTotalSpending] = useState<number>(0)

  useEffect(() => {
    const calculateSpending = () => {
      try {
        const transactions = storage.getTransactions()
        const categories = storage.getCategories()
        
        // Filter transactions for last 30 days
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        thirtyDaysAgo.setHours(0, 0, 0, 0)

        const recentTransactions = transactions.filter(transaction => {
          const transactionDate = new Date(transaction.date)
          return transactionDate >= thirtyDaysAgo
        })

        // Calculate total spending
        const total = recentTransactions.reduce((sum, t) => {
          return sum + (typeof t.vndAmount === 'number' ? t.vndAmount : 0)
        }, 0)

        // Calculate spending by category
        const categorySpending = recentTransactions.reduce((acc, t) => {
          const category = categories.find(c => c.id === t.categoryId)?.name || 'Uncategorized'
          const amount = typeof t.vndAmount === 'number' ? t.vndAmount : 0
          acc[category] = (acc[category] || 0) + amount
          return acc
        }, {} as Record<string, number>)

        // Convert to array format for visualization
        const categoryData = Object.entries(categorySpending).map(([category, amount]) => ({
          category,
          amount
        }))

        setTotalSpending(total)
        setSpendingByCategory(categoryData)
      } catch (error) {
        console.error('Error calculating monthly spending:', error)
        setTotalSpending(0)
        setSpendingByCategory([])
      }
    }

    calculateSpending()
    window.addEventListener('storage-changed', calculateSpending)
    return () => window.removeEventListener('storage-changed', calculateSpending)
  }, [])

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Total Spending by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsivePie
              data={spendingByCategory.map(item => ({
                id: item.category,
                label: item.category,
                value: item.amount,
                formattedValue: formatCurrency(item.amount, "VND")
              }))}
              margin={{ top: 20, right: 80, bottom: 40, left: 80 }}
              innerRadius={0.6}
              padAngle={0.5}
              cornerRadius={3}
              activeOuterRadiusOffset={8}
              colors={['#E8B4BC', '#D282A6']}
              borderWidth={1}
              borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
              arcLinkLabelsSkipAngle={10}
              arcLinkLabelsTextColor="#6b7280"
              arcLinkLabelsThickness={2}
              arcLinkLabelsColor={{ from: 'color' }}
              arcLabelsSkipAngle={10}
              arcLabelsTextColor="#ffffff"
              enableArcLabels={false}
              legends={[]}
              arcLinkLabel={datum => `${datum.id}: ${formatCurrency(datum.value, "VND")}`}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Spending Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Total Spending</div>
              <div className="text-2xl font-bold">{formatCurrency(totalSpending, "VND")}</div>
            </div>
            <div className="space-y-2">
              {spendingByCategory.map(item => (
                <div key={item.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      item.category === spendingByCategory[0]?.category ? 'bg-[#E8B4BC]' : 'bg-[#D282A6]'
                    }`} />
                    <span className="text-sm font-medium">{item.category}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatCurrency(item.amount, "VND")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 