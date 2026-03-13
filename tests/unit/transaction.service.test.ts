import { ITransactionRepository } from "../../src/repositories/transaction.repository";
import { IUserRepository } from "../../src/repositories/user.repository";
import { ICategoryRepository } from "../../src/repositories/category.repository";
import { TransactionService } from "../../src/services/transaction.service";
import {
  BalanceTransaction,
  CreateTransactionDto,
  Transaction,
} from "../../src/types/transaction.types";
import { User } from "../../src/types/user.types";
import { Category } from "../../src/types/category.types";

describe("TransactionService", () => {
  let mockTransactionRepo: jest.Mocked<ITransactionRepository>;
  let mockUserRepo: jest.Mocked<IUserRepository>;
  let mockCategoryRepo: jest.Mocked<ICategoryRepository>;
  let service: TransactionService;
  let FIXED_DATE: Date;
  beforeEach(() => {
    mockTransactionRepo = {
      create: jest.fn(),
      getMonthlyExpenses: jest.fn(),
      getMonthlyTransactions: jest.fn(),
    };
    mockUserRepo = {
      getById: jest.fn(),
    };
    mockCategoryRepo = {
      getById: jest.fn(),
    };
    FIXED_DATE = new Date("2026-03-13T10:00:00Z");
    service = new TransactionService({
      transactionRepo: mockTransactionRepo,
      userRepo: mockUserRepo,
      categoryRepo: mockCategoryRepo,
      clock: (time?: string | Date) => (time ? new Date(time) : FIXED_DATE),
    });
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

  describe("createTransaction", () => {
    const user: User = {
      id: 1,
      name: "Name",
      email: "test@email.com",
      createdAt: new Date(2026, 1, 1, 12, 0, 0, 0).toISOString(),
      updatedAt: new Date(2026, 1, 1, 12, 0, 0, 0).toISOString(),
    };

    const category: Category = {
      id: 1,
      name: "Test",
    };

    const transaction: Transaction = {
      id: 1,
      amount: 100,
      type: "EXPENSE",
      userId: 1,
      categoryId: 1,
      date: new Date(2026, 1, 12, 14, 30, 0),
    };

    it("should return created transaction with id", async () => {
      mockUserRepo.getById.mockResolvedValue(user);
      mockCategoryRepo.getById.mockResolvedValue(category);
      mockTransactionRepo.create.mockResolvedValue(transaction);

      const newTransaction: CreateTransactionDto = {
        amount: 100,
        type: "EXPENSE",
        userId: 1,
        categoryId: 1,
        date: new Date(2026, 1, 12, 14, 30, 0),
      };

      const result = await service.createTransaction(newTransaction);

      expect(result.id).toBe(1);
    });

    it("should throw if transaction date from future", async () => {
      mockUserRepo.getById.mockResolvedValue(user);
      mockCategoryRepo.getById.mockResolvedValue(category);

      const newTransaction: CreateTransactionDto = {
        amount: 100,
        type: "EXPENSE",
        userId: 1,
        categoryId: 1,
        date: new Date(2027, 1, 12, 14, 30, 0),
      };

      await expect(service.createTransaction(newTransaction)).rejects.toThrow(
        "Transaction from the future",
      );
    });

    it("should throw if transaction's amount is equal or less than 0", async () => {
      mockUserRepo.getById.mockResolvedValue(user);
      mockCategoryRepo.getById.mockResolvedValue(category);

      const newTransaction: CreateTransactionDto = {
        amount: 0,
        type: "EXPENSE",
        userId: 1,
        categoryId: 1,
        date: new Date(2026, 1, 12, 14, 30, 0),
      };
      const newTransaction2: CreateTransactionDto = {
        amount: -10,
        type: "EXPENSE",
        userId: 1,
        categoryId: 1,
        date: new Date(2026, 1, 12, 14, 30, 0),
      };

      await expect(service.createTransaction(newTransaction)).rejects.toThrow(
        "Transaction amount has to be positive",
      );
      await expect(service.createTransaction(newTransaction2)).rejects.toThrow(
        "Transaction amount has to be positive",
      );
    });
    it("should throw if user does not exists", async () => {
      mockUserRepo.getById.mockResolvedValue(null);

      const newTransaction: CreateTransactionDto = {
        amount: 10,
        type: "EXPENSE",
        userId: 1,
        categoryId: 1,
        date: new Date(2026, 1, 12, 14, 30, 0),
      };

      await expect(service.createTransaction(newTransaction)).rejects.toThrow(
        "User not found",
      );
    });

    it("should throw if category does not exists", async () => {
      mockUserRepo.getById.mockResolvedValue(user);
      mockCategoryRepo.getById.mockResolvedValue(null);
      const newTransaction: CreateTransactionDto = {
        amount: 10,
        type: "EXPENSE",
        userId: 1,
        categoryId: 1,
        date: new Date(2026, 1, 12, 14, 30, 0),
      };

      await expect(service.createTransaction(newTransaction)).rejects.toThrow(
        "Category not found",
      );
    });
  });
});
