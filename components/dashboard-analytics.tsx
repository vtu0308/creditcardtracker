/**
 * DashboardAnalytics
 * ------------------
 * – Fetches transactions & categories once via TanStack Query
 * – Allows user to pick a time window (7 / 30 / 90 days or All)
 * – Shows:
 *     1. Recharts donut (spending by category)
 *     2. Total-spend summary list
 */
"use client";
import { useState, useMemo } from "react";
import { useQuery } from '@tanstack/react-query';
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardContent, CardTitle } from "./ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./ui/select";
import { storage, Transaction, Category } from "@/lib/storage";
import { formatCurrency } from "@/lib/currency";
import { SpendingPieChart } from "./SpendingPieChart";

// Category colors for the pie chart
const CATEGORY_COLORS = [
  "#CE839C", // Beauty related (darker pink)
  "#E8B4BC", // Groceries (lighter pink)
  "#6E4555", // Coffee (dark brown)
  "#F5E3E0", // Food and Drinks (very light pink)
  "#FFB5A7", // Subscription (salmon pink)
  "#FCD5CE", // Transportation (peachy pink)
  "#F8EDEB", // Additional colors if needed
  "#F9DCC4",
  "#FEC89A",
];

// Time period options for filtering
const TIME_PERIODS = {
  "7D": 7,
  "30D": 30,
  "90D": 90,
  "ALL": 0 // 0 days means no date filtering (all time)
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

  // Fetch transactions via react-query
  const {
    data: transactions = [],
    isLoading,
    isError,
  } = useQuery<Transaction[]>({
    queryKey: ['transactions'],
    queryFn: storage.getTransactions,
  });

  // Fetch categories (optional, for better naming)
  const {
    data: categories = [],
    isError: isErrorCategories,
  } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: storage.getCategories,
  });

  // Compute category totals whenever timePeriod or transactions change
  const categoryTotals = useMemo(() => {
    const days = TIME_PERIODS[timePeriod];
    const cutoffDate = days > 0 ? new Date(Date.now() - days * 24 * 60 * 60 * 1000) : new Date(0);
    const totals: { [key: string]: { id: string, value: number } } = {};
    transactions.forEach(transaction => {
      let transactionDate: Date;
      try {
        transactionDate = new Date(transaction.date);
        if (isNaN(transactionDate.getTime())) return;
      } catch {
        return;
      }
      if (transactionDate >= cutoffDate) {
        const categoryName = categories.find((c) => c.id === transaction.categoryId)?.name || transaction.categoryName || 'Uncategorized';
        const categoryId = transaction.categoryId || 'uncategorized';
        const amount = typeof transaction.vndAmount === 'number' && !isNaN(transaction.vndAmount)
          ? transaction.vndAmount : 0;
        if (!totals[categoryName]) {
          totals[categoryName] = { id: categoryId, value: 0 };
        }
        totals[categoryName].value += amount;
      }
    });
    return Object.entries(totals)
      .map(([name, { id, value }], index) => ({
        id,
        name,
        value,
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [timePeriod, transactions, categories]);

  // Total spending across all categories
  const totalSpending = useMemo(
    () => categoryTotals.reduce((sum, c) => sum + c.value, 0),
    [categoryTotals],
  );

  // Loading / error / empty states
  if (isLoading) return <p>Loading…</p>;
  if (isError || isErrorCategories) return <p>Error loading data</p>;
  if (!categoryTotals.length)
    return <p>No spending data for this period</p>;

  // Render
  return (
    <div className={`w-full space-y-4 ${className || ""}`}>
      {/* header + dropdown */}
      <div className="flex flex-col gap-1.5">
        <div>
          <div className="space-y-1">
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Spending Analytics</h2>
            <p className="text-muted-foreground text-sm">Your spending breakdown by category</p>
          </div>
        </div>
        <Select value={timePeriod} onValueChange={v => setTimePeriod(v as TimePeriod)}>
          <SelectTrigger className="w-full bg-background/50">
            <SelectValue>
              {timePeriod === "ALL"
                ? "All time"
                : `Last ${TIME_PERIODS[timePeriod]} days`}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7D">Last 7 days</SelectItem>
            <SelectItem value="30D">Last 30 days</SelectItem>
            <SelectItem value="90D">Last 90 days</SelectItem>
            <SelectItem value="ALL">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Pie chart card */}
      <Card>
        <CardHeader>
          <div className="space-y-1">
            <CardTitle className="text-lg sm:text-xl">Total Spending by Category</CardTitle>
            <p className="text-muted-foreground text-sm">Your spending breakdown by category</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full flex flex-col items-center py-4">
            <div className="relative w-full aspect-square max-w-[220px] mx-auto mb-8">
              <SpendingPieChart
                categoryTotals={categoryTotals}
                colors={CATEGORY_COLORS}
              />
            </div>
            <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 mt-3 text-xs sm:text-sm">
              {categoryTotals.slice(0, 6).map(ct => (
                <div key={ct.id} className="flex items-center gap-1.5 sm:gap-2">
                  <span
                    className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: ct.color }}
                  />
                  <span className="text-muted-foreground truncate max-w-[70px] sm:max-w-[90px]">{ct.name}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary card */}
      <Card className="mt-4">
        <CardHeader>
          <div className="space-y-1">
            <CardTitle className="text-lg sm:text-xl">Spending Summary</CardTitle>
            <p className="text-muted-foreground text-sm">
              Your spending overview for {timePeriod === "ALL" ? "all time" : `the last ${TIME_PERIODS[timePeriod]} days`}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-0.5 mb-2">
            <div className="text-muted-foreground text-sm font-medium">Total Spending ({timePeriod === "ALL" ? "All time" : `Last ${TIME_PERIODS[timePeriod]} Days`})</div>
            <span className="text-2xl font-bold">{formatCurrency(totalSpending, "VND")}</span>
          </div>
          <div className="mb-2 mt-4 text-muted-foreground text-sm font-medium">By Category:</div>
          {categoryTotals.length > 0 ? (
            categoryTotals.map(ct => (
              <div
                key={ct.id}
                className="flex items-center justify-between cursor-pointer hover:bg-muted/50 rounded px-2 py-1"
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
                  <span className="text-sm font-medium truncate max-w-[150px]">{ct.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatCurrency(ct.value, "VND")}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No spending data by category.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}