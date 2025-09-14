# Recall.ai Bot Setup Guide

This guide explains how to set up and configure the enhanced Recall.ai bot for real-time meeting transcription with automatic English translation.

## Features

The enhanced bot includes:

1. **Lobby Waiting** - Bot waits in the meeting lobby until admitted by the host
2. **Real-time Transcription** - Captures meeting transcript as it happens
3. **Automatic Translation** - Translates any language to English automatically
4. **Speaker Identification** - Identifies different speakers in the meeting
5. **Live Updates** - Real-time webhook updates for bot status and transcript

## Setup Instructions

### 1. Get Recall.ai API Key

1. **Sign up** at [recall.ai](https://recall.ai)
2. **Create an account** and verify your email
3. **Navigate to API Keys** in your dashboard
4. **Generate a new API key** for your application
5. **Copy the API key** (it starts with `rec_`)

### 2. Configure Environment Variables

Add the following to your `.env` file:

```bash
# Recall.ai Configuration
RECALL_API_KEY=rec_your_actual_api_key_here
RECALL_API_BASE_URL=https://api.recall.ai/api/v1
RECALL_WEBHOOK_URL=http://localhost:5000/api/webhooks/recall

# Backend URL for webhooks (update for production)
BACKEND_URL=http://localhost:5000
```

### 3. Update Production Environment

For production deployment, update these variables:

```bash
# Production Recall.ai Configuration
RECALL_API_KEY=rec_your_production_api_key
RECALL_WEBHOOK_URL=https://yourdomain.com/api/webhooks/recall
BACKEND_URL=https://yourdomain.com
```

### 4. Configure Webhook URL in Recall.ai Dashboard

1. **Go to your Recall.ai dashboard**
2. **Navigate to Webhooks section**
3. **Add webhook URL**: `https://yourdomain.com/api/webhooks/recall`
4. **Enable the following events**:
   - `bot.status_change`
   - `bot.admitted`
   - `bot.in_lobby`
   - `transcript.live`
   - `transcript.translated`
   - `recording.completed`
   - `transcript.ready`

## Bot Behavior

### Meeting Flow

1. **User submits meeting URL** → Bot is created and joins meeting lobby
2. **Bot waits in lobby** → Status: `waiting_for_admission`
3. **Host admits bot** → Status: `in_progress`, transcription starts
4. **Real-time transcription** → Live transcript updates via webhooks
5. **Automatic translation** → All speech translated to English
6. **Meeting ends** → Status: `completed`, final transcript available

### Bot Configuration

The bot is configured with:

```json
{
  "bot_name": "Acta AI Assistant",
  "recording_mode": "speaker_view",
  "transcription_options": {
    "provider": "assembly_ai",
    "real_time_transcription": true,
    "translation": {
      "target_language": "en",
      "source_language": "auto"
    },
    "language_detection": true,
    "speaker_diarization": true,
    "punctuation": true,
    "formatting": true
  },
  "bot_settings": {
    "wait_for_admission": true,
    "join_as_participant": true,
    "real_time_features": {
      "live_transcript": true,
      "live_translation": true,
      "speaker_identification": true
    }
  }
}
```

## API Endpoints

### Get Real-time Transcript

```bash
GET /api/meetings/:id/transcript/live
Authorization: Bearer <token>
```

Response:
```json
{
  "meetingId": "meeting-id",
  "transcript": "Live transcript text...",
  "speakers": [
    {
      "id": "speaker-1",
      "name": "John Doe",
      "text": "Hello everyone",
      "timestamp": "2025-01-01T10:00:00Z"
    }
  ],
  "isLive": true,
  "language": "en",
  "translatedText": "Translated text if original was not English",
  "timestamp": "2025-01-01T10:00:00Z"
}
```

### Get Bot Status

```bash
GET /api/meetings/:id/bot/status
Authorization: Bearer <token>
```

Response:
```json
{
  "meetingId": "meeting-id",
  "botStatus": {
    "id": "bot-id",
    "status": "in_call",
    "is_in_meeting": true,
    "is_in_lobby": false,
    "admission_required": false,
    "transcription_active": true,
    "language_detected": "en",
    "speakers_detected": 3
  },
  "timestamp": "2025-01-01T10:00:00Z"
}
```

## Webhook Events

The system handles these webhook events:

### Bot Events
- `bot.status_change` - Bot status changed (lobby → admitted → in_call)
- `bot.admitted` - Bot was admitted to the meeting
- `bot.in_lobby` - Bot is waiting in the lobby

### Transcript Events
- `transcript.live` - Real-time transcript update
- `transcript.translated` - Translated transcript available
- `transcript.ready` - Final transcript is ready

### Recording Events
- `recording.completed` - Meeting recording finished

## Testing

### 1. Test API Key

```bash
# Test if API key is working
curl -H "Authorization: Bearer YOUR_RECALL_API_KEY" \
     https://api.recall.ai/api/v1/bot
```

### 2. Test Bot Creation

```bash
# Create a test bot
curl -X POST https://api.recall.ai/api/v1/bot \
  -H "Authorization: Bearer YOUR_RECALL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "meeting_url": "https://meet.google.com/test-meeting",
    "bot_name": "Test Bot",
    "recording_mode": "speaker_view"
  }'
```

### 3. Test Webhook

```bash
# Test webhook endpoint
curl -X POST http://localhost:5000/api/webhooks/recall \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "bot.status_change",
    "payload": {
      "status": "in_call",
      "bot_id": "test-bot-id"
    }
  }'
```

## Troubleshooting

### Common Issues

#### 1. "Recall.ai API key not configured"

**Solution**: Set the `RECALL_API_KEY` environment variable with a valid API key from recall.ai

#### 2. "401 Unauthorized" from Recall.ai

**Solution**: 
- Verify your API key is correct
- Check if your Recall.ai account is active
- Ensure you have sufficient credits

#### 3. Bot not joining meeting

**Solution**:
- Check if the meeting URL is valid
- Verify the meeting is active
- Ensure the bot has permission to join

#### 4. No webhook events received

**Solution**:
- Verify webhook URL is accessible from internet
- Check webhook configuration in Recall.ai dashboard
- Ensure webhook events are enabled

### Debug Steps

1. **Check server logs** for bot creation and webhook events
2. **Verify environment variables** are set correctly
3. **Test API key** with a simple curl request
4. **Check webhook URL** is accessible
5. **Monitor Recall.ai dashboard** for bot status

## Production Considerations

### Security
- Use HTTPS for webhook URLs
- Validate webhook signatures (if available)
- Rate limit webhook endpoints
- Store API keys securely

### Performance
- Implement webhook retry logic
- Cache transcript data appropriately
- Monitor API rate limits
- Handle webhook failures gracefully

### Monitoring
- Log all bot events
- Monitor transcription accuracy
- Track API usage and costs
- Set up alerts for failures

## Cost Considerations

Recall.ai pricing typically includes:
- **Per-minute transcription** costs
- **Translation** costs (if using premium features)
- **Storage** costs for recordings
- **API call** costs

Monitor your usage in the Recall.ai dashboard to manage costs effectively.

## Support

For issues with:
- **Recall.ai API**: Contact Recall.ai support
- **Bot configuration**: Check this documentation
- **Webhook issues**: Verify webhook URL and events
- **Integration problems**: Check server logs and API responses
