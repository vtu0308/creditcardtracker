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

// --- Utility: Group transactions by date and label (Today, Yesterday, Date) ---
// (Keep your existing groupTransactionsByDate function here)
function groupTransactionsByDate(transactions: Transaction[], now: Date) {
  const formatLocalYMD = (date: Date) => {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  };
  const formatHeader = (date: Date) => date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

  const todayYMD = formatLocalYMD(now);
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayYMD = formatLocalYMD(yesterday);

  const groups: Record<string, Transaction[]> = {};
  transactions.forEach(tx => {
    const txDate = new Date(tx.date);
    const txYMD = formatLocalYMD(txDate);
    if (!groups[txYMD]) groups[txYMD] = [];
    groups[txYMD].push(tx);
  });

  const sortedKeys = Object.keys(groups).sort((a, b) => b.localeCompare(a));

  return sortedKeys.map(dateYMD => {
    let label = formatHeader(new Date(dateYMD + 'T00:00:00')); // Ensure correct date parsing for header
    if (dateYMD === todayYMD) label = 'Today';
    else if (dateYMD === yesterdayYMD) label = 'Yesterday';
    return { label, transactions: groups[dateYMD] };
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


function TransactionsContent() {
  // --- State for UI controls ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCard, setSelectedCard] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);

  // --- Read filters from URL query params ---
  const searchParams = useSearchParams();

  // Sync category and period from URL params (Keep your existing useEffect)
  useEffect(() => {
    const urlCategory = searchParams.get('category') || '';
    const urlPeriod = searchParams.get('period') || '';
    setSelectedCategory(urlCategory);
    if (urlPeriod === '7D') {
      const today = new Date();
      const from = new Date();
      from.setDate(today.getDate() - 6);
      setDateFrom(from.toISOString().slice(0, 10));
      setDateTo(today.toISOString().slice(0, 10));
    } else if (urlPeriod === '30D') {
      const today = new Date();
      const from = new Date();
      from.setDate(today.getDate() - 29);
      setDateFrom(from.toISOString().slice(0, 10));
      setDateTo(today.toISOString().slice(0, 10));
    } else if (urlPeriod === '90D') {
      const today = new Date();
      const from = new Date();
      from.setDate(today.getDate() - 89);
      setDateFrom(from.toISOString().slice(0, 10));
      setDateTo(today.toISOString().slice(0, 10));
    } else {
       // Keep existing dates if no period is specified or period is invalid?
       // Or clear them like before? Clearing seems reasonable if period controls dates.
       // setDateFrom('');
       // setDateTo('');
       // Decide based on desired UX when URL period changes/is removed
    }
  }, [searchParams]); // Removed date setters from dependency array as they cause loops

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
        <div className="container py-6 space-y-6">
           <div className="flex items-center justify-between">
              <div> <Skeleton className="h-8 w-40 mb-2" /> <Skeleton className="h-4 w-64" /> </div>
           </div>
           <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-4">
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
          <div className="container py-6 space-y-6">
             <div className="flex items-center justify-between">
                <div> <h1 className="text-2xl font-bold tracking-tight text-red-600">Error Loading Data</h1> <p className="text-muted-foreground"> Could not load page data. Please try again later. </p> {error && <p className="text-sm text-red-500 mt-2">Details: {error.message}</p>} </div>
             </div>
          </div>
       );
  }

  // --- Render Main Content ---
  return (
    <div className="container py-6 space-y-6">
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
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
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

          {/* Transaction List with Date Headers */}
          <div className="space-y-4">
            {groupTransactionsByDate(filteredTransactions, new Date()).map(({ label, transactions }) => (
              <div key={label}>
                {/* Date Header - MODIFIED */}
                <div className="rounded-md bg-muted px-4 py-2 text-sm font-semibold text-muted-foreground mb-2"> {/* <-- CHANGED STYLING HERE */}
                  {label}
                </div>
                <div className="space-y-4">
                  {transactions.map(transaction => (
                    <TransactionItem key={transaction.id} transaction={transaction} />
                  ))}
                </div>
              </div>
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