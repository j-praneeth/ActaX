import { storage } from '../storage';
import type { User, Meeting } from '@shared/schema';

export interface SecurityPolicy {
  maxRecordingsPerDay: number;
  maxRecordingDuration: number; // in minutes
  allowedDomains: string[];
  requireExplicitConsent: boolean;
  dataRetentionDays: number;
  encryptionRequired: boolean;
}

export interface AccessControlResult {
  allowed: boolean;
  reason?: string;
  requiresConsent?: boolean;
  rateLimited?: boolean;
}

export interface ConsentRecord {
  userId: string;
  meetingId: string;
  consentGiven: boolean;
  consentTimestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

class SecurityService {
  private defaultPolicy: SecurityPolicy = {
    maxRecordingsPerDay: 10,
    maxRecordingDuration: 120, // 2 hours
    allowedDomains: ['gmail.com', 'googlemail.com', 'company.com'],
    requireExplicitConsent: true,
    dataRetentionDays: 30,
    encryptionRequired: true,
  };

  /**
   * Validates if a user can record a meeting
   */
  async validateRecordingAccess(
    user: User, 
    meetingUrl: string, 
    ipAddress?: string,
    userAgent?: string
  ): Promise<AccessControlResult> {
    try {
      // Check if user has exceeded daily recording limit
      const dailyRecordings = await this.getDailyRecordingCount(user.id);
      if (dailyRecordings >= this.defaultPolicy.maxRecordingsPerDay) {
        return {
          allowed: false,
          reason: `Daily recording limit of ${this.defaultPolicy.maxRecordingsPerDay} exceeded`,
          rateLimited: true
        };
      }

      // Check if meeting URL is from allowed domain
      const domainValidation = this.validateMeetingDomain(meetingUrl);
      if (!domainValidation.allowed) {
        return {
          allowed: false,
          reason: domainValidation.reason
        };
      }

      // Check if explicit consent is required and given
      if (this.defaultPolicy.requireExplicitConsent) {
        const consentStatus = await this.checkConsentStatus(user.id, meetingUrl);
        if (!consentStatus.hasConsent) {
          return {
            allowed: false,
            reason: 'Explicit consent required for meeting recording',
            requiresConsent: true
          };
        }
      }

      // Check user's organization permissions
      const orgPermissions = await this.checkOrganizationPermissions(user.id);
      if (!orgPermissions.allowed) {
        return {
          allowed: false,
          reason: orgPermissions.reason
        };
      }

      return {
        allowed: true
      };
    } catch (error) {
      console.error('Security validation error:', error);
      return {
        allowed: false,
        reason: 'Security validation failed'
      };
    }
  }

  /**
   * Records user consent for meeting recording
   */
  async recordConsent(
    userId: string, 
    meetingId: string, 
    consentGiven: boolean,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      const consentRecord: ConsentRecord = {
        userId,
        meetingId,
        consentGiven,
        consentTimestamp: new Date(),
        ipAddress,
        userAgent
      };

      // Store consent record in database
      // In a real implementation, you would store this in a consent_records table
      console.log('Consent recorded:', consentRecord);
      
      // You could also store this in a separate consent tracking system
      // or use a service like Supabase's real-time features for consent management
    } catch (error) {
      console.error('Error recording consent:', error);
      throw error;
    }
  }

  /**
   * Validates meeting domain against allowed domains
   */
  private validateMeetingDomain(meetingUrl: string): { allowed: boolean; reason?: string } {
    try {
      const url = new URL(meetingUrl);
      
      // Check if it's a Google Meet URL
      if (!url.hostname.includes('meet.google.com')) {
        return {
          allowed: false,
          reason: 'Only Google Meet URLs are supported'
        };
      }

      // Additional domain validation could be added here
      // For example, checking if the meeting is from a trusted organization
      
      return { allowed: true };
    } catch (error) {
      return {
        allowed: false,
        reason: 'Invalid meeting URL format'
      };
    }
  }

  /**
   * Gets the number of recordings a user has made today
   */
  private async getDailyRecordingCount(userId: string): Promise<number> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get user's meetings created today
      const user = await storage.getUserById(userId);
      if (!user) return 0;

      const organizations = await storage.getOrganizationsByOwner(user.id);
      if (organizations.length === 0) return 0;

      const meetings = await storage.getMeetingsByOrganization(organizations[0].id);
      
      // Count meetings created today with recordings
      const todayRecordings = meetings.filter(meeting => {
        const meetingDate = new Date(meeting.createdAt);
        return meetingDate >= today && 
               meetingDate < tomorrow && 
               meeting.recallBotId; // Has a recording bot
      });

