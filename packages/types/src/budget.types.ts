export type BudgetStatus = 'ok' | 'warning' | 'exceeded';

export interface Budget {
  id: string;
  category: string;
  limitAmount: number;
  spentAmount: number;
  percentage: number;
  status: BudgetStatus;
  month: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBudgetDto {
  category: string;
  limitAmount: number;
  month: string;
}

export interface UpdateBudgetDto {
  limitAmount: number;
}
