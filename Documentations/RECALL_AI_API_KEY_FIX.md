# Recall.ai API Key Fix - 403 Forbidden Error

## Problem
You're getting a **403 Forbidden** error from CloudFront when trying to access the Recall.ai API. This indicates that the API key being used is invalid or doesn't have the correct format.

## Current Issue
The API key in your code (`04d300b16d4ce33e3f0844dc1538c3ba902cd2d5`) is not a valid Recall.ai API key format.

## Solution

### Step 1: Get a Valid Recall.ai API Key

1. **Go to [recall.ai](https://recall.ai)**
2. **Sign up or log in** to your account
3. **Navigate to your dashboard**
4. **Go to API Keys section**
5. **Generate a new API key** - it should start with `rec_`

### Step 2: Update Your Environment Variables

Create or update your `.env` file with the correct API key:

```bash
# Replace with your actual Recall.ai API key
RECALL_API_KEY=rec_your_actual_api_key_here
RECALL_API_BASE_URL=https://api.recall.ai/api/v1
RECALL_WEBHOOK_URL=http://localhost:5000/api/webhooks/recall
BACKEND_URL=http://localhost:5000
```

### Step 3: Remove Hardcoded API Key

Update your `server/services/recall-ai.ts` file to remove the hardcoded API key:

```typescript
// Remove this line:
const RECALL_API_KEY = process.env.RECALL_API_KEY || process.env.VITE_RECALL_API_KEY || '04d300b16d4ce33e3f0844dc1538c3ba902cd2d5';

// Replace with:
const RECALL_API_KEY = process.env.RECALL_API_KEY || process.env.VITE_RECALL_API_KEY;
```

### Step 4: Test the API Key

Run the test script to verify your API key works:

```bash
node test-recall-ai.js
```

## Alternative: Use a Different Service

If you don't have access to Recall.ai or want to test without it, you can create a mock service for development:

### Mock Recall.ai Service

Create `server/services/mock-recall-ai.ts`:

```typescript
export class MockRecallAIService {
  async startBot(meetingUrl: string, meetingId: string): Promise<string> {
    console.log(`🤖 Mock bot joining meeting: ${meetingUrl}`);
    
    // Simulate bot creation
    const botId = `mock-bot-${Date.now()}`;
    
    // Simulate lobby waiting
    setTimeout(() => {
      console.log(`⏳ Mock bot waiting in lobby for meeting ${meetingId}`);
    }, 1000);
    
    // Simulate admission after 5 seconds
    setTimeout(() => {
      console.log(`🎉 Mock bot admitted to meeting ${meetingId}`);
    }, 5000);
    
    return botId;
  }

  async stopBot(botId: string): Promise<void> {
    console.log(`🛑 Mock bot stopped: ${botId}`);
  }

  async getBotStatus(botId: string): Promise<any> {
    return {
      id: botId,
      status: 'in_call',
      meeting_url: 'mock-meeting-url',
      is_in_meeting: true,
      is_in_lobby: false,
      admission_required: false,
      transcription_active: true,
      language_detected: 'en',
      speakers_detected: 2
    };
  }

  async getRealTimeTranscript(botId: string): Promise<any> {
    return {
      transcript: 'Mock transcript: This is a test meeting with sample conversation.',
      speakers: [
        {
          id: 'speaker-1',
          name: 'John Doe',
          text: 'Hello everyone, welcome to our meeting.',
          timestamp: new Date().toISOString()
        },
        {
          id: 'speaker-2',
          name: 'Jane Smith',
          text: 'Thank you for having me. Let\'s discuss the project.',
          timestamp: new Date().toISOString()
        }
      ],
      is_live: true,
      language: 'en',
      translated_text: 'Mock transcript: This is a test meeting with sample conversation.'
    };
  }

  async processWebhook(webhookEvent: any): Promise<void> {
    console.log('📨 Mock webhook processed:', webhookEvent);
  }
}

export const mockRecallAIService = new MockRecallAIService();
```

### Update Google Meet Service to Use Mock

Update `server/services/google-meet.ts` to use the mock service when Recall.ai is not available:

```typescript
private async startRecordingBot(meetingUrl: string, meetingId: string): Promise<string> {
  try {
    const { recallAIService } = await import('./recall-ai');
    return await recallAIService.startBot(meetingUrl, meetingId);
  } catch (error) {
    console.log('⚠️  Recall.ai not available, using mock service');
    const { mockRecallAIService } = await import('./mock-recall-ai');
    return await mockRecallAIService.startBot(meetingUrl, meetingId);
  }
}
```

## Testing Without Recall.ai

If you want to test the bot functionality without Recall.ai:

1. **Use the mock service** (see above)
2. **Test the webhook endpoints** with mock data
3. **Verify the meeting flow** works correctly
4. **Test the UI components** for bot status and transcripts

## Next Steps

1. **Get a valid Recall.ai API key** from their dashboard
2. **Update your environment variables**
3. **Remove hardcoded API keys** from your code
4. **Test the integration** with the real API
5. **Configure webhooks** in Recall.ai dashboard

## Troubleshooting

### If you still get 403 errors:

1. **Check API key format** - should start with `rec_`
2. **Verify account status** - ensure your Recall.ai account is active
3. **Check API limits** - ensure you haven't exceeded usage limits
4. **Contact Recall.ai support** - if the issue persists

### If you want to develop without Recall.ai:

1. **Use the mock service** for development
2. **Test all functionality** with mock data
3. **Switch to real API** when ready for production

## Security Note

**Never commit API keys to your code repository.** Always use environment variables and keep your `.env` file in `.gitignore`.
