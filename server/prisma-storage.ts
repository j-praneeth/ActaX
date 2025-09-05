import { prisma } from './prisma-db';
import type { IStorage } from './storage';

// Define types based on Prisma models
export type User = {
  id: string;
  email: string;
  password: string | null;
  name: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
};

export type InsertUser = {
  email: string;
  password?: string | null;
  name: string;
  role?: string;
};

export type Organization = {
  id: string;
  name: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type InsertOrganization = {
  name: string;
  ownerId: string;
};

export type Meeting = {
  id: string;
  title: string;
  description: string | null;
  organizationId: string;
  recallBotId: string | null;
  status: string;
  startTime: Date | null;
  endTime: Date | null;
  platform: string | null;
  meetingUrl: string | null;
  transcript: string | null;
  summary: string | null;
  actionItems: any;
  keyTopics: any;
  decisions: any;
  takeaways: any;
  sentiment: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type InsertMeeting = {
  title: string;
  description?: string | null;
  organizationId: string;
  recallBotId?: string | null;
  status?: string;
  startTime?: Date | null;
  endTime?: Date | null;
  platform?: string | null;
  meetingUrl?: string | null;
  transcript?: string | null;
  summary?: string | null;
  actionItems?: any;
  keyTopics?: any;
  decisions?: any;
  takeaways?: any;
  sentiment?: string | null;
};

export type Integration = {
  id: string;
  organizationId: string;
  provider: string;
  accessToken: string;
  refreshToken: string | null;
  expiresAt: Date | null;
  isActive: boolean;
  settings: any;
  createdAt: Date;
  updatedAt: Date;
};

export type InsertIntegration = {
  organizationId: string;
  provider: string;
  accessToken: string;
  refreshToken?: string | null;
  expiresAt?: Date | null;
  isActive?: boolean;
  settings?: any;
};

export type Agent = {
  id: string;
  organizationId: string;
  name: string;
  goal: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type InsertAgent = {
  organizationId: string;
  name: string;
  goal?: string | null;
};

export type WebhookEvent = {
  id: string;
  source: string;
  eventType: string;
  payload: any;
  processed: boolean;
  meetingId: string | null;
  createdAt: Date;
};

export type InsertWebhookEvent = {
  source: string;
  eventType: string;
  payload: any;
  processed?: boolean;
  meetingId?: string | null;
};

export class PrismaStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const user = await prisma.user.findUnique({
      where: { id }
    });
    return user || undefined;
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.getUser(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const user = await prisma.user.findUnique({
      where: { email }
    });
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    return await prisma.user.create({
      data: insertUser
    });
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    return await prisma.user.update({
      where: { id },
      data: {
        ...updates,
        updatedAt: new Date()
      }
    });
  }

  // Organizations
  async getOrganization(id: string): Promise<Organization | undefined> {
    const org = await prisma.organization.findUnique({
      where: { id }
    });
    return org || undefined;
  }

  async getOrganizationsByOwner(ownerId: string): Promise<Organization[]> {
    return await prisma.organization.findMany({
      where: { ownerId }
    });
  }

  async createOrganization(insertOrg: InsertOrganization): Promise<Organization> {
    return await prisma.organization.create({
      data: insertOrg
    });
  }

  // Meetings
  async getMeeting(id: string): Promise<Meeting | undefined> {
    const meeting = await prisma.meeting.findUnique({
      where: { id }
    });
    return meeting || undefined;
  }

  async getMeetingsByOrganization(organizationId: string): Promise<Meeting[]> {
    return await prisma.meeting.findMany({
      where: { organizationId }
    });
  }

  async createMeeting(insertMeeting: InsertMeeting): Promise<Meeting> {
    return await prisma.meeting.create({
      data: insertMeeting
    });
  }

  async updateMeeting(id: string, updates: Partial<Meeting>): Promise<Meeting> {
    return await prisma.meeting.update({
      where: { id },
      data: {
        ...updates,
        updatedAt: new Date()
      }
    });
  }

  // Integrations
  async getIntegrationsByOrganization(organizationId: string): Promise<Integration[]> {
    return await prisma.integration.findMany({
      where: { organizationId }
    });
  }

  async getIntegrationByProvider(organizationId: string, provider: string): Promise<Integration | undefined> {
    const integration = await prisma.integration.findFirst({
      where: {
        organizationId,
        provider
      }
    });
    return integration || undefined;
  }

  async createIntegration(insertIntegration: InsertIntegration): Promise<Integration> {
    return await prisma.integration.create({
      data: insertIntegration
    });
  }

  async updateIntegration(id: string, updates: Partial<Integration>): Promise<Integration> {
    return await prisma.integration.update({
      where: { id },
      data: {
        ...updates,
        updatedAt: new Date()
      }
    });
  }

  async getIntegration(id: string): Promise<Integration | undefined> {
    const integration = await prisma.integration.findUnique({
      where: { id }
    });
    return integration || undefined;
  }

  async deleteIntegration(id: string): Promise<void> {
    await prisma.integration.delete({
      where: { id }
    });
  }

  // Agents
  async getAgentsByOrganization(organizationId: string): Promise<Agent[]> {
    return await prisma.agent.findMany({
      where: { organizationId }
    });
  }

  async createAgent(insertAgent: InsertAgent): Promise<Agent> {
    return await prisma.agent.create({
      data: insertAgent
    });
  }

  async updateAgent(id: string, updates: Partial<Agent>): Promise<Agent> {
    return await prisma.agent.update({
      where: { id },
      data: {
        ...updates,
        updatedAt: new Date()
      }
    });
  }

  // Webhook Events
  async createWebhookEvent(insertEvent: InsertWebhookEvent): Promise<WebhookEvent> {
    return await prisma.webhookEvent.create({
      data: insertEvent
    });
  }

  async getUnprocessedWebhookEvents(): Promise<WebhookEvent[]> {
    return await prisma.webhookEvent.findMany({
      where: { processed: false }
    });
  }

  async markWebhookEventProcessed(id: string): Promise<void> {
    await prisma.webhookEvent.update({
      where: { id },
      data: { processed: true }
    });
  }
}
