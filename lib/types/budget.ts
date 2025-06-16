export interface Budget {
  id?: string;  // Optional because it won't exist for new budgets
  enabled: boolean;
  monthlyAmount: number;
  statementCardId: string; // The card whose statement cycle we'll follow
  lastUpdated: string; // ISO date string
}

export interface BudgetStatus {
  currentSpending: number;
  remainingAmount: number;
  percentageUsed: number;
  statementPeriod: {
    start: string;
    end: string;
  };
  status: 'on_track' | 'warning' | 'exceeded';
}

export interface BudgetProgress {
  amount: number;
  percentage: number;
  type: 'cumulative' | 'single';
}
