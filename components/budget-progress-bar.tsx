import { Progress } from '@/components/ui/progress';
import { useBudget } from '@/lib/hooks/useBudget';
import { formatCurrency } from '@/lib/currency';

interface BudgetProgressBarProps {
  // Allow customizing styles for different contexts
  className?: string;
  showAmount?: boolean;
}

export function BudgetProgressBar({ className = '', showAmount = false }: BudgetProgressBarProps) {
  const { budget, getBudgetStatus } = useBudget();
  const status = getBudgetStatus();

  if (!budget?.enabled || !status) return null;

  const statementStart = new Date(status.statementPeriod.start);
  const statementEnd = new Date(status.statementPeriod.end);
  const statementPeriod = `${statementStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} - ${statementEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="text-sm font-bold">Monthly Budget</div>
        <div className="text-sm font-medium">{formatCurrency(budget.monthlyAmount, 'VND')}</div>
      </div>
      <Progress 
        value={status.percentageUsed} 
        className="h-2 bg-[#F3E2E7]" 
        indicatorClassName="bg-[#C58B9F]" 
      />
      <div className="flex items-center justify-between text-xs mt-1">
        <div className="text-[#7B7680]">{statementPeriod}</div>
        <div className="font-bold text-[#7B7680]">{Math.round(status.percentageUsed)}% used</div>
      </div>
    </div>
  );
}
