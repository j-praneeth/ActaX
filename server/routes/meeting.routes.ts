import { Router } from "express";
import { container } from "../core/container/container";
import { IMeetingService, IAuthService } from "../core/interfaces/services";
import { IMeetingRepository } from "../core/interfaces/repositories";
import { IOrganizationRepository } from "../core/interfaces/repositories";
import { IUserRepository } from "../core/interfaces/repositories";
import { createMeetingRequestSchema } from "@shared/schemas/validation";
import { z } from "zod";

const router = Router();

// Meeting validation schema
const meetingSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  platform: z.string().optional().nullable(),
  meetingUrl: z.string().optional().nullable(),
  startTime: z.string().optional().nullable(),
  endTime: z.string().optional().nullable(),
});

// Validate meeting access
router.post("/validate", async (req, res) => {
  try {
    const { url } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    if (!url) {
      return res.status(400).json({ message: "Meeting URL is required" });
    }

    const meetingService = container.get<IMeetingService>('meetingService');
    const accessValidation = await meetingService.validateMeetingAccess(url, 'temp-user-id', ipAddress, userAgent);
    
    if (!accessValidation.hasAccess) {
      return res.status(400).json({ 
        isActive: false, 
        canJoin: false, 
        message: accessValidation.message 
      });
    }

    const meetingStatus = await meetingService.checkMeetingStatus(url);
    
    res.json({
      isActive: meetingStatus.isActive,
      meetingId: meetingStatus.meetingId,
      canJoin: meetingStatus.canJoin,
      message: meetingStatus.isActive ? 'Meeting is active and ready for recording' : 'Meeting is not active'
    });
  } catch (error) {
    console.error("Meeting validation error:", error);
    res.status(500).json({ 
      isActive: false, 
      canJoin: false, 
      message: "Failed to validate meeting" 
    });
  }
});

// Join meeting with bot
router.post("/join-bot", async (req, res) => {
  try {
    const { url, subject, meetingId } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    if (!url || !meetingId) {
      return res.status(400).json({ 
        success: false, 
        message: "Meeting URL and ID are required" 
      });
    }

    const meetingService = container.get<IMeetingService>('meetingService');
    const result = await meetingService.joinMeetingWithBot(url, meetingId, 'temp-user-id');
    
    res.json(result);
  } catch (error) {
    console.error("Bot joining error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to join meeting with bot" 
    });
  }
});

// Get meetings
router.get("/", async (req, res) => {
  try {
    console.log('📋 Fetching meetings for user');
    
    // Get user from authentication token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication token required" });
    }
    
    const token = authHeader.substring(7);
    const authService = container.get<IAuthService>('authService');
    const user = await authService.verifySessionToken(token);
    
    if (!user) {
      return res.status(401).json({ message: "Invalid authentication token" });
    }
    
    const meetingRepository = container.get<IMeetingRepository>('meetingRepository');
    const organizationRepository = container.get<IOrganizationRepository>('organizationRepository');
    
    // Get user's organizations
    const organizations = await organizationRepository.findByOwnerId(user.id);
    
    if (organizations.length === 0) {
      console.log('⚠️  No organizations found for user');
      return res.json([]);
    }
    
    // Get meetings for all user's organizations
    const allMeetings = [];
    for (const org of organizations) {
      const meetings = await meetingRepository.findByOrganizationId(org.id);
      allMeetings.push(...meetings);
    }
    
    console.log(`✅ Found ${allMeetings.length} meetings across ${organizations.length} organizations`);
    
    res.json(allMeetings);
  } catch (error) {
    console.error("❌ Get meetings error:", error);
    res.status(500).json({ message: "Failed to fetch meetings" });
  }
});

