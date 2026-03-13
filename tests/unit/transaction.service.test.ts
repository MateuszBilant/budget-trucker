import { ITransactionRepository } from "../../src/repositories/transaction.repository";
import { TransactionService } from "../../src/services/transaction.service";
import {
  BalanceTransaction,
  Transaction,
} from "../../src/types/transaction.types";

describe("TransactionService", () => {
  let mockTransactionRepo: jest.Mocked<ITransactionRepository>;
  let service: TransactionService;

  beforeEach(() => {
    mockTransactionRepo = {
      getMonthlyExpenses: jest.fn(),
      getMonthlyTransactions: jest.fn(),
    };
    service = new TransactionService(mockTransactionRepo);
  });

  describe("calculateBalance", () => {
    it("should return 0 when transactions list is empty", () => {
      // Arrange
      const transactions: [] = [];

      // Act
      const result = service.calculateBalance(transactions);

      // Assert
      expect(result).toBe(0);
    });

    it("should return correct balance for income only", () => {
      // Arrange
      const transactions = [
        { type: "INCOME" as const, amount: 100, categoryId: 1 },
        { type: "INCOME" as const, amount: 200, categoryId: 1 },
      ];

      // Act
      const result = service.calculateBalance(transactions);

      // Assert
      expect(result).toBe(300);
    });

    it("should return negative balance when expenses exceed income", () => {
      // Arrange
      const transactions = [
        { type: "INCOME" as const, amount: 100, categoryId: 1 },
        { type: "EXPENSE" as const, amount: 150, categoryId: 1 },
      ];

      // Act
      const result = service.calculateBalance(transactions);

      // Assert
      expect(result).toBe(-50);
    });

    it("should return correct balance for mixed transactions", () => {
      // Arrange
      const transactions = [
        { type: "INCOME" as const, amount: 1000, categoryId: 1 },
        { type: "EXPENSE" as const, amount: 200, categoryId: 1 },
        { type: "EXPENSE" as const, amount: 300, categoryId: 1 },
        { type: "INCOME" as const, amount: 500, categoryId: 1 },
      ];

      // Act
      const result = service.calculateBalance(transactions);

      // Assert
      expect(result).toBe(1000);
    });
  });

  describe("calculateCategoryPercentage", () => {
    it("should return percentage of category expenses relative to all expenses", () => {
      const transactions = [
        { type: "INCOME" as const, amount: 10, categoryId: 1 },
        { type: "EXPENSE" as const, amount: 10, categoryId: 1 },
        { type: "EXPENSE" as const, amount: 10, categoryId: 2 },
        { type: "INCOME" as const, amount: 10, categoryId: 1 },
      ];

      const value = service.calculateCategoryPercentage(transactions, 1);

      expect(value).toBe(50);
    });
    it("should return percentage of category expenses relative to all expenses fixed to integer", () => {
      const transactions = [
        { type: "INCOME" as const, amount: 10, categoryId: 1 },
        { type: "EXPENSE" as const, amount: 20, categoryId: 1 },
        { type: "EXPENSE" as const, amount: 10, categoryId: 2 },
        { type: "INCOME" as const, amount: 10, categoryId: 1 },
      ];

      const value = service.calculateCategoryPercentage(transactions, 1);

      expect(value).toBe(67);
    });
    it("should throw if no expenses in any category", () => {
      const transactions = [
        { type: "INCOME" as const, amount: 10, categoryId: 1 },
        { type: "INCOME" as const, amount: 10, categoryId: 1 },
      ];

      expect(() =>
        service.calculateCategoryPercentage(transactions, 1),
      ).toThrow("Expenses not found");
    });
    it("should throw if category not found", () => {
      const transactions = [
        { type: "INCOME" as const, amount: 10, categoryId: 1 },
        { type: "EXPENSE" as const, amount: 20, categoryId: 1 },
        { type: "EXPENSE" as const, amount: 10, categoryId: 2 },
        { type: "INCOME" as const, amount: 10, categoryId: 1 },
      ];

      expect(() =>
        service.calculateCategoryPercentage(transactions, 3),
      ).toThrow("Expenses category not found");
    });

    it("should throw if empty array of transactions provided", () => {
      const transactions: BalanceTransaction[] = [];

      expect(() =>
        service.calculateCategoryPercentage(transactions, 3),
      ).toThrow("Transactions not provided");
    });
  });

  describe("getMonthlyExpensesByCategory", () => {
    const transaction1: Transaction = {
      id: 1,
      amount: 100,
      type: "EXPENSE",
      userId: 1,
      categoryId: 1,
      date: new Date(2026, 1, 12, 14, 30, 0),
    };

    const transaction2: Transaction = {
      id: 2,
      amount: 200,
      type: "EXPENSE",
      userId: 1,
      categoryId: 2,
      date: new Date(2026, 1, 12, 15, 30, 0),
    };

    const transaction3: Transaction = {
      id: 3,
      amount: 300,
      type: "EXPENSE",
      userId: 1,
      categoryId: 2,
      date: new Date(2026, 1, 12, 16, 30, 0),
    };

    const transaction4: Transaction = {
      id: 4,
      amount: 400,
      type: "EXPENSE",
      userId: 1,
      categoryId: 1,
      date: new Date(2026, 1, 12, 18, 30, 0),
    };

    it("should return array of user's expenses by the month", async () => {
      mockTransactionRepo.getMonthlyExpenses.mockResolvedValue([
        transaction1,
        transaction2,
        transaction3,
        transaction4,
      ]);

      const result = await service.getMonthlyExpensesByCategory(1, 1, 2026);

      expect(result).toHaveLength(2);
    });
    it("should calculate sum of category's expenses in the month", async () => {
      mockTransactionRepo.getMonthlyExpenses.mockResolvedValue([
        transaction1,
        transaction2,
        transaction3,
        transaction4,
      ]);

      const result = await service.getMonthlyExpensesByCategory(1, 1, 2026);

      expect(result).toEqual(
        expect.arrayContaining([
          { categoryId: 1, total: 500 },
          { categoryId: 2, total: 500 },
        ]),
      );
    });
    it("should return empty array if any user's expenses not found for the month", async () => {
      mockTransactionRepo.getMonthlyExpenses.mockResolvedValue([]);

      const result = await service.getMonthlyExpensesByCategory(1, 1, 2026);

      expect(result).toEqual([]);
    });
  });
});
