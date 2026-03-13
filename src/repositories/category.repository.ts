import { Category } from "../types/category.types";

export interface ICategoryRepository {
  getById(id: number): Promise<Category | null>;
}
