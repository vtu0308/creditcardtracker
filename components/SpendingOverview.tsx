//spending overview provides a quick snapshot in time: day spending, week spending and month spending

import { Card, CardContent } from "@/components/ui/card"
import { CalendarDays, Mail, TrendingUp, ArrowUpRight } from "lucide-react"
import { formatCurrency } from "@/lib/currency"
import { useRouter } from "next/navigation"
import { BudgetProgressBar } from "./budget-progress-bar"
import { useBudget } from "@/lib/hooks/useBudget"

interface SpendingOverviewProps {
  todaySpending: number
  weekSpending: number
  monthSpending: number
}

export function SpendingOverview({ todaySpending, weekSpending, monthSpending }: SpendingOverviewProps) {
  const router = useRouter();
  const { getBudgetStatus } = useBudget();
  const status = getBudgetStatus();

  return (
    <div className="space-y-4 relative">
      <Card className="bg-[#F7EDEF] p-4 shadow-sm">
        <BudgetProgressBar />
      </Card>
      <div className="grid gap-4 md:grid-cols-3">
        <Card 
        className="bg-primary/5 cursor-pointer group relative hover:shadow-md hover:bg-primary/10 transition-all duration-200" 
        onClick={() => router.push(`/transactions?period=1D`)}
      >
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowUpRight className="h-4 w-4 text-primary" />
        </div>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Today</p>
              <p className="text-2xl font-bold mt-1 text-black">
                {formatCurrency(todaySpending, "VND")}
              </p>
            </div>
            <div className="p-2 bg-primary/10 rounded-full">
              <CalendarDays className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card 
        className="bg-primary/5 cursor-pointer group relative hover:shadow-md hover:bg-primary/10 transition-all duration-200"
        onClick={() => router.push(`/transactions?period=week`)}
      >
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowUpRight className="h-4 w-4 text-primary" />
        </div>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">This Week</p>
              <p className="text-2xl font-bold mt-1 text-black">
                {formatCurrency(weekSpending, "VND")}
              </p>
            </div>
            <div className="p-2 bg-primary/10 rounded-full">
              <Mail className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card 
        className="bg-primary/5 cursor-pointer group relative hover:shadow-md hover:bg-primary/10 transition-all duration-200"
        onClick={() => router.push(`/transactions?period=month`)}
      >
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowUpRight className="h-4 w-4 text-primary" />
        </div>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">This Month</p>
              <p className="text-2xl font-bold mt-1 text-black">
                {formatCurrency(monthSpending, "VND")}
              </p>
            </div>
            <div className="p-2 bg-primary/10 rounded-full">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}