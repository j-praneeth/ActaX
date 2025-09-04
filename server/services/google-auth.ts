import { google } from 'googleapis';
import { supabaseService } from './supabase';
import { storage } from '../storage';
import type { InsertUser, InsertOrganization } from '@shared/schema';

interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
  verified_email: boolean;
}

class GoogleAuthService {
  private oauth2Client: any;

  constructor() {
    const clientId = process.env.GOOGLE_CLIENT_ID || '917455473484-gqhhte5990hnk9qq5a7fdfpl4ugkj2mr.apps.googleusercontent.com';
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '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';
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${process.env.CALLBACK_BASE_URL || 'http://localhost:5000'}/api/auth/google/callback`;

    if (!clientId || !clientSecret) {
      throw new Error('Missing required Google OAuth environment variables: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET');
    }

    console.log('Google OAuth Config:', {
      clientId: clientId ? `${clientId.substring(0, 10)}...` : 'MISSING',
      clientSecret: clientSecret ? 'SET' : 'MISSING',
      redirectUri
    });

    this.oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );
  }

  getAuthUrl(): string {
    const scopes = [
      'openid',
      'email',
      'profile',
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/meetings.space.created'
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });
  }

  async handleCallback(code: string): Promise<{ user: any; token: string }> {
    try {
      // Exchange code for tokens
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);

      // Get user info from Google
      const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
      const { data: userInfo } = await oauth2.userinfo.get();

      if (!userInfo.email || !userInfo.verified_email) {
        throw new Error('Invalid Google account - email not verified');
      }

      // Check if user exists in our database
      let user = await storage.getUserByEmail(userInfo.email);
      
      if (!user) {
        // Create new user
        const userData: InsertUser = {
          email: userInfo.email,
          name: userInfo.name || userInfo.email,
          role: 'owner'
        };
        
        user = await storage.createUser(userData);
        
        // Create default organization for the user
        const orgData: InsertOrganization = {
          name: `${userInfo.name || userInfo.email}'s Organization`,
          ownerId: user.id
        };
        
        await storage.createOrganization(orgData);
      }

      // Create Supabase session token
      const token = await supabaseService.createSessionToken(user);

      return { user, token };
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      throw new Error('Failed to authenticate with Google');
    }
  }

  async refreshToken(refreshToken: string): Promise<string> {
    try {
      this.oauth2Client.setCredentials({
        refresh_token: refreshToken
      });

      const { credentials } = await this.oauth2Client.refreshAccessToken();
      return credentials.access_token;
    } catch (error) {
      console.error('Token refresh error:', error);
      throw new Error('Failed to refresh token');
    }
  }

  async createGoogleMeetMeeting(accessToken: string, meetingDetails: {
    title: string;
    description?: string;
    startTime: Date;
    endTime: Date;
  }): Promise<{ meetingUrl: string; meetingId: string }> {
    try {
      this.oauth2Client.setCredentials({
        access_token: accessToken
      });

      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

      const event = {
        summary: meetingDetails.title,
        description: meetingDetails.description,
        start: {
          dateTime: meetingDetails.startTime.toISOString(),
          timeZone: 'UTC',
        },
        end: {
          dateTime: meetingDetails.endTime.toISOString(),
          timeZone: 'UTC',
        },
        conferenceData: {
          createRequest: {
            requestId: `meet-${Date.now()}`,
            conferenceSolutionKey: {
              type: 'hangoutsMeet'
            }
          }
        },
        attendees: [],
      };

      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
        conferenceDataVersion: 1,
      });

      const meetingUrl = response.data?.conferenceData?.entryPoints?.[0]?.uri;
      const meetingId = response.data?.id;

      if (!meetingUrl || !meetingId) {
        throw new Error('Failed to create Google Meet meeting');
      }

      return { meetingUrl, meetingId };
    } catch (error) {
      console.error('Google Meet creation error:', error);
      throw new Error('Failed to create Google Meet meeting');
    }
  }
}

export const googleAuthService = new GoogleAuthService();

