import { Card } from "@/components/ui/card";
import { Transaction } from "@/lib/storage";
import { TrendingUp, CreditCard, ChevronDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";

interface TopCategory {
  category: string;
  amount: number;
  count: number;
  percentage: number;
}

interface TopSpendingCategoryProps {
  category: string;
  amount: number;
  count: number;
  percentage: number;
  index: number;
  onClick: () => void;
}

function TopSpendingCategory({ category, amount, count, percentage, index, onClick }: TopSpendingCategoryProps) {
  return (
    <button
      onClick={onClick}
      className="relative w-full bg-[#F9F2F4] hover:bg-[#F5E8EB] transition-colors rounded-2xl sm:rounded-3xl p-4 flex flex-col gap-2 group cursor-pointer shadow-sm text-left"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-[#78A0A0]" />
          <span className="text-[#5D5053] text-sm sm:text-base font-medium sm:font-semibold">{category}</span>
        </div>
        <span className="text-[#5D5053] text-xs bg-[#F1DDE3] px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">#{index}</span>
      </div>
      <div className="text-[#3D7A7A] text-lg sm:text-2xl font-bold">
        {formatCurrency(amount)}
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-[#5D5053] text-xs sm:text-sm">
        <span>
          {count} transaction{count !== 1 ? 's' : ''}
        </span>
        <span className="mt-0.5 sm:mt-0">
          {percentage.toFixed(1)}%
        </span>
      </div>
    </button>
  );
}

interface TransactionSummaryProps {
  transactions: Transaction[];
  dateRange: {
    from: Date;
    to: Date;
  };
  onCategoryClick: (category: string) => void;
}

function getActivityLevel(transactionsPerWeek: number): string {
  if (transactionsPerWeek > 12) return "High activity";
  if (transactionsPerWeek > 7) return "Moderate activity";
  return "Low activity";
}

function calculateTransactionsPerWeek(transactions: Transaction[], days: number): number {
  return (transactions.length / days) * 7;
}

function groupTransactionsByCategory(transactions: Transaction[]): TopCategory[] {
  const totalAmount = transactions.reduce((sum, tx) => sum + tx.vndAmount, 0);
  const categoryGroups = transactions.reduce((groups, tx) => {
    // Use categoryName instead of categoryId for display
    const category = tx.categoryName;
    if (!groups[category]) {
      groups[category] = { amount: 0, count: 0 };
    }
    groups[category].amount += tx.vndAmount;
    groups[category].count += 1;
    return groups;
  }, {} as Record<string, { amount: number; count: number }>);

  return Object.entries(categoryGroups)
    .map(([category, data]) => ({
      category,
      amount: data.amount,
      count: data.count,
      percentage: (data.amount / totalAmount) * 100,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);
}

function groupTransactionsByCard(transactions: Transaction[]) {
  const groups = transactions.reduce((acc, tx) => {
    const card = tx.cardName;
    if (!acc[card]) {
      acc[card] = {
        amount: 0,
        count: 0,
      };
    }
    acc[card].amount += tx.vndAmount;
    acc[card].count += 1;
    return acc;
  }, {} as Record<string, { amount: number; count: number }>);

  return Object.entries(groups)
    .map(([card, data]) => ({
      card,
      amount: data.amount,
      count: data.count,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function TransactionSummary({ transactions, dateRange, onCategoryClick }: TransactionSummaryProps) {
  const [isOpen, setIsOpen] = useState(true);
  const totalAmount = transactions.reduce((sum, tx) => sum + tx.vndAmount, 0);
  const averageAmount = totalAmount / (transactions.length || 1);
  
  const daysDiff = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
  
  // Calculate frequency based on period length
  const isWeeklyView = daysDiff >= 7;
  const frequency = isWeeklyView
    ? calculateTransactionsPerWeek(transactions, daysDiff)
    : transactions.length / Math.max(1, daysDiff); // Use per day average for shorter periods
  
  // Activity level is still based on weekly rate for consistency
  const weeklyRate = isWeeklyView ? frequency : frequency * 7;
  const activityLevel = getActivityLevel(weeklyRate);
  
  const topCategories = groupTransactionsByCategory(transactions);
  const cardUsage = groupTransactionsByCard(transactions);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="bg-white rounded-lg shadow-sm border border-gray-100 w-full">
      {/* Header */}
      <CollapsibleTrigger className="w-full">
        <div className="bg-[#F5E8EB] rounded-t-lg px-4 sm:px-6 py-3 sm:py-4">
          <div className="sm:flex sm:items-center sm:justify-between">
            {/* Mobile Layout */}
            <div className="block sm:hidden">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-[#78A0A0] mt-1 flex-shrink-0" />
                  <div className="flex flex-col items-start">
                    <h2 className="text-base font-bold text-black">Transaction Summary</h2>
                    <p className="text-xs text-[#5D5053]">Complete transaction overview</p>
                    <div className="mt-2 text-xs text-[#5D5053] bg-[#F1DDE3] px-3 py-1.5 rounded-lg inline-block">
                      {dateRange.from.toLocaleDateString()} - {dateRange.to.toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-[#78A0A0] transition-transform ${isOpen ? 'rotate-180' : ''} flex-shrink-0`} />
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden sm:flex sm:items-start sm:gap-3">
              <TrendingUp className="w-5 h-5 text-[#78A0A0] mt-1 flex-shrink-0" />
              <div className="flex flex-col items-start">
                <h2 className="text-lg font-bold text-black">Transaction Summary</h2>
                <p className="text-sm text-[#5D5053]">Complete transaction overview</p>
              </div>
            </div>
            <div className="hidden sm:flex sm:items-center sm:gap-4">
              <div className="text-sm text-[#5D5053] bg-[#F1DDE3] px-3 py-1 rounded-full">
                {dateRange.from.toLocaleDateString()} - {dateRange.to.toLocaleDateString()}
              </div>
              <ChevronDown className={`w-5 h-5 text-[#78A0A0] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Total Amount */}
          <div className="bg-[#F9F2F4] rounded-lg p-4 w-full">
            <h3 className="text-xs sm:text-sm font-medium text-[#5D5053]">Total Amount</h3>
            <p className="text-lg sm:text-2xl font-bold text-[#3D7A7A] mt-0.5 sm:mt-1">
              {formatCurrency(totalAmount)}
            </p>
          </div>

          {/* Transaction Count */}
          <div className="bg-[#F9F2F4] rounded-lg p-4 w-full">
            <h3 className="text-xs sm:text-sm font-medium text-[#5D5053]">Transactions</h3>
            <p className="text-lg sm:text-2xl font-bold text-[#3D7A7A] mt-0.5 sm:mt-1">{transactions.length}</p>
            <p className="text-xs sm:text-sm text-[#5D5053] mt-0.5 sm:mt-1">{activityLevel}</p>
          </div>

          {/* Average */}
          <div className="bg-[#F9F2F4] rounded-lg p-4 w-full">
            <h3 className="text-xs sm:text-sm font-medium text-[#5D5053]">Average</h3>
            <p className="text-lg sm:text-2xl font-bold text-[#3D7A7A] mt-0.5 sm:mt-1">
              {formatCurrency(averageAmount)}
            </p>
            <p className="text-xs sm:text-sm text-[#5D5053] mt-0.5 sm:mt-1">Per transaction</p>
          </div>

          {/* Frequency */}
          <div className="bg-[#F9F2F4] rounded-lg p-4 w-full">
            <h3 className="text-xs sm:text-sm font-medium text-[#5D5053]">Frequency</h3>
            <p className="text-lg sm:text-2xl font-bold text-[#3D7A7A] mt-0.5 sm:mt-1">
              {Math.round(frequency * 10) / 10}
            </p>
            <p className="text-xs sm:text-sm text-[#5D5053] mt-0.5 sm:mt-1">
              Per {isWeeklyView ? 'week' : 'day'} average
            </p>
          </div>
        </div>

        {/* Top Spending Categories */}
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-[#5D5053] mb-3 sm:mb-4">Top Spending Categories</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {topCategories.map((category, index) => (
              <TopSpendingCategory
                key={category.category}
                category={category.category}
                amount={category.amount}
                count={category.count}
                percentage={category.percentage}
                index={index + 1}
                onClick={() => onCategoryClick(category.category)}
              />
            ))}
          </div>
        </div>

        {/* Card Usage Breakdown */}
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-[#5D5053] mb-3 sm:mb-4">Card Usage Breakdown</h3>
          <div className="space-y-3 sm:space-y-4">
            {cardUsage.map((card) => (
              <div
                key={card.card}
                className="bg-[#F9F2F4] rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 w-full"
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-4 sm:w-5 h-4 sm:h-5 text-[#78A0A0]" />
                  <div>
                    <p className="text-sm sm:text-base font-medium text-[#5D5053]">{card.card}</p>
                    <p className="text-xs sm:text-sm text-[#5D5053] mt-1 sm:mt-2">
                      <span className="text-[#5D5053]">{card.count} transaction{card.count !== 1 ? 's' : ''} · {((card.amount / totalAmount) * 100).toFixed(1)}%</span>
                    </p>
                  </div>
                </div>
                <p className="text-base sm:text-xl font-bold text-[#3D7A7A]">
                  {formatCurrency(card.amount)}
                </p>
              </div>
            ))}
          </div>
        </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
