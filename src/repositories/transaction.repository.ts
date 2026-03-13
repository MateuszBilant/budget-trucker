import { Transaction } from "../types/transaction.types";

export interface ITransactionRepository {
  getMonthlyExpenses(
    userId: number,
    month: number,
    year: number,
  ): Promise<Transaction[]>;
  getMonthlyTransactions(
    userId: number,
    month: number,
    year: number,
  ): Promise<Transaction[]>;
}
