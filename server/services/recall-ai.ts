import type { WebhookEvent, Meeting } from "@shared/schema";
import { storage } from "../storage";

const RECALL_API_KEY = process.env.RECALL_API_KEY || process.env.VITE_RECALL_API_KEY || "demo_key";
const RECALL_API_BASE_URL = "https://api.recall.ai/api/v1";

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
    this.apiKey = RECALL_API_KEY;
    this.baseUrl = RECALL_API_BASE_URL;
  }

  async startBot(meetingUrl: string, meetingId: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/bot`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          meeting_url: meetingUrl,
          bot_name: "Acta AI Assistant",
          recording_mode: "speaker_view",
          transcription_options: {
            provider: "assembly_ai",
          },
          metadata: {
            meeting_id: meetingId,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Recall.ai API error: ${response.status} ${response.statusText}`);
      }

      const bot: RecallBot = await response.json();
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
          "Authorization": `Bearer ${this.apiKey}`,
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
          "Authorization": `Bearer ${this.apiKey}`,
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
          "Authorization": `Bearer ${this.apiKey}`,
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
