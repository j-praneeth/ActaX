import { google } from 'googleapis';
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

class GoogleMeetService {
  private oauth2Client: any;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || `${process.env.FRONTEND_URL}/api/auth/google/callback`
    );
  }

  /**
   * Validates and extracts meeting ID from Google Meet URL
   */
  validateMeetingUrl(url: string): { isValid: boolean; meetingId?: string; error?: string } {
    try {
      // Google Meet URL patterns
      const patterns = [
        /https:\/\/meet\.google\.com\/([a-z0-9-]+)/i,
        /https:\/\/meet\.google\.com\/[a-z0-9-]+\?hs=([a-z0-9-]+)/i,
        /https:\/\/meet\.google\.com\/[a-z0-9-]+\?pli=1&authuser=0&hs=([a-z0-9-]+)/i
      ];

      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
          return { isValid: true, meetingId: match[1] };
        }
      }

      return { isValid: false, error: 'Invalid Google Meet URL format' };
    } catch (error) {
      return { isValid: false, error: 'Failed to parse meeting URL' };
    }
  }

  /**
   * Checks if a Google Meet is currently active
   * Note: Google Meet API doesn't provide direct meeting status, so we use alternative methods
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

      // Since Google Meet API doesn't provide direct meeting status,
      // we'll attempt to join with a bot to determine if the meeting is active
      // This is a common approach used by meeting recording services
      
      // For now, we'll assume the meeting is joinable if the URL is valid
      // In a real implementation, you would use a service like Meeting BaaS
      // or attempt to join with a bot to check status
      
      return {
        isActive: true, // We'll determine this when attempting to join
        meetingId,
        canJoin: true,
        startTime: new Date(), // Placeholder
        endTime: new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now
      };
    } catch (error) {
      console.error('Error checking meeting status:', error);
      return {
        isActive: false,
        meetingId: '',
        canJoin: false
      };
    }
  }

  /**
   * Attempts to join a Google Meet with a bot for recording
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
        platform: 'google_meet',
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
      console.error('Error joining meeting with bot:', error);
      return {
        success: false,
        message: 'Failed to join meeting. Please check the URL and try again.',
        requiresAdmission: false
      };
    }
  }

  /**
   * Starts a recording bot using Recall.ai service or mock service
   */
  private async startRecordingBot(meetingUrl: string, meetingId: string): Promise<string> {
    try {
      const { recallAIService } = await import('./recall-ai');
      return await recallAIService.startBot(meetingUrl, meetingId);
    } catch (error) {
      console.log('⚠️  Recall.ai not available, using mock service for development');
      const { mockRecallAIService } = await import('./mock-recall-ai');
      return await mockRecallAIService.startBot(meetingUrl, meetingId);
    }
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
      console.error('Error getting meeting recording status:', error);
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
      console.error('Error stopping meeting recording:', error);
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
      console.error('Error validating meeting access:', error);
      return {
        hasAccess: false,
        message: 'Failed to validate access'
      };
    }
  }
}

export const googleMeetService = new GoogleMeetService();
