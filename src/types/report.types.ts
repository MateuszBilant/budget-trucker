export interface MonthlyReport {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  budgetLimit: number | null;
  budgetExceeded: boolean;
}
