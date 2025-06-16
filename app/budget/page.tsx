"use client";

import { useState, useEffect, useCallback, ReactNode } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Target, Clock, Info, LucideIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import { storage } from '@/lib/storage';
import { useBudget } from '@/lib/hooks/useBudget';
import type { Budget } from '@/lib/types/budget';
// import { formatCurrency } from '@/lib/currency'; // Not used in the second block
import { BudgetStatus } from '@/components/budget-status'; // Assuming this is a separate, complex component

// --- Helper Types ---
interface CardData {
  id: string;
  name: string;
  // Add other card properties if needed by your app
}

// --- Sub-Components ---

interface SectionCardHeaderProps {
  icon: LucideIcon;
  title: string;
  description?: string;
}

const SectionCardHeader = ({ icon: Icon, title, description }: SectionCardHeaderProps) => (
  <CardHeader className="pb-2 pt-6 px-6 md:pt-4 md:px-4 lg:pt-6 lg:px-6"> {/* Adjusted padding for responsiveness */}
    <div className="flex items-center space-x-3 mb-1">
      <div className="rounded-full bg-[#F3E2E7] p-2">
        <Icon className="h-5 w-5 text-[#C58B9F]" />
      </div>
      <div>
        <CardTitle className="text-xl font-semibold leading-tight">{title}</CardTitle>
        {description && <p className="text-base text-[#7B7680] font-normal mt-0.5">{description}</p>}
      </div>
    </div>
    <div className="h-px bg-[#F3E2E7]/70 w-full mt-3" />
  </CardHeader>
);

interface BudgetSettingsFormProps {
  budget: Budget;
  onBudgetChange: (field: keyof Budget, value: any) => void;
  onSave: () => void;
  saving: boolean;
  cards: CardData[] | undefined;
  isLoadingCards: boolean;
  cardsError: Error | null;
}

