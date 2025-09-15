import { PrismaClient } from '@prisma/client';
import { IOrganizationRepository } from '../interfaces/repositories';
import { Organization } from '../interfaces/domain';
import { BaseRepository } from './base-repository';

export class OrganizationRepository extends BaseRepository implements IOrganizationRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async findById(id: string): Promise<Organization | null> {
    try {
      const organization = await this.prisma.organization.findUnique({
        where: { id }
      });
      return organization ? this.mapToDomain(organization) : null;
    } catch (error) {
      this.handleError(error, 'find organization by id');
    }
  }

  async findByOwnerId(ownerId: string): Promise<Organization[]> {
    try {
      const organizations = await this.prisma.organization.findMany({
        where: { ownerId },
        orderBy: { createdAt: 'desc' }
      });
      return organizations.map(org => this.mapToDomain(org));
    } catch (error) {
      this.handleError(error, 'find organizations by owner');
    }
  }

  async create(organizationData: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>): Promise<Organization> {
    try {
      const organization = await this.prisma.organization.create({
        data: {
          name: organizationData.name,
          ownerId: organizationData.ownerId
        }
      });
      return this.mapToDomain(organization);
    } catch (error) {
      this.handleError(error, 'create organization');
    }
  }

  async update(id: string, updates: Partial<Organization>): Promise<Organization> {
    try {
      const organization = await this.prisma.organization.update({
        where: { id },
        data: {
          ...(updates.name && { name: updates.name }),
          ...(updates.ownerId && { ownerId: updates.ownerId })
        }
      });
      return this.mapToDomain(organization);
    } catch (error) {
      this.handleError(error, 'update organization');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.organization.delete({
        where: { id }
      });
    } catch (error) {
      this.handleError(error, 'delete organization');
    }
  }

  private mapToDomain(prismaOrganization: any): Organization {
    return {
      id: prismaOrganization.id,
      name: prismaOrganization.name,
      ownerId: prismaOrganization.ownerId,
      createdAt: prismaOrganization.createdAt,
      updatedAt: prismaOrganization.updatedAt
    };
  }
}
