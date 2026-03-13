import { ITransactionRepository } from "../../src/repositories/transaction.repository";
import { IBudgetRepository } from "../../src/repositories/budget.repository";
import { ReportService } from "../../src/services/report.service";
import { Transaction } from "../../src/types/transaction.types";
import { Budget } from "../../src/types/budget.types";

describe("reportService", () => {
  let mockTransactionRepo: jest.Mocked<ITransactionRepository>;
  let mockBudgetRepo: jest.Mocked<IBudgetRepository>;
  let service: ReportService;
  beforeEach(() => {
    mockTransactionRepo = {
      getMonthlyExpenses: jest.fn(),
    };
    mockBudgetRepo = {
      getBudget: jest.fn(),
    };

    service = new ReportService(mockBudgetRepo, mockTransactionRepo);
  });
  describe("getMonthlyReport", () => {
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
      type: "INCOME",
      userId: 1,
      categoryId: 2,
      date: new Date(2026, 1, 12, 16, 30, 0),
    };

    const transaction4: Transaction = {
      id: 4,
      amount: 400,
      type: "INCOME",
      userId: 1,
      categoryId: 1,
      date: new Date(2026, 1, 12, 18, 30, 0),
    };
    const transaction5: Transaction = {
      id: 2,
      amount: 200,
      type: "EXPENSE",
      userId: 1,
      categoryId: 2,
      date: new Date(2026, 1, 20, 15, 30, 0),
    };
    it("should calculate correct balance", async () => {
      const mockBudget: Budget = {
        userId: 1,
        id: 1,
        limit: 500,
        year: 2026,
        month: 1,
      };
      mockBudgetRepo.getBudget.mockResolvedValue(mockBudget);
      mockTransactionRepo.getMonthlyExpenses.mockResolvedValue([
        transaction1,
        transaction2,
        transaction3,
        transaction4,
      ]);

      const { totalIncome } = await service.getMonthlyReport(1, 1, 2026);

      expect(totalIncome).toBe(700);
    });

    it("should return budgetExceeded falsy if no budget found for the month", async () => {
      mockBudgetRepo.getBudget.mockResolvedValue(null);
      mockTransactionRepo.getMonthlyExpenses.mockResolvedValue([
        transaction1,
        transaction2,
        transaction3,
        transaction4,
      ]);

      const { budgetExceeded } = await service.getMonthlyReport(1, 1, 2026);

      expect(budgetExceeded).toBeFalsy();
    });
    it("should return budgetExceeded true if expenses exceeds budget limit", async () => {
      const mockBudget: Budget = {
        userId: 1,
        id: 1,
        limit: 200,
        year: 2026,
        month: 1,
      };
      mockBudgetRepo.getBudget.mockResolvedValue(mockBudget);
      mockTransactionRepo.getMonthlyExpenses.mockResolvedValue([
        transaction1,
        transaction2,
        transaction3,
        transaction5,
      ]);

      const { budgetExceeded } = await service.getMonthlyReport(1, 1, 2026);

      expect(budgetExceeded).toBeTruthy();
    });
    it("should return negative balance if total expenses exceed total incomes in the month", async () => {
      const mockBudget: Budget = {
        userId: 1,
        id: 1,
        limit: 500,
        year: 2026,
        month: 1,
      };
      mockBudgetRepo.getBudget.mockResolvedValue(mockBudget);

      mockTransactionRepo.getMonthlyExpenses.mockResolvedValue([
        transaction1,
        transaction2,
        transaction3,
        transaction5,
      ]);

      const { balance } = await service.getMonthlyReport(1, 1, 2026);

      expect(balance).toBeLessThan(0);
    });
    it("should return nonnegative balance if total incomes exceed total expenses in the month", async () => {
      const mockBudget: Budget = {
        userId: 1,
        id: 1,
        limit: 500,
        year: 2026,
        month: 1,
      };
      mockBudgetRepo.getBudget.mockResolvedValue(mockBudget);

      mockTransactionRepo.getMonthlyExpenses.mockResolvedValue([
        transaction1,
        transaction2,
        transaction3,
        transaction4,
      ]);

      const { balance } = await service.getMonthlyReport(1, 1, 2026);

      expect(balance).toBeGreaterThanOrEqual(0);
    });
  });
});
