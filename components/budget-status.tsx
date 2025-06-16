import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Target, TrendingUp } from 'lucide-react';
import { useBudget } from '@/lib/hooks/useBudget';
import { formatCurrency } from '@/lib/currency';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { BudgetProgressBar } from './budget-progress-bar';

export function BudgetStatus() {
  const { budget, getBudgetStatus } = useBudget();
  const status = getBudgetStatus();

  if (!budget?.enabled || !status) return null;

  const statementStart = new Date(status.statementPeriod.start);
  const statementEnd = new Date(status.statementPeriod.end);
  const statementPeriod = `${statementStart.toLocaleDateString()} - ${statementEnd.toLocaleDateString()}`;

  return (
    <Card className="bg-[#F7EDEF] rounded-xl shadow-sm">
      <CardHeader className="pb-2 pt-6 px-4 sm:px-6">
        <div className="flex items-center space-x-3 mb-1">
          <div className="rounded-full bg-[#F3E2E7] p-2">
            <TrendingUp className="h-5 w-5 text-[#C58B9F]" />
          </div>
          <div>
            <CardTitle className="text-xl font-semibold leading-tight">Current Budget Status</CardTitle>
            <p className="text-sm text-[#7B7680] mt-1">Statement period: {statementPeriod}</p>
          </div>
        </div>
        <div className="h-px bg-[#F3E2E7]/70 w-full mt-3" />
      </CardHeader>
      <CardContent className="pt-4 px-4 sm:px-6 pb-6 space-y-6">
        <div className="grid gap-3 md:grid-cols-3 md:gap-4">
          <div className="bg-[#FBF6F7] rounded-xl p-4 shadow-sm text-center">
            <div className="text-sm font-bold text-[#7B7680] mb-2">Monthly Budget</div>
            <div className="text-2xl sm:text-3xl font-bold text-[#C58B9F]">
              {formatCurrency(budget.monthlyAmount, 'VND')}
            </div>
          </div>

          <div className="bg-[#FBF6F7] rounded-xl p-4 shadow-sm text-center">
            <div className="text-sm font-bold text-[#7B7680] mb-2">Current Spending</div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">
              {formatCurrency(status.currentSpending, 'VND')}
            </div>
          </div>

          <div className="bg-[#FBF6F7] rounded-xl p-4 shadow-sm text-center">
            <div className="text-sm font-bold text-[#7B7680] mb-2">Remaining</div>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-500">
              {formatCurrency(status.remainingAmount, 'VND')}
            </div>
          </div>
        </div>

        <BudgetProgressBar />

        <Card className="bg-[#FBF6F7] border-none shadow-sm">
          <CardContent className="p-4 text-center space-y-2">
            <div className="rounded-full bg-emerald-100 w-8 h-8 mx-auto flex items-center justify-center">
              <Target className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="font-medium text-emerald-600">
              You're on track with your budget
            </div>
            <div className="text-sm text-[#7B7680]">
              {formatCurrency(status.remainingAmount, 'VND')} remaining for this period
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}