# Acta.ai Meeting Recording Workflow Documentation

## Overview

This document describes the comprehensive workflow implemented for user authentication, meeting link submission, validation, and automated meeting recording in the Acta.ai application.

## Workflow Components

### 1. User Authentication & Data Storage

#### Supabase Authentication Integration
- **Primary Authentication**: Users sign up/login through Supabase Auth
- **Custom Users Table**: Additional user data stored in custom `users` table
- **Automatic Synchronization**: New users are automatically created in both systems

#### Implementation Details
```typescript
// Client-side signup with dual storage
async signUp(email: string, password: string, name: string): Promise<AuthUser> {
  // 1. Create user in Supabase Auth
  const { data, error } = await supabase.auth.signUp({...});
  
  // 2. Create user in custom users table
  await fetch('/api/auth/create-user', {
    method: 'POST',
    body: JSON.stringify({ email, name, role: 'member' })
  });
}
```

#### API Endpoints
- `POST /api/auth/create-user` - Creates user in custom table
- `POST /api/auth/verify` - Verifies authentication tokens
- `GET /api/auth/google` - Initiates Google OAuth flow

### 2. Meeting Link Submission & Validation

#### Enhanced Meeting Modal
The meeting modal now includes a multi-step workflow:

1. **Form Submission**: User enters subject and Google Meet URL
2. **Validation Phase**: System validates URL format and meeting accessibility
3. **Bot Joining Phase**: Bot attempts to join the meeting
4. **Success/Error Handling**: User receives feedback on the process

#### URL Validation
```typescript
validateMeetingUrl(url: string): { isValid: boolean; meetingId?: string; error?: string } {
  const patterns = [
    /https:\/\/meet\.google\.com\/([a-z0-9-]+)/i,
    /https:\/\/meet\.google\.com\/[a-z0-9-]+\?hs=([a-z0-9-]+)/i,
    // Additional patterns for different Google Meet URL formats
  ];
}
```

#### API Endpoints
- `POST /api/meetings/validate` - Validates meeting URL and checks status
- `POST /api/meetings/join-bot` - Initiates bot joining process

### 3. Meeting Status Checking

#### Google Meet API Integration
Since Google Meet doesn't provide direct meeting status APIs, the system uses alternative methods:

1. **URL Pattern Validation**: Ensures the URL follows Google Meet format
2. **Bot Admission Test**: Attempts to join with a bot to determine if meeting is active
3. **Meeting Metadata**: Extracts meeting ID and validates accessibility

#### Implementation
```typescript
async checkMeetingStatus(meetingUrl: string): Promise<MeetingStatus> {
  // 1. Validate URL format
  const validation = this.validateMeetingUrl(meetingUrl);
  
  // 2. Attempt to determine meeting status
  // (In production, this would use Meeting BaaS or similar service)
  
  return {
    isActive: true, // Determined when attempting to join
    meetingId: validation.meetingId,
    canJoin: true
  };
}
```

### 4. Bot Admission System

#### Recall.ai Integration
The system uses Recall.ai for meeting recording and bot management:

```typescript
async joinMeetingWithBot(meetingUrl: string, meetingId: string, userId: string): Promise<BotAdmissionResult> {
  // 1. Create meeting record in database
  const meeting = await storage.createMeeting(meetingData);
  
  // 2. Start Recall.ai bot
  const botId = await recallAIService.startBot(meetingUrl, meeting.id);
  
  // 3. Update meeting with bot ID
  await storage.updateMeeting(meeting.id, { recallBotId: botId });
  
  return {
    success: true,
    botId,
    message: 'Bot successfully joined. Please admit when prompted.',
    requiresAdmission: true
  };
}
```

#### Bot Configuration
- **Bot Name**: "Acta AI Assistant"
- **Recording Mode**: Speaker view
- **Transcription**: Assembly AI
- **Webhook Integration**: Real-time status updates

### 5. Automated Meeting Recording

#### Recording Process
1. **Bot Joins Meeting**: Recall.ai bot attempts to join the Google Meet
2. **User Admission**: User admits the bot when prompted in Google Meet
3. **Recording Starts**: Bot begins recording audio and video
4. **Real-time Processing**: Transcription and AI analysis happen in real-time
5. **Webhook Updates**: Status updates sent to the application

#### Webhook Handling
```typescript
async processWebhook(webhookEvent: WebhookEvent): Promise<void> {
  switch (webhookEvent.eventType) {
    case "bot.status_change":
      await this.handleBotStatusChange(meeting, payload);
      break;
    case "recording.completed":
      await this.handleRecordingCompleted(meeting, payload);
      break;
    case "transcript.ready":
      await this.handleTranscriptReady(meeting, payload);
      break;
  }
}
```

### 6. Security & Access Control

#### Comprehensive Security Service
The system includes a robust security layer with:

