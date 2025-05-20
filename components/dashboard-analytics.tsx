"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { Card, CardHeader, CardContent, CardTitle } from "./ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./ui/select";

import { storage, Transaction, Category } from "@/lib/storage";
import { formatCurrency } from "@/lib/currency";
import { SpendingPieChart } from "./SpendingPieChart";
import { SpendingOverview } from "./SpendingOverview";

const CATEGORY_COLORS = [
  "#CE839C", "#E8B4BC", "#6E4555",
  "#F5E3E0", "#FFB5A7", "#FCD5CE",
  "#F8EDEB", "#F9DCC4", "#FEC89A",
];

const TIME_PERIODS = {
  "7D": 7,
  "30D": 30,
  "90D": 90,
  ALL: 0,
} as const;

type TimePeriod = keyof typeof TIME_PERIODS;

interface DashboardAnalyticsProps {
  className?: string;
}

interface CategoryTotal {
  id: string;
  name: string;
  value: number;
  color: string;
}

export function DashboardAnalytics({ className }: DashboardAnalyticsProps) {
  const router = useRouter();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("30D");

  const {
    data: transactions = [],
    isLoading,
    isError,
  } = useQuery<Transaction[]>({
    queryKey: ["transactions"],
    queryFn: storage.getTransactions,
  });

  const {
    data: categories = [],
    isError: isErrorCategories,
  } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: storage.getCategories,
  });

  // 1) compute spending overview
  const { todaySpending, weekSpending, monthSpending } = useMemo(() => {
    let t = 0, w = 0, m = 0;
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - 6);
    const startOfMonth = new Date(startOfToday);
    startOfMonth.setDate(startOfMonth.getDate() - 29);

    transactions.forEach((tx) => {
      const d = new Date(tx.date);
      if (isNaN(d.getTime())) return;
      const amt = typeof tx.vndAmount === "number" ? tx.vndAmount : 0;
      if (d >= startOfToday) t += amt;
      if (d >= startOfWeek) w += amt;
      if (d >= startOfMonth) m += amt;
    });

    return { todaySpending: t, weekSpending: w, monthSpending: m };
  }, [transactions]);

  // 2) compute categoryTotals
  const categoryTotals = useMemo<CategoryTotal[]>(() => {
    const days = TIME_PERIODS[timePeriod];
    const cutoff = days ? Date.now() - days * 864e5 : 0;
    const map: Record<string, { id: string; value: number }> = {};

    transactions.forEach((tx) => {
      const d = new Date(tx.date).getTime();
      if (isNaN(d) || d < cutoff) return;
      const name = categories.find((c) => c.id === tx.categoryId)?.name
        || tx.categoryName
        || "Uncategorized";
      const id = tx.categoryId || "uncategorized";
      const val = typeof tx.vndAmount === "number" ? tx.vndAmount : 0;
      map[name] = map[name] || { id, value: 0 };
      map[name].value += val;
    });

    return Object.entries(map)
      .map(([name, { id, value }], i) => ({
        id,
        name,
        value,
        color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [timePeriod, transactions, categories]);

  // 3) totalSpending
  const totalSpending = useMemo(
    () => categoryTotals.reduce((sum, c) => sum + c.value, 0),
    [categoryTotals]
  );

  if (isLoading)  return <p className="py-10 text-center">Loading…</p>;
  if (isError || isErrorCategories) return <p className="py-10 text-center text-red-500">Error loading data</p>;

  return (
    <div className={`w-full space-y-8 ${className || ""}`}>
      {/* Spending Overview */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Spending Overview</h2>
        <SpendingOverview
          todaySpending={todaySpending}
          weekSpending={weekSpending}
          monthSpending={monthSpending}
        />
      </div>

      {/* Analytics header + dropdown */}
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold">Spending Analytics</h2>
          <p className="text-sm text-muted-foreground">
            Your spending overview for {timePeriod === "ALL"
              ? "all time"
              : `the last ${TIME_PERIODS[timePeriod]} days`}
          </p>
        </div>
        <Select
          value={timePeriod}
          onValueChange={(v) => setTimePeriod(v as TimePeriod)}
        >
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

      {/* Analytics grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="h-full">
          <CardHeader>
            <div className="space-y-1">
              <CardTitle className="text-xl sm:text-2xl font-semibold">
                Total Spending by Category
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Your spending breakdown by category
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative w-full max-w-[360px] mx-auto aspect-square">
              <SpendingPieChart categoryTotals={categoryTotals} />
            </div>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader className="pb-3">
            <div className="space-y-1">
              <CardTitle className="text-xl sm:text-2xl font-semibold">
                Spending Summary
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Your spending overview for {timePeriod === "ALL"
                  ? "all time"
                  : `the last ${TIME_PERIODS[timePeriod]} days`}
              </p>
            </div>
          </CardHeader>
          <CardContent className="pt-0 pb-6">
            <div className="mb-4">
              <div className="text-sm text-muted-foreground">
                Total Spending ({timePeriod === "ALL"
                  ? "All time"
                  : `Last ${TIME_PERIODS[timePeriod]} days`})
              </div>
              <div className="text-2xl font-bold">
                {formatCurrency(totalSpending, "VND")}
              </div>
            </div>
            <div className="text-sm text-muted-foreground font-medium mb-2">
              By Category:
            </div>
            {categoryTotals.map((ct) => (
              <div
                key={ct.id}
                className="flex items-center justify-between px-2 py-1 rounded hover:bg-muted/50 cursor-pointer"
                onClick={() =>
                  router.push(
                    `/transactions?category=${encodeURIComponent(ct.id)}&period=${timePeriod}`
                  )
                }
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: ct.color }}
                  />
                  <span className="truncate max-w-[150px] text-sm font-medium">
                    {ct.name}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatCurrency(ct.value, "VND")}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
