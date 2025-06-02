"use client"

import { useState } from "react";
import { useQuery } from '@tanstack/react-query';
import { storage, Card } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { AddCardButton } from "@/components/add-card-button";
import { PlusCircle } from "lucide-react";
import { AddCardDialog } from "@/components/add-card-dialog";
import { CardItem } from "@/components/card-item";
import { Skeleton } from "@/components/ui/skeleton";
import { TimeFilter, TimeFilterPeriod } from "@/components/time-filter";
import { isTransactionInPeriod } from "@/lib/date-utils";

import { ProtectedRoute } from "@/components/auth/protected-route";

export default function CardsPage() {
  return (
    <ProtectedRoute>
      <CardsContent />
    </ProtectedRoute>
  );
}

function CardsContent() {
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [timePeriod, setTimePeriod] = useState<TimeFilterPeriod>("all");

  const {
    data: cards = [],
    isLoading,
    isError,
    error,
  } = useQuery<Card[]>({
    queryKey: ['cards'],
    queryFn: storage.getCards,
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: storage.getTransactions,
  });

  // --- Render Loading State ---
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-9 w-24 mb-2" /> {/* Approx size of "Cards" */}
            <Skeleton className="h-5 w-64" /> {/* Approx size of description */}
          </div>
          <Skeleton className="h-10 w-28" /> {/* Approx size of "Add Card" button */}
        </div>
        {/* Card Grid Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-32 w-full rounded-lg" /> {/* Adjust height as needed */}
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  // --- Render Error State ---
  if (isError) {
    return (
       <div className="space-y-6">
          <div className="flex items-center justify-between">
             <div>
                <h1 className="text-3xl font-bold tracking-tight text-red-600">Error Loading Cards</h1>
                <p className="text-muted-foreground"> Could not fetch your card list. Please try again later. </p>
                {error instanceof Error && <p className="text-sm text-red-500 mt-2">Details: {error.message}</p>}
             </div>
             {/* Still allow adding a card even if list fails */}
             <Button onClick={() => setIsAddCardOpen(true)}>
               <PlusCircle className="mr-2 h-4 w-4" />
               Add Card
             </Button>
          </div>
           <AddCardDialog open={isAddCardOpen} onOpenChange={setIsAddCardOpen} />
       </div>
    );
 }

  // --- Render Main Content (including Empty State) ---
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cards</h1>
          <p className="text-muted-foreground">
            View and manage your credit cards
          </p>
        </div>
        <div className="flex items-center gap-4">
          <TimeFilter
            selected={timePeriod}
            onChange={setTimePeriod}
          />
          <AddCardButton onClick={() => setIsAddCardOpen(true)} />
        </div>
      </div>

      {/* Card Grid or Empty State */}
      {cards.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Map over the 'cards' data fetched by useQuery */}
          {cards.map((card) => {
            const cardTransactions = transactions.filter(tx => 
              tx.cardId === card.id && isTransactionInPeriod(tx.date, timePeriod)
            );
            return (
              <CardItem
                key={card.id}
                card={card}
                transactions={cardTransactions}
              />
            );
          })}
        </div>
      ) : (
        // Empty State
         <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center h-48">
            <h3 className="text-lg font-semibold">No cards added yet</h3>
            <p className="text-sm text-muted-foreground">Click "Add Card" to get started.</p>
         </div>
      )}


      {/* Add Card Dialog - controlled by local state */}
      <AddCardDialog open={isAddCardOpen} onOpenChange={setIsAddCardOpen} />
    </div>
  )
}