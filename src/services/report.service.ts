import { IBudgetRepository } from "../repositories/budget.repository";
import { ITransactionRepository } from "../repositories/transaction.repository";
import { MonthlyReport } from "../types/report.types";

export class ReportService {
  constructor(
    private readonly budgetRepo: IBudgetRepository,
    private readonly transactionRepo: ITransactionRepository,
  ) {}
  async getMonthlyReport(
    userId: number,
    month: number,
    year: number,
  ): Promise<MonthlyReport> {
    const budget = await this.budgetRepo.getBudget(userId, month, year);

    const transactions = await this.transactionRepo.getMonthlyExpenses(
      userId,
      month,
      year,
    );

    let totalIncome = 0;
    let totalExpenses = 0;

    transactions.forEach(({ type, amount }) => {
      if (type === "INCOME") {
        totalIncome += amount;
      }

      if (type === "EXPENSE") {
        totalExpenses += amount;
      }
    });

    const balance = totalIncome - totalExpenses;
    const budgetLimit = budget?.limit ?? null;
    const budgetExceeded =
      !budget || !(budgetLimit && budgetLimit - totalExpenses < 0)
        ? false
        : true;

    return {
      totalIncome,
      totalExpenses,
      balance,
      budgetExceeded,
      budgetLimit,
    };
  }
}
