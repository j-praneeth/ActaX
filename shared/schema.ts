import { z } from "zod";

// Re-export Prisma types from the storage implementation
export type {
  User,
  InsertUser,
  Organization,
  InsertOrganization,
  Meeting,
  InsertMeeting,
  Integration,
  InsertIntegration,
  Agent,
  InsertAgent,
  WebhookEvent,
  InsertWebhookEvent
} from '../server/prisma-storage';

// Zod schemas for validation
export const insertUserSchema = z.object({
  email: z.string().email(),
  password: z.string().optional().nullable(),
  name: z.string().min(1),
  role: z.string().default("member"),
});

export const insertOrganizationSchema = z.object({
  name: z.string().min(1),
  ownerId: z.string().uuid(),
});

export const insertMeetingSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  organizationId: z.string().uuid(),
  recallBotId: z.string().optional().nullable(),
  status: z.string().default("scheduled"),
  startTime: z.date().optional().nullable(),
  endTime: z.date().optional().nullable(),
  platform: z.string().optional().nullable(),
  meetingUrl: z.string().optional().nullable(),
  transcript: z.string().optional().nullable(),
  summary: z.string().optional().nullable(),
  actionItems: z.any().optional().nullable(),
  keyTopics: z.any().optional().nullable(),
  decisions: z.any().optional().nullable(),
  takeaways: z.any().optional().nullable(),
  sentiment: z.string().optional().nullable(),
});

export const insertIntegrationSchema = z.object({
  organizationId: z.string().uuid(),
  provider: z.string().min(1),
  accessToken: z.string().min(1),
  refreshToken: z.string().optional().nullable(),
  expiresAt: z.date().optional().nullable(),
  isActive: z.boolean().default(true),
  settings: z.any().optional().nullable(),
});

export const insertAgentSchema = z.object({
  organizationId: z.string().uuid(),
  name: z.string().min(1),
  goal: z.string().optional().nullable(),
});

export const insertWebhookEventSchema = z.object({
  source: z.string().min(1),
  eventType: z.string().min(1),
  payload: z.any(),
  processed: z.boolean().default(false),
  meetingId: z.string().uuid().optional().nullable(),
});
