import { ITransactionRepository } from "../repositories/transaction.repository";
import {
  BalanceTransaction,
  CategoryExpenseSummary,
} from "../types/transaction.types";
import { getAmountSum } from "../utils/getSum";

export class TransactionService {
  constructor(private readonly transactionRepo: ITransactionRepository) {}
  calculateBalance(transactions: BalanceTransaction[]): number {
    return transactions.reduce((balance, { type, amount }) => {
      const multiplier = type === "INCOME" ? 1 : -1;
      return balance + amount * multiplier;
    }, 0);
  }
  calculateCategoryPercentage(
    transactions: BalanceTransaction[],
    categoryId: number,
  ): number {
    if (!transactions.length) {
      throw new Error("Transactions not provided");
    }

    const expenses: BalanceTransaction[] = [];
    const categoryExpenses: BalanceTransaction[] = [];

    transactions.forEach((expense) => {
      if (expense.type === "EXPENSE") {
        expenses.push(expense);
      }
      if (expense.type === "EXPENSE" && expense.categoryId === categoryId) {
        categoryExpenses.push(expense);
      }
    });

    if (!expenses.length) {
      throw new Error("Expenses not found");
    }

    if (!categoryExpenses.length) {
      throw new Error("Expenses category not found");
    }

    const expensesSum = getAmountSum(expenses);

    const categorySum = getAmountSum(categoryExpenses);

    const result = (categorySum / expensesSum) * 100;

    return Number(result.toFixed(0));
  }

  async getMonthlyExpensesByCategory(
    userId: number,
    month: number,
    year: number,
  ): Promise<CategoryExpenseSummary[]> {
    const transactions = await this.transactionRepo.getMonthlyExpenses(
      userId,
      month,
      year,
    );

    if (!transactions.length) {
      return [];
    }

    const sortedExpenses: Record<number, number> = {};

    transactions.forEach(({ categoryId, amount }) => {
      if (sortedExpenses[categoryId]) {
        sortedExpenses[categoryId] += amount;
        return;
      }

      sortedExpenses[categoryId] = amount;
    });

    return Object.entries(sortedExpenses).map(([categoryId, sum]) => {
      return {
        categoryId: Number(categoryId),
        total: sum,
      };
    });
  }
}
