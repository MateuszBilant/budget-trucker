import { Budget } from "../types/budget.types";

// interfejs który serwis dostaje przez DI
export interface IBudgetRepository {
  getBudget(
    userId: number,
    month: number,
    year: number,
  ): Promise<Budget | null>;
}
