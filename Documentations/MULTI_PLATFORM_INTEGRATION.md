# Multi-Platform Meeting Integration

This document describes the comprehensive integration of Google Meet, Zoom, and Microsoft Teams meeting platforms into the ActaX-ai project.

## Overview

The project now supports three major meeting platforms with full feature parity:

- **Google Meet** - Original integration with enhanced features
- **Zoom** - New integration with complete feature parity
- **Microsoft Teams** - New integration with complete feature parity

## Architecture

### Service Layer

Each platform has its own dedicated service following the same standardized pattern:

```
server/services/
├── google-meet.ts      # Google Meet integration
├── zoom-meet.ts        # Zoom integration
├── teams-meet.ts       # Microsoft Teams integration
└── recall-ai.ts        # Shared bot service
```

### Common Interface

All platform services implement the same interface:

```typescript
interface MeetingService {
  validateMeetingUrl(url: string): { isValid: boolean; meetingId?: string; error?: string };
  checkMeetingStatus(url: string, accessToken?: string): Promise<MeetingStatus>;
  joinMeetingWithBot(url: string, meetingId: string, userId: string): Promise<BotAdmissionResult>;
  getMeetingRecordingStatus(meetingId: string): Promise<RecordingStatus>;
  stopMeetingRecording(meetingId: string): Promise<{ success: boolean; message: string }>;
  validateMeetingAccess(url: string, userId: string, ipAddress?: string, userAgent?: string): Promise<AccessResult>;
}
```

## Platform-Specific Features

### Google Meet Integration

**URL Patterns Supported:**
- `https://meet.google.com/{meeting-id}`
- `https://meet.google.com/{meeting-id}?hs={hash}`
- `https://meet.google.com/{meeting-id}?pli=1&authuser=0&hs={hash}`

**Features:**
- OAuth2 authentication with Google Calendar API
- Meeting creation via Google Calendar
- Bot admission with lobby waiting
- Real-time transcript monitoring
- Integration with Google Workspace

### Zoom Integration

**URL Patterns Supported:**
- `https://zoom.us/j/{meeting-id}`
- `https://{subdomain}.zoom.us/j/{meeting-id}`
- `https://zoom.us/my/{personal-room-id}`
- `https://{subdomain}.zoom.us/s/{meeting-id}`

**Features:**
- JWT-based authentication with Zoom API
- Meeting creation via Zoom API
- Bot admission with lobby waiting
- Real-time transcript monitoring
- Integration with Zoom Marketplace

### Microsoft Teams Integration

**URL Patterns Supported:**
- `https://teams.microsoft.com/l/meetup-join/{encoded-meeting-id}`
- `https://teams.live.com/meet/{meeting-id}`
- `https://{tenant}.teams.microsoft.com/l/meetup-join/{encoded-meeting-id}`

**Features:**
- OAuth2 authentication with Microsoft Graph API
- Meeting creation via Microsoft Graph
- Bot admission with lobby waiting
- Real-time transcript monitoring
- Integration with Microsoft 365

## API Endpoints

### Universal Endpoints

All platforms use the same API endpoints with automatic platform detection:

#### Validate Meeting
```http
POST /api/meetings/validate
Content-Type: application/json

{
  "url": "https://meet.google.com/abc-def-ghi"
}
```

**Response:**
```json
{
  "isActive": true,
  "meetingId": "abc-def-ghi",
  "canJoin": true,
  "message": "Meeting is active and ready for recording"
}
```

#### Join Meeting with Bot
```http
POST /api/meetings/join-bot
Content-Type: application/json

{
  "url": "https://zoom.us/j/123456789",
  "subject": "Team Meeting",
  "meetingId": "123456789"
}
```

**Response:**
```json
{
  "success": true,
  "botId": "bot_abc123",
  "message": "Bot successfully joined the meeting lobby. Please admit the bot when prompted to start real-time transcription.",
  "requiresAdmission": true
}
```

#### Get Recording Status
```http
GET /api/meetings/{meetingId}/recording-status
```

**Response:**
```json
{
  "isRecording": true,
  "hasTranscript": true,
  "transcript": "Meeting transcript content...",
  "summary": "Meeting summary...",
  "actionItems": ["Action item 1", "Action item 2"]
}
```

#### Stop Recording
```http
POST /api/meetings/{meetingId}/stop-recording
```

**Response:**
```json
{
  "success": true,
  "message": "Recording stopped successfully"
}
```

## Configuration

### Environment Variables

#### Google Meet
```bash
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
GOOGLE_API_KEY=your_google_api_key
```

#### Zoom
```bash
ZOOM_API_KEY=your_zoom_api_key
ZOOM_API_SECRET=your_zoom_api_secret
ZOOM_API_BASE_URL=https://api.zoom.us/v2
ZOOM_WEBHOOK_URL=http://localhost:5000/api/webhooks/zoom
```

#### Microsoft Teams
```bash
MICROSOFT_CLIENT_ID=your_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret
MICROSOFT_TENANT_ID=your_tenant_id
MICROSOFT_GRAPH_BASE_URL=https://graph.microsoft.com/v1.0
MICROSOFT_WEBHOOK_URL=http://localhost:5000/api/webhooks/teams
```

