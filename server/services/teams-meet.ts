import { storage } from '../storage';

export interface MeetingStatus {
  isActive: boolean;
  meetingId: string;
  participants?: number;
  startTime?: Date;
  endTime?: Date;
  canJoin: boolean;
}

export interface BotAdmissionResult {
  success: boolean;
  botId?: string;
  message: string;
  requiresAdmission: boolean;
}

class TeamsMeetService {
  private clientId: string;
  private clientSecret: string;
  private tenantId: string;
  private baseUrl: string;

  constructor() {
    this.clientId = process.env.MICROSOFT_CLIENT_ID || '';
    this.clientSecret = process.env.MICROSOFT_CLIENT_SECRET || '';
    this.tenantId = process.env.MICROSOFT_TENANT_ID || 'common';
    this.baseUrl = 'https://graph.microsoft.com/v1.0';
  }

  /**
   * Validates and extracts meeting ID from Microsoft Teams URL
   */
  validateMeetingUrl(url: string): { isValid: boolean; meetingId?: string; error?: string } {
    try {
      // Microsoft Teams URL patterns
      const patterns = [
        /https:\/\/teams\.microsoft\.com\/l\/meetup-join\/([a-zA-Z0-9%]+)/i,
        /https:\/\/teams\.live\.com\/meet\/([a-zA-Z0-9%]+)/i,
        /https:\/\/teams\.microsoft\.com\/l\/meetup-join\/[a-zA-Z0-9%]+\/([a-zA-Z0-9%]+)/i,
        /https:\/\/[a-z0-9-]+\.teams\.microsoft\.com\/l\/meetup-join\/([a-zA-Z0-9%]+)/i,
        /https:\/\/[a-z0-9-]+\.teams\.live\.com\/meet\/([a-zA-Z0-9%]+)/i
      ];

      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
          return { isValid: true, meetingId: match[1] };
        }
      }

