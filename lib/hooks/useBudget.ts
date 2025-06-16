import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBudget, setBudget } from '@/lib/storage/budget';
import { storage } from '@/lib/storage';           // your existing card / tx helpers
import type { Budget, BudgetStatus } from '@/lib/types/budget';
import { addMonths } from 'date-fns';

export function useBudget() {
  const qc = useQueryClient();

  /* -------- base row -------------------------------------------------- */
  const { data: budget } = useQuery<Budget | null>({
    queryKey: ['budget'],
    queryFn: getBudget,
  });

  /* -------- card & transaction data ----------------------------------- */
  const { data: cards } = useQuery({
    queryKey: ['cards'],
    queryFn: storage.getCards,
  });

  const { data: transactions } = useQuery({
    queryKey: ['transactions'],
    queryFn: storage.getTransactions,
  });

  /* -------- save mutation --------------------------------------------- */
  const saveMutation = useMutation({
    mutationFn: setBudget,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budget'] }),
  });

  /* -------- derived helpers ------------------------------------------- */
  const computeStatus = (): BudgetStatus | null => {
    if (!budget?.enabled || !cards || !transactions || budget.monthlyAmount === 0) return null;

    const card = cards.find((c) => c.id === budget.statementCardId);
    if (!card) return null;

    /* statement window */
    const today = new Date();
    const cycleDay = card.statementDay;
    let start = new Date(today.getFullYear(), today.getMonth(), cycleDay);
    if (today.getDate() < cycleDay) start = addMonths(start, -1);
    const end = addMonths(start, 1);

    /* transactions inside that window */
    const periodTx = transactions.filter((t) => {
      const d = new Date(t.date);
      return d >= start && d < end;
    });

    const spent = periodTx.reduce((s, t) => s + t.vndAmount, 0);
    const remaining = budget.monthlyAmount - spent;
    const pct = (spent / budget.monthlyAmount) * 100;

    let label: BudgetStatus['status'] = 'on_track';
    if (pct >= 100) label = 'exceeded';
    else if (pct >= 75) label = 'warning';

    return {
      currentSpending: spent,
      remainingAmount: remaining,
      percentageUsed: pct,
      statementPeriod: { start: start.toISOString(), end: end.toISOString() },
      status: label,
    };
  };

  /* expose the same helpers your UI already calls */
  const getBudgetStatus = computeStatus;

  const getTransactionBudgetProgress = (txDateISO: string): number => {
    if (!budget?.enabled || !transactions || budget.monthlyAmount === 0) return 0;

    const txDate = new Date(txDateISO);
    const runningTx = transactions.filter((t) => new Date(t.date) <= txDate);
    const spent = runningTx.reduce((s, t) => s + t.vndAmount, 0);
    return Math.round((spent / budget.monthlyAmount) * 100);
  };

  return {
    budget,
    getBudgetStatus,
    getTransactionBudgetProgress,
    saveBudget: (b: Budget) => saveMutation.mutate(b),
    saving: saveMutation.isLoading,
  };
}