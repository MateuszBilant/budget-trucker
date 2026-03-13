import { TransactionService } from "../services/transaction.service";
import { CreateTransactionDto } from "../types/transaction.types";
import { Request, Response } from "express";
export class TransactionController {
  constructor(private readonly service: TransactionService) {}
  createTransaction = async (req: Request, res: Response) => {
    try {
      const data = req.body as CreateTransactionDto;

      const transaction = await this.service.createTransaction(data);

      res.status(201).json(transaction);
    } catch (error) {
      res.status(400).json({ error: "ERROR" });
    }
  };
}
