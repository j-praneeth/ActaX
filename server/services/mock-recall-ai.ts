import type { WebhookEvent, Meeting } from "@shared/schema";
import { storage } from "../storage";

export interface MockRecallBot {
  id: string;
  meeting_url: string;
  status: string;
  recording_id?: string;
}

export interface MockRecallTranscript {
  id: string;
  transcript_text: string;
  summary?: string;
  action_items?: string[];
  key_topics?: string[];
  decisions?: string[];
  takeaways?: string[];
  sentiment?: string;
}

class MockRecallAIService {
  private bots: Map<string, MockRecallBot> = new Map();
  private transcripts: Map<string, MockRecallTranscript> = new Map();

  async startBot(meetingUrl: string, meetingId: string): Promise<string> {
    console.log(`🤖 Mock bot joining meeting: ${meetingUrl}`);
    
    // Generate a mock bot ID
    const botId = `mock-bot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create mock bot
    const bot: MockRecallBot = {
      id: botId,
      meeting_url: meetingUrl,
      status: 'in_lobby',
      recording_id: `recording-${botId}`
    };
    
    this.bots.set(botId, bot);
    
    // Simulate lobby waiting
    setTimeout(() => {
      console.log(`⏳ Mock bot waiting in lobby for meeting ${meetingId}`);
      this.simulateBotInLobby(botId, meetingId);
    }, 1000);
    
    // Simulate admission after 3 seconds
    setTimeout(() => {
      console.log(`🎉 Mock bot admitted to meeting ${meetingId}`);
      this.simulateBotAdmitted(botId, meetingId);
    }, 3000);
    
    // Simulate transcription after 5 seconds
    setTimeout(() => {
      console.log(`📝 Mock bot starting transcription for meeting ${meetingId}`);
      this.simulateTranscription(botId, meetingId);
    }, 5000);
    
    return botId;
  }

  async stopBot(botId: string): Promise<void> {
    console.log(`🛑 Mock bot stopped: ${botId}`);
    const bot = this.bots.get(botId);
    if (bot) {
      bot.status = 'done';
      this.bots.set(botId, bot);
    }
  }

  async getBotStatus(botId: string): Promise<MockRecallBot> {
    const bot = this.bots.get(botId);
    if (!bot) {
      throw new Error(`Bot ${botId} not found`);
    }
    return bot;
  }

  async getBotStatusDetailed(botId: string): Promise<{
    id: string;
    status: string;
    meeting_url: string;
    recording_id?: string;
    is_in_meeting: boolean;
    is_in_lobby: boolean;
    admission_required: boolean;
    transcription_active: boolean;
    language_detected?: string;
    speakers_detected: number;
  }> {
    const bot = this.bots.get(botId);
    if (!bot) {
      throw new Error(`Bot ${botId} not found`);
    }

    return {
      id: bot.id,
      status: bot.status,
      meeting_url: bot.meeting_url,
      recording_id: bot.recording_id,
      is_in_meeting: bot.status === 'in_call',
      is_in_lobby: bot.status === 'in_lobby',
      admission_required: bot.status === 'in_lobby',
      transcription_active: bot.status === 'in_call',
      language_detected: 'en',
      speakers_detected: 2
    };
  }

  async getTranscript(recordingId: string): Promise<MockRecallTranscript> {
    const transcript = this.transcripts.get(recordingId);
    if (!transcript) {
      throw new Error(`Transcript ${recordingId} not found`);
    }
    return transcript;
  }

  async getRealTimeTranscript(botId: string): Promise<{
    transcript: string;
    speakers: Array<{ id: string; name: string; text: string; timestamp: string }>;
    is_live: boolean;
    language: string;
    translated_text?: string;
  }> {
    const bot = this.bots.get(botId);
    if (!bot) {
      throw new Error(`Bot ${botId} not found`);
    }

    // Generate mock transcript based on bot status
    let transcript = '';
    let speakers: Array<{ id: string; name: string; text: string; timestamp: string }> = [];

    if (bot.status === 'in_lobby') {
      transcript = 'Bot is waiting in the lobby...';
    } else if (bot.status === 'in_call') {
      transcript = 'Welcome to our meeting. Today we will discuss the project timeline and deliverables.';
      speakers = [
        {
          id: 'speaker-1',
          name: 'John Doe',
          text: 'Welcome to our meeting. Today we will discuss the project timeline.',
          timestamp: new Date(Date.now() - 30000).toISOString()
        },
        {
          id: 'speaker-2',
          name: 'Jane Smith',
          text: 'Thank you for having me. Let\'s start with the project overview.',
          timestamp: new Date(Date.now() - 20000).toISOString()
        },
        {
          id: 'speaker-1',
          name: 'John Doe',
          text: 'The project is progressing well. We have completed 60% of the tasks.',
          timestamp: new Date(Date.now() - 10000).toISOString()
        }
      ];
    } else {
      transcript = 'Meeting has ended.';
    }

    return {
      transcript,
      speakers,
      is_live: bot.status === 'in_call',
      language: 'en',
      translated_text: transcript // Mock translation (same as original for English)
    };
  }

  async processWebhook(webhookEvent: WebhookEvent): Promise<void> {
    console.log('📨 Mock webhook processed:', webhookEvent);
    
    // Simulate webhook processing
    const { payload, meetingId } = webhookEvent;
    
    if (!meetingId) {
      console.warn("Mock webhook event has no associated meeting ID");
      return;
    }

    const meeting = await storage.getMeeting(meetingId);
    if (!meeting) {
      console.warn(`Meeting ${meetingId} not found for mock webhook event`);
      return;
    }

    // Handle different webhook event types
    switch (webhookEvent.eventType) {
      case "bot.status_change":
        await this.handleBotStatusChange(meeting, payload);
        break;
      case "bot.admitted":
        await this.handleBotAdmitted(meeting, payload);
        break;
      case "bot.in_lobby":
        await this.handleBotInLobby(meeting, payload);
        break;
      case "transcript.live":
        await this.handleLiveTranscript(meeting, payload);
        break;
      case "transcript.translated":
        await this.handleTranslatedTranscript(meeting, payload);
        break;
      case "recording.completed":
        await this.handleRecordingCompleted(meeting, payload);
        break;
      case "transcript.ready":
        await this.handleTranscriptReady(meeting, payload);
        break;
      default:
        console.log(`Unhandled mock webhook event type: ${webhookEvent.eventType}`);
    }
  }

  private async simulateBotInLobby(botId: string, meetingId: string): Promise<void> {
    const bot = this.bots.get(botId);
    if (bot) {
      bot.status = 'in_lobby';
      this.bots.set(botId, bot);
    }

    // Simulate webhook event
    const webhookEvent: WebhookEvent = {
      id: `webhook-${Date.now()}`,
      eventType: 'bot.in_lobby',
      payload: {
        bot_id: botId,
        status: 'in_lobby',
        meeting_id: meetingId
      },
      meetingId,
      processed: false,
      createdAt: new Date()
    };

    await this.processWebhook(webhookEvent);
  }

  private async simulateBotAdmitted(botId: string, meetingId: string): Promise<void> {
    const bot = this.bots.get(botId);
    if (bot) {
      bot.status = 'in_call';
      this.bots.set(botId, bot);
    }

    // Simulate webhook event
    const webhookEvent: WebhookEvent = {
      id: `webhook-${Date.now()}`,
      eventType: 'bot.admitted',
      payload: {
        bot_id: botId,
        status: 'in_call',
        meeting_id: meetingId
      },
      meetingId,
      processed: false,
      createdAt: new Date()
    };

    await this.processWebhook(webhookEvent);
  }

  private async simulateTranscription(botId: string, meetingId: string): Promise<void> {
    const bot = this.bots.get(botId);
    if (!bot) return;

    // Create mock transcript
    const transcript: MockRecallTranscript = {
      id: `transcript-${botId}`,
      transcript_text: 'Welcome to our meeting. Today we will discuss the project timeline and deliverables. The project is progressing well and we have completed 60% of the tasks.',
      summary: 'Project status meeting discussing timeline and progress.',
      action_items: [
        'Review project timeline',
        'Update task completion status',
        'Schedule next meeting'
      ],
      key_topics: ['Project Timeline', 'Task Completion', 'Next Steps'],
      decisions: [
        'Approved current timeline',
        'Agreed on next milestone date'
      ],
      takeaways: [
        'Project is on track',
        'Team is performing well',
        'Timeline adjustments may be needed'
      ],
      sentiment: 'positive'
    };

    this.transcripts.set(bot.recording_id!, transcript);

    // Simulate live transcript webhook
    const webhookEvent: WebhookEvent = {
      id: `webhook-${Date.now()}`,
      eventType: 'transcript.live',
      payload: {
        bot_id: botId,
        transcript_text: transcript.transcript_text,
        speakers: [
          { id: 'speaker-1', name: 'John Doe' },
          { id: 'speaker-2', name: 'Jane Smith' }
        ],
        language: 'en',
        meeting_id: meetingId
      },
      meetingId,
      processed: false,
      createdAt: new Date()
    };

    await this.processWebhook(webhookEvent);
  }

  private async handleBotStatusChange(meeting: Meeting, payload: any): Promise<void> {
    const botStatus = payload.status;
    
    let meetingStatus = meeting.status;
    if (botStatus === "in_call") {
      meetingStatus = "in_progress";
    } else if (botStatus === "done") {
      meetingStatus = "completed";
    } else if (botStatus === "error") {
      meetingStatus = "failed";
    }

    await storage.updateMeeting(meeting.id, {
      status: meetingStatus,
      startTime: payload.started_at ? new Date(payload.started_at) : meeting.startTime,
      endTime: payload.ended_at ? new Date(payload.ended_at) : meeting.endTime,
    });
  }

  private async handleBotAdmitted(meeting: Meeting, payload: any): Promise<void> {
    console.log(`🎉 Mock bot admitted to meeting ${meeting.id}`);
    
    await storage.updateMeeting(meeting.id, {
      status: "in_progress",
      startTime: new Date(),
    });
  }

  private async handleBotInLobby(meeting: Meeting, payload: any): Promise<void> {
    console.log(`⏳ Mock bot waiting in lobby for meeting ${meeting.id}`);
    
    await storage.updateMeeting(meeting.id, {
      status: "waiting_for_admission",
    });
  }

  private async handleLiveTranscript(meeting: Meeting, payload: any): Promise<void> {
    console.log(`📝 Mock live transcript update for meeting ${meeting.id}`);
    
    const liveTranscript = {
      text: payload.transcript_text,
      speakers: payload.speakers || [],
      timestamp: new Date(),
      language: payload.language || 'en',
      translated: payload.translated_text || null
    };

    await storage.updateMeeting(meeting.id, {
      transcript: JSON.stringify(liveTranscript),
    });
  }

  private async handleTranslatedTranscript(meeting: Meeting, payload: any): Promise<void> {
    console.log(`🌐 Mock translated transcript received for meeting ${meeting.id}`);
    
    const translatedTranscript = {
      original_text: payload.original_text,
      translated_text: payload.translated_text,
      source_language: payload.source_language,
      target_language: payload.target_language,
      timestamp: new Date()
    };

    await storage.updateMeeting(meeting.id, {
      summary: JSON.stringify(translatedTranscript),
    });
  }

  private async handleRecordingCompleted(meeting: Meeting, payload: any): Promise<void> {
    await storage.updateMeeting(meeting.id, {
      status: "completed",
      endTime: new Date(),
    });
  }

  private async handleTranscriptReady(meeting: Meeting, payload: any): Promise<void> {
    try {
      const recordingId = payload.recording_id;
      if (!recordingId) return;

      const transcript = this.transcripts.get(recordingId);
      if (!transcript) return;
      
      await storage.updateMeeting(meeting.id, {
        transcript: transcript.transcript_text,
        summary: transcript.summary,
        actionItems: transcript.action_items || [],
        keyTopics: transcript.key_topics || [],
        decisions: transcript.decisions || [],
        takeaways: transcript.takeaways || [],
        sentiment: transcript.sentiment,
      });
    } catch (error) {
      console.error("Failed to process mock transcript:", error);
    }
  }
}

export const mockRecallAIService = new MockRecallAIService();
