// Service interfaces for the client following SOLID principles

export interface IApiService {
  get<T>(endpoint: string): Promise<T>;
  post<T>(endpoint: string, data?: any): Promise<T>;
  put<T>(endpoint: string, data?: any): Promise<T>;
  delete<T>(endpoint: string): Promise<T>;
  setToken(token: string | null): void;
}

export interface IAuthService {
  login(email: string, password: string): Promise<{ user: any; token: string }>;
  signup(email: string, password: string, name: string): Promise<{ user: any; token: string }>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<any | null>;
  isAuthenticated(): boolean;
  getToken(): string | null;
}

export interface IMeetingService {
  getMeetings(): Promise<any[]>;
  getMeeting(id: string): Promise<any>;
  createMeeting(meeting: any): Promise<any>;
  updateMeeting(id: string, updates: any): Promise<any>;
  deleteMeeting(id: string): Promise<void>;
  validateMeeting(url: string): Promise<any>;
  joinMeetingWithBot(url: string, meetingId: string): Promise<any>;
}

export interface IIntegrationService {
  getIntegrations(): Promise<any[]>;
  connectIntegration(provider: string): Promise<{ authUrl: string }>;
  disconnectIntegration(id: string): Promise<void>;
  handleOAuthCallback(provider: string, code: string, state: string): Promise<any>;
}

export interface IAnalyticsService {
  getMeetingAnalytics(): Promise<{
    totalMeetings: number;
    completedMeetings: number;
    scheduledMeetings: number;
    inProgressMeetings: number;
  }>;
}

export interface IStorageService {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
  clear(): void;
}