// Create meeting
router.post("/", async (req, res) => {
  try {
    console.log('📝 Creating meeting');
    
    // Get user from authentication token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication token required" });
    }
    
    const token = authHeader.substring(7);
    const authService = container.get<IAuthService>('authService');
    const user = await authService.verifySessionToken(token);
    
    if (!user) {
      return res.status(401).json({ message: "Invalid authentication token" });
    }
    
    const meetingRepository = container.get<IMeetingRepository>('meetingRepository');
    const organizationRepository = container.get<IOrganizationRepository>('organizationRepository');
    
    // Get user's organizations
    const organizations = await organizationRepository.findByOwnerId(user.id);
    
    if (organizations.length === 0) {
      return res.status(400).json({ message: "No organizations found for user" });
    }
    
    // Use the first organization (in a real app, you might let user choose)
    const organizationId = organizations[0].id;
    
    const meetingData = createMeetingRequestSchema.parse(req.body);

    console.log('💾 Storing meeting data:', {
      title: meetingData.title,
      platform: meetingData.platform,
      organizationId: organizationId
    });

    const meeting = await meetingRepository.create({
      title: meetingData.title,
      description: meetingData.description || undefined,
      organizationId: organizationId,
      status: 'scheduled',
      startTime: meetingData.startTime ? new Date(meetingData.startTime) : undefined,
      endTime: meetingData.endTime ? new Date(meetingData.endTime) : undefined,
      platform: meetingData.platform || undefined,
      meetingUrl: meetingData.meetingUrl || undefined
    });
    
    console.log('✅ Meeting created successfully with ID:', meeting.id);

    res.json(meeting);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Validation error:", error.errors);
      return res.status(400).json({ message: "Invalid meeting data", errors: error.errors });
    }
    console.error("❌ Create meeting error:", error);
    res.status(500).json({ message: "Failed to create meeting" });
  }
});

