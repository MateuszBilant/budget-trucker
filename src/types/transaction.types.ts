export type TransactionType = "INCOME" | "EXPENSE";

export interface Transaction {
  id: number;
  amount: number;
  type: "INCOME" | "EXPENSE";
  userId: number;
  categoryId: number;
  date: Date;
}

export type BalanceTransaction = Pick<
  Transaction,
  "amount" | "categoryId" | "type"
>;

export type CategoryExpenseSummary = Pick<Transaction, "categoryId"> & {
  total: number;
};
