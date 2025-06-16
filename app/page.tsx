"use client"

import { CardList } from "@/components/card-list"
import { DashboardHeader } from "@/components/dashboard-header"

import { RecentTransactions } from "@/components/recent-transactions"
import { SpendingAnalytics } from "@/components/spending-analytics"
import { DashboardAnalytics } from "@/components/dashboard-analytics"
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function Home() {
  return (
    <ProtectedRoute>
      <div className="space-y-6 font-sans">
        <DashboardHeader />
        <div className="space-y-4">
          <DashboardAnalytics />
          <SpendingAnalytics />
          {/* Cards/Transactions grid */}
          <div className="grid gap-4 md:grid-cols-2">
            <CardList />
            <RecentTransactions />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
