import { User, Meeting, Integration } from './domain.js';

// Service interfaces following the Interface Segregation Principle
export interface IAuthService {
  verifySessionToken(token: string): Promise<User | null>;
  validateAndRefreshSession(token: string): Promise<{ user: User | null; newToken?: string }>;
  getGoogleAuthUrl(state?: string): string;
  handleGoogleCallback(code: string, state?: string): Promise<{ user: User; token: string; isNewUser: boolean }>;
}

export interface IMeetingService {
  validateMeetingAccess(url: string, userId: string, ipAddress?: string, userAgent?: string): Promise<{ hasAccess: boolean; message: string }>;
  checkMeetingStatus(url: string): Promise<{ isActive: boolean; meetingId?: string; canJoin: boolean }>;
  joinMeetingWithBot(url: string, meetingId: string, userId: string): Promise<{ success: boolean; message: string; botId?: string }>;
  getMeetingRecordingStatus(meetingId: string): Promise<{ isRecording: boolean; status: string }>;
  stopMeetingRecording(meetingId: string): Promise<{ success: boolean; message: string }>;
}

export interface IRecallAIService {
  startBot(meetingUrl: string, meetingId: string): Promise<string>;
  stopBot(botId: string): Promise<void>;
  getBotStatus(botId: string): Promise<any>;
  getTranscript(recordingId: string): Promise<any>;
  getRealTimeTranscript(botId: string): Promise<any>;
  getBotStatusDetailed(botId: string): Promise<any>;
  getParticipants(botId: string): Promise<any[]>;
  processWebhook(webhookEvent: any): Promise<void>;
  fetchAndStoreTranscript(botId: string, meetingId: string): Promise<void>;
  generateMeetingInsights(meeting: Meeting): Promise<void>;
}

export interface IIntegrationService {
  getAuthUrl(provider: string, organizationId: string): Promise<string>;
  handleCallback(provider: string, code: string, state: string): Promise<Integration>;
  getDecryptedAccessToken(integration: Integration): Promise<string>;
  syncMeetingToIntegration(meeting: Meeting, provider: string): Promise<void>;
}

export interface IAnalyticsService {
  getMeetingAnalytics(organizationId: string): Promise<{
    totalMeetings: number;
    completedMeetings: number;
    scheduledMeetings: number;
    inProgressMeetings: number;
  }>;
}

export interface ISecurityService {
  validateMeetingData(data: { meetingUrl: string }): Promise<{ valid: boolean; errors: string[] }>;
  recordConsent(userId: string, meetingId: string, consented: boolean, ipAddress?: string, userAgent?: string): Promise<void>;
}

export interface IAIService {
  analyzeMeetingTranscript(transcript: string): Promise<{
    summary: string;
    actionItems: string[];
    keyTopics: string[];
    takeaways: string[];
  }>;
  answerQuestion(transcript: string, question: string): Promise<string>;
}
