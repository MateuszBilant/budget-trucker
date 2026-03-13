import { PrismaClient } from "@prisma/client";
import { TransactionController } from "./controllers/transaction.controller";

export const prismaClient = new PrismaClient();
export const transactionController = new TransactionController();
