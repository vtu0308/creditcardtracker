"use client"

import { CardList } from "@/components/card-list"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardMetrics } from "@/components/dashboard-metrics"
import { RecentTransactions } from "@/components/recent-transactions"
import { SpendingAnalytics } from "@/components/spending-analytics"

import { ProtectedRoute } from "@/components/auth/protected-route";

export default function Home() {
  return (
    <ProtectedRoute>
      <div className="container py-6 space-y-8">
        <DashboardHeader />
        <DashboardMetrics />
        <SpendingAnalytics className="w-full" />
        <div className="grid gap-8 md:grid-cols-2">
          <CardList />
          <RecentTransactions />
        </div>
      </div>
    </ProtectedRoute>
  )
}
