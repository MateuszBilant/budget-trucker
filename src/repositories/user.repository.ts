import { PrismaClient } from "@prisma/client";
import { User } from "../types/user.types";

export interface IUserRepository {
  getById(id: number): Promise<User | null>;
}

export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}
  async getById(id: number): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    return !user
      ? null
      : {
          ...user,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        };
  }
}
