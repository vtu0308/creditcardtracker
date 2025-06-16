"use client"

export function DashboardHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Dashboard</h1>
        <p className="text-muted-foreground text-xs sm:text-sm">
          Track your credit card expenses and manage statement cycles
        </p>
      </div>
    </div>
  )
}
