"use client"

import { useState, useMemo, useEffect } from "react";
import { useQuery } from '@tanstack/react-query';
import { Input } from "@/components/ui/input"; // Added Input import
import { Button } from "@/components/ui/button"; // Added Button import
import { AddTransactionButton } from "@/components/add-transaction-button";
import { PlusCircle } from "lucide-react"; // Added Icon import
import { AddTransactionDialog } from "@/components/add-transaction-dialog"; // Added Dialog import
import { storage, Transaction, Card, Category } from "@/lib/storage";
import { TransactionItem } from "@/components/transaction-item"; // Added TransactionItem import
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { useSearchParams } from "next/navigation"; // Make sure this import is present
import { X } from "lucide-react"
import { FilterBadge } from "@/components/transaction-page/filter-badge"
import { TransactionMonthSection } from "@/components/transaction-month-section"
import { SpendingTrendsChart } from "@/components/spending-trends-chart"

// --- Utility: Group transactions by month and date ---
function groupTransactionsByMonthAndDate(transactions: Transaction[]) {
  const formatLocalYMD = (date: Date) => {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long' });
  };

  const formatDayHeader = (date: Date, now: Date) => {
    const dateYMD = formatLocalYMD(date);
    const todayYMD = formatLocalYMD(now);
    const yesterdayDate = new Date(now);
    yesterdayDate.setDate(now.getDate() - 1);
    const yesterdayYMD = formatLocalYMD(yesterdayDate);

    if (dateYMD === todayYMD) return 'Today';
    if (dateYMD === yesterdayYMD) return 'Yesterday';
    return date.toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
  };

  // First, group by month-year
  const monthGroups: Record<string, Record<string, Transaction[]>> = {};
  const now = new Date();

  transactions.forEach(tx => {
    const txDate = new Date(tx.date);
    const monthKey = `${txDate.getFullYear()}-${(txDate.getMonth() + 1).toString().padStart(2, '0')}`;
    const dayKey = formatLocalYMD(txDate);

    if (!monthGroups[monthKey]) monthGroups[monthKey] = {};
    if (!monthGroups[monthKey][dayKey]) monthGroups[monthKey][dayKey] = [];
    monthGroups[monthKey][dayKey].push(tx);
  });

  // Convert to final structure
  return Object.entries(monthGroups)
    .sort(([a], [b]) => b.localeCompare(a)) // Sort months newest first
    .map(([monthKey, dayGroups]) => {
      const monthDate = new Date(monthKey + '-01'); // First day of month
      return {
        monthLabel: formatMonthYear(monthDate),
        dayGroups: Object.entries(dayGroups)
          .sort(([a], [b]) => b.localeCompare(a)) // Sort days newest first
          .map(([dayKey, transactions]) => ({
            label: formatDayHeader(new Date(dayKey), now),
            transactions
          }))
      };
    });
}


// --- Main Page Component ---
export default function TransactionsPage() {
  return (
    <ProtectedRoute>
      <TransactionsContent />
    </ProtectedRoute>
  );
}


function applyQuickDateFilter(period: "1D"|"7D"|"30D"|"90D") {
  const today = new Date();
  let from = new Date(today);
  switch(period) {
    case "1D": /* keep from = today */; break;
    case "7D": from.setDate(today.getDate() - 6); break;
    case "30D": from.setDate(today.getDate() - 29); break;
    case "90D": from.setDate(today.getDate() - 89); break;
  }
  return {
    from: from.toISOString().slice(0,10),
    to: today.toISOString().slice(0,10)
  };
}

