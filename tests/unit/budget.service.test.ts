import { ITransactionRepository } from "../../src/repositories/transaction.repository";
import { IBudgetRepository } from "../../src/repositories/budget.repository";
import { BudgetService } from "../../src/services/budget.service";
import { Budget } from "../../src/types/budget.types";
import { Transaction } from "../../src/types/transaction.types";
describe("budgetService", () => {
  let mockTransactionRepo: jest.Mocked<ITransactionRepository>;

  let mockBudgetRepo: jest.Mocked<IBudgetRepository>;

  let service: BudgetService;

  beforeEach(() => {
    mockTransactionRepo = {
      create: jest.fn(),
      getMonthlyExpenses: jest.fn(),
      getMonthlyTransactions: jest.fn(),
    };
    mockBudgetRepo = {
      getBudget: jest.fn(),
    };
    service = new BudgetService(mockTransactionRepo, mockBudgetRepo);
  });

  describe("getRemainingBudget", () => {
    it("should return value of budget left for the month", async () => {
      const mockBudget: Budget = {
        userId: 1,
        id: 1,
        limit: 500,
        year: 2026,
        month: 1,
      };

      mockBudgetRepo.getBudget.mockResolvedValue(mockBudget);

      const transaction1: Transaction = {
        id: 1,
        amount: 200,
        type: "EXPENSE",
        userId: 1,
        categoryId: 1,
        date: new Date(2026, 1, 12, 14, 30, 0),
      };

      const transaction2: Transaction = {
        id: 1,
        amount: 100,
        type: "EXPENSE",
        userId: 1,
        categoryId: 1,
        date: new Date(2026, 1, 12, 15, 30, 0),
      };

      const transactions: Transaction[] = [transaction1, transaction2];

      mockTransactionRepo.getMonthlyExpenses.mockResolvedValue(transactions);

      const result = await service.getRemainingBudget(1, 1, 2026);

      expect(result).toBe(200);
    });
    it("should return budget limit if no transactions for the month", async () => {
      const mockBudget: Budget = {
        userId: 1,
        id: 1,
        limit: 500,
        year: 2026,
        month: 1,
      };

      mockBudgetRepo.getBudget.mockResolvedValue(mockBudget);

      const transactions: Transaction[] = [];

      mockTransactionRepo.getMonthlyExpenses.mockResolvedValue(transactions);

      const result = await service.getRemainingBudget(1, 1, 2026);

      expect(result).toBe(500);
    });
    it("should return negative value if budget exceeded", async () => {
      const mockBudget: Budget = {
        userId: 1,
        id: 1,
        limit: 500,
        year: 2026,
        month: 1,
      };

      mockBudgetRepo.getBudget.mockResolvedValue(mockBudget);

      const transaction1: Transaction = {
        id: 1,
        amount: 300,
        type: "EXPENSE",
        userId: 1,
        categoryId: 1,
        date: new Date(2026, 1, 12, 14, 30, 0),
      };

      const transaction2: Transaction = {
        id: 1,
        amount: 300,
        type: "EXPENSE",
        userId: 1,
        categoryId: 1,
        date: new Date(2026, 1, 12, 15, 30, 0),
      };

      const transactions: Transaction[] = [transaction1, transaction2];

      mockTransactionRepo.getMonthlyExpenses.mockResolvedValue(transactions);

      const result = await service.getRemainingBudget(1, 1, 2026);

      expect(result).toBe(-100);
    });
    it("should throw if budget not found for the provided user and date", async () => {
      mockBudgetRepo.getBudget.mockResolvedValue(null);

      await expect(service.getRemainingBudget(1, 1, 2026)).rejects.toThrow(
        "Budget not found",
      );
    });
  });
});
