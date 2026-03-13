import { PrismaClient } from "@prisma/client";
import { TransactionController } from "./controllers/transaction.controller";
import { TransactionRepository } from "./repositories/transaction.repository";
import { TransactionService } from "./services/transaction.service";
import { clock } from "./utils/clock";
import { UserRepository } from "./repositories/user.repository";
import { CategoryRepository } from "./repositories/category.repository";

export const prismaClient = new PrismaClient();
export const transactionRepo = new TransactionRepository(prismaClient, clock);
export const userRepo = new UserRepository(prismaClient);
export const categoryRepo = new CategoryRepository(prismaClient);
export const transactionService = new TransactionService({
  transactionRepo,
  userRepo,
  categoryRepo,
  clock: clock,
});
export const transactionController = new TransactionController(
  transactionService,
);
