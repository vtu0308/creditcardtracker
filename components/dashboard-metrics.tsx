"use client"

import { useState, useMemo } from "react"; // Removed useEffect
import { useQuery } from '@tanstack/react-query'; // Added useQuery
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { storage, Transaction } from "@/lib/storage"; // Import Transaction type
import { formatCurrency } from "@/lib/currency"; // Assuming formatCurrency is correct
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { SpendingPieChart } from "@/components/SpendingPieChart";

// Category colors for the pie chart
const CATEGORY_COLORS = [
  "#CE839C", "#E8B4BC", "#6E4555", "#F5E3E0", "#FFB5A7",
  "#FCD5CE", "#F8EDEB", "#F9DCC4", "#FEC89A",
];

// Time period options for filtering
const TIME_PERIODS = {
  "7D": 7,
  "30D": 30,
  "90D": 90,
  "ALL": 0 // 0 days means no date filtering (all time)
} as const;

type TimePeriod = keyof typeof TIME_PERIODS;

interface CategoryTotal {
  id: string;
  name: string;
  value: number;
  color: string;
}

import { useRouter } from "next/navigation";

export function DashboardMetrics() {
  const router = useRouter();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("30D");
  // REMOVED: useState for isLoading and transactions

  // --- Fetch Transactions using useQuery ---
  const {
    data: transactions = [], // Default to empty array
    isLoading,                // Get loading state from useQuery
    isError,                  // Get error state from useQuery
    // error                   // Optional: get error object for detailed messages
  } = useQuery<Transaction[]>({
    queryKey: ['transactions'],       // Use the consistent query key
    queryFn: storage.getTransactions, // Fetch function
  });

  // REMOVED: The useEffect hook that manually fetched transactions

  // --- Calculate category totals based on selected time period ---
  const categoryTotals = useMemo<CategoryTotal[]>(() => {
    console.log("[DashboardMetrics] Recalculating category totals..."); // Debug log
    // No need to check isLoading here; useQuery handles data fetching state
    const days = TIME_PERIODS[timePeriod];
    // Set cutoffDate to beginning of time if days is 0 (ALL time)
    const cutoffDate = days > 0 ? new Date(Date.now() - days * 24 * 60 * 60 * 1000) : new Date(0);

    const totals: { [key: string]: { id: string, value: number } } = {};

    transactions.forEach(transaction => { // Use transactions directly from useQuery
      let transactionDate: Date;
      try {
         transactionDate = new Date(transaction.date);
         if (isNaN(transactionDate.getTime())) return; // Skip if date is invalid
      } catch {
          return; // Skip if date parsing fails
      }

      if (transactionDate >= cutoffDate) {
        // Ensure categoryName and categoryId exist, provide fallback
        const categoryName = transaction.categoryName || 'Uncategorized';
        const categoryId = transaction.categoryId || 'uncategorized';
        // Ensure amount is a valid number, default to 0
        const amount = typeof transaction.vndAmount === 'number' && !isNaN(transaction.vndAmount)
                           ? transaction.vndAmount
                           : 0;
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
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length]
      }))
      .sort((a, b) => b.value - a.value); // Sort by value descending

  }, [timePeriod, transactions]); // Dependencies: timePeriod filter and fetched transactions

  // --- Calculate total spending ---
  const totalSpending = useMemo(() => {
    return categoryTotals.reduce((sum, category) => sum + category.value, 0);
  }, [categoryTotals]); // Dependency: calculated categoryTotals


  // --- Handle Loading State ---
  if (isLoading) {
    return (
       <div className="space-y-4">
        {/* Keep header/filter usable while loading */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Spending Analytics</h2>
          <Select value={timePeriod} onValueChange={(value: TimePeriod) => setTimePeriod(value)} disabled>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            {/* Content can be omitted or disabled during load */}
          </Select>
        </div>
        {/* Show loading placeholder cards */}
        <div className="grid gap-4 md:grid-cols-2">
           <Card><CardHeader><CardTitle>Total Spending by Category</CardTitle></CardHeader><CardContent className="h-[400px] flex items-center justify-center"><p>Loading...</p></CardContent></Card>
           <Card><CardHeader><CardTitle>Spending Summary</CardTitle></CardHeader><CardContent className="h-[200px] flex items-center justify-center"><p>Loading...</p></CardContent></Card>
        </div>
      </div>
    );
  }

  // --- Handle Error State ---
  if (isError) {
     return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
             <h2 className="text-2xl font-bold tracking-tight">Spending Analytics</h2>
             {/* Keep filter */}
              <Select value={timePeriod} onValueChange={(value: TimePeriod) => setTimePeriod(value)}>
                 {/* ... Select options ... */}
              </Select>
          </div>
           <Card>
              <CardHeader><CardTitle>Error</CardTitle></CardHeader>
              <CardContent className="pt-6"><p className="text-red-600">Error loading spending data.</p></CardContent>
           </Card>
        </div>
     );
  }


  // --- Handle No Data State ---
  if (categoryTotals.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Spending Analytics</h2>
          <Select value={timePeriod} onValueChange={(value: TimePeriod) => setTimePeriod(value)}>
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

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-2 py-12 text-center">
              {/* Changed message slightly */}
              <p className="text-sm text-muted-foreground">No spending data found for this period.</p>
              <p className="text-xs text-muted-foreground">Try adjusting the time period or adding transactions.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- Render Main Content (Data Loaded Successfully) ---
  return (
    <div className="space-y-4">
      {/* Header with Filter */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Spending Analytics</h2>
        <Select value={timePeriod} onValueChange={(value: TimePeriod) => setTimePeriod(value)}>
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

      {/* Charts/Summary Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Pie Chart Card */}
        <Card>
          <CardHeader>
  <CardTitle>Total Spending by Category</CardTitle>
  <p className="text-muted-foreground text-base font-medium mt-1">Your spending breakdown by category</p>
</CardHeader>
          <CardContent className="h-[400px] w-full flex flex-col items-center justify-center">
  <SpendingPieChart categoryTotals={categoryTotals} colors={CATEGORY_COLORS} />
</CardContent>
        </Card>

        {/* Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle>Spending Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Total Spending */}
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Spending ({timePeriod === 'ALL' ? 'All Time' : `Last ${TIME_PERIODS[timePeriod]} Days`})</p>
                <p className="text-2xl font-bold">
                    {formatCurrency(totalSpending, "VND")}
                </p>
              </div>
              {/* Category Breakdown */}
              <div className="space-y-2 pt-2">
        <h4 className="text-sm font-medium text-muted-foreground">By Category:</h4>
        <div className="flex flex-col gap-1 sm:gap-2 overflow-x-auto">
          {categoryTotals.map((category, index) => (
            <div
              key={category.name}
              className="flex items-center justify-between cursor-pointer hover:bg-primary/10 rounded px-2 py-1 transition-colors min-w-0"
              onClick={() => {
                router.push(`/transactions?category=${encodeURIComponent(category.id)}&period=${timePeriod}`);
              }}
              title={`Show transactions for ${category.name}`}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  router.push(`/transactions?category=${encodeURIComponent(category.id)}&period=${timePeriod}`);
                }
              }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }}
                />
                <span className="text-sm font-medium truncate max-w-[90px] sm:max-w-[150px]">{category.name}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {formatCurrency(category.value, "VND")}
              </span>
            </div>
          ))}
        </div>
      </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}