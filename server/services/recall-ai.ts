import type { WebhookEvent, Meeting } from "@shared/schema";
import { storage } from "../storage";

const RECALL_API_KEY = process.env.RECALL_API_KEY || process.env.VITE_RECALL_API_KEY || '32bd623de16c5e9a4520ed8c42085f3f9f9ceccd';
const RECALL_API_BASE_URL = "https://us-west-2.recall.ai/api/v1";

if (!RECALL_API_KEY || RECALL_API_KEY === "demo_key") {
  console.warn("⚠️  RECALL_API_KEY not set or using demo key. Bot functionality will be limited.");
}

export interface RecallBot {
  id: string;
  meeting_url: string;
  status: string;
  recording_id?: string;
}

export interface RecallTranscript {
  id: string;
  transcript_text: string;
  summary?: string;
  action_items?: string[];
  key_topics?: string[];
  decisions?: string[];
  takeaways?: string[];
  sentiment?: string;
}

class RecallAIService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = RECALL_API_KEY || '32bd623de16c5e9a4520ed8c42085f3f9f9ceccd';
    this.baseUrl = RECALL_API_BASE_URL;
  }

  async startBot(meetingUrl: string, meetingId: string): Promise<string> {
    try {
      // Check if API key is valid
      if (!this.apiKey || this.apiKey === "demo_key") {
        throw new Error("Recall.ai API key not configured. Please set RECALL_API_KEY environment variable.");
      }

      console.log(`🤖 Starting Recall.ai bot for meeting: ${meetingUrl}`);

      const response = await fetch(`${this.baseUrl}/bot`, {
        method: "POST",
        headers: {
          "Authorization": `Token ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          meeting_url: meetingUrl,
          recording_config: {
            transcript: {
              provider: {
                recallai_streaming: {}
              }
            }
          },
          // Enhanced bot configuration for better meeting participation
          bot_name: "Acta AI Assistant",
          // Bot behavior settings
          bot_settings: {
            // Wait in lobby until admitted
            wait_for_admission: true,
            // Join as participant (not just observer)
            join_as_participant: true,
            // Enable real-time features
            real_time_features: {
              live_transcript: true,
              live_translation: true,
              speaker_identification: true
            }
          },
          // Webhook configuration for real-time updates
          webhook_url: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/webhooks/recall`,
          metadata: {
            meeting_id: meetingId,
            bot_type: "transcription_assistant",
            features: ["real_time_transcript", "english_translation", "lobby_waiting"]
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Recall.ai API error response:", errorText);
        throw new Error(`Recall.ai API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const bot: RecallBot = await response.json();
      console.log(`✅ Recall.ai bot started successfully: ${bot.id}`);
      console.log(`📝 Bot will join meeting and wait in lobby for admission`);
      return bot.id;
    } catch (error) {
      console.error("Failed to start Recall.ai bot:", error);
      throw error;
    }
  }

  async stopBot(botId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/bot/${botId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Token ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to stop bot: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error("Failed to stop Recall.ai bot:", error);
      throw error;
    }
  }

  async getBotStatus(botId: string): Promise<RecallBot> {
    try {
      const response = await fetch(`${this.baseUrl}/bot/${botId}`, {
        headers: {
          "Authorization": `Token ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get bot status: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to get bot status:", error);
      throw error;
    }
  }

  async getTranscript(recordingId: string): Promise<RecallTranscript> {
    try {
      const response = await fetch(`${this.baseUrl}/recording/${recordingId}/transcript`, {
        headers: {
          "Authorization": `Token ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get transcript: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to get transcript:", error);
      throw error;
    }
  }

  /**
   * Get real-time transcript for an active meeting
   */
  async getRealTimeTranscript(botId: string): Promise<{
    transcript: string;
    speakers: Array<{ id: string; name: string; text: string; timestamp: string }>;
    is_live: boolean;
    language: string;
    translated_text?: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/bot/${botId}/transcript`, {
        headers: {
          "Authorization": `Token ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get real-time transcript: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to get real-time transcript:", error);
      throw error;
    }
  }

  /**
   * Get bot status with detailed information
   */
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
    try {
      const response = await fetch(`${this.baseUrl}/bot/${botId}`, {
        headers: {
          "Authorization": `Token ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get bot status: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to get bot status:", error);
      throw error;
    }
  }

  async processWebhook(webhookEvent: WebhookEvent): Promise<void> {
    try {
      const { payload, meetingId } = webhookEvent;
      
      if (!meetingId) {
        console.warn("Webhook event has no associated meeting ID");
        await storage.markWebhookEventProcessed(webhookEvent.id);
        return;
      }

      const meeting = await storage.getMeeting(meetingId);
      if (!meeting) {
        console.warn(`Meeting ${meetingId} not found for webhook event`);
        await storage.markWebhookEventProcessed(webhookEvent.id);
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
          console.log(`Unhandled webhook event type: ${webhookEvent.eventType}`);
      }

      await storage.markWebhookEventProcessed(webhookEvent.id);
    } catch (error) {
      console.error("Webhook processing error:", error);
      throw error;
    }
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
    console.log(`🎉 Bot admitted to meeting ${meeting.id}`);
    
    await storage.updateMeeting(meeting.id, {
      status: "in_progress",
      startTime: new Date(),
    });

    // Start real-time transcript monitoring
    if (payload.bot_id) {
      console.log(`📝 Starting real-time transcript monitoring for bot ${payload.bot_id}`);
    }
  }

  private async handleBotInLobby(meeting: Meeting, payload: any): Promise<void> {
    console.log(`⏳ Bot waiting in lobby for meeting ${meeting.id}`);
    
    await storage.updateMeeting(meeting.id, {
      status: "waiting_for_admission",
    });
  }

  private async handleLiveTranscript(meeting: Meeting, payload: any): Promise<void> {
    console.log(`📝 Live transcript update for meeting ${meeting.id}`);
    
    // Store real-time transcript
    const liveTranscript = {
      text: payload.transcript_text,
      speakers: payload.speakers || [],
      timestamp: new Date(),
      language: payload.language || 'unknown',
      translated: payload.translated_text || null
    };

    // Update meeting with live transcript (store in transcript field for now)
    await storage.updateMeeting(meeting.id, {
      transcript: JSON.stringify(liveTranscript),
    });
  }

  private async handleTranslatedTranscript(meeting: Meeting, payload: any): Promise<void> {
    console.log(`🌐 Translated transcript received for meeting ${meeting.id}`);
    
    // Store translated transcript
    const translatedTranscript = {
      original_text: payload.original_text,
      translated_text: payload.translated_text,
      source_language: payload.source_language,
      target_language: payload.target_language,
      timestamp: new Date()
    };

    // Update meeting with translated transcript (store in summary field for now)
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

      const transcript = await this.getTranscript(recordingId);
      
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
      console.error("Failed to process transcript:", error);
    }
  }

  async generateMeetingInsights(meeting: Meeting): Promise<void> {
    if (!meeting.transcript) return;

    // This would typically call an AI service to generate insights
    // For now, we'll create basic insights from the transcript
    const transcript = meeting.transcript;
    const words = transcript.split(" ");
    
    // Generate basic action items (this would be AI-powered in production)
    const actionItems = this.extractActionItems(transcript);
    const keyTopics = this.extractKeyTopics(transcript);
    const decisions = this.extractDecisions(transcript);
    const takeaways = this.extractTakeaways(transcript);
    
    await storage.updateMeeting(meeting.id, {
      actionItems,
      keyTopics,
      decisions,
      takeaways,
      summary: this.generateSummary(transcript),
      sentiment: this.analyzeSentiment(transcript),
    });
  }

  private extractActionItems(transcript: string): string[] {
    const actionIndicators = ["action item", "todo", "follow up", "next step", "will do", "should do"];
    const sentences = transcript.split(/[.!?]+/);
    
    return sentences
      .filter(sentence => 
        actionIndicators.some(indicator => 
          sentence.toLowerCase().includes(indicator)
        )
      )
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length > 10)
      .slice(0, 10); // Limit to 10 action items
  }

  private extractKeyTopics(transcript: string): string[] {
    const words = transcript.toLowerCase().split(/\W+/);
    const commonWords = new Set(["the", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by", "is", "are", "was", "were", "will", "would", "could", "should"]);
    
    const wordFreq = new Map<string, number>();
    words.forEach(word => {
      if (word.length > 3 && !commonWords.has(word)) {
        wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
      }
    });

    return Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1));
  }

  private extractDecisions(transcript: string): string[] {
    const decisionIndicators = ["decided", "decision", "agree", "approved", "rejected", "concluded"];
    const sentences = transcript.split(/[.!?]+/);
    
    return sentences
      .filter(sentence => 
        decisionIndicators.some(indicator => 
          sentence.toLowerCase().includes(indicator)
        )
      )
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length > 10)
      .slice(0, 8);
  }

  private extractTakeaways(transcript: string): string[] {
    const takeawayIndicators = ["takeaway", "key point", "important", "conclusion", "result", "outcome"];
    const sentences = transcript.split(/[.!?]+/);
    
    return sentences
      .filter(sentence => 
        takeawayIndicators.some(indicator => 
          sentence.toLowerCase().includes(indicator)
        )
      )
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length > 10)
      .slice(0, 8);
  }

  private generateSummary(transcript: string): string {
    const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const maxSentences = Math.min(5, Math.ceil(sentences.length * 0.1));
    
    return sentences
      .slice(0, maxSentences)
      .map(s => s.trim())
      .join(". ") + ".";
  }

  private analyzeSentiment(transcript: string): string {
    const positiveWords = ["good", "great", "excellent", "positive", "agree", "success", "happy", "pleased"];
    const negativeWords = ["bad", "terrible", "negative", "disagree", "failure", "angry", "upset", "concerned"];
    
    const words = transcript.toLowerCase().split(/\W+/);
    const positiveCount = words.filter(word => positiveWords.includes(word)).length;
    const negativeCount = words.filter(word => negativeWords.includes(word)).length;
    
    if (positiveCount > negativeCount * 1.5) return "positive";
    if (negativeCount > positiveCount * 1.5) return "negative";
    return "neutral";
  }
}

export const recallAIService = new RecallAIService();
