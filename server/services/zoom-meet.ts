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

class ZoomMeetService {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.ZOOM_API_KEY || '';
    this.apiSecret = process.env.ZOOM_API_SECRET || '';
    this.baseUrl = 'https://api.zoom.us/v2';
  }

  /**
   * Validates and extracts meeting ID from Zoom URL
   */
  validateMeetingUrl(url: string): { isValid: boolean; meetingId?: string; error?: string } {
    try {
      // Zoom URL patterns
      const patterns = [
        /https:\/\/[a-z0-9-]+\.zoom\.us\/j\/(\d+)/i,
        /https:\/\/zoom\.us\/j\/(\d+)/i,
        /https:\/\/[a-z0-9-]+\.zoom\.us\/my\/([a-zA-Z0-9]+)/i,
        /https:\/\/zoom\.us\/my\/([a-zA-Z0-9]+)/i,
        /https:\/\/[a-z0-9-]+\.zoom\.us\/s\/(\d+)/i,
        /https:\/\/zoom\.us\/s\/(\d+)/i
      ];

      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
          return { isValid: true, meetingId: match[1] };
        }
      }

      return { isValid: false, error: 'Invalid Zoom URL format' };
    } catch (error) {
      return { isValid: false, error: 'Failed to parse meeting URL' };
    }
  }

  /**
   * Checks if a Zoom meeting is currently active
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

      // For Zoom, we'll attempt to get meeting details to check if it's active
      // This requires authentication, so we'll use a simplified approach
      // In a real implementation, you would use the Zoom API to check meeting status
      
      return {
        isActive: true, // We'll determine this when attempting to join
        meetingId,
        canJoin: true,
        startTime: new Date(), // Placeholder
        endTime: new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now
      };
    } catch (error) {
      console.error('Error checking Zoom meeting status:', error);
      return {
        isActive: false,
        meetingId: '',
        canJoin: false
      };
    }
  }

  /**
   * Attempts to join a Zoom meeting with a bot for recording
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
        platform: 'zoom',
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
      console.error('Error joining Zoom meeting with bot:', error);
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
      console.error('Error getting Zoom meeting recording status:', error);
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
      console.error('Error stopping Zoom meeting recording:', error);
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
      console.error('Error validating Zoom meeting access:', error);
      return {
        hasAccess: false,
        message: 'Failed to validate access'
      };
    }
  }

  /**
   * Creates a Zoom meeting using Zoom API
   */
  async createZoomMeeting(accessToken: string, meetingDetails: {
    title: string;
    description?: string;
    startTime: Date;
    endTime: Date;
  }): Promise<{ meetingUrl: string; meetingId: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/users/me/meetings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: meetingDetails.title,
          agenda: meetingDetails.description,
          type: 2, // Scheduled meeting
          start_time: meetingDetails.startTime.toISOString(),
          duration: Math.ceil((meetingDetails.endTime.getTime() - meetingDetails.startTime.getTime()) / (1000 * 60)),
          timezone: 'UTC',
          settings: {
            host_video: true,
            participant_video: true,
            join_before_host: false,
            mute_upon_entry: false,
            waiting_room: true,
            auto_recording: 'cloud'
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Zoom API error response:', errorText);
        throw new Error(`Zoom API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const meeting = await response.json();
      const meetingUrl = meeting.join_url;
      const meetingId = meeting.id.toString();

      if (!meetingUrl || !meetingId) {
        throw new Error('Failed to create Zoom meeting');
      }

      return { meetingUrl, meetingId };
    } catch (error) {
      console.error('Zoom meeting creation error:', error);
      throw new Error('Failed to create Zoom meeting');
    }
  }

  /**
   * Gets Zoom meeting details
   */
  async getMeetingDetails(meetingId: string, accessToken: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/meetings/${meetingId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get meeting details: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting Zoom meeting details:', error);
      throw error;
    }
  }

  /**
   * Gets Zoom meeting participants
   */
  async getMeetingParticipants(meetingId: string, accessToken: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/meetings/${meetingId}/participants`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get meeting participants: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.participants || [];
    } catch (error) {
      console.error('Error getting Zoom meeting participants:', error);
      throw error;
    }
  }
}

export const zoomMeetService = new ZoomMeetService();
