import express from "express";
import { transactionRouter } from "./routes/transaction.routes";

export const app = express();

app.use(express.json());

app.use("/transactions", transactionRouter);
