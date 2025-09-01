import { 
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
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  
  // Organizations
  getOrganization(id: string): Promise<Organization | undefined>;
  getOrganizationsByOwner(ownerId: string): Promise<Organization[]>;
  createOrganization(org: InsertOrganization): Promise<Organization>;
  
  // Meetings
  getMeeting(id: string): Promise<Meeting | undefined>;
  getMeetingsByOrganization(organizationId: string): Promise<Meeting[]>;
  createMeeting(meeting: InsertMeeting): Promise<Meeting>;
  updateMeeting(id: string, updates: Partial<Meeting>): Promise<Meeting>;
  
  // Integrations
  getIntegrationsByOrganization(organizationId: string): Promise<Integration[]>;
  getIntegrationByProvider(organizationId: string, provider: string): Promise<Integration | undefined>;
  createIntegration(integration: InsertIntegration): Promise<Integration>;
  updateIntegration(id: string, updates: Partial<Integration>): Promise<Integration>;

  // Agents
  getAgentsByOrganization(organizationId: string): Promise<Agent[]>;
  createAgent(agent: InsertAgent): Promise<Agent>;
  updateAgent(id: string, updates: Partial<Agent>): Promise<Agent>;
  
  // Webhook Events
  createWebhookEvent(event: InsertWebhookEvent): Promise<WebhookEvent>;
  getUnprocessedWebhookEvents(): Promise<WebhookEvent[]>;
  markWebhookEventProcessed(id: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private organizations: Map<string, Organization> = new Map();
  private meetings: Map<string, Meeting> = new Map();
  private integrations: Map<string, Integration> = new Map();
  private agents: Map<string, Agent> = new Map();
  private webhookEvents: Map<string, WebhookEvent> = new Map();

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const now = new Date();
    const user: User = {
      ...insertUser,
      id,
      role: insertUser.role || 'member',
      password: insertUser.password || null,
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    
    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: new Date(),
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Organizations
  async getOrganization(id: string): Promise<Organization | undefined> {
    return this.organizations.get(id);
  }

  async getOrganizationsByOwner(ownerId: string): Promise<Organization[]> {
    return Array.from(this.organizations.values()).filter(org => org.ownerId === ownerId);
  }

  async createOrganization(insertOrg: InsertOrganization): Promise<Organization> {
    const id = randomUUID();
    const now = new Date();
    const organization: Organization = {
      ...insertOrg,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.organizations.set(id, organization);
    return organization;
  }

  // Meetings
  async getMeeting(id: string): Promise<Meeting | undefined> {
    return this.meetings.get(id);
  }

  async getMeetingsByOrganization(organizationId: string): Promise<Meeting[]> {
    return Array.from(this.meetings.values()).filter(meeting => meeting.organizationId === organizationId);
  }

  async createMeeting(insertMeeting: InsertMeeting): Promise<Meeting> {
    const id = randomUUID();
    const now = new Date();
    const meeting: Meeting = {
      ...insertMeeting,
      id,
      status: insertMeeting.status || 'scheduled',
      description: insertMeeting.description || null,
      recallBotId: insertMeeting.recallBotId || null,
      startTime: insertMeeting.startTime || null,
      endTime: insertMeeting.endTime || null,
      platform: insertMeeting.platform || null,
      meetingUrl: insertMeeting.meetingUrl || null,
      transcript: insertMeeting.transcript || null,
      summary: insertMeeting.summary || null,
      actionItems: insertMeeting.actionItems || null,
      keyTopics: insertMeeting.keyTopics || null,
      decisions: insertMeeting.decisions || null,
      takeaways: insertMeeting.takeaways || null,
      sentiment: insertMeeting.sentiment || null,
      createdAt: now,
      updatedAt: now,
    };
    this.meetings.set(id, meeting);
    return meeting;
  }

  async updateMeeting(id: string, updates: Partial<Meeting>): Promise<Meeting> {
    const meeting = this.meetings.get(id);
    if (!meeting) throw new Error("Meeting not found");
    
    const updatedMeeting = {
      ...meeting,
      ...updates,
      updatedAt: new Date(),
    };
    this.meetings.set(id, updatedMeeting);
    return updatedMeeting;
  }

  // Integrations
  async getIntegrationsByOrganization(organizationId: string): Promise<Integration[]> {
    return Array.from(this.integrations.values()).filter(integration => integration.organizationId === organizationId);
  }

  async getIntegrationByProvider(organizationId: string, provider: string): Promise<Integration | undefined> {
    return Array.from(this.integrations.values()).find(
      integration => integration.organizationId === organizationId && integration.provider === provider
    );
  }

  async createIntegration(insertIntegration: InsertIntegration): Promise<Integration> {
    const id = randomUUID();
    const now = new Date();
    const integration: Integration = {
      ...insertIntegration,
      id,
      refreshToken: insertIntegration.refreshToken || null,
      expiresAt: insertIntegration.expiresAt || null,
      isActive: insertIntegration.isActive !== undefined ? insertIntegration.isActive : true,
      settings: insertIntegration.settings || null,
      createdAt: now,
      updatedAt: now,
    };
    this.integrations.set(id, integration);
    return integration;
  }

  async updateIntegration(id: string, updates: Partial<Integration>): Promise<Integration> {
    const integration = this.integrations.get(id);
    if (!integration) throw new Error("Integration not found");
    
    const updatedIntegration = {
      ...integration,
      ...updates,
      updatedAt: new Date(),
    };
    this.integrations.set(id, updatedIntegration);
    return updatedIntegration;
  }

  // Agents
  async getAgentsByOrganization(organizationId: string): Promise<Agent[]> {
    return Array.from(this.agents.values()).filter(agent => agent.organizationId === organizationId);
  }

  async createAgent(insertAgent: InsertAgent): Promise<Agent> {
    const id = randomUUID();
    const now = new Date();
    const agent: Agent = {
      ...insertAgent,
      id,
      goal: insertAgent.goal || null,
      createdAt: now,
      updatedAt: now,
    } as Agent;
    this.agents.set(id, agent);
    return agent;
  }

  async updateAgent(id: string, updates: Partial<Agent>): Promise<Agent> {
    const agent = this.agents.get(id);
    if (!agent) throw new Error("Agent not found");
    const updated = { ...agent, ...updates, updatedAt: new Date() } as Agent;
    this.agents.set(id, updated);
    return updated;
  }

  // Webhook Events
  async createWebhookEvent(insertEvent: InsertWebhookEvent): Promise<WebhookEvent> {
    const id = randomUUID();
    const event: WebhookEvent = {
      ...insertEvent,
      id,
      processed: insertEvent.processed !== undefined ? insertEvent.processed : false,
      meetingId: insertEvent.meetingId || null,
      createdAt: new Date(),
    };
    this.webhookEvents.set(id, event);
    return event;
  }

  async getUnprocessedWebhookEvents(): Promise<WebhookEvent[]> {
    return Array.from(this.webhookEvents.values()).filter(event => !event.processed);
  }

  async markWebhookEventProcessed(id: string): Promise<void> {
    const event = this.webhookEvents.get(id);
    if (event) {
      event.processed = true;
      this.webhookEvents.set(id, event);
    }
  }
}

// Use Supabase storage if DATABASE_URL is available, otherwise fall back to in-memory storage
const useSupabase = !!process.env.DATABASE_URL;

let storage: IStorage;
if (useSupabase) {
  // Dynamic import to avoid issues when DATABASE_URL is not set
  const { SupabaseStorage } = await import('./supabase-storage');
  storage = new SupabaseStorage();
} else {
  storage = new MemStorage();
}

export { storage };

// Initialize with sample data for demonstration
async function initSampleData() {
  try {
    // Create sample user
    const sampleUser = await storage.createUser({
      email: "demo@acta.ai",
      name: "Demo User",
      role: "owner",
    });

    // Create sample organization
    const sampleOrg = await storage.createOrganization({
      name: "Demo Organization",
      ownerId: sampleUser.id,
    });

    // Create sample meetings
    const meetings = [
      {
        title: "Q4 Strategy Planning",
        description: "Quarterly strategy meeting to discuss goals and objectives",
        organizationId: sampleOrg.id,
        status: "completed",
        platform: "google_meet",
        startTime: new Date(Date.now() - 86400000), // Yesterday
        endTime: new Date(Date.now() - 82800000), // Yesterday + 1 hour
        summary: "Discussed Q4 objectives, budget allocation, and team expansion plans. Key decisions made on product roadmap and resource allocation.",
        actionItems: [
          "Finalize Q4 budget by end of week",
          "Schedule team expansion interviews",
          "Review product roadmap with engineering",
          "Prepare board presentation"
        ],
        keyTopics: ["Budget", "Hiring", "Product Roadmap", "Board Meeting"],
        decisions: [
          "Approved 20% increase in engineering budget",
          "Decided to hire 3 new developers",
          "Postponed mobile app launch to Q1"
        ],
        takeaways: [
          "Focus on core product features",
          "Prioritize customer retention",
          "Invest in team growth"
        ],
        sentiment: "positive"
      },
      {
        title: "Product Demo Session",
        description: "Demo of new AI features to stakeholders",
        organizationId: sampleOrg.id,
        status: "completed",
        platform: "zoom",
        startTime: new Date(Date.now() - 172800000), // 2 days ago
        endTime: new Date(Date.now() - 169200000), // 2 days ago + 1 hour
        summary: "Showcased new AI-powered meeting insights and integration capabilities. Received positive feedback from stakeholders.",
        actionItems: [
          "Incorporate feedback into final design",
          "Schedule beta testing with key customers",
          "Prepare launch marketing materials"
        ],
        keyTopics: ["AI Features", "User Feedback", "Beta Testing", "Launch Plan"],
        decisions: [
          "Approved UI changes based on feedback",
          "Set beta launch date for next month"
        ],
        takeaways: [
          "AI features exceed expectations",
          "Strong stakeholder support",
          "Ready for beta launch"
        ],
        sentiment: "positive"
      },
      {
        title: "Weekly Team Standup",
        description: "Regular team sync and progress updates",
        organizationId: sampleOrg.id,
        status: "scheduled",
        platform: "google_meet",
        startTime: new Date(Date.now() + 86400000), // Tomorrow
      },
      {
        title: "Client Onboarding Call",
        description: "Onboarding session with new enterprise client",
        organizationId: sampleOrg.id,
        status: "in_progress",
        platform: "teams",
        startTime: new Date(), // Now
      }
    ];

    for (const meetingData of meetings) {
      await storage.createMeeting(meetingData);
    }

    // Sample agents
    await storage.createAgent({
      organizationId: sampleOrg.id,
      name: "Product Assistant - Ticket Creator",
      goal: "Identifies potential new Jira tickets from meetings.",
    });
    await storage.createAgent({
      organizationId: sampleOrg.id,
      name: "Product Manager Agent",
      goal: "Generates PRDs from meeting discussions.",
    });

    console.log("Sample data initialized successfully");
  } catch (error) {
    console.error("Error initializing sample data:", error);
  }
}

// Initialize sample data
initSampleData();
