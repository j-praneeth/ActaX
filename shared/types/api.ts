// API request and response types
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  status: number;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateMeetingRequest {
  title: string;
  description?: string;
  platform?: string;
  meetingUrl?: string;
  startTime?: string;
  endTime?: string;
}

export interface UpdateMeetingRequest {
  title?: string;
  description?: string;
  platform?: string;
  meetingUrl?: string;
  startTime?: string;
  endTime?: string;
  status?: string;
  transcript?: string;
  summary?: string;
  actionItems?: any;
  keyTopics?: any;
  decisions?: any;
  takeaways?: any;
  sentiment?: string;
}

export interface ValidateMeetingRequest {
  url: string;
}

export interface ValidateMeetingResponse {
  isActive: boolean;
  meetingId?: string;
  canJoin: boolean;
  message: string;
}

export interface JoinMeetingRequest {
  url: string;
  meetingId: string;
}

export interface JoinMeetingResponse {
  success: boolean;
  message: string;
  botId?: string;
}

export interface AuthRequest {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  user: any;
  token: string;
}

export interface IntegrationConnectRequest {
  provider: string;
}

export interface IntegrationConnectResponse {
  authUrl: string;
}

export interface OAuthCallbackRequest {
  provider: string;
  code: string;
  state: string;
}

export interface OAuthCallbackResponse {
  success: boolean;
  integration: any;
}