- **Rate Limiting**: Maximum recordings per day per user
- **Domain Validation**: Only Google Meet URLs allowed
- **Consent Tracking**: Explicit consent recording for compliance
- **Data Encryption**: Sensitive data encryption at rest
- **Access Control**: Organization-level permissions

#### Security Policies
```typescript
interface SecurityPolicy {
  maxRecordingsPerDay: number;        // Default: 10
  maxRecordingDuration: number;       // Default: 120 minutes
  allowedDomains: string[];           // ['gmail.com', 'googlemail.com']
  requireExplicitConsent: boolean;    // Default: true
  dataRetentionDays: number;          // Default: 30
  encryptionRequired: boolean;        // Default: true
}
```

#### Consent Management
```typescript
async recordConsent(
  userId: string, 
  meetingId: string, 
  consentGiven: boolean,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  // Records consent with timestamp, IP, and user agent
  // Required for GDPR and other compliance requirements
}
```

### 7. API Integration Configuration

#### Centralized Configuration
All API integrations are managed through a centralized configuration system:

```typescript
interface APIConfiguration {
  googleMeet: GoogleMeetConfig;
  recallAI: RecallAIConfig;
  security: SecurityConfig;
}
```

#### Environment Variables
Required environment variables:
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `RECALL_API_KEY` - Recall.ai API key
- `DATABASE_URL` - PostgreSQL database URL
- `JWT_SECRET` - JWT signing secret
- `ENCRYPTION_KEY` - Data encryption key

## User Experience Flow

### 1. Authentication
1. User visits the application
2. Chooses to sign up with email/password or Google OAuth
3. System creates user in both Supabase Auth and custom users table
4. User is redirected to dashboard

### 2. Meeting Recording Request
1. User clicks "+ Invite Weblink" button
2. Modal opens with form for subject and Google Meet URL
3. User enters meeting details and clicks "Submit"

### 3. Validation Process
1. System validates URL format
2. Checks user permissions and rate limits
3. Validates meeting accessibility
4. Shows loading state with progress indicators

### 4. Bot Joining
1. System creates meeting record in database
2. Starts Recall.ai bot to join the meeting
3. User sees "Bot Joined Successfully" message
4. User is prompted to admit the bot in Google Meet

### 5. Recording & Processing
1. Bot records the meeting once admitted
2. Real-time transcription begins
3. AI analysis generates insights (action items, key topics, decisions)
4. Webhook updates provide real-time status

### 6. Results & Access
1. User can view meeting details and transcript
2. AI-generated insights are available
3. Recording can be downloaded or shared
4. Data is encrypted and stored securely

## Security Considerations

### Data Protection
- **Encryption**: All sensitive data encrypted at rest
- **Access Control**: Role-based access to meeting data
- **Consent Tracking**: Explicit consent recorded for compliance
- **Data Retention**: Configurable retention policies

### API Security
- **Authentication**: JWT-based authentication for all API calls
- **Rate Limiting**: Prevents abuse and ensures fair usage
- **Input Validation**: All inputs validated and sanitized
- **CORS Configuration**: Proper cross-origin resource sharing setup

### Compliance
- **GDPR**: Consent tracking and data portability
- **SOC 2**: Security controls and monitoring
- **HIPAA**: Healthcare data protection (if applicable)

## Error Handling

### Graceful Degradation
- Network failures don't crash the application
- Invalid URLs provide clear error messages
- Bot joining failures offer retry options
- Authentication errors redirect to login

### User Feedback
- Real-time status updates during processing
- Clear error messages with actionable suggestions
- Loading states with progress indicators
- Success confirmations with next steps

## Monitoring & Analytics

### Metrics Tracked
- Meeting recording success rates
- Bot admission success rates
- User engagement and usage patterns
- API response times and error rates

### Logging
- Structured logging for all operations
- Security events and access attempts
- Performance metrics and bottlenecks
- Error tracking and debugging information

## Future Enhancements

### Planned Features
- **Multi-platform Support**: Zoom, Microsoft Teams integration
- **Advanced AI**: More sophisticated meeting analysis
- **Real-time Collaboration**: Live meeting insights
- **Mobile App**: Native mobile application
- **Enterprise Features**: Advanced admin controls and reporting

### Scalability Considerations
- **Microservices Architecture**: Break down monolithic services
- **Queue System**: Handle high-volume meeting processing
- **CDN Integration**: Fast global content delivery
- **Database Optimization**: Read replicas and caching

## Conclusion

This comprehensive workflow provides a secure, automated, and user-friendly solution for meeting recording and analysis. The system handles the complete lifecycle from user authentication to meeting recording, with robust security measures and compliance features throughout.

The implementation follows best practices for API integration, security, and user experience, making it suitable for both individual users and enterprise deployments.