      return todayRecordings.length;
    } catch (error) {
      console.error('Error getting daily recording count:', error);
      return 0;
    }
  }

  /**
   * Checks if user has given consent for meeting recording
   */
  private async checkConsentStatus(userId: string, meetingUrl: string): Promise<{ hasConsent: boolean }> {
    try {
      // In a real implementation, you would check a consent_records table
      // For now, we'll assume consent is given if the user is authenticated
      // and has access to the recording feature
      
      // You could implement more sophisticated consent tracking:
      // - Per-meeting consent
      // - Time-based consent expiration
      // - Granular consent for different types of recordings
      
      return { hasConsent: true };
    } catch (error) {
      console.error('Error checking consent status:', error);
      return { hasConsent: false };
    }
  }

  /**
   * Checks organization-level permissions
   */
  private async checkOrganizationPermissions(userId: string): Promise<{ allowed: boolean; reason?: string }> {
    try {
      const user = await storage.getUserById(userId);
      if (!user) {
        return {
          allowed: false,
          reason: 'User not found'
        };
      }

      const organizations = await storage.getOrganizationsByOwner(user.id);
      if (organizations.length === 0) {
        return {
          allowed: false,
          reason: 'No organization found for user'
        };
      }

      // Check organization subscription status
      // In a real implementation, you would check:
      // - Organization's subscription plan
      // - Available recording credits
      // - Organization's recording policies
      // - Compliance requirements

      return { allowed: true };
    } catch (error) {
      console.error('Error checking organization permissions:', error);
      return {
        allowed: false,
        reason: 'Failed to verify organization permissions'
      };
    }
  }

  /**
   * Validates meeting data for security compliance
   */
  async validateMeetingData(meetingData: any): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      // Validate meeting URL
      if (!meetingData.meetingUrl) {
        errors.push('Meeting URL is required');
      } else {
        const domainValidation = this.validateMeetingDomain(meetingData.meetingUrl);
        if (!domainValidation.allowed) {
          errors.push(domainValidation.reason || 'Invalid meeting URL');
        }
      }

      // Validate meeting duration
      if (meetingData.startTime && meetingData.endTime) {
        const startTime = new Date(meetingData.startTime);
        const endTime = new Date(meetingData.endTime);
        const durationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
        
        if (durationMinutes > this.defaultPolicy.maxRecordingDuration) {
          errors.push(`Meeting duration exceeds maximum allowed duration of ${this.defaultPolicy.maxRecordingDuration} minutes`);
        }
      }

      // Validate meeting title and description for sensitive information
      if (meetingData.title) {
        const titleValidation = this.validateContentForSensitiveData(meetingData.title);
        if (!titleValidation.valid) {
          errors.push('Meeting title contains potentially sensitive information');
        }
      }

      if (meetingData.description) {
        const descValidation = this.validateContentForSensitiveData(meetingData.description);
        if (!descValidation.valid) {
          errors.push('Meeting description contains potentially sensitive information');
        }
      }

      return {
        valid: errors.length === 0,
        errors
      };
    } catch (error) {
      console.error('Error validating meeting data:', error);
      return {
        valid: false,
        errors: ['Failed to validate meeting data']
      };
    }
  }

  /**
   * Validates content for sensitive information
   */
  private validateContentForSensitiveData(content: string): { valid: boolean; sensitivePatterns?: string[] } {
    const sensitivePatterns = [
      /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/, // Credit card numbers
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b.*password/i, // Email with password
      /\bpassword\s*[:=]\s*\S+/i, // Password fields
      /\bapi[_-]?key\s*[:=]\s*\S+/i, // API keys
      /\btoken\s*[:=]\s*\S+/i, // Tokens
    ];

    const foundPatterns: string[] = [];
    
    for (const pattern of sensitivePatterns) {
      if (pattern.test(content)) {
        foundPatterns.push(pattern.source);
      }
    }

    return {
      valid: foundPatterns.length === 0,
      sensitivePatterns: foundPatterns.length > 0 ? foundPatterns : undefined
    };
  }

  /**
   * Encrypts sensitive meeting data
   */
  async encryptMeetingData(meetingData: any): Promise<any> {
    try {
      // In a real implementation, you would use proper encryption
      // For now, we'll just return the data as-is
      // You could use libraries like crypto-js or node-forge for encryption
      
      const encryptedData = { ...meetingData };
      
      // Mark sensitive fields for encryption
      if (encryptedData.transcript) {
        encryptedData.transcript = `[ENCRYPTED]${encryptedData.transcript}`;
      }
      
      if (encryptedData.summary) {
        encryptedData.summary = `[ENCRYPTED]${encryptedData.summary}`;
      }

      return encryptedData;
    } catch (error) {
      console.error('Error encrypting meeting data:', error);
      throw error;
    }
  }

  /**
   * Decrypts sensitive meeting data
   */
  async decryptMeetingData(encryptedData: any): Promise<any> {
    try {
      const decryptedData = { ...encryptedData };
      
      // Remove encryption markers (in real implementation, you'd decrypt)
      if (decryptedData.transcript && decryptedData.transcript.startsWith('[ENCRYPTED]')) {
        decryptedData.transcript = decryptedData.transcript.replace('[ENCRYPTED]', '');
      }
      
      if (decryptedData.summary && decryptedData.summary.startsWith('[ENCRYPTED]')) {
        decryptedData.summary = decryptedData.summary.replace('[ENCRYPTED]', '');
      }

      return decryptedData;
    } catch (error) {
      console.error('Error decrypting meeting data:', error);
      throw error;
    }
  }

  /**
   * Gets security policy for an organization
   */
  async getSecurityPolicy(organizationId: string): Promise<SecurityPolicy> {
    try {
      // In a real implementation, you would fetch organization-specific policies
      // For now, return the default policy
      return this.defaultPolicy;
    } catch (error) {
      console.error('Error getting security policy:', error);
      return this.defaultPolicy;
    }
  }

  /**
   * Updates security policy for an organization
   */
  async updateSecurityPolicy(organizationId: string, policy: Partial<SecurityPolicy>): Promise<void> {
    try {
      // In a real implementation, you would update the policy in the database
      console.log(`Updating security policy for organization ${organizationId}:`, policy);
    } catch (error) {
      console.error('Error updating security policy:', error);
      throw error;
    }
  }
}

export const securityService = new SecurityService();

