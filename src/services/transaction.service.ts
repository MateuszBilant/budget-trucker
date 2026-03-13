import { ICategoryRepository } from "../repositories/category.repository";
import { ITransactionRepository } from "../repositories/transaction.repository";
import { IUserRepository } from "../repositories/user.repository";
import {
  BalanceTransaction,
  CategoryExpenseSummary,
  CreateTransactionDto,
  Transaction,
} from "../types/transaction.types";
import { Clock } from "../utils/clock";
import { getAmountSum } from "../utils/getSum";

export type TransactionServiceDependencies = {
  transactionRepo: ITransactionRepository;
  userRepo: IUserRepository;
  categoryRepo: ICategoryRepository;
  clock: Clock;
};
export class TransactionService {
  constructor(private readonly serviceDepo: TransactionServiceDependencies) {}
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
    const transactions =
      await this.serviceDepo.transactionRepo.getMonthlyExpenses(
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

  async createTransaction(data: CreateTransactionDto): Promise<Transaction> {
    if (data.amount <= 0) {
      throw new Error("Transaction amount has to be positive");
    }

    const nowTimestamp = this.serviceDepo.clock().getTime();
    const transactionTimestamp = this.serviceDepo.clock(data.date).getTime();

    if (transactionTimestamp > nowTimestamp) {
      throw new Error("Transaction from the future");
    }

    const user = await this.serviceDepo.userRepo.getById(data.userId);

    if (!user) {
      throw new Error("User not found");
    }

    const category = await this.serviceDepo.categoryRepo.getById(
      data.categoryId,
    );

    if (!category) {
      throw new Error("Category not found");
    }

    return await this.serviceDepo.transactionRepo.create(data);
  }
}
