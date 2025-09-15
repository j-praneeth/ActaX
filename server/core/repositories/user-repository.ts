import { PrismaClient } from '@prisma/client';
import { IUserRepository } from '../interfaces/repositories';
import { User } from '../interfaces/domain';
import { BaseRepository } from './base-repository';

export class UserRepository extends BaseRepository implements IUserRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async findById(id: string): Promise<User | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id }
      });
      return user ? this.mapToDomain(user) : null;
    } catch (error) {
      this.handleError(error, 'find user by id');
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email }
      });
      return user ? this.mapToDomain(user) : null;
    } catch (error) {
      this.handleError(error, 'find user by email');
    }
  }

  async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    try {
      const user = await this.prisma.user.create({
        data: {
          email: userData.email,
          name: userData.name,
          role: userData.role
        }
      });
      return this.mapToDomain(user);
    } catch (error) {
      this.handleError(error, 'create user');
    }
  }

  async update(id: string, updates: Partial<User>): Promise<User> {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: {
          ...(updates.email && { email: updates.email }),
          ...(updates.name && { name: updates.name }),
          ...(updates.role && { role: updates.role })
        }
      });
      return this.mapToDomain(user);
    } catch (error) {
      this.handleError(error, 'update user');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.user.delete({
        where: { id }
      });
    } catch (error) {
      this.handleError(error, 'delete user');
    }
  }

  private mapToDomain(prismaUser: any): User {
    return {
      id: prismaUser.id,
      email: prismaUser.email,
      name: prismaUser.name,
      role: prismaUser.role,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt
    };
  }
}