function TransactionsContent() {
  // --- State for UI controls ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCard, setSelectedCard] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [chartViewMode, setChartViewMode] = useState<"day" | "week" | "month">("day");
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);

  // --- Read filters from URL query params ---
  const searchParams = useSearchParams();

  // Sync category and period from URL params (Keep your existing useEffect)
  useEffect(() => {
    const urlCategory = searchParams.get('category') || '';
    const urlPeriod = searchParams.get('period') || '';
    setSelectedCategory(urlCategory);

    const today = new Date();
    let fromDate = new Date(today);
    let toDate = new Date(today);

    if (urlPeriod === '1D') {
      // Handled by default fromDate, toDate initialization to today
    } else if (urlPeriod === 'week') {
      const dayOfWeek = today.getDay(); // Sunday - 0, Monday - 1, ..., Saturday - 6
      const diffToMonday = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust for Sunday
      fromDate = new Date(today.setDate(diffToMonday));
      
      const diffToSunday = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? 0 : 7); // Adjust for Sunday
      toDate = new Date(new Date().setDate(diffToSunday)); // Use new Date() to avoid mutation from fromDate calculation
    } else if (urlPeriod === 'month') {
      fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
      toDate = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Last day of current month
    } else if (urlPeriod === '7D') {
      fromDate.setDate(today.getDate() - 6);
    } else if (urlPeriod === '30D') {
      fromDate.setDate(today.getDate() - 29);
    } else if (urlPeriod === '90D') {
      fromDate.setDate(today.getDate() - 89);
    } else {
      // If no valid period, don't set dates from URL, allow manual/default
      // Or clear them if that's preferred: 
      // setDateFrom(''); 
      // setDateTo('');
      return; // Exit early if no specific period handling is needed
    }

    // Set dates only if a period was processed
    if (urlPeriod) {
        fromDate.setHours(0,0,0,0); // Normalize to start of day
        toDate.setHours(23,59,59,999); // Normalize to end of day
        setDateFrom(fromDate.toISOString().slice(0, 10));
        setDateTo(toDate.toISOString().slice(0, 10));
    }

  }, [searchParams]);

  // --- Fetch Data using useQuery ---
   const {
      data: transactions = [],
      isLoading: isLoadingTransactions,
      isError: isErrorTransactions,
      error: transactionsError,
   } = useQuery<Transaction[]>({
      queryKey: ['transactions'],
      queryFn: storage.getTransactions,
   });

   const {
      data: cards = [],
      isLoading: isLoadingCards,
      isError: isErrorCards,
      error: cardsError,
   } = useQuery<Card[]>({
      queryKey: ['cards'],
      queryFn: storage.getCards,
   });

   const {
      data: categories = [],
      isLoading: isLoadingCategories,
      isError: isErrorCategories,
      error: categoriesError,
   } = useQuery<Category[]>({
      queryKey: ['categories'],
      queryFn: storage.getCategories,
   });


  // --- Calculate Filtered Transactions using useMemo ---
  const filteredTransactions = useMemo(() => {
    // Keep your existing useMemo logic
    return transactions.filter(transaction => {
      if (selectedCard && transaction.cardId !== selectedCard) return false;
      if (selectedCategory && transaction.categoryId !== selectedCategory) return false;
      if (dateFrom) {
          try {
              // Compare only dates, ignore time by creating date objects at midnight UTC
              const txDateOnly = new Date(Date.UTC(new Date(transaction.date).getUTCFullYear(), new Date(transaction.date).getUTCMonth(), new Date(transaction.date).getUTCDate()));
              const fromDateOnly = new Date(Date.UTC(new Date(dateFrom).getUTCFullYear(), new Date(dateFrom).getUTCMonth(), new Date(dateFrom).getUTCDate()));
              if (txDateOnly < fromDateOnly) return false;
          } catch { return false; }
      }
      if (dateTo) {
          try {
              // Compare only dates, ignore time
               const txDateOnly = new Date(Date.UTC(new Date(transaction.date).getUTCFullYear(), new Date(transaction.date).getUTCMonth(), new Date(transaction.date).getUTCDate()));
               const toDateOnly = new Date(Date.UTC(new Date(dateTo).getUTCFullYear(), new Date(dateTo).getUTCMonth(), new Date(dateTo).getUTCDate()));
               if (txDateOnly > toDateOnly) return false;
          } catch { return false; }
      }
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const descMatch = transaction.description.toLowerCase().includes(searchLower);
        // Ensure cardName and categoryName exist before calling toLowerCase
        const cardMatch = transaction.cardName && transaction.cardName.toLowerCase().includes(searchLower);
        const catMatch = transaction.categoryName && transaction.categoryName.toLowerCase().includes(searchLower);
        if (!descMatch && !cardMatch && !catMatch) {
          return false;
        }
      }
      return true;
    });
  }, [transactions, searchQuery, selectedCard, selectedCategory, dateFrom, dateTo]);


  // --- Combined Loading/Error State ---
  const isLoading = isLoadingTransactions || isLoadingCards || isLoadingCategories;
  const isError = isErrorTransactions || isErrorCards || isErrorCategories;
  const error = transactionsError || cardsError || categoriesError;

  // --- Render Loading State ---
  if (isLoading) {
     // Keep your existing Skeleton loading state
     return (
        <div className="space-y-4 p-4 md:p-6">
           <div className="flex items-center justify-between">
              <div> <Skeleton className="h-8 w-40 mb-2" /> <Skeleton className="h-4 w-64" /> </div>
           </div>
           <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 md:p-6 space-y-4">
              <div className="flex justify-between items-center mb-4"> <Skeleton className="h-8 w-48" /> <Skeleton className="h-10 w-40" /> </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 items-end"> <Skeleton className="h-16 w-full" /> <Skeleton className="h-16 w-full" /> <Skeleton className="h-16 w-full" /> <Skeleton className="h-16 w-full" /> </div>
              <Skeleton className="h-10 w-full mb-6" /> {/* Adjusted skeleton for full width search */}
              <div className="space-y-4"> <Skeleton className="h-16 w-full rounded-lg" /> <Skeleton className="h-16 w-full rounded-lg" /> <Skeleton className="h-16 w-full rounded-lg" /> </div>
           </div>
        </div>
     );
  }

  // --- Render Error State ---
  if (isError) {
      // Keep your existing Error state
       return (
          <div className="space-y-4 p-2 md:p-4">
             <div className="flex items-center justify-between">
                <div> <h1 className="text-2xl font-bold tracking-tight text-red-600">Error Loading Data</h1> <p className="text-muted-foreground"> Could not load page data. Please try again later. </p> {error && <p className="text-sm text-red-500 mt-2">Details: {error.message}</p>} </div>
             </div>
          </div>
       );
  }

  // --- Render Main Content ---
  return (
    <div className="space-y-4 p-2 md:p-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">
            View and manage all your credit card transactions
          </p>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-2 md:p-4">
        {/* Inner Content Container */}
        <div className="px-1 md:px-2">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
             <div>
                <h2 className="text-xl font-semibold tracking-tight">Transaction History</h2>
                <p className="text-sm text-muted-foreground">Search and filter your transaction history</p>
             </div>
             <AddTransactionButton onClick={() => setIsAddTransactionOpen(true)} />
          </div>

          {/* Filters Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 items-end">
            {/* Date From */}
            <div className="grid gap-1.5">
              <Label htmlFor="filter-date-from">Date From</Label>
              <Input id="filter-date-from" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
            </div>
            {/* Date To */}
            <div className="grid gap-1.5">
              <Label htmlFor="filter-date-to">Date To</Label>
              <Input id="filter-date-to" type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
            </div>
            {/* Card Select */}
            <div className="grid gap-1.5">
              <Label htmlFor="filter-card">Card</Label>
              <Select value={selectedCard} onValueChange={(value) => setSelectedCard(value === "all" ? "" : value)} disabled={cards.length === 0} >
                 <SelectTrigger id="filter-card"> <SelectValue placeholder={cards.length === 0 ? "No Cards" : "All Cards"} /> </SelectTrigger>
                 <SelectContent> <SelectItem value="all">All Cards</SelectItem> {cards.map(card => (<SelectItem key={card.id} value={card.id}>{card.name}</SelectItem>))} </SelectContent>
              </Select>
            </div>
             {/* Category Select */}
             <div className="grid gap-1.5">
               <Label htmlFor="filter-category">Category</Label>
               <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value === "all" ? "" : value)} disabled={categories.length === 0} >
                  <SelectTrigger id="filter-category"> <SelectValue placeholder={categories.length === 0 ? "No Categories" : "All Categories"} /> </SelectTrigger>
                  <SelectContent> <SelectItem value="all">All Categories</SelectItem> {categories.map(category => (<SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>))} </SelectContent>
               </Select>
             </div>
          </div>

          {/* Search Input - MODIFIED with Icon */}
          <div className="relative mb-6"> {/* Added relative positioning */}
             <Label htmlFor="filter-search" className="sr-only">Search Transactions</Label>
             {/* Icon positioned absolutely inside the relative div */}
             <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
             <Input
               id="filter-search"
               placeholder="Search descriptions, cards, categories..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="pl-10" // Added padding-left to make space for the icon
             />
          </div>

          {/* ─── Active Filters + Clear All ─────────────────────────── */}
          {(selectedCategory || selectedCard || dateFrom) && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {selectedCategory && (
                <FilterBadge
                  label="Category"
                  value={categories.find(c=>c.id===selectedCategory)?.name || "—"}
                  onRemove={() => setSelectedCategory("")}
                />
              )}
              {selectedCard && (
                <FilterBadge
                  label="Card"
                  value={cards.find(c=>c.id===selectedCard)?.name || "—"}
                  onRemove={() => setSelectedCard("")}
                />
              )}
              {(dateFrom || dateTo) && (
                <FilterBadge
                  label="Period"
                  value={
                    dateFrom === dateTo
                      ? "Today"
                      : `${dateFrom} ↔ ${dateTo}`
                  }
                  onRemove={() => { setDateFrom(""); setDateTo(""); }}
                />
              )}

              <button
                className="ml-auto flex items-center text-sm font-medium text-primary hover:underline"
                onClick={() => {
                  setSelectedCategory("");
                  setSelectedCard("");
                  setDateFrom("");
                  setDateTo("");
                }}
              >
                Clear All <X className="ml-1 h-4 w-4" />
              </button>
            </div>
          )}

          {/* ─── Quick Date Filters ──────────────────────────────────── */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => {
                const dates = applyQuickDateFilter("1D");
                setDateFrom(dates.from);
                setDateTo(dates.to);
                setSelectedCategory("");
                setSelectedCard("");
              }}
            >
              Today
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => {
                const dates = applyQuickDateFilter("7D");
                setDateFrom(dates.from);
                setDateTo(dates.to);
                setSelectedCategory("");
                setSelectedCard("");
              }}
            >
              This Week
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => {
                const dates = applyQuickDateFilter("30D");
                setDateFrom(dates.from);
                setDateTo(dates.to);
                setSelectedCategory("");
                setSelectedCard("");
              }}
            >
              This Month
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => {
                const dates = applyQuickDateFilter("90D");
                setDateFrom(dates.from);
                setDateTo(dates.to);
                setSelectedCategory("");
                setSelectedCard("");
              }}
            >
              Last 3 Months
            </Button>
          </div>

          {/* Spending Trends Chart */}
          <div className="w-full rounded-lg border bg-[#FDF9FA] text-card-foreground shadow-sm p-4 sm:p-6 mt-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-4">
              <div>
                <h2 className="text-lg font-semibold">Spending Trends</h2>
                <p className="text-sm text-muted-foreground">
                  {chartViewMode === "day" && "Daily"}
                  {chartViewMode === "week" && "Weekly"}
                  {chartViewMode === "month" && "Monthly"}
                  {" spending for the selected period"}
                </p>
              </div>
              <div className="flex items-center gap-1 bg-white/50 rounded-lg p-1 self-start sm:self-auto">
                <Button
                  variant={chartViewMode === "day" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setChartViewMode("day")}
                  className={chartViewMode === "day" ? "bg-white" : "hover:bg-white/50"}
                >
                  Day
                </Button>
                <Button
                  variant={chartViewMode === "week" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setChartViewMode("week")}
                  className={chartViewMode === "week" ? "bg-white" : "hover:bg-white/50"}
                >
                  Week
                </Button>
                <Button
                  variant={chartViewMode === "month" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setChartViewMode("month")}
                  className={chartViewMode === "month" ? "bg-white" : "hover:bg-white/50"}
                >
                  Month
                </Button>
              </div>
            </div>
            <SpendingTrendsChart
              transactions={filteredTransactions}
              filterPeriod={dateTo && dateFrom
                ? Math.abs(new Date(dateTo).getTime() - new Date(dateFrom).getTime()) / (1000 * 60 * 60 * 24) > 60
                  ? "month"
                  : Math.abs(new Date(dateTo).getTime() - new Date(dateFrom).getTime()) / (1000 * 60 * 60 * 24) > 14
                    ? "week"
                    : "day"
                : "day"}
              viewMode={chartViewMode}
              onFilterChange={(from, to) => {
                setDateFrom(from);
                setDateTo(to);
                setSelectedCategory("");
                setSelectedCard("");
              }}
            />
          </div>

          {/* Transaction List with Month Sections */}
          <div className="space-y-6 mt-8">
            {groupTransactionsByMonthAndDate(filteredTransactions).map(({ monthLabel, dayGroups }) => (
              <TransactionMonthSection
                key={monthLabel}
                monthLabel={monthLabel}
                dayGroups={dayGroups}
              />
            ))}
            {/* Empty State Message */}
            {filteredTransactions.length === 0 && !isLoading && ( // Added !isLoading check
              <div className="text-center py-8 text-muted-foreground">
                 {(searchQuery || selectedCard || selectedCategory || dateFrom || dateTo)
                   ? 'No transactions found matching your filters.'
                   : 'No transactions recorded yet.'
                 }
              </div>
            )}
          </div>


        </div>
      </div>

      {/* Add Transaction Dialog */}
      <AddTransactionDialog open={isAddTransactionOpen} onOpenChange={setIsAddTransactionOpen} />
    </div>
  );
}