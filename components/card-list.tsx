"use client"

import { useState } from "react" // Removed useEffect
import { useQuery } from '@tanstack/react-query' // Import useQuery
import { storage, Card } from "@/lib/storage" // Import Card type
import { AddCardDialog } from "@/components/add-card-dialog"
import { CardItem } from "@/components/card-item"
import { Button } from "@/components/ui/button"
import { AddCardButton } from "@/components/add-card-button"
import { PlusCircle } from "lucide-react"
// Optional: Import components for loading/error states
import { Skeleton } from "@/components/ui/skeleton" // Example skeleton

export function CardList() {
  // State for controlling the <span className="font-bold text-sm">Add Card</span> dialog visibility
  const [isAddCardOpen, setIsAddCardOpen] = useState(false)

  // --- Fetch Cards using useQuery ---
  const {
    data: cards = [], // Default to empty array while loading/if no data
    isLoading,        // Loading state flag
    isError,          // Error state flag
    // error           // Optional: Access the error object for details
  } = useQuery<Card[]>({ // Specify the expected return type
    queryKey: ['cards'], // The unique key for caching card data
    queryFn: storage.getCards, // The async function to fetch cards
    // staleTime: 1000 * 60 * 5 // Optional: Keep data fresh for 5 mins
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
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Your Cards</h2>
        <AddCardButton onClick={() => setIsAddCardOpen(true)} />
      </div>
      <div className="grid gap-4">
        {/* Map over the 'cards' data fetched by useQuery */}
        {cards.map((card) => (
          <CardItem key={card.id} card={card} />
        ))}
      </div>
      {/* <span className="font-bold text-sm">Add Card</span> Dialog - controlled by local state */}
      <AddCardDialog open={isAddCardOpen} onOpenChange={setIsAddCardOpen} />
    </div>
  )
}