#### Recall.ai (Shared)
```bash
RECALL_API_KEY=your_recall_api_key
RECALL_API_BASE_URL=https://api.recall.ai/api/v1
RECALL_WEBHOOK_URL=http://localhost:5000/api/webhooks/recall
```

## Frontend Integration

### Platform Detection

The frontend automatically detects the meeting platform based on the URL:

```typescript
const getPlatformInfo = (url: string): PlatformInfo | null => {
  if (url.includes('meet.google.com')) {
    return {
      name: 'Google Meet',
      icon: <Video className="w-5 h-5" />,
      color: 'text-blue-600',
      description: 'Google Meet meeting'
    };
  } else if (url.includes('zoom.us') || url.includes('zoom.com')) {
    return {
      name: 'Zoom',
      icon: <Monitor className="w-5 h-5" />,
      color: 'text-blue-500',
      description: 'Zoom meeting'
    };
  } else if (url.includes('teams.microsoft.com') || url.includes('teams.live.com')) {
    return {
      name: 'Microsoft Teams',
      icon: <Users className="w-5 h-5" />,
      color: 'text-purple-600',
      description: 'Microsoft Teams meeting'
    };
  }
  return null;
};
```

### UI Components

#### Meeting Modal
- Automatic platform detection and validation
- Visual platform indicators
- Platform-specific placeholder text
- Error handling for unsupported platforms

#### Meeting Creation Modal
- Platform selection dropdown with icons
- Platform-specific URL placeholders
- Dynamic help text based on selected platform

## Security Features

### URL Validation
- Comprehensive URL pattern matching for each platform
- Protection against malicious URLs
- Input sanitization and validation

### Access Control
- User authentication required for all operations
- Organization-based access control
- Rate limiting and abuse prevention
- Consent tracking for meeting recordings

### Data Protection
- Encrypted storage of sensitive data
- Secure token management
- Audit logging for all operations

## Error Handling

### Standardized Error Responses

All platforms return consistent error responses:

```json
{
  "success": false,
  "message": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {
    "platform": "google_meet",
    "error": "Detailed error information"
  }
}
```

### Common Error Codes

- `INVALID_URL` - Malformed or unsupported meeting URL
- `PLATFORM_NOT_SUPPORTED` - Unsupported meeting platform
- `AUTHENTICATION_REQUIRED` - User not authenticated
- `ACCESS_DENIED` - User lacks permission
- `MEETING_NOT_FOUND` - Meeting does not exist
- `BOT_ADMISSION_FAILED` - Bot could not join meeting
- `RECORDING_FAILED` - Recording could not be started

## Testing

### Test Suite

Run the comprehensive test suite:

```bash
node test-multi-platform-integration.js
```

### Test Coverage

- Platform detection accuracy
- URL validation for all platforms
- Meeting validation and status checking
- Bot joining and admission
- Recording status monitoring
- Error handling and edge cases
- Security validation
- Frontend integration

## Deployment

### Prerequisites

1. Set up OAuth applications for each platform
2. Configure webhook endpoints
3. Set up Recall.ai account and API key
4. Configure environment variables

### Platform Setup

#### Google Meet
1. Create Google Cloud Project
2. Enable Google Calendar API
3. Create OAuth2 credentials
4. Configure authorized redirect URIs

#### Zoom
1. Create Zoom Marketplace app
2. Configure OAuth settings
3. Set up webhook endpoints
4. Generate JWT credentials

#### Microsoft Teams
1. Register app in Azure AD
2. Configure API permissions
3. Set up webhook endpoints
4. Generate client credentials

## Monitoring and Logging

### Logging Levels

- `INFO` - Normal operations
- `WARN` - Non-critical issues
- `ERROR` - Critical failures
- `DEBUG` - Detailed debugging information

### Metrics

- Meeting creation success rate by platform
- Bot admission success rate
- Recording completion rate
- Error rates by platform and operation type

## Troubleshooting

### Common Issues

#### Bot Not Joining Meeting
1. Check Recall.ai API key configuration
2. Verify meeting URL format
3. Ensure meeting is active
4. Check bot admission permissions

#### Authentication Failures
1. Verify OAuth credentials
2. Check token expiration
3. Validate redirect URIs
4. Ensure proper scopes

#### Recording Issues
1. Check Recall.ai service status
2. Verify webhook configuration
3. Check meeting permissions
4. Validate bot status

### Debug Mode

Enable debug logging:

```bash
LOG_LEVEL=debug npm start
```

## Future Enhancements

### Planned Features

1. **Advanced Analytics** - Platform-specific usage analytics
2. **Custom Bot Names** - Platform-specific bot naming
3. **Recording Quality** - Platform-specific quality settings
4. **Integration Webhooks** - Platform-specific webhook handling
5. **Mobile Support** - Enhanced mobile platform support

### Platform Extensions

1. **Webex Integration** - Cisco Webex support
2. **GoToMeeting Integration** - LogMeIn GoToMeeting support
3. **BlueJeans Integration** - Verizon BlueJeans support

## Support

For technical support or questions about the multi-platform integration:

1. Check the troubleshooting section
2. Review the test suite output
3. Check application logs
4. Contact the development team

## Changelog

### Version 1.0.0
- Initial multi-platform integration
- Google Meet, Zoom, and Microsoft Teams support
- Unified API interface
- Comprehensive test suite
- Security and error handling
- Frontend integration
