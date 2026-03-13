import { TransactionService } from "../../src/services/transaction.service";
import { BalanceTransaction } from "../../src/types/transaction.types";

describe("TransactionService", () => {
  let service: TransactionService;

  beforeEach(() => {
    service = new TransactionService();
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
});
