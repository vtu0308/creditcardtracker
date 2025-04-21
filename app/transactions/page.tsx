"use client"

import { useState, useMemo } from "react";
import { useQuery } from '@tanstack/react-query';
import { Input } from "@/components/ui/input"; // Added Input import
import { Button } from "@/components/ui/button"; // Added Button import
import { PlusCircle } from "lucide-react"; // Added Icon import
import { AddTransactionDialog } from "@/components/add-transaction-dialog"; // Added Dialog import
import { storage, Transaction, Card, Category } from "@/lib/storage";
import { TransactionItem } from "@/components/transaction-item"; // Added TransactionItem import
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export default function TransactionsPage() {
  // --- State for UI controls ---
  const [searchQuery, setSearchQuery] = useState(''); // Added back
  const [selectedCard, setSelectedCard] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>(''); // Added back
  const [dateTo, setDateTo] = useState<string>(''); // Added back
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false); // Added back

  // --- Fetch Data using useQuery (MUST BE DEFINED BEFORE useMemo uses them) ---
  const {
    data: transactions = [], // <-- DEFINITION FOR 'transactions'
    isLoading: isLoadingTransactions,
    isError: isErrorTransactions,
    error: transactionsError,
  } = useQuery<Transaction[]>({
    queryKey: ['transactions'],
    queryFn: storage.getTransactions,
  });

  const {
    data: cards = [], // <-- DEFINITION FOR 'cards'
    isLoading: isLoadingCards,
    isError: isErrorCards,
    error: cardsError,
  } = useQuery<Card[]>({
    queryKey: ['cards'],
    queryFn: storage.getCards,
  });

  const {
    data: categories = [], // <-- DEFINITION FOR 'categories'
    isLoading: isLoadingCategories,
    isError: isErrorCategories,
    error: categoriesError,
  } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: storage.getCategories,
  });


  // --- Calculate Filtered Transactions using useMemo ---
  const filteredTransactions = useMemo(() => {
    console.log("[TransactionsPage] Filtering transactions...");
    // Now 'transactions' exists because it's defined above by useQuery
    return transactions.filter(transaction => {
      // Card Filter
      if (selectedCard && transaction.cardId !== selectedCard) {
        return false;
      }
      // Category Filter
      if (selectedCategory && transaction.categoryId !== selectedCategory) {
        return false;
      }
      // Date From Filter
      if (dateFrom) {
          try {
              if (new Date(transaction.date) < new Date(dateFrom)) return false;
          } catch { return false; }
      }
      // Date To Filter
       if (dateTo) {
           try {
               const dateToObj = new Date(dateTo);
               dateToObj.setHours(23, 59, 59, 999);
               if (new Date(transaction.date) > dateToObj) return false;
           } catch { return false; }
       }
      // Search Query Filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const descMatch = transaction.description.toLowerCase().includes(searchLower);
        const cardMatch = (transaction.cardName || '').toLowerCase().includes(searchLower);
        const catMatch = (transaction.categoryName || '').toLowerCase().includes(searchLower);
        if (!descMatch && !cardMatch && !catMatch) {
          return false;
        }
      }
      return true;
    });
  }, [transactions, searchQuery, selectedCard, selectedCategory, dateFrom, dateTo]); // Dependencies are correct


  // --- Combined Loading/Error State ---
  const isLoading = isLoadingTransactions || isLoadingCards || isLoadingCategories;
  const isError = isErrorTransactions || isErrorCards || isErrorCategories;
  const error = transactionsError || cardsError || categoriesError;

  // --- Render Loading State ---
  if (isLoading) {
     return (
        <div className="container py-6 space-y-6">
           {/* Header Skeleton */}
           <div className="flex items-center justify-between">
              <div> <Skeleton className="h-8 w-40 mb-2" /> <Skeleton className="h-4 w-64" /> </div>
           </div>
           {/* Content Card Skeleton */}
           <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-4">
              <div className="flex justify-between items-center mb-4"> <Skeleton className="h-8 w-48" /> <Skeleton className="h-10 w-40" /> </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 items-end"> <Skeleton className="h-16 w-full" /> <Skeleton className="h-16 w-full" /> <Skeleton className="h-16 w-full" /> <Skeleton className="h-16 w-full" /> </div>
              <Skeleton className="h-10 w-full max-w-md mb-6" />
              <div className="space-y-4"> <Skeleton className="h-16 w-full rounded-lg" /> <Skeleton className="h-16 w-full rounded-lg" /> <Skeleton className="h-16 w-full rounded-lg" /> </div>
           </div>
        </div>
     );
  }

  // --- Render Error State ---
  if (isError) {
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
             <Button onClick={() => setIsAddTransactionOpen(true)}>
               <PlusCircle className="mr-2 h-4 w-4" />
               Add Transaction
             </Button>
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

          {/* Search Input */}
          <div className="mb-6">
             <Label htmlFor="filter-search" className="sr-only">Search Transactions</Label>
             <Input id="filter-search" placeholder="Search descriptions, cards, categories..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="max-w-md" />
          </div>

          {/* Transaction List */}
          <div className="space-y-4">
            {filteredTransactions.map(transaction => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))}
            {/* Empty State Message */}
            {filteredTransactions.length === 0 && (
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