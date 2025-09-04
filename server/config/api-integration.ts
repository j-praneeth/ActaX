import { google } from 'googleapis';

export interface APIConfiguration {
  googleMeet: GoogleMeetConfig;
  recallAI: RecallAIConfig;
  security: SecurityConfig;
}

export interface GoogleMeetConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
  apiKey?: string;
}

export interface RecallAIConfig {
  apiKey: string;
  baseUrl: string;
  webhookUrl: string;
  botName: string;
  recordingMode: 'speaker_view' | 'gallery_view' | 'shared_screen';
  transcriptionProvider: 'assembly_ai' | 'deepgram' | 'rev';
}

export interface SecurityConfig {
  encryptionKey: string;
  jwtSecret: string;
  rateLimitWindow: number; // in milliseconds
  maxRequestsPerWindow: number;
  allowedOrigins: string[];
  corsOptions: {
    origin: string | string[];
    credentials: boolean;
    methods: string[];
    allowedHeaders: string[];
  };
}

class APIConfigurationManager {
  private config: APIConfiguration;

  constructor() {
    this.config = this.loadConfiguration();
  }

  private loadConfiguration(): APIConfiguration {
    return {
      googleMeet: {
        clientId: process.env.GOOGLE_CLIENT_ID || '917455473484-gqhhte5990hnk9qq5a7fdfpl4ugkj2mr.apps.googleusercontent.com',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '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',
        redirectUri: process.env.GOOGLE_REDIRECT_URI || `${process.env.FRONTEND_URL}/api/auth/google/callback`,
        scopes: [
          'https://www.googleapis.com/auth/calendar',
          'https://www.googleapis.com/auth/calendar.events',
          'https://www.googleapis.com/auth/meetings.space.created',
          'https://www.googleapis.com/auth/meetings.space.readonly'
        ],
        apiKey: process.env.GOOGLE_API_KEY
      },
      recallAI: {
        apiKey: process.env.RECALL_API_KEY || "32bd623de16c5e9a4520ed8c42085f3f9f9ceccd",
        baseUrl: process.env.RECALL_API_BASE_URL || 'https://api.recall.ai/api/v1',
        webhookUrl: process.env.RECALL_WEBHOOK_URL || `${process.env.BACKEND_URL}/api/webhooks/recall`,
        botName: process.env.RECALL_BOT_NAME || 'Acta AI Assistant',
        recordingMode: (process.env.RECALL_RECORDING_MODE as any) || 'speaker_view',
        transcriptionProvider: (process.env.RECALL_TRANSCRIPTION_PROVIDER as any) || 'assembly_ai'
      },
      security: {
        encryptionKey: process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production',
        jwtSecret: process.env.JWT_SECRET || 'default-jwt-secret-change-in-production',
        rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15 minutes
        maxRequestsPerWindow: parseInt(process.env.MAX_REQUESTS_PER_WINDOW || '100'),
        allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:5000').split(','),
        corsOptions: {
          origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5000'],
          credentials: true,
          methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
          allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
        }
      }
    };
  }

