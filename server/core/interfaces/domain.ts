// Domain entities and value objects
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  organizationId: string;
  recallBotId?: string;
  status: MeetingStatus;
  startTime?: Date;
  endTime?: Date;
  platform?: string;
  meetingUrl?: string;
  transcript?: string;
  summary?: string;
  actionItems?: any;
  keyTopics?: any;
  decisions?: any;
  takeaways?: any;
  sentiment?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Integration {
  id: string;
  organizationId: string;
  provider: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  isActive: boolean;
  settings?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface Agent {
  id: string;
  organizationId: string;
  name: string;
  goal?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WebhookEvent {
  id: string;
  source: string;
  eventType: string;
  payload: any;
  processed: boolean;
  meetingId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type MeetingStatus = 
  | "scheduled" 
  | "waiting_for_admission" 
  | "in_progress" 
  | "completed" 
  | "failed";

export type IntegrationProvider = 
  | "google" 
  | "jira" 
  | "slack" 
  | "microsoft";

export type WebhookEventType = 
  | "bot.status_change"
  | "bot.admitted"
  | "bot.in_lobby"
  | "transcript.live"
  | "transcript.translated"
  | "recording.completed"
  | "transcript.ready";
