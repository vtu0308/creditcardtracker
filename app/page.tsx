"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { CardList } from "@/components/card-list"
import { RecentTransactions } from "@/components/recent-transactions"
import { DashboardMetrics } from "@/components/dashboard-metrics"
import { ErrorBoundary } from "@/components/error-boundary"

export default function Home() {
  return (
    <ErrorBoundary>
      <div className="space-y-8">
        <DashboardHeader />
        <DashboardMetrics />
        <div className="grid gap-8 md:grid-cols-2">
          <CardList />
          <RecentTransactions />
        </div>
      </div>
    </ErrorBoundary>
  )
}