  /**
   * Validates that all required configuration is present
   */
  validateConfiguration(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate Google Meet configuration
    if (!this.config.googleMeet.clientId) {
      errors.push('GOOGLE_CLIENT_ID is required');
    }
    if (!this.config.googleMeet.clientSecret) {
      errors.push('GOOGLE_CLIENT_SECRET is required');
    }

    // Validate Recall.ai configuration
    if (!this.config.recallAI.apiKey) {
      errors.push('RECALL_API_KEY is required');
    }

    // Validate security configuration
    if (this.config.security.encryptionKey === 'default-encryption-key-change-in-production') {
      errors.push('ENCRYPTION_KEY should be changed from default value in production');
    }
    if (this.config.security.jwtSecret === 'default-jwt-secret-change-in-production') {
      errors.push('JWT_SECRET should be changed from default value in production');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Gets the complete configuration
   */
  getConfiguration(): APIConfiguration {
    return this.config;
  }

  /**
   * Gets Google Meet configuration
   */
  getGoogleMeetConfig(): GoogleMeetConfig {
    return this.config.googleMeet;
  }

  /**
   * Gets Recall.ai configuration
   */
  getRecallAIConfig(): RecallAIConfig {
    return this.config.recallAI;
  }

  /**
   * Gets security configuration
   */
  getSecurityConfig(): SecurityConfig {
    return this.config.security;
  }

  /**
   * Creates a configured Google OAuth2 client
   */
  createGoogleOAuth2Client() {
    const { clientId, clientSecret, redirectUri } = this.config.googleMeet;
    
    return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  }

  /**
   * Creates a configured Google API client with authentication
   */
  async createAuthenticatedGoogleClient(accessToken: string) {
    const oauth2Client = this.createGoogleOAuth2Client();
    oauth2Client.setCredentials({ access_token: accessToken });
    
    return {
      calendar: google.calendar({ version: 'v3', auth: oauth2Client }),
      oauth2: google.oauth2({ version: 'v2', auth: oauth2Client })
    };
  }

  /**
   * Updates configuration at runtime (for testing or dynamic configuration)
   */
  updateConfiguration(updates: Partial<APIConfiguration>): void {
    this.config = {
      ...this.config,
      ...updates,
      googleMeet: { ...this.config.googleMeet, ...updates.googleMeet },
      recallAI: { ...this.config.recallAI, ...updates.recallAI },
      security: { ...this.config.security, ...updates.security }
    };
  }

  /**
   * Gets environment-specific configuration
   */
  getEnvironmentConfig(): {
    environment: string;
    isDevelopment: boolean;
    isProduction: boolean;
    isTest: boolean;
  } {
    const environment = process.env.NODE_ENV || 'development';
    
    return {
      environment,
      isDevelopment: environment === 'development',
      isProduction: environment === 'production',
      isTest: environment === 'test'
    };
  }

  /**
   * Gets database configuration
   */
  getDatabaseConfig(): {
    url: string;
    ssl: boolean;
    maxConnections: number;
    connectionTimeout: number;
  } {
    return {
      url: process.env.DATABASE_URL || 'postgresql://localhost:5432/actax_ai',
      ssl: process.env.NODE_ENV === 'production',
      maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '10'),
      connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30000')
    };
  }

  /**
   * Gets logging configuration
   */
  getLoggingConfig(): {
    level: string;
    format: string;
    enableConsole: boolean;
    enableFile: boolean;
    filePath?: string;
  } {
    return {
      level: process.env.LOG_LEVEL || 'info',
      format: process.env.LOG_FORMAT || 'json',
      enableConsole: process.env.LOG_CONSOLE !== 'false',
      enableFile: process.env.LOG_FILE === 'true',
      filePath: process.env.LOG_FILE_PATH
    };
  }
}

export const apiConfig = new APIConfigurationManager();

/**
 * Validates API configuration on startup
 */
export function validateAPIConfiguration(): void {
  const validation = apiConfig.validateConfiguration();
  
  if (!validation.valid) {
    console.error('API Configuration validation failed:');
    validation.errors.forEach(error => console.error(`  - ${error}`));
    
    if (apiConfig.getEnvironmentConfig().isProduction) {
      throw new Error('Invalid API configuration in production environment');
    } else {
      console.warn('Continuing with invalid configuration in non-production environment');
    }
  } else {
    console.log('API Configuration validation passed');
  }
}

/**
 * Gets required environment variables for the application
 */
export function getRequiredEnvironmentVariables(): string[] {
  return [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'RECALL_API_KEY',
    'DATABASE_URL',
    'JWT_SECRET',
    'ENCRYPTION_KEY'
  ];
}

/**
 * Checks if all required environment variables are set
 */
export function checkEnvironmentVariables(): { allSet: boolean; missing: string[] } {
  const required = getRequiredEnvironmentVariables();
  const missing = required.filter(varName => !process.env[varName]);
  
  return {
    allSet: missing.length === 0,
    missing
  };
}

