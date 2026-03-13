import { PrismaClient } from "@prisma/client";
import { Category } from "../types/category.types";

export interface ICategoryRepository {
  getById(id: number): Promise<Category | null>;
}

export class CategoryRepository implements ICategoryRepository {
  constructor(private readonly prisma: PrismaClient) {}
  async getById(id: number): Promise<Category | null> {
    return await this.prisma.category.findUnique({ where: { id } });
  }
}
