import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = 'AIzaSyBaUUrN6Dey5RXVySMqoAriSAwRLNgyozI';

if (!GEMINI_API_KEY) {
  console.warn("⚠️ GEMINI_API_KEY environment variable is not set. Gemini features will be disabled.");
}

export interface MeetingInsights {
  summary: string;
  keyTopics: string[];
  actionItems: string[];
  takeaways: string[];
}

class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  constructor() {
    if (GEMINI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }
  }

  /**
   * Analyze meeting transcript and generate insights
   */
  async analyzeMeetingTranscript(transcript: string): Promise<MeetingInsights> {
    if (!this.model) {
      throw new Error('Gemini API key not configured');
    }

    const prompt = `
Please analyze the following meeting transcript and provide structured insights in JSON format.

Meeting Transcript:
${transcript}

Please provide your response in the following JSON format:
{
  "summary": "A concise 2-3 sentence summary of the meeting",
  "keyTopics": ["topic1", "topic2", "topic3"],
  "actionItems": ["action1", "action2", "action3"],
  "takeaways": ["takeaway1", "takeaway2", "takeaway3"]
}

Guidelines:
- Summary: Focus on the main purpose and outcomes of the meeting
- Key Topics: Extract 3-5 main discussion topics or themes
- Action Items: Identify specific tasks, assignments, or next steps mentioned
- Takeaways: Extract important insights, decisions, or conclusions

Respond only with valid JSON, no additional text.
`;

    try {
      console.log('🤖 Analyzing transcript with Gemini...');
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('📝 Gemini raw response:', text);
      
      // Parse JSON response
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      const insights: MeetingInsights = JSON.parse(cleanedText);
      
      // Validate the response structure
      if (!insights.summary || !Array.isArray(insights.keyTopics) || 
          !Array.isArray(insights.actionItems) || !Array.isArray(insights.takeaways)) {
        throw new Error('Invalid response structure from Gemini');
      }
      
      console.log('✅ Gemini analysis completed successfully');
      return insights;
    } catch (error) {
      console.error('❌ Gemini analysis failed:', error);
      
      // Fallback to basic extraction if Gemini fails
      console.log('🔄 Falling back to basic text extraction...');
      return this.fallbackAnalysis(transcript);
    }
  }

  /**
   * Fallback analysis when Gemini is not available
   */
  private fallbackAnalysis(transcript: string): MeetingInsights {
    const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    return {
      summary: sentences.slice(0, 2).join('. ') + '.',
      keyTopics: this.extractBasicTopics(transcript),
      actionItems: this.extractBasicActionItems(transcript),
      takeaways: this.extractBasicTakeaways(transcript)
    };
  }

  private extractBasicTopics(transcript: string): string[] {
    const topicKeywords = ['discuss', 'review', 'plan', 'project', 'budget', 'timeline', 'strategy'];
    const topics: string[] = [];
    
    topicKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\w*\\s+([^.!?]{10,50})`, 'gi');
      const matches = transcript.match(regex);
      if (matches) {
        topics.push(...matches.slice(0, 2).map(match => match.trim()));
      }
    });
    
    return topics.slice(0, 5);
  }

  private extractBasicActionItems(transcript: string): string[] {
    const actionKeywords = ['action', 'todo', 'task', 'follow up', 'next step', 'will do', 'should do'];
    const actions: string[] = [];
    
    actionKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}[^.!?]{5,80}`, 'gi');
      const matches = transcript.match(regex);
      if (matches) {
        actions.push(...matches.slice(0, 2).map(match => match.trim()));
      }
    });
    
    return actions.slice(0, 5);
  }

  private extractBasicTakeaways(transcript: string): string[] {
    const takeawayKeywords = ['important', 'key point', 'conclusion', 'decision', 'agreed', 'decided'];
    const takeaways: string[] = [];
    
    takeawayKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}[^.!?]{5,80}`, 'gi');
      const matches = transcript.match(regex);
      if (matches) {
        takeaways.push(...matches.slice(0, 2).map(match => match.trim()));
      }
    });
    
    return takeaways.slice(0, 5);
  }

  /**
   * Check if Gemini is available
   */
  isAvailable(): boolean {
    return !!this.model;
  }
}

export const geminiService = new GeminiService(); 