      return { isValid: false, error: 'Invalid Microsoft Teams URL format' };
    } catch (error) {
      return { isValid: false, error: 'Failed to parse meeting URL' };
    }
  }

  /**
   * Checks if a Microsoft Teams meeting is currently active
   */
  async checkMeetingStatus(meetingUrl: string, accessToken?: string): Promise<MeetingStatus> {
    try {
      const validation = this.validateMeetingUrl(meetingUrl);
      if (!validation.isValid) {
        return {
          isActive: false,
          meetingId: '',
          canJoin: false
        };
      }

      const meetingId = validation.meetingId!;

      // For Microsoft Teams, we'll attempt to get meeting details to check if it's active
      // This requires authentication, so we'll use a simplified approach
      // In a real implementation, you would use the Microsoft Graph API to check meeting status
      
      return {
        isActive: true, // We'll determine this when attempting to join
        meetingId,
        canJoin: true,
        startTime: new Date(), // Placeholder
        endTime: new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now
      };
    } catch (error) {
      console.error('Error checking Microsoft Teams meeting status:', error);
      return {
        isActive: false,
        meetingId: '',
        canJoin: false
      };
    }
  }

  /**
   * Attempts to join a Microsoft Teams meeting with a bot for recording
   */
  async joinMeetingWithBot(meetingUrl: string, meetingId: string, userId: string): Promise<BotAdmissionResult> {
    try {
      const validation = this.validateMeetingUrl(meetingUrl);
      if (!validation.isValid) {
        return {
          success: false,
          message: 'Invalid meeting URL',
          requiresAdmission: false
        };
      }

      // Create a meeting record in our database
      const meetingData = {
        title: `Meeting Recording - ${new Date().toLocaleString()}`,
        description: 'Automated meeting recording via Acta.ai',
        platform: 'microsoft_teams',
        meetingUrl,
        status: 'scheduled',
        startTime: new Date(),
        endTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
        organizationId: '', // Will be set below
      };

      // Get user's organization
      const user = await storage.getUserById(userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found',
          requiresAdmission: false
        };
      }

      const organizations = await storage.getOrganizationsByOwner(user.id);
      if (organizations.length === 0) {
        return {
          success: false,
          message: 'No organization found for user',
          requiresAdmission: false
        };
      }

      // Set organization ID
      meetingData.organizationId = organizations[0].id;

      // Create meeting record
      const meeting = await storage.createMeeting(meetingData);

      // Start Recall.ai bot for recording
      try {
        const botId = await this.startRecordingBot(meetingUrl, meeting.id);
        
        // Update meeting with bot ID and enhanced metadata
        await storage.updateMeeting(meeting.id, { 
          recallBotId: botId,
          status: 'waiting_for_admission' // Bot starts in lobby
        });

        return {
          success: true,
          botId,
          message: 'Bot successfully joined the meeting lobby. Please admit the bot when prompted to start real-time transcription.',
          requiresAdmission: true
        };
      } catch (botError) {
        console.error('Failed to start recording bot:', botError);
        return {
          success: false,
          message: 'Failed to start recording bot. Please check your Recall.ai API key and try again.',
          requiresAdmission: false
        };
      }
    } catch (error) {
      console.error('Error joining Microsoft Teams meeting with bot:', error);
      return {
        success: false,
        message: 'Failed to join meeting. Please check the URL and try again.',
        requiresAdmission: false
      };
    }
  }

  /**
   * Starts a recording bot using Recall.ai service
   */
  private async startRecordingBot(meetingUrl: string, meetingId: string): Promise<string> {
    const { recallAIService } = await import('./recall-ai');
    return await recallAIService.startBot(meetingUrl, meetingId);
  }

  /**
   * Gets meeting recording status and transcript
   */
  async getMeetingRecordingStatus(meetingId: string): Promise<{
    isRecording: boolean;
    hasTranscript: boolean;
    transcript?: string;
    summary?: string;
    actionItems?: string[];
  }> {
    try {
      const meeting = await storage.getMeeting(meetingId);
      if (!meeting) {
        return {
          isRecording: false,
          hasTranscript: false
        };
      }

      return {
        isRecording: meeting.status === 'in_progress',
        hasTranscript: !!meeting.transcript,
        transcript: meeting.transcript || undefined,
        summary: meeting.summary || undefined,
        actionItems: meeting.actionItems as string[] || undefined
      };
    } catch (error) {
      console.error('Error getting Microsoft Teams meeting recording status:', error);
      return {
        isRecording: false,
        hasTranscript: false
      };
    }
  }

  /**
   * Stops meeting recording
   */
  async stopMeetingRecording(meetingId: string): Promise<{ success: boolean; message: string }> {
    try {
      const meeting = await storage.getMeeting(meetingId);
      if (!meeting || !meeting.recallBotId) {
        return {
          success: false,
          message: 'No active recording found for this meeting'
        };
      }

      const { recallAIService } = await import('./recall-ai');
      await recallAIService.stopBot(meeting.recallBotId);

      // Update meeting status
      await storage.updateMeeting(meetingId, {
        status: 'completed',
        endTime: new Date()
      });

      return {
        success: true,
        message: 'Recording stopped successfully'
      };
    } catch (error) {
      console.error('Error stopping Microsoft Teams meeting recording:', error);
      return {
        success: false,
        message: 'Failed to stop recording'
      };
    }
  }

  /**
   * Validates user permissions for meeting access
   */
  async validateMeetingAccess(meetingUrl: string, userId: string, ipAddress?: string, userAgent?: string): Promise<{
    hasAccess: boolean;
    message: string;
  }> {
    try {
      // Check if user has active subscription/credits
      const user = await storage.getUserById(userId);
      if (!user) {
        return {
          hasAccess: false,
          message: 'User not found'
        };
      }

      // Import and use security service for comprehensive validation
      const { securityService } = await import('./security');
      
      // Validate recording access with security policies
      const accessResult = await securityService.validateRecordingAccess(
        user, 
        meetingUrl, 
        ipAddress, 
        userAgent
      );

      if (!accessResult.allowed) {
        return {
          hasAccess: false,
          message: accessResult.reason || 'Access denied'
        };
      }

      // Check user's organization permissions
      const organizations = await storage.getOrganizationsByOwner(user.id);
      if (organizations.length === 0) {
        return {
          hasAccess: false,
          message: 'No organization found'
        };
      }

      return {
        hasAccess: true,
        message: 'Access granted'
      };
    } catch (error) {
      console.error('Error validating Microsoft Teams meeting access:', error);
      return {
        hasAccess: false,
        message: 'Failed to validate access'
      };
    }
  }

  /**
   * Creates a Microsoft Teams meeting using Microsoft Graph API
   */
  async createTeamsMeeting(accessToken: string, meetingDetails: {
    title: string;
    description?: string;
    startTime: Date;
    endTime: Date;
  }): Promise<{ meetingUrl: string; meetingId: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/me/onlineMeetings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: meetingDetails.title,
          startDateTime: meetingDetails.startTime.toISOString(),
          endDateTime: meetingDetails.endTime.toISOString(),
          participants: {
            organizer: {
              identity: {
                user: {
                  id: 'me'
                }
              }
            }
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Microsoft Graph API error response:', errorText);
        throw new Error(`Microsoft Graph API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const meeting = await response.json();
      const meetingUrl = meeting.joinWebUrl;
      const meetingId = meeting.id;

      if (!meetingUrl || !meetingId) {
        throw new Error('Failed to create Microsoft Teams meeting');
      }

      return { meetingUrl, meetingId };
    } catch (error) {
      console.error('Microsoft Teams meeting creation error:', error);
      throw new Error('Failed to create Microsoft Teams meeting');
    }
  }

  /**
   * Gets Microsoft Teams meeting details
   */
  async getMeetingDetails(meetingId: string, accessToken: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/me/onlineMeetings/${meetingId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get meeting details: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting Microsoft Teams meeting details:', error);
      throw error;
    }
  }

  /**
   * Gets Microsoft Teams meeting participants
   */
  async getMeetingParticipants(meetingId: string, accessToken: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/me/onlineMeetings/${meetingId}/participants`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get meeting participants: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.value || [];
    } catch (error) {
      console.error('Error getting Microsoft Teams meeting participants:', error);
      throw error;
    }
  }

  /**
   * Gets access token for Microsoft Graph API
   */
  async getAccessToken(): Promise<string> {
    try {
      const response = await fetch(`https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          scope: 'https://graph.microsoft.com/.default',
          grant_type: 'client_credentials',
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get access token: ${response.status} ${response.statusText}`);
      }

      const tokenData = await response.json();
      return tokenData.access_token;
    } catch (error) {
      console.error('Error getting Microsoft access token:', error);
      throw error;
    }
  }
}

export const teamsMeetService = new TeamsMeetService();
