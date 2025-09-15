import { PrismaClient } from '@prisma/client';
import { container } from './container';

// Repositories
import { UserRepository } from '../repositories/user-repository';
import { MeetingRepository } from '../repositories/meeting-repository';
import { OrganizationRepository } from '../repositories/organization-repository';

// Services
import { AuthService } from '../services/auth-service';
import { MeetingService } from '../services/meeting-service';

// Interfaces
import { IUserRepository } from '../interfaces/repositories';
import { IMeetingRepository } from '../interfaces/repositories';
import { IOrganizationRepository } from '../interfaces/repositories';
import { IAuthService } from '../interfaces/services';
import { IMeetingService } from '../interfaces/services';

export function setupContainer(): void {
  // Create Prisma client
  const prisma = new PrismaClient();

  // Register repositories
  container.register<IUserRepository>('userRepository', new UserRepository(prisma));
  container.register<IMeetingRepository>('meetingRepository', new MeetingRepository(prisma));
  container.register<IOrganizationRepository>('organizationRepository', new OrganizationRepository(prisma));

  // Register services
  container.register<IAuthService>('authService', new AuthService());
  container.register<IMeetingService>('meetingService', new MeetingService());

  // Register Prisma client
  container.register<PrismaClient>('prisma', prisma);
}
