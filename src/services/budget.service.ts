import { IBudgetRepository } from "../repositories/budget.repository";
import { ITransactionRepository } from "../repositories/transaction.repository";
import { getAmountSum } from "../utils/getSum";

export class BudgetService {
  constructor(
    private readonly transactionRepo: ITransactionRepository,
    private readonly budgetRepo: IBudgetRepository,
  ) {}
  async getRemainingBudget(
    userId: number,
    month: number,
    year: number,
  ): Promise<number> {
    const budget = await this.budgetRepo.getBudget(userId, month, year);

    if (!budget) {
      throw new Error("Budget not found");
    }

    const expenses = await this.transactionRepo.getMonthlyExpenses(
      userId,
      month,
      year,
    );

    if (!expenses.length) {
      return budget.limit;
    }

    const expensesSum = getAmountSum(expenses);

    return budget.limit - expensesSum;
  }
}
