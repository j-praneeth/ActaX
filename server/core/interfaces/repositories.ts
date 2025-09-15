import { User, Organization, Meeting, Integration, Agent, WebhookEvent } from './domain.js';

// Repository interfaces following the Repository pattern
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  update(id: string, updates: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
}

export interface IOrganizationRepository {
  findById(id: string): Promise<Organization | null>;
  findByOwnerId(ownerId: string): Promise<Organization[]>;
  create(organization: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>): Promise<Organization>;
  update(id: string, updates: Partial<Organization>): Promise<Organization>;
  delete(id: string): Promise<void>;
}

export interface IMeetingRepository {
  findById(id: string): Promise<Meeting | null>;
  findByOrganizationId(organizationId: string): Promise<Meeting[]>;
  create(meeting: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>): Promise<Meeting>;
  update(id: string, updates: Partial<Meeting>): Promise<Meeting>;
  delete(id: string): Promise<void>;
}

export interface IIntegrationRepository {
  findById(id: string): Promise<Integration | null>;
  findByOrganizationId(organizationId: string): Promise<Integration[]>;
  findByProvider(organizationId: string, provider: string): Promise<Integration | null>;
  create(integration: Omit<Integration, 'id' | 'createdAt' | 'updatedAt'>): Promise<Integration>;
  update(id: string, updates: Partial<Integration>): Promise<Integration>;
  delete(id: string): Promise<void>;
}

export interface IAgentRepository {
  findById(id: string): Promise<Agent | null>;
  findByOrganizationId(organizationId: string): Promise<Agent[]>;
  create(agent: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>): Promise<Agent>;
  update(id: string, updates: Partial<Agent>): Promise<Agent>;
  delete(id: string): Promise<void>;
}

export interface IWebhookEventRepository {
  findById(id: string): Promise<WebhookEvent | null>;
  findUnprocessed(): Promise<WebhookEvent[]>;
  create(event: Omit<WebhookEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<WebhookEvent>;
  update(id: string, updates: Partial<WebhookEvent>): Promise<WebhookEvent>;
  markAsProcessed(id: string): Promise<void>;
}