const BudgetSettingsForm = ({
  budget,
  onBudgetChange,
  onSave,
  saving,
  cards,
  isLoadingCards,
  cardsError,
}: BudgetSettingsFormProps) => {
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cleanValue = value.replace(/^0+/, '').replace(/[^0-9]/g, ''); // Ensure only numbers
    onBudgetChange('monthlyAmount', cleanValue ? Number(cleanValue) : 0);
  };

  const handleStatementCardChange = (value: string) => {
    onBudgetChange('statementCardId', value);
    // Consider if auto-save is desired here or if it should rely on the main save button
  };

  return (
    <Card className="bg-[#F7EDEF]">
      <SectionCardHeader icon={Clock} title="Budget Settings" />
      <CardContent className="space-y-4 pt-4 px-6 pb-6 md:px-4 lg:px-6">
        <div className="space-y-2">
          <label htmlFor="monthlyBudgetAmount" className="text-sm font-medium">
            Monthly Budget Amount
          </label>
          <div className="flex space-x-2">
            <Input
              id="monthlyBudgetAmount"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={budget.monthlyAmount || ''}
              onChange={handleAmountChange}
              placeholder="5000"
              className="rounded-full border-[#C58B9F]/25 focus-visible:ring-[#C58B9F]/50"
            />
            <Button
              onClick={onSave}
              className="rounded-full bg-[#C58B9F] hover:bg-[#C58B9F]/90 text-white font-medium px-6"
              disabled={saving || budget.monthlyAmount <= 0}
            >
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="statementCard" className="text-sm font-medium">
            Statement Cycle
          </label>
          <Select
            value={budget.statementCardId}
            onValueChange={handleStatementCardChange}
          >
            <SelectTrigger id="statementCard" className="border-[#C58B9F]/25 focus-visible:ring-[#C58B9F]/50">
              <SelectValue placeholder="Select a card" />
            </SelectTrigger>
            <SelectContent>
              {isLoadingCards && <SelectItem disabled value="loading">Loading cards...</SelectItem>}
              {cardsError && <SelectItem disabled value="error">Error loading cards.</SelectItem>}
              {!isLoadingCards && !cardsError && cards && cards.length === 0 && (
                <SelectItem disabled value="no-cards">No cards available.</SelectItem>
              )}
              {!isLoadingCards && !cardsError && cards?.map(card => (
                <SelectItem key={card.id} value={card.id}>
                  {card.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Budget will reset according to the selected card's statement cycle.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

const BudgetTips = () => (
  <Card className="bg-[#F7EDEF]">
    <SectionCardHeader icon={Info} title="Budget Tips" />
    <CardContent className="space-y-4 pt-4 px-6 pb-6 md:px-4 lg:px-6">
      <ul className="space-y-4 text-sm">
        {[
          "Set realistic budget goals based on your spending history",
          "Review your budget regularly and adjust as needed",
          "Focus on reducing spending in your highest expense categories",
        ].map(tip => (
          <li key={tip} className="flex items-start space-x-2">
            <span className="w-1 h-1 mt-1.5 rounded-full bg-rose-500 flex-shrink-0" />
            <span>{tip}</span>
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
);

interface DisabledBudgetViewProps {
  onEnable: () => void;
  saving: boolean;
}

const DisabledBudgetView = ({ onEnable, saving }: DisabledBudgetViewProps) => (
  <Card className="py-16">
    <CardContent className="flex flex-col items-center justify-center space-y-4">
      <div className="rounded-full bg-[#F3E2E7] p-3">
        <Target className="w-6 h-6 text-[#C58B9F]" />
      </div>
      <h2 className="text-xl font-semibold">Budget Tracking Disabled</h2>
      <p className="text-sm text-muted-foreground text-center max-w-md">
        Enable budget tracking to set spending limits and monitor
        your financial goals throughout each statement cycle.
      </p>
      <Button
        variant="secondary"
        onClick={onEnable}
        disabled={saving}
        className="bg-[#C58B9F] hover:bg-[#C58B9F]/90 text-white"
      >
        {saving ? 'Enabling...' : 'Enable Budget Tracking'}
      </Button>
    </CardContent>
  </Card>
);

// --- Main Page Component ---
export default function BudgetPage() {
  const { budget: persistedBudget, saveBudget: persistBudgetToBackend, saving } = useBudget();
  const [budget, setBudgetState] = useState<Budget>({
    enabled: false,
    monthlyAmount: 0,
    statementCardId: '',
    lastUpdated: new Date().toISOString(), // Initialize with current time
  });

  const { data: cards, isLoading: isLoadingCards, error: cardsError } = useQuery<CardData[], Error>({
    queryKey: ['cards'],
    queryFn: () => storage.getCards(), // Assuming storage.getCards returns Promise<CardData[]>
  });

  useEffect(() => {
    if (persistedBudget) {
      setBudgetState(persistedBudget);
    }
  }, [persistedBudget]);

  const updateBudgetField = useCallback((field: keyof Budget, value: any) => {
    setBudgetState(prev => ({
      ...prev,
      [field]: value,
      lastUpdated: new Date().toISOString(), // Update timestamp on any field change
    }));
  }, []);

  // Unified save function
  const handleSave = useCallback(() => {
    // Prepare the budget object with a fresh timestamp for saving
    const budgetToSave = {
      ...budget,
      lastUpdated: new Date().toISOString(),
    };
    // Update local state immediately (optional, if persistBudgetToBackend doesn't return the saved object)
    // setBudgetState(budgetToSave);
    persistBudgetToBackend(budgetToSave);
  }, [budget, persistBudgetToBackend]);


  const handleToggleBudget = useCallback((enabled: boolean) => {
    const newBudget = {
      ...budget,
      enabled,
      lastUpdated: new Date().toISOString(),
    };
    setBudgetState(newBudget);
    persistBudgetToBackend(newBudget);
  }, [budget, persistBudgetToBackend]);

  // Specific handler for statement card change to auto-save
  const handleStatementCardChangeAndSave = useCallback((cardId: string) => {
    const newBudget = {
      ...budget,
      statementCardId: cardId,
      lastUpdated: new Date().toISOString(),
    };
    setBudgetState(newBudget);
    persistBudgetToBackend(newBudget);
  }, [budget, persistBudgetToBackend]);


  return (
    <div className="px-4 py-6 space-y-6 md:container">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Budget Management</h1>
        <p className="text-sm text-muted-foreground">Set and track your monthly spending budget</p>
      </div>

      <Card className="bg-[#F7EDEF] rounded-xl shadow-sm mb-8 flex flex-row items-center px-6 py-4 justify-between">
        <div className="flex items-start space-x-4">
          <div className="rounded-full bg-[#F3E2E7] p-3 mt-0.5">
            <Target className="w-6 h-6 text-[#C58B9F]" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold leading-tight">Budget Tracking</h2>
            <p className="text-sm text-[#7B7680] mt-0.5">
              Budget tracking is {budget.enabled ? 'active' : 'disabled'}
              {budget.enabled && budget.lastUpdated && (
                <span className="ml-2 text-xs text-muted-foreground/70">
                  (Last updated: {new Date(budget.lastUpdated).toLocaleDateString()})
                </span>
              )}
            </p>
          </div>
        </div>
        <Switch
          checked={budget.enabled}
          onCheckedChange={handleToggleBudget}
          disabled={saving}
          className="data-[state=checked]:bg-[#C58B9F]"
        />
      </Card>

      {budget.enabled ? (
        <div className="grid gap-6 md:grid-cols-[0.8fr,2fr] md:gap-8">
          <div className="space-y-4 md:space-y-6">
            <BudgetSettingsForm
              budget={budget}
              // Pass a combined handler for budget changes if preferred,
              // or individual handlers like onAmountChange, onStatementCardChange
              onBudgetChange={(field, value) => {
                if (field === 'statementCardId') {
                  handleStatementCardChangeAndSave(value);
                } else {
                  updateBudgetField(field, value);
                }
              }}
              onSave={handleSave}
              saving={saving}
              cards={cards}
              isLoadingCards={isLoadingCards}
              cardsError={cardsError}
            />
            <BudgetTips />
          </div>
          <BudgetStatus />
        </div>
      ) : (
        <DisabledBudgetView onEnable={() => handleToggleBudget(true)} saving={saving} />
      )}
    </div>
  );
}