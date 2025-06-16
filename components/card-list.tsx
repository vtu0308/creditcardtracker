"use client"

import { useState } from "react"
import { useQuery } from '@tanstack/react-query'
import { storage, Card } from "@/lib/storage"
import { AddCardDialog } from "@/components/add-card-dialog"
import { CardItem } from "@/components/card-item"
import { Button } from "@/components/ui/button"
import { AddCardButton } from "@/components/add-card-button"
import { PlusCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { TimeFilter, TimeFilterPeriod } from "@/components/time-filter"
import { isTransactionInPeriod } from "@/lib/date-utils"

export function CardList() {
  const [isAddCardOpen, setIsAddCardOpen] = useState(false)
  const [timePeriod, setTimePeriod] = useState<TimeFilterPeriod>("all")

  // Fetch Cards and Transactions
  const {
    data: cards = [],
    isLoading,
    isError,
  } = useQuery<Card[]>({
    queryKey: ['cards'],
    queryFn: storage.getCards,
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: storage.getTransactions,
  });

  // REMOVED: The useEffect hook that manually fetched cards and added the event listener

  // --- Render Loading State ---
  const renderLoadingState = () => (
    <div className="space-y-4">
      {/* Skeleton for the header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-28" />
      </div>
      {/* Skeleton placeholders for CardItems */}
      <div className="grid gap-4">
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    </div>
  );

  // --- Render Error State ---
  const renderErrorState = () => (
     <div className="space-y-4">
        <div className="flex items-center justify-between">
           <h2 className="text-2xl font-bold tracking-tight text-red-600">Error Loading Cards</h2>
           {/* Still allow adding a card even if list fails to load */}
           <Button onClick={() => setIsAddCardOpen(true)}>
              <span className="font-bold text-sm">Add Card</span>
           </Button>
        </div>
        <p className="text-red-500">Could not fetch your card list. Please try again later.</p>
        {/* Optionally display error details from the 'error' object */}
     </div>
  );

 // --- Render Empty State ---
 const renderEmptyState = () => (
    <div className="space-y-4">
       <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Your Cards</h2>
          <Button onClick={() => setIsAddCardOpen(true)}>
             <span className="font-bold text-sm">Add Card</span>
          </Button>
       </div>
       <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <h3 className="text-lg font-semibold">No cards found</h3>
            <p className="text-sm text-muted-foreground">Get started by adding your first credit card.</p>
       </div>
    </div>
 );


  // --- Main Render Logic ---
  if (isLoading) {
    return renderLoadingState();
  }

  if (isError) {
    return renderErrorState();
  }

  if (cards.length === 0) {
     return (
         <>
            {renderEmptyState()}
             {/* Ensure dialog can still open */}
            <AddCardDialog open={isAddCardOpen} onOpenChange={setIsAddCardOpen} />
         </>
     );
  }

  // --- Render Card List (Data Loaded Successfully) ---
  // Filter transactions by time period for each card
  const getCardTransactions = (cardId: string) => {
    return transactions.filter(tx => 
      tx.cardId === cardId && isTransactionInPeriod(tx.date, timePeriod)
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Your Cards</h2>
        <TimeFilter
          selected={timePeriod}
          onChange={setTimePeriod}
        />
      </div>
      <div className="grid gap-4">
        {cards.map((card) => (
          <CardItem 
            key={card.id} 
            card={card}
            transactions={getCardTransactions(card.id)}
          />
        ))}
      </div>
      <AddCardDialog open={isAddCardOpen} onOpenChange={setIsAddCardOpen} />
    </div>
  )
}