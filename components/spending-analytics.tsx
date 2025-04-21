"use client"

import { useState, useMemo, useEffect } from "react"; // Added useMemo
import { useQuery } from '@tanstack/react-query';      // Added useQuery
import { Card as UICard, CardContent, CardHeader, CardTitle } from "./ui/card"; // Rename Card component import
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { storage, Card, Transaction } from "@/lib/storage"; // Import types Card and Transaction
import { formatCurrency } from "@/lib/currency";
import { Label } from "./ui/label";

interface SpendingAnalyticsProps {
  className?: string;
}

// Enhanced CycleDate interface to include a stable value for Select
interface CycleDate {
  start: Date;
  end: Date;
  label: string;
  value: string; // JSON string representation for stable Select value
}

// Helper function to generate cycles (can be kept outside or inside component)
const generateCycles = (statementDay: number): CycleDate[] => {
    const cycles: CycleDate[] = [];
    const today = new Date();

    // --- Current Cycle Calculation ---
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const lastStatementDayInMonth = new Date(currentYear, currentMonth, statementDay);

    let currentCycleStart: Date;
    let currentCycleEnd: Date;

    if (currentDate.getDate() > statementDay) {
      // Past statement day: Cycle is this month's statement day + 1 to next month's statement day
      currentCycleStart = new Date(currentYear, currentMonth, statementDay + 1);
      currentCycleEnd = new Date(currentYear, currentMonth + 1, statementDay);
    } else {
      // Before statement day: Cycle is last month's statement day + 1 to this month's statement day
      currentCycleStart = new Date(currentYear, currentMonth - 1, statementDay + 1);
      currentCycleEnd = new Date(currentYear, currentMonth, statementDay);
    }
    currentCycleStart.setHours(0, 0, 0, 0);
    currentCycleEnd.setHours(23, 59, 59, 999);

    const currentLabel = `Current Cycle: ${currentCycleStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${currentCycleEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    const currentValue = JSON.stringify({ start: currentCycleStart.toISOString(), end: currentCycleEnd.toISOString() });
    cycles.push({ start: currentCycleStart, end: currentCycleEnd, label: currentLabel, value: currentValue });

    // --- Past Cycles Calculation ---
    for (let i = 1; i <= 24; i++) { // Start from i=1 to avoid duplicating current cycle logic
      // Calculate end date relative to the *current cycle's end date* for simplicity
      const cycleEnd = new Date(currentCycleEnd);
      cycleEnd.setMonth(cycleEnd.getMonth() - i); // Go back i months

      // Calculate start date relative to this past cycle's end date
      const cycleStart = new Date(cycleEnd);
      cycleStart.setMonth(cycleEnd.getMonth() - 1); // Go back one more month
      cycleStart.setDate(statementDay + 1);      // Start day is statement day + 1

      cycleStart.setHours(0, 0, 0, 0);
      cycleEnd.setHours(23, 59, 59, 999);

      const label = `${cycleStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${cycleEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      const value = JSON.stringify({ start: cycleStart.toISOString(), end: cycleEnd.toISOString() });
      cycles.push({ start: cycleStart, end: cycleEnd, label: label, value: value });
    }

    return cycles;
};


export function SpendingAnalytics({ className }: SpendingAnalyticsProps) {
  // --- State for UI selections ---
  const [selectedCard, setSelectedCard] = useState<string>("all");
  const [selectedCycleValue, setSelectedCycleValue] = useState<string>(""); // Store the stringified value

  // --- Fetch Cards using useQuery ---
  const {
    data: cards = [], // Default to empty array
    isLoading: isLoadingCards,
    isError: isErrorCards, // Handle potential error fetching cards
  } = useQuery<Card[]>({
    queryKey: ['cards'],
    queryFn: storage.getCards,
  });

  // --- Fetch Transactions using useQuery ---
  const {
    data: transactions = [], // Default to empty array
    isLoading: isLoadingTransactions,
    isError: isErrorTransactions, // Handle potential error fetching transactions
  } = useQuery<Transaction[]>({
    queryKey: ['transactions'],
    queryFn: storage.getTransactions,
  });

  // --- Calculate Cycles based on fetched cards and selection ---
  const cycles = useMemo<CycleDate[]>(() => {
    console.log("[SpendingAnalytics] Recalculating cycles...");
    // Don't generate cycles until cards are loaded and valid
    if (isLoadingCards || !cards || cards.length === 0) {
        return [];
    }

    let statementDay: number | undefined;
    if (selectedCard === "all") {
      // Use the statement day of the *first* card as a default for "All"
      statementDay = cards[0]?.statementDay;
    } else {
      const cardData = cards.find(card => card.id === selectedCard);
      statementDay = cardData?.statementDay;
    }

    // Only generate if we found a valid statement day
    if (typeof statementDay === 'number' && statementDay >= 1 && statementDay <= 31) {
      return generateCycles(statementDay);
    } else {
       console.warn("Could not determine a valid statement day for cycle generation.");
       return []; // Return empty if no valid day found
    }
  }, [cards, selectedCard, isLoadingCards]); // Depend on fetched cards and selection


  // --- Effect to set the default selected cycle *after* cycles are calculated ---
  useEffect(() => {
    // Only run if cycles have been calculated and no cycle is currently selected
    if (cycles.length > 0 && !selectedCycleValue) {
      console.log("[SpendingAnalytics] Setting default cycle:", cycles[0].value);
      setSelectedCycleValue(cycles[0].value);
    }
    // If the selected value is no longer in the list (e.g., card changed), reset to default
    else if (cycles.length > 0 && selectedCycleValue && !cycles.some(c => c.value === selectedCycleValue)) {
        console.log("[SpendingAnalytics] Resetting cycle value as selected one is missing:", cycles[0].value);
        setSelectedCycleValue(cycles[0].value);
    }
    // If no cycles are available (e.g., no cards), clear selection
    else if (cycles.length === 0 && selectedCycleValue) {
        setSelectedCycleValue("");
    }
  }, [cycles, selectedCycleValue]); // Depend on the calculated cycles array


  // --- Calculate Total Spending based on fetched transactions and selections ---
  const totalSpending = useMemo<number>(() => {
    console.log("[SpendingAnalytics] Recalculating total spending...");
    // Require transactions and a selected cycle to calculate
    if (isLoadingTransactions || !transactions || transactions.length === 0 || !selectedCycleValue) {
        return 0;
    }

    try {
      // Parse the selected cycle value (which is a JSON string)
      const cycleData = JSON.parse(selectedCycleValue);
      if (!cycleData.start || !cycleData.end) return 0; // Basic validation

      const startDate = new Date(cycleData.start);
      const endDate = new Date(cycleData.end);

      // Add date validation
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          console.error("Invalid date parsed from selected cycle value");
          return 0;
      }

      // Note: Setting hours might not be needed if comparison handles dates correctly,
      // but setting explicitly can prevent timezone issues if dates have time parts.
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      const filteredTransactions = transactions.filter(transaction => {
        let transactionDate: Date;
        try {
            transactionDate = new Date(transaction.date);
             if (isNaN(transactionDate.getTime())) return false; // Skip invalid dates
        } catch {
            return false; // Skip if date parsing throws error
        }

        const isInDateRange = transactionDate >= startDate && transactionDate <= endDate;
        const matchesCard = selectedCard === "all" || transaction.cardId === selectedCard;
        return isInDateRange && matchesCard;
      });

      const total = filteredTransactions.reduce((sum, t) => {
        const amount = typeof t.vndAmount === 'number' && !isNaN(t.vndAmount) ? t.vndAmount : 0;
        return sum + amount;
      }, 0);

      return total;

    } catch (error) {
      console.error('Error parsing cycle value or calculating total spending:', error);
      return 0; // Return 0 on error
    }
  }, [transactions, selectedCard, selectedCycleValue, isLoadingTransactions]); // Depend on transactions and selections

  // --- Loading State UI ---
  if (isLoadingCards || isLoadingTransactions) {
     return (
        <UICard className={className}>
          <CardHeader><CardTitle>Statement Cycle Deep Dive</CardTitle></CardHeader>
          <CardContent><p className="text-muted-foreground">Loading analytics data...</p></CardContent>
        </UICard>
     );
  }

  // --- Error State UI ---
  if (isErrorCards || isErrorTransactions) {
    return (
       <UICard className={className}>
         <CardHeader><CardTitle>Error</CardTitle></CardHeader>
         <CardContent><p className="text-red-600">Could not load data for analytics.</p></CardContent>
       </UICard>
    );
  }

  // --- Render Component UI ---
  return (
    <UICard className={className}>
      <CardHeader>
        <CardTitle>Statement Cycle Deep Dive</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {/* Card Filter Select */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="card-filter-sa">Filter by Card</Label>
            <Select
                value={selectedCard}
                onValueChange={setSelectedCard}
                // Disable if no cards loaded
                disabled={cards.length === 0}
            >
              <SelectTrigger id="card-filter-sa">
                <SelectValue placeholder={cards.length === 0 ? "No cards available" : "Select a card"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cards</SelectItem>
                {cards.map(card => (
                  <SelectItem key={card.id} value={card.id}>
                    {card.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Statement Cycle Select */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="cycle-filter-sa">Filter by Statement Cycle</Label>
            <Select
                value={selectedCycleValue}
                onValueChange={setSelectedCycleValue}
                // Disable if no cycles generated (e.g., no cards)
                disabled={cycles.length === 0}
            >
              <SelectTrigger id="cycle-filter-sa">
                <SelectValue placeholder={cycles.length === 0 ? "No cycles available" : "Select a cycle"} />
              </SelectTrigger>
              <SelectContent>
                {/* Show disabled item if no cycles */}
                {cycles.length === 0 && <SelectItem value="-" disabled>No cycles generated</SelectItem>}
                {/* Map over calculated cycles */}
                {cycles.map((cycle) => (
                  <SelectItem
                    key={cycle.value} // Use stable string value as key
                    value={cycle.value}
                    className={cycle.label.startsWith('Current Cycle') ? 'font-medium text-pink-600' : ''}
                  >
                    {cycle.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Spending Display Area */}
          <div className="mt-4 space-y-4">
            <div className="text-sm text-muted-foreground">
              {/* Display selected range description only if a cycle is selected */}
              {selectedCycleValue && cards.length > 0 && (
                <p>
                  Showing transactions for{' '}
                  <strong>{selectedCard === 'all' ? 'all cards' : cards.find(c => c.id === selectedCard)?.name ?? 'selected card'}</strong>{' '}
                  from{' '}
                  <strong>{new Date(JSON.parse(selectedCycleValue).start).toLocaleDateString()}</strong> to{' '}
                  <strong>{new Date(JSON.parse(selectedCycleValue).end).toLocaleDateString()}</strong>
                </p>
              )}
              {!selectedCycleValue && cards.length > 0 && (
                   <p>Please select a statement cycle to view spending.</p>
              )}
               {cards.length === 0 && (
                    <p>Add a card to generate statement cycles.</p>
               )}
            </div>
            <div>
              <h3 className="text-lg font-semibold">Total Spending for Cycle</h3>
              <p className="text-3xl font-bold text-pink-400">
                {/* Format the calculated total spending */}
                {formatCurrency(totalSpending, "VND")}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </UICard>
  )
}