// Get meeting participants
router.get("/:id/participants", async (req, res) => {
  try {
    // Get user from authentication token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication token required" });
    }
    
    const token = authHeader.substring(7);
    const authService = container.get<IAuthService>('authService');
    const user = await authService.verifySessionToken(token);
    
    if (!user) {
      return res.status(401).json({ message: "Invalid authentication token" });
    }
    
    const meetingId = req.params.id;
    const meetingRepository = container.get<IMeetingRepository>('meetingRepository');
    
    const meeting = await meetingRepository.findById(meetingId);
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }
    
    // Verify user has access to this meeting's organization
    const organizationRepository = container.get<IOrganizationRepository>('organizationRepository');
    const organizations = await organizationRepository.findByOwnerId(user.id);
    const hasAccess = organizations.some(org => org.id === meeting.organizationId);
    
    if (!hasAccess) {
      return res.status(403).json({ message: "Access denied to this meeting" });
    }

    let participants = [];

    // Try to get participants from Recall.ai API first
    if (meeting.recallBotId) {
      try {
        const { recallAIService } = await import('../services/recall-ai');
        const recallParticipants = await recallAIService.getParticipants(meeting.recallBotId);
        
        if (recallParticipants && recallParticipants.length > 0) {
          participants = recallParticipants.map(participant => ({
            id: participant.id,
            name: participant.name,
            email: participant.email || null,
            is_host: participant.is_host || false,
            platform: meeting.platform || 'unknown',
            role: participant.is_host ? 'host' : 'participant',
            extra_data: participant.extra_data || {}
          }));
          
          console.log(`✅ Retrieved ${participants.length} participants from Recall.ai API`);
        }
      } catch (error) {
        console.log(`⚠️ Failed to get participants from Recall.ai API: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    // Fallback to extracting participants from transcript if Recall.ai API failed
    if (participants.length === 0 && meeting.transcript) {
      let transcriptData = meeting.transcript;
      
      // Try to parse as JSON first
      try {
        transcriptData = JSON.parse(meeting.transcript);
      } catch {
        // Keep as string if JSON parsing fails
      }
      
      // Handle structured transcript data from Recall.ai
      if (typeof transcriptData === 'object' && transcriptData && 'speakers' in transcriptData && Array.isArray((transcriptData as any).speakers)) {
        const speakerMap = new Map<string, any>();
        
        (transcriptData as any).speakers.forEach((speaker: any) => {
          const speakerName = speaker.name || speaker.speaker || 'Unknown Speaker';
          
          if (!speakerMap.has(speakerName)) {
            // Look for host indicators in the speaker data
            const isHost = speaker.is_host || 
                          speaker.role === 'host' || 
                          speakerName.toLowerCase().includes('host') ||
                          speakerName.toLowerCase().includes('organizer') ||
                          speakerName.toLowerCase().includes('moderator');
            
            speakerMap.set(speakerName, {
              id: speaker.id || `participant-${speakerName.toLowerCase().replace(/\s+/g, '-')}`,
              name: speakerName,
              email: null,
              is_host: isHost,
              platform: meeting.platform || 'unknown',
              role: isHost ? 'host' : 'participant',
              extra_data: {
                [meeting.platform || 'unknown']: {
                  name: speakerName
                }
              }
            });
          }
        });
        
        participants = Array.from(speakerMap.values());
      } else {
        // Fallback to parsing as plain text
        const lines = typeof transcriptData === 'string' ? transcriptData.split('\n') : [];
        const participantNames = new Set<string>();
        
        lines.forEach(line => {
          // Look for patterns like "Speaker 1:", "John:", etc.
          const match = line.match(/^(?:Speaker \d+|[\w\s]+):/);
          if (match) {
            const name = match[0].replace(':', '').trim();
            if (name && name !== 'Speaker') {
              participantNames.add(name);
            }
          }
        });
        
        participants = Array.from(participantNames).map((name) => {
          // Look for host indicators in the name
          const isHost = name.toLowerCase().includes('host') ||
                        name.toLowerCase().includes('organizer') ||
                        name.toLowerCase().includes('moderator') ||
                        name.toLowerCase().includes('facilitator');
          
          return {
            id: `participant-${name.toLowerCase().replace(/\s+/g, '-')}`,
            name: name,
            email: null,
            is_host: isHost,
            platform: meeting.platform || 'unknown',
            role: isHost ? 'host' : 'participant',
            extra_data: {
              [meeting.platform || 'unknown']: {
                name: name
              }
            }
          };
        });
      }
    }
    
    // If no participants from transcript, add a default host based on meeting data
    if (participants.length === 0) {
      participants.push({
        id: 'host-default',
        name: 'Meeting Host',
        email: null,
        is_host: true,
        platform: meeting.platform || 'unknown',
        role: 'host',
        extra_data: {
          [meeting.platform || 'unknown']: {
            name: 'Meeting Host'
          }
        }
      });
    }

    res.json({ participants });
  } catch (error) {
    console.error("Get meeting participants error:", error);
    res.status(500).json({ message: "Failed to fetch participants" });
  }
});

// Get meeting by ID
router.get("/:id", async (req, res) => {
  try {
    // Get user from authentication token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication token required" });
    }
    
    const token = authHeader.substring(7);
    const authService = container.get<IAuthService>('authService');
    const user = await authService.verifySessionToken(token);
    
    if (!user) {
      return res.status(401).json({ message: "Invalid authentication token" });
    }
    
    const meetingId = req.params.id;
    const meetingRepository = container.get<IMeetingRepository>('meetingRepository');
    
    const meeting = await meetingRepository.findById(meetingId);
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }
    
    // Verify user has access to this meeting's organization
    const organizationRepository = container.get<IOrganizationRepository>('organizationRepository');
    const organizations = await organizationRepository.findByOwnerId(user.id);
    const hasAccess = organizations.some(org => org.id === meeting.organizationId);
    
    if (!hasAccess) {
      return res.status(403).json({ message: "Access denied to this meeting" });
    }

    res.json(meeting);
  } catch (error) {
    console.error("Get meeting error:", error);
    res.status(500).json({ message: "Failed to fetch meeting" });
  }
});

// Update meeting
router.put("/:id", async (req, res) => {
  try {
    // Get user from authentication token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication token required" });
    }
    
    const token = authHeader.substring(7);
    const authService = container.get<IAuthService>('authService');
    const user = await authService.verifySessionToken(token);
    
    if (!user) {
      return res.status(401).json({ message: "Invalid authentication token" });
    }
    
    const meetingId = req.params.id;
    const updates = req.body;
    const meetingRepository = container.get<IMeetingRepository>('meetingRepository');

    console.log('📝 Updating meeting:', meetingId);

    const meeting = await meetingRepository.findById(meetingId);
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }
    
    // Verify user has access to this meeting's organization
    const organizationRepository = container.get<IOrganizationRepository>('organizationRepository');
    const organizations = await organizationRepository.findByOwnerId(user.id);
    const hasAccess = organizations.some(org => org.id === meeting.organizationId);
    
    if (!hasAccess) {
      return res.status(403).json({ message: "Access denied to this meeting" });
    }

    console.log('💾 Storing meeting updates:', updates);
    const updatedMeeting = await meetingRepository.update(meetingId, {
      ...updates,
      updatedAt: new Date()
    });
    console.log('✅ Meeting updated successfully');

    res.json(updatedMeeting);
  } catch (error) {
    console.error("❌ Update meeting error:", error);
    res.status(500).json({ message: "Failed to update meeting" });
  }
});

// Delete meeting
router.delete("/:id", async (req, res) => {
  try {
    // Get user from authentication token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication token required" });
    }
    
    const token = authHeader.substring(7);
    const authService = container.get<IAuthService>('authService');
    const user = await authService.verifySessionToken(token);
    
    if (!user) {
      return res.status(401).json({ message: "Invalid authentication token" });
    }
    
    const meetingId = req.params.id;
    const meetingRepository = container.get<IMeetingRepository>('meetingRepository');
    
    const meeting = await meetingRepository.findById(meetingId);
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }
    
    // Verify user has access to this meeting's organization
    const organizationRepository = container.get<IOrganizationRepository>('organizationRepository');
    const organizations = await organizationRepository.findByOwnerId(user.id);
    const hasAccess = organizations.some(org => org.id === meeting.organizationId);
    
    if (!hasAccess) {
      return res.status(403).json({ message: "Access denied to this meeting" });
    }
    
    await meetingRepository.delete(meetingId);
    res.json({ message: "Meeting deleted successfully" });
  } catch (error) {
    console.error("Delete meeting error:", error);
    res.status(500).json({ message: "Failed to delete meeting" });
  }
});

// Update meeting highlights (actionItems, keyTopics, takeaways)
router.patch("/:id/highlights", async (req, res) => {
  try {
    // Get user from authentication token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication token required" });
    }
    
    const token = authHeader.substring(7);
    const authService = container.get<IAuthService>('authService');
    const user = await authService.verifySessionToken(token);
    
    if (!user) {
      return res.status(401).json({ message: "Invalid authentication token" });
    }
    
    const meetingId = req.params.id;
    const { field, data } = req.body; // field: 'actionItems', 'keyTopics', or 'takeaways'
    
    if (!field || !['actionItems', 'keyTopics', 'takeaways'].includes(field)) {
      return res.status(400).json({ message: "Invalid field. Must be 'actionItems', 'keyTopics', or 'takeaways'" });
    }
    
    const meetingRepository = container.get<IMeetingRepository>('meetingRepository');
    
    const meeting = await meetingRepository.findById(meetingId);
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }
    
    // Verify user has access to this meeting's organization
    const organizationRepository = container.get<IOrganizationRepository>('organizationRepository');
    const organizations = await organizationRepository.findByOwnerId(user.id);
    const hasAccess = organizations.some(org => org.id === meeting.organizationId);
    
    if (!hasAccess) {
      return res.status(403).json({ message: "Access denied to this meeting" });
    }

    // Update the specific field
    const updateData = { [field]: data };
    const updatedMeeting = await meetingRepository.update(meetingId, updateData);
    
    res.json({ 
      success: true, 
      field, 
      data: (updatedMeeting as any)[field],
      message: `${field} updated successfully` 
    });
  } catch (error) {
    console.error("Update meeting highlights error:", error);
    res.status(500).json({ message: "Failed to update meeting highlights" });
  }
});

// Fetch transcript from Recall.ai
router.post("/:id/fetch-transcript", async (req, res) => {
  try {
    // Get user from authentication token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication token required" });
    }

    const token = authHeader.substring(7);
    const authService = container.get<IAuthService>('authService');
    const user = await authService.verifySessionToken(token);

    if (!user) {
      return res.status(401).json({ message: "Invalid authentication token" });
    }

    const meetingId = req.params.id;
    const meetingRepository = container.get<IMeetingRepository>('meetingRepository');

    const meeting = await meetingRepository.findById(meetingId);
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    // Verify user has access to this meeting's organization
    const organizationRepository = container.get<IOrganizationRepository>('organizationRepository');
    const organizations = await organizationRepository.findByOwnerId(user.id);
    const hasAccess = organizations.some(org => org.id === meeting.organizationId);

    if (!hasAccess) {
      return res.status(403).json({ message: "Access denied to this meeting" });
    }

    if (!meeting.recallBotId) {
      return res.status(400).json({ message: "No bot ID available for this meeting" });
    }

    // Import recall-ai service
    const { recallAIService } = await import('../services/recall-ai');

    try {
      // Try to get real-time transcript with timestamps first
      let realtimeTranscript;
      try {
        realtimeTranscript = await recallAIService.getRealTimeTranscript(meeting.recallBotId);
        console.log(`📝 Retrieved real-time transcript with ${realtimeTranscript.speakers?.length || 0} speakers`);
      } catch (realtimeError) {
        console.log(`⚠️ Real-time transcript not available: ${realtimeError instanceof Error ? realtimeError.message : String(realtimeError)}`);
      }

      // If real-time transcript is available, use it
      if (realtimeTranscript && realtimeTranscript.speakers && realtimeTranscript.speakers.length > 0) {
        // Store the structured transcript data
        await meetingRepository.update(meetingId, {
          transcript: JSON.stringify({
            speakers: realtimeTranscript.speakers,
            transcript_text: realtimeTranscript.transcript,
            is_live: realtimeTranscript.is_live,
            language: realtimeTranscript.language
          })
        });

        // Get updated meeting data
        const updatedMeeting = await meetingRepository.findById(meetingId);

        res.json({
          success: true,
          meeting: updatedMeeting,
          transcript: realtimeTranscript,
          message: "Real-time transcript fetched successfully"
        });
      } else {
        // Fallback to regular transcript fetching
        await recallAIService.fetchAndStoreTranscript(meeting.recallBotId, meetingId);

        // Get updated meeting data
        const updatedMeeting = await meetingRepository.findById(meetingId);

        res.json({
          success: true,
          meeting: updatedMeeting,
          message: "Transcript fetched successfully"
        });
      }
    } catch (error) {
      console.error("Failed to fetch transcript from Recall.ai:", error);
      res.status(500).json({
        message: "Failed to fetch transcript from Recall.ai",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  } catch (error) {
    console.error("Fetch transcript error:", error);
    res.status(500).json({ message: "Failed to fetch transcript" });
  }
});

// Generate meeting insights
router.post("/:id/generate-insights", async (req, res) => {
  try {
    // Get user from authentication token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication token required" });
    }
    
    const token = authHeader.substring(7);
    const authService = container.get<IAuthService>('authService');
    const user = await authService.verifySessionToken(token);
    
    if (!user) {
      return res.status(401).json({ message: "Invalid authentication token" });
    }
    
    const meetingId = req.params.id;
    const meetingRepository = container.get<IMeetingRepository>('meetingRepository');
    
    const meeting = await meetingRepository.findById(meetingId);
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }
    
    // Verify user has access to this meeting's organization
    const organizationRepository = container.get<IOrganizationRepository>('organizationRepository');
    const organizations = await organizationRepository.findByOwnerId(user.id);
    const hasAccess = organizations.some(org => org.id === meeting.organizationId);
    
    if (!hasAccess) {
      return res.status(403).json({ message: "Access denied to this meeting" });
    }

    if (!meeting.transcript) {
      return res.status(400).json({ message: "No transcript available for this meeting" });
    }

    // Import Gemini service for AI-powered insights
    const { geminiService } = await import('../services/gemini');
    
    try {
      // Generate AI-powered insights using Gemini
      const insights = await geminiService.analyzeMeetingTranscript(meeting.transcript);
      
      // Update meeting with generated insights
      const updatedMeeting = await meetingRepository.update(meetingId, {
        summary: insights.summary,
        actionItems: insights.actionItems,
        keyTopics: insights.keyTopics,
        takeaways: insights.takeaways
      });
      
      res.json({ 
        success: true, 
        insights: insights,
        meeting: updatedMeeting,
        message: "Insights generated successfully" 
      });
    } catch (error) {
      console.error("Failed to generate insights with Gemini:", error);
      res.status(500).json({ 
        message: "Failed to generate insights with Gemini",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  } catch (error) {
    console.error("Generate insights error:", error);
    res.status(500).json({ message: "Failed to generate insights" });
  }
});

// Ask question about meeting
router.post("/:id/ask-question", async (req, res) => {
  try {
    // Get user from authentication token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication token required" });
    }
    
    const token = authHeader.substring(7);
    const authService = container.get<IAuthService>('authService');
    const user = await authService.verifySessionToken(token);
    
    if (!user) {
      return res.status(401).json({ message: "Invalid authentication token" });
    }
    
    const meetingId = req.params.id;
    const { question } = req.body;
    
    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return res.status(400).json({ message: "Question is required" });
    }
    
    const meetingRepository = container.get<IMeetingRepository>('meetingRepository');
    
    const meeting = await meetingRepository.findById(meetingId);
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }
    
    // Verify user has access to this meeting's organization
    const organizationRepository = container.get<IOrganizationRepository>('organizationRepository');
    const organizations = await organizationRepository.findByOwnerId(user.id);
    const hasAccess = organizations.some(org => org.id === meeting.organizationId);
    
    if (!hasAccess) {
      return res.status(403).json({ message: "Access denied to this meeting" });
    }

    if (!meeting.transcript) {
      return res.status(400).json({ message: "No transcript available for this meeting" });
    }

    // Import Gemini service for AI-powered answers
    const { geminiService } = await import('../services/gemini');
    
    try {
      // Generate AI-powered answer using Gemini
      const answer = await geminiService.generateAnswer(question, meeting.transcript);
      
      res.json({ 
        success: true, 
        answer: answer,
        question: question.trim(),
        message: "Answer generated successfully" 
      });
    } catch (error) {
      console.error("Failed to generate answer with Gemini:", error);
      
      // Fallback to simple keyword-based answer
      const fallbackAnswer = generateFallbackAnswer(question, meeting.transcript);
      
      res.json({ 
        success: true, 
        answer: fallbackAnswer,
        question: question.trim(),
        message: "Answer generated using fallback method" 
      });
    }
  } catch (error) {
    console.error("Ask question error:", error);
    res.status(500).json({ message: "Failed to process question" });
  }
});

// Fallback answer generation when AI service is unavailable
function generateFallbackAnswer(question: string, transcript: string): string {
  const questionLower = question.toLowerCase();
  const transcriptLower = transcript.toLowerCase();
  
  // Simple keyword matching
  if (questionLower.includes('summary') || questionLower.includes('overview')) {
    return "Based on the meeting transcript, this appears to be a discussion covering various topics. For a detailed summary, please refer to the meeting highlights section above.";
  }
  
  if (questionLower.includes('participant') || questionLower.includes('who')) {
    return "The meeting participants can be found in the participants section. Please check the right sidebar for a complete list of attendees.";
  }
  
  if (questionLower.includes('action') || questionLower.includes('todo') || questionLower.includes('task')) {
    return "Action items and tasks discussed in the meeting are listed in the Action Points section above. Please refer to that section for specific action items.";
  }
  
  if (questionLower.includes('decision') || questionLower.includes('decide')) {
    return "Key decisions made during the meeting are highlighted in the Key Takeaways section. Please check that section for important decisions.";
  }
  
  if (questionLower.includes('topic') || questionLower.includes('discuss')) {
    return "The main topics discussed in the meeting are listed in the Key Topics section. Please refer to that section for a comprehensive overview of discussion topics.";
  }
  
  // Generic fallback
  return "I understand you're asking about the meeting content. While I can't provide a detailed AI-powered answer at the moment, you can find relevant information in the meeting highlights sections above, including the transcript, action points, key topics, and takeaways.";
}

export { router as meetingRoutes };