import { PrismaClient } from "@prisma/client";
import { CreateTransactionDto, Transaction } from "../types/transaction.types";
import { Clock } from "../utils/clock";

export interface ITransactionRepository {
  create(data: CreateTransactionDto): Promise<Transaction>;
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

export class TransactionRepository implements ITransactionRepository {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly dbClock: Clock,
  ) {}
  async create(data: CreateTransactionDto): Promise<Transaction> {
    return await this.prisma.transaction.create({
      data,
    });
  }

  async getMonthlyExpenses(
    userId: number,
    month: number,
    year: number,
  ): Promise<Transaction[]> {
    const { start, end } = this.getMonthRange(year, month);

    return await this.prisma.transaction.findMany({
      where: { type: "EXPENSE", userId, date: { gte: start, lt: end } },
    });
  }

  async getMonthlyTransactions(
    userId: number,
    month: number,
    year: number,
  ): Promise<Transaction[]> {
    const { start, end } = this.getMonthRange(year, month);

    return await this.prisma.transaction.findMany({
      where: { userId, date: { gte: start, lt: end } },
    });
  }

  private getMonthRange(year: number, month: number) {
    return {
      start: this.dbClock(new Date(year, month - 1, 1)),
      end: this.dbClock(new Date(year, month, 1)),
    };
  }
}
