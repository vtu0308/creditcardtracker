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
      <div className="container py-8 space-y-10 font-sans">
        <DashboardHeader />
        {/* Redesigned Spending Analytics section */}
        <section className="space-y-8">
        <DashboardMetrics />
        <SpendingAnalytics className="w-full" />
        </section>
        {/* Cards/Transactions grid */}
        <div className="grid gap-8 md:grid-cols-2">
          <CardList />
          <RecentTransactions />
        </div>
      </div>
    </ProtectedRoute>
  );
}
