"use client"

export function DashboardHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Track your credit card expenses and manage statement cycles
        </p>
      </div>
    </div>
  )
}
