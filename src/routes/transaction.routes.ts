import express from "express";
import { transactionController } from "../ioc";

export const transactionRouter = express.Router();

transactionRouter.post("/", transactionController.createTransaction);
