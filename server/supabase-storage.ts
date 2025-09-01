import { db } from './db';
import { 
  users, 
  organizations, 
  meetings, 
  integrations, 
  agents, 
  webhookEvents,
  type User,
  type InsertUser,
  type Organization,
  type InsertOrganization,
  type Meeting,
  type InsertMeeting,
  type Integration,
  type InsertIntegration,
  type Agent,
  type InsertAgent,
  type WebhookEvent,
  type InsertWebhookEvent
} from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import type { IStorage } from './storage';

export class SupabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.getUser(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const result = await db.update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  // Organizations
  async getOrganization(id: string): Promise<Organization | undefined> {
    const result = await db.select().from(organizations).where(eq(organizations.id, id)).limit(1);
    return result[0];
  }

  async getOrganizationsByOwner(ownerId: string): Promise<Organization[]> {
    return await db.select().from(organizations).where(eq(organizations.ownerId, ownerId));
  }

  async createOrganization(insertOrg: InsertOrganization): Promise<Organization> {
    const result = await db.insert(organizations).values(insertOrg).returning();
    return result[0];
  }

  // Meetings
  async getMeeting(id: string): Promise<Meeting | undefined> {
    const result = await db.select().from(meetings).where(eq(meetings.id, id)).limit(1);
    return result[0];
  }

  async getMeetingsByOrganization(organizationId: string): Promise<Meeting[]> {
    return await db.select().from(meetings).where(eq(meetings.organizationId, organizationId));
  }

  async createMeeting(insertMeeting: InsertMeeting): Promise<Meeting> {
    const result = await db.insert(meetings).values(insertMeeting).returning();
    return result[0];
  }

  async updateMeeting(id: string, updates: Partial<Meeting>): Promise<Meeting> {
    const result = await db.update(meetings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(meetings.id, id))
      .returning();
    return result[0];
  }

  // Integrations
  async getIntegrationsByOrganization(organizationId: string): Promise<Integration[]> {
    return await db.select().from(integrations).where(eq(integrations.organizationId, organizationId));
  }

  async getIntegrationByProvider(organizationId: string, provider: string): Promise<Integration | undefined> {
    const result = await db.select()
      .from(integrations)
      .where(and(
        eq(integrations.organizationId, organizationId),
        eq(integrations.provider, provider)
      ))
      .limit(1);
    return result[0];
  }

  async createIntegration(insertIntegration: InsertIntegration): Promise<Integration> {
    const result = await db.insert(integrations).values(insertIntegration).returning();
    return result[0];
  }

  async updateIntegration(id: string, updates: Partial<Integration>): Promise<Integration> {
    const result = await db.update(integrations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(integrations.id, id))
      .returning();
    return result[0];
  }

  // Agents
  async getAgentsByOrganization(organizationId: string): Promise<Agent[]> {
    return await db.select().from(agents).where(eq(agents.organizationId, organizationId));
  }

  async createAgent(insertAgent: InsertAgent): Promise<Agent> {
    const result = await db.insert(agents).values(insertAgent).returning();
    return result[0];
  }

  async updateAgent(id: string, updates: Partial<Agent>): Promise<Agent> {
    const result = await db.update(agents)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(agents.id, id))
      .returning();
    return result[0];
  }

  // Webhook Events
  async createWebhookEvent(insertEvent: InsertWebhookEvent): Promise<WebhookEvent> {
    const result = await db.insert(webhookEvents).values(insertEvent).returning();
    return result[0];
  }

  async getUnprocessedWebhookEvents(): Promise<WebhookEvent[]> {
    return await db.select().from(webhookEvents).where(eq(webhookEvents.processed, false));
  }

  async markWebhookEventProcessed(id: string): Promise<void> {
    await db.update(webhookEvents)
      .set({ processed: true })
      .where(eq(webhookEvents.id, id));
  }
}

