import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { supabaseService } from "./services/supabase";
import { recallAIService } from "./services/recall-ai";
import { oauthService } from "./services/oauth";
import { googleAuthService } from "./services/google-auth";
import { authMiddleware, type AuthenticatedRequest } from "./middleware/auth";
import { insertMeetingSchema, insertIntegrationSchema, insertWebhookEventSchema, insertAgentSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Ensure all API routes return JSON
  app.use('/api', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
  });

  // Auth routes
  app.post("/api/auth/verify", async (req, res) => {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(401).json({ message: "Token required" });
      }

      const user = await supabaseService.verifySessionToken(token);
      if (!user) {
        return res.status(401).json({ message: "Invalid token" });
      }

      res.json({ user });
    } catch (error) {
      console.error("Auth verification error:", error);
      res.status(500).json({ message: "Authentication failed" });
    }
  });

  // Session refresh endpoint for session restore
  app.post("/api/auth/refresh", async (req, res) => {
    try {
      const { token, refreshToken } = req.body;
      
      if (!token && !refreshToken) {
        return res.status(401).json({ message: "Token or refresh token required" });
      }

      // Try to validate and refresh the session
      const result = await supabaseService.validateAndRefreshSession(token || refreshToken);
      
      if (!result.user) {
        return res.status(401).json({ message: "Session expired or invalid" });
      }

      const response: any = { user: result.user };
      if (result.newToken) {
        response.newToken = result.newToken;
      }

      res.json(response);
    } catch (error) {
      console.error("Session refresh error:", error);
      res.status(500).json({ message: "Session refresh failed" });
    }
  });

            // Google OAuth routes
          app.get("/api/auth/google", async (req, res) => {
            try {
              const { state } = req.query;
              const authUrl = googleAuthService.getAuthUrl(state as string);
              res.json({ authUrl });
            } catch (error) {
              console.error("Google OAuth error:", error);
              if (error instanceof Error && error.message.includes('Missing required Google OAuth environment variables')) {
                res.status(500).json({ 
                  message: "Google OAuth not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables." 
                });
              } else {
                res.status(500).json({ message: "Failed to initiate Google OAuth" });
              }
            }
          });

  app.get("/api/auth/google/callback", async (req, res) => {
    try {
      const { code, error, state } = req.query;
      
      if (error) {
        console.error("Google OAuth error:", error);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5000';
        const redirectPage = state === 'signup' ? 'signup' : 'login';
        return res.redirect(`${frontendUrl}/${redirectPage}?error=oauth_error`);
      }
      
      if (!code || typeof code !== 'string') {
        console.error("No authorization code received");
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5000';
        const redirectPage = state === 'signup' ? 'signup' : 'login';
        return res.redirect(`${frontendUrl}/${redirectPage}?error=no_code`);
      }

      console.log("Received authorization code:", code.substring(0, 20) + "...");
      
      const { user, token, isNewUser } = await googleAuthService.handleCallback(code, state as string);
      
      console.log("User authenticated:", user.email, isNewUser ? "(new user)" : "(existing user)");
      
      // Redirect to frontend with token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5000';
      res.redirect(`${frontendUrl}/dashboard?token=${token}${isNewUser ? '&welcome=true' : ''}`);
    } catch (error) {
      console.error("Google OAuth callback error:", error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5000';
      const { state } = req.query;
      const redirectPage = state === 'signup' ? 'signup' : 'login';
      res.redirect(`${frontendUrl}/${redirectPage}?error=callback_failed`);
    }
  });

  // Supabase Auth webhook endpoint
  app.post("/api/auth/webhook", async (req, res) => {
    try {
      const { type, record } = req.body;

      if (type === 'INSERT' && record?.email) {
        // New user signed up in Supabase Auth
        const { email, user_metadata } = record;
        
        // Check if user already exists in our custom table
        const existingUser = await storage.getUserByEmail(email);
        if (!existingUser) {
          // Create user in custom users table
          const userData = {
            email,
            name: user_metadata?.name || email.split('@')[0],
            role: 'member',
          };

          const createdUser = await storage.createUser(userData);

          // Create default organization for the user
          const orgData = {
            name: `${userData.name}'s Organization`,
            ownerId: createdUser.id,
          };
          
          await storage.createOrganization(orgData);
          
          console.log(`User ${email} created in custom table via webhook`);
        }
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Auth webhook error:", error);
      res.status(500).json({ message: "Webhook processing failed" });
    }
  });

  // New signup endpoint that doesn't require authentication
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, name, role, authUserId } = req.body;

      if (!email || !name) {
        return res.status(400).json({ message: "Email and name are required" });
      }

      console.log('👤 Creating user:', { email, name, role });

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        console.log('⚠️  User already exists:', email);
        return res.status(409).json({ message: "User already exists" });
      }

      // Create user in custom users table
      const userData = {
        email,
        name,
        role: role || 'member',
      };

      console.log('💾 Storing user data:', userData);
      const createdUser = await storage.createUser(userData);
      console.log('✅ User created successfully with ID:', createdUser.id);

      // Create default organization for the user
      const orgData = {
        name: `${name}'s Organization`,
        ownerId: createdUser.id,
      };
      
      console.log('🏢 Creating organization:', orgData);
      const createdOrg = await storage.createOrganization(orgData);
      console.log('✅ Organization created successfully with ID:', createdOrg.id);

      res.json(createdUser);
    } catch (error) {
      console.error("❌ Signup error:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Utility endpoint to sync existing users
  app.post("/api/auth/sync-user", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;
      
      // Check if user exists in custom table
      const existingUser = await storage.getUserByEmail(user.email);
      if (existingUser) {
        return res.json({ message: "User already exists in custom table", user: existingUser });
      }

      // Create user in custom users table
      const userData = {
        email: user.email,
        name: user.name,
        role: 'member',
      };

      const createdUser = await storage.createUser(userData);

      // Create default organization for the user
      const orgData = {
        name: `${user.name}'s Organization`,
        ownerId: createdUser.id,
      };
      
      await storage.createOrganization(orgData);

      res.json({ message: "User synced successfully", user: createdUser });
    } catch (error) {
      console.error("Sync user error:", error);
      res.status(500).json({ message: "Failed to sync user" });
    }
  });

  app.post("/api/auth/create-user", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;
      const { email, name, role } = req.body;

      // Create user in custom users table
      const userData = {
        email: email || user.email,
        name: name || user.name,
        role: role || 'member',
      };

      const createdUser = await storage.createUser(userData);
      res.json(createdUser);
    } catch (error) {
      console.error("Create user error:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Meeting validation and bot joining routes
  app.post("/api/meetings/validate", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;
      const { url } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent');

      if (!url) {
        return res.status(400).json({ message: "Meeting URL is required" });
      }

      // Import services
      const { googleMeetService } = await import('./services/google-meet');
      const { securityService } = await import('./services/security');

      // Validate meeting data for security compliance
      const dataValidation = await securityService.validateMeetingData({ meetingUrl: url });
      if (!dataValidation.valid) {
        return res.status(400).json({ 
          isActive: false, 
          canJoin: false, 
          message: dataValidation.errors.join(', ') 
        });
      }

      // Validate meeting access with security policies
      const accessValidation = await googleMeetService.validateMeetingAccess(url, user.id, ipAddress, userAgent);
      if (!accessValidation.hasAccess) {
        return res.status(403).json({ 
          isActive: false, 
          canJoin: false, 
          message: accessValidation.message 
        });
      }

      // Check meeting status
      const meetingStatus = await googleMeetService.checkMeetingStatus(url);
      
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

  app.post("/api/meetings/join-bot", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;
      const { url, subject, meetingId } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent');

      if (!url || !meetingId) {
        return res.status(400).json({ 
          success: false, 
          message: "Meeting URL and ID are required" 
        });
      }

      // Import services
      const { googleMeetService } = await import('./services/google-meet');
      const { securityService } = await import('./services/security');

      // Record user consent for meeting recording
      await securityService.recordConsent(user.id, meetingId, true, ipAddress, userAgent);

      // Join meeting with bot
      const result = await googleMeetService.joinMeetingWithBot(url, meetingId, user.id);
      
      res.json(result);
    } catch (error) {
      console.error("Bot joining error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to join meeting with bot" 
      });
    }
  });

  app.get("/api/meetings/:id/recording-status", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;
      const meetingId = req.params.id;

      // Import Google Meet service
      const { googleMeetService } = await import('./services/google-meet');

      const status = await googleMeetService.getMeetingRecordingStatus(meetingId);
      res.json(status);
    } catch (error) {
      console.error("Recording status error:", error);
      res.status(500).json({ message: "Failed to get recording status" });
    }
  });

  app.post("/api/meetings/:id/stop-recording", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;
      const meetingId = req.params.id;

      // Import Google Meet service
      const { googleMeetService } = await import('./services/google-meet');

      const result = await googleMeetService.stopMeetingRecording(meetingId);
      res.json(result);
    } catch (error) {
      console.error("Stop recording error:", error);
      res.status(500).json({ success: false, message: "Failed to stop recording" });
    }
  });

  // Meetings routes
  app.get("/api/meetings", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;
      console.log('📋 Fetching meetings for user:', user.email);
      
      const organizations = await storage.getOrganizationsByOwner(user.id);
      
      if (organizations.length === 0) {
        console.log('⚠️  No organization found for user:', user.email);
        return res.json([]);
      }

      console.log('🏢 Fetching meetings for organization:', organizations[0].name);
      const meetings = await storage.getMeetingsByOrganization(organizations[0].id);
      console.log(`✅ Found ${meetings.length} meetings`);
      
      res.json(meetings);
    } catch (error) {
      console.error("❌ Get meetings error:", error);
      res.status(500).json({ message: "Failed to fetch meetings" });
    }
  });

  app.post("/api/meetings", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;
      console.log('📝 Creating meeting for user:', user.email);
      
      const organizations = await storage.getOrganizationsByOwner(user.id);
      
      if (organizations.length === 0) {
        console.log('❌ No organization found for user:', user.email);
        return res.status(400).json({ message: "No organization found" });
      }

      console.log('🏢 Using organization:', organizations[0].name);

      const meetingData = insertMeetingSchema.parse({
        ...req.body,
        organizationId: organizations[0].id,
      });

      console.log('💾 Storing meeting data:', {
        title: meetingData.title,
        platform: meetingData.platform,
        status: meetingData.status,
        organizationId: meetingData.organizationId
      });

      const meeting = await storage.createMeeting(meetingData);
      console.log('✅ Meeting created successfully with ID:', meeting.id);

      // Start Recall.ai bot if meeting URL is provided
      if (meeting.meetingUrl) {
        try {
          console.log('🤖 Starting Recall.ai bot for meeting:', meeting.id);
          const botId = await recallAIService.startBot(meeting.meetingUrl, meeting.id);
          await storage.updateMeeting(meeting.id, { recallBotId: botId });
          console.log('✅ Recall.ai bot started with ID:', botId);
        } catch (error) {
          console.error("❌ Failed to start Recall.ai bot:", error);
        }
      }

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

  // Optional delete route for completeness used by UI later
  app.delete("/api/meetings/:id", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const meeting = await storage.getMeeting(req.params.id);
      if (!meeting) {
        return res.status(404).json({ message: "Meeting not found" });
      }
      // For in-memory store, just update status to failed as soft-delete example (real impl would delete)
      const updated = await storage.updateMeeting(req.params.id, { status: "failed" as any });
      res.json(updated);
    } catch (error) {
      console.error("Delete meeting error:", error);
      res.status(500).json({ message: "Failed to delete meeting" });
    }
  });

    app.get("/api/meetings/:id", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const meeting = await storage.getMeeting(req.params.id);
      if (!meeting) {
        return res.status(404).json({ message: "Meeting not found" });
      }

      // Check if user has access to this meeting
      const user = req.user!;
      const organizations = await storage.getOrganizationsByOwner(user.id);
      const hasAccess = organizations.some(org => org.id === meeting.organizationId);

      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(meeting);
    } catch (error) {
      console.error("Get meeting error:", error);
      res.status(500).json({ message: "Failed to fetch meeting" });
    }
  });

  // Update meeting endpoint
  app.put("/api/meetings/:id", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;
      const meetingId = req.params.id;
      const updates = req.body;

      console.log('📝 Updating meeting:', meetingId, 'for user:', user.email);

      // Check if meeting exists and user has access
      const meeting = await storage.getMeeting(meetingId);
      if (!meeting) {
        return res.status(404).json({ message: "Meeting not found" });
      }

      const organizations = await storage.getOrganizationsByOwner(user.id);
      const hasAccess = organizations.some(org => org.id === meeting.organizationId);

      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }

      console.log('💾 Storing meeting updates:', updates);
      const updatedMeeting = await storage.updateMeeting(meetingId, updates);
      console.log('✅ Meeting updated successfully');

      res.json(updatedMeeting);
    } catch (error) {
      console.error("❌ Update meeting error:", error);
      res.status(500).json({ message: "Failed to update meeting" });
    }
  });

  // Fetch transcript from Recall.ai bot endpoint
  app.post("/api/meetings/:id/fetch-transcript", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;
      const meetingId = req.params.id;

      console.log('📥 Fetching transcript for meeting:', meetingId, 'by user:', user.email);

      // Check if meeting exists and user has access
      const meeting = await storage.getMeeting(meetingId);
      if (!meeting) {
        return res.status(404).json({ message: "Meeting not found" });
      }

      const organizations = await storage.getOrganizationsByOwner(user.id);
      const hasAccess = organizations.some(org => org.id === meeting.organizationId);

      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Check if meeting has a bot ID
      if (!meeting.recallBotId) {
        return res.status(400).json({ message: "No Recall.ai bot associated with this meeting" });
      }

      // Fetch and store transcript
      await recallAIService.fetchAndStoreTranscript(meeting.recallBotId, meetingId);
      
      // Return updated meeting data
      const updatedMeeting = await storage.getMeeting(meetingId);
      console.log('✅ Transcript fetched and stored successfully');

      res.json({ 
        success: true, 
        message: "Transcript fetched and stored successfully",
        meeting: updatedMeeting 
      });
    } catch (error) {
      console.error("❌ Fetch transcript error:", error);
      res.status(500).json({ 
        success: false, 
        message: error instanceof Error ? error.message : "Failed to fetch transcript" 
      });
    }
  });

  // Generate meeting insights using Gemini
  app.post("/api/meetings/:id/generate-insights", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;
      const meetingId = req.params.id;

      console.log('🧠 Generating insights for meeting:', meetingId, 'by user:', user.email);

      // Check if meeting exists and user has access
      const meeting = await storage.getMeeting(meetingId);
      if (!meeting) {
        return res.status(404).json({ message: "Meeting not found" });
      }

      const organizations = await storage.getOrganizationsByOwner(user.id);
      const hasAccess = organizations.some(org => org.id === meeting.organizationId);

      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Check if meeting has a transcript
      if (!meeting.transcript) {
        return res.status(400).json({ message: "No transcript available for this meeting" });
      }

      // Generate insights
      await recallAIService.generateMeetingInsights(meeting);
      
      // Return updated meeting data
      const updatedMeeting = await storage.getMeeting(meetingId);
      console.log('✅ Insights generated successfully');

      res.json({ 
        success: true, 
        message: "Meeting insights generated successfully",
        meeting: updatedMeeting 
      });
    } catch (error) {
      console.error("❌ Generate insights error:", error);
      res.status(500).json({ 
        success: false, 
        message: error instanceof Error ? error.message : "Failed to generate insights" 
      });
    }
  });

  // Integrations routes
  app.get("/api/integrations", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;
      const organizations = await storage.getOrganizationsByOwner(user.id);
      
      if (organizations.length === 0) {
        return res.json([]);
      }

      const integrations = await storage.getIntegrationsByOrganization(organizations[0].id);
      
      // Remove sensitive data before sending
      const safeIntegrations = integrations.map(integration => ({
        ...integration,
        accessToken: undefined,
        refreshToken: undefined,
      }));

      res.json(safeIntegrations);
    } catch (error) {
      console.error("Get integrations error:", error);
      res.status(500).json({ message: "Failed to fetch integrations" });
    }
  });

  // Agents routes
  app.get("/api/agents", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;
      const organizations = await storage.getOrganizationsByOwner(user.id);
      if (organizations.length === 0) return res.json([]);
      const agents = await storage.getAgentsByOrganization(organizations[0].id);
      res.json(agents);
    } catch (error) {
      console.error("Get agents error:", error);
      res.status(500).json({ message: "Failed to fetch agents" });
    }
  });

  app.post("/api/agents", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;
      const organizations = await storage.getOrganizationsByOwner(user.id);
      if (organizations.length === 0) return res.status(400).json({ message: "No organization found" });
      const agentData = insertAgentSchema.parse({
        ...req.body,
        organizationId: organizations[0].id,
      });
      const agent = await storage.createAgent(agentData);
      res.json(agent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid agent data", errors: error.errors });
      }
      console.error("Create agent error:", error);
      res.status(500).json({ message: "Failed to create agent" });
    }
  });

  app.post("/api/integrations/:provider/connect", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;
      const provider = req.params.provider;
      const organizations = await storage.getOrganizationsByOwner(user.id);
      
      if (organizations.length === 0) {
        return res.status(400).json({ message: "No organization found" });
      }

      const authUrl = await oauthService.getAuthUrl(provider, organizations[0].id);
      res.json({ authUrl });
    } catch (error) {
      console.error("OAuth connect error:", error);
      res.status(500).json({ message: "Failed to initiate OAuth connection" });
    }
  });

  app.post("/api/integrations/callback", async (req, res) => {
    try {
      const { code, state, provider } = req.body;
      
      if (!code || !state || !provider) {
        return res.status(400).json({ message: "Missing OAuth parameters" });
      }

      const integration = await oauthService.handleCallback(provider, code, state);
      res.json({ success: true, integration: { ...integration, accessToken: undefined, refreshToken: undefined } });
    } catch (error) {
      console.error("OAuth callback error:", error);
      res.status(500).json({ message: "OAuth callback failed" });
    }
  });

  app.delete("/api/integrations/:id", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const integrationId = req.params.id;
      const integration = await storage.getIntegration(integrationId);
      
      if (!integration) {
        return res.status(404).json({ message: "Integration not found" });
      }

      // Check if user has access to this integration
      const user = req.user!;
      const organizations = await storage.getOrganizationsByOwner(user.id);
      const hasAccess = organizations.some(org => org.id === integration.organizationId);
      
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.deleteIntegration(integrationId);
      
      res.json({ success: true, message: "Integration disconnected successfully" });
    } catch (error) {
      console.error("Delete integration error:", error);
      res.status(500).json({ message: "Failed to disconnect integration" });
    }
  });

  // Jira-specific integration routes
  app.get("/api/integrations/jira/projects", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;
      const organizations = await storage.getOrganizationsByOwner(user.id);
      
      if (organizations.length === 0) {
        return res.status(400).json({ message: "No organization found" });
      }

      const integration = await storage.getIntegrationByProvider(organizations[0].id, "jira");
      if (!integration || !integration.isActive) {
        return res.status(400).json({ message: "Jira integration not found or inactive" });
      }

      const accessToken = await oauthService.getDecryptedAccessToken(integration);
      const { jiraService } = await import('./services/jira');
      const projects = await jiraService.getProjects(accessToken);
      
      res.json(projects);
    } catch (error) {
      console.error("Get Jira projects error:", error);
      res.status(500).json({ message: "Failed to fetch Jira projects" });
    }
  });

  app.get("/api/integrations/jira/boards", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;
      const { projectKey } = req.query;
      const organizations = await storage.getOrganizationsByOwner(user.id);
      
      if (organizations.length === 0) {
        return res.status(400).json({ message: "No organization found" });
      }

      const integration = await storage.getIntegrationByProvider(organizations[0].id, "jira");
      if (!integration || !integration.isActive) {
        return res.status(400).json({ message: "Jira integration not found or inactive" });
      }

      const accessToken = await oauthService.getDecryptedAccessToken(integration);
      const { jiraService } = await import('./services/jira');
      const boards = await jiraService.getBoards(accessToken, projectKey as string);
      
      res.json(boards);
    } catch (error) {
      console.error("Get Jira boards error:", error);
      res.status(500).json({ message: "Failed to fetch Jira boards" });
    }
  });

  app.get("/api/integrations/jira/boards/:boardId/issues", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;
      const { boardId } = req.params;
      const organizations = await storage.getOrganizationsByOwner(user.id);
      
      if (organizations.length === 0) {
        return res.status(400).json({ message: "No organization found" });
      }

      const integration = await storage.getIntegrationByProvider(organizations[0].id, "jira");
      if (!integration || !integration.isActive) {
        return res.status(400).json({ message: "Jira integration not found or inactive" });
      }

      const accessToken = await oauthService.getDecryptedAccessToken(integration);
      const { jiraService } = await import('./services/jira');
      const issues = await jiraService.getBoardIssues(accessToken, parseInt(boardId));
      
      res.json(issues);
    } catch (error) {
      console.error("Get board issues error:", error);
      res.status(500).json({ message: "Failed to fetch board issues" });
    }
  });

  app.get("/api/integrations/jira/projects/:projectKey/issue-types", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;
      const { projectKey } = req.params;
      const organizations = await storage.getOrganizationsByOwner(user.id);
      
      if (organizations.length === 0) {
        return res.status(400).json({ message: "No organization found" });
      }

      const integration = await storage.getIntegrationByProvider(organizations[0].id, "jira");
      if (!integration || !integration.isActive) {
        return res.status(400).json({ message: "Jira integration not found or inactive" });
      }

      const accessToken = await oauthService.getDecryptedAccessToken(integration);
      const { jiraService } = await import('./services/jira');
      const issueTypes = await jiraService.getIssueTypes(accessToken, projectKey);
      
      res.json(issueTypes);
    } catch (error) {
      console.error("Get issue types error:", error);
      res.status(500).json({ message: "Failed to fetch issue types" });
    }
  });

  app.get("/api/integrations/jira/priorities", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;
      const organizations = await storage.getOrganizationsByOwner(user.id);
      
      if (organizations.length === 0) {
        return res.status(400).json({ message: "No organization found" });
      }

      const integration = await storage.getIntegrationByProvider(organizations[0].id, "jira");
      if (!integration || !integration.isActive) {
        return res.status(400).json({ message: "Jira integration not found or inactive" });
      }

      const accessToken = await oauthService.getDecryptedAccessToken(integration);
      const { jiraService } = await import('./services/jira');
      const priorities = await jiraService.getPriorities(accessToken);
      
      res.json(priorities);
    } catch (error) {
      console.error("Get priorities error:", error);
      res.status(500).json({ message: "Failed to fetch priorities" });
    }
  });

  app.post("/api/meetings/:id/sync/jira", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;
      const meetingId = req.params.id;
      const { projectKey, options } = req.body;

      if (!projectKey) {
        return res.status(400).json({ message: "Project key is required" });
      }

      // Check if meeting exists and user has access
      const meeting = await storage.getMeeting(meetingId);
      if (!meeting) {
        return res.status(404).json({ message: "Meeting not found" });
      }

      const organizations = await storage.getOrganizationsByOwner(user.id);
      const hasAccess = organizations.some(org => org.id === meeting.organizationId);
      
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }

      const integration = await storage.getIntegrationByProvider(organizations[0].id, "jira");
      if (!integration || !integration.isActive) {
        return res.status(400).json({ message: "Jira integration not found or inactive" });
      }

      const accessToken = await oauthService.getDecryptedAccessToken(integration);
      const { jiraService } = await import('./services/jira');
      const result = await jiraService.syncMeetingToJira(accessToken, meeting, projectKey, options);
      
      res.json({ 
        success: true, 
        message: "Meeting synced to Jira successfully",
        result 
      });
    } catch (error) {
      console.error("Sync to Jira error:", error);
      res.status(500).json({ 
        success: false,
        message: error instanceof Error ? error.message : "Failed to sync to Jira" 
      });
    }
  });

  // Webhook routes
  app.post("/api/webhooks/recall", async (req, res) => {
    try {
      const event: any = {
        source: "recall_ai",
        eventType: req.body.event || "unknown",
        payload: req.body || {},
        processed: false,
      };

      const webhookEvent = await storage.createWebhookEvent(event);
      
      // Process the webhook
      await recallAIService.processWebhook(webhookEvent);

      // If meeting is completed, sync to integrations
      if (event.eventType === "transcript.ready" && event.meetingId) {
        const meeting = await storage.getMeeting(event.meetingId);
        if (meeting && meeting.status === "completed") {
          // Sync to Jira if integration exists
          await oauthService.syncMeetingToIntegration(meeting, "jira");
        }
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Webhook processing error:", error);
      res.status(500).json({ message: "Webhook processing failed" });
    }
  });

  // Manual sync route
  app.post("/api/meetings/:id/sync", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const meeting = await storage.getMeeting(req.params.id);
      if (!meeting) {
        return res.status(404).json({ message: "Meeting not found" });
      }

      // Check if user has access to this meeting
      const user = req.user!;
      const organizations = await storage.getOrganizationsByOwner(user.id);
      const hasAccess = organizations.some(org => org.id === meeting.organizationId);
      
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }

      const { provider } = req.body;
      if (!provider) {
        return res.status(400).json({ message: "Provider required" });
      }

      await oauthService.syncMeetingToIntegration(meeting, provider);
      res.json({ success: true, message: `Meeting synced to ${provider}` });
    } catch (error) {
      console.error("Meeting sync error:", error);
      res.status(500).json({ message: "Failed to sync meeting" });
    }
  });

  // Analytics routes
  app.get("/api/analytics/meetings", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;
      const organizations = await storage.getOrganizationsByOwner(user.id);
      
      if (organizations.length === 0) {
        return res.json({
          totalMeetings: 0,
          completedMeetings: 0,
          scheduledMeetings: 0,
          inProgressMeetings: 0,
        });
      }

      const meetings = await storage.getMeetingsByOrganization(organizations[0].id);
      
      const analytics = {
        totalMeetings: meetings.length,
        completedMeetings: meetings.filter(m => m.status === "completed").length,
        scheduledMeetings: meetings.filter(m => m.status === "scheduled").length,
        inProgressMeetings: meetings.filter(m => m.status === "in_progress").length,
      };

      res.json(analytics);
    } catch (error) {
      console.error("Analytics error:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Get real-time transcript for a meeting
  app.get('/api/meetings/:id/transcript/live', authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const meetingId = req.params.id;
      const user = req.user!;

      // Get meeting to verify access
      const meeting = await storage.getMeeting(meetingId);
      if (!meeting) {
        return res.status(404).json({ message: 'Meeting not found' });
      }

      // Get bot ID from meeting recallBotId field
      const botId = meeting.recallBotId;
      if (!botId) {
        return res.status(404).json({ message: 'No bot found for this meeting' });
      }

      // Get real-time transcript
      const { recallAIService } = await import('./services/recall-ai');
      const transcript = await recallAIService.getRealTimeTranscript(botId);
      res.json({
        meetingId,
        transcript: transcript.transcript,
        speakers: transcript.speakers,
        isLive: transcript.is_live,
        language: transcript.language,
        translatedText: transcript.translated_text,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Live transcript error:', error);
      res.status(500).json({ message: 'Failed to get live transcript' });
    }
  });

  // Get bot status for a meeting
  app.get('/api/meetings/:id/bot/status', authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const meetingId = req.params.id;
      const user = req.user!;

      // Get meeting to verify access
      const meeting = await storage.getMeeting(meetingId);
      if (!meeting) {
        return res.status(404).json({ message: 'Meeting not found' });
      }

      // Get bot ID from meeting recallBotId field
      const botId = meeting.recallBotId;
      if (!botId) {
        return res.status(404).json({ message: 'No bot found for this meeting' });
      }

      // Get bot status
      const { recallAIService } = await import('./services/recall-ai');
      const botStatus = await recallAIService.getBotStatusDetailed(botId);
      res.json({
        meetingId,
        botStatus,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Bot status error:', error);
      res.status(500).json({ message: 'Failed to get bot status' });
    }
  });

  // API-specific 404 handler
  app.use('/api/*', (req, res) => {
    res.status(404).json({
      error: 'Not Found',
      message: `API endpoint ${req.method} ${req.originalUrl} not found`,
      path: req.originalUrl
    });
  });

  // Catch-all route for non-API routes (will be handled by Vite/static serving)
  app.use('*', (req, res, next) => {
    // Only handle non-API routes here
    if (!req.originalUrl.startsWith('/api')) {
      return next();
    }
    
    // This should not be reached for API routes, but just in case
    res.status(404).json({
      error: 'Not Found',
      message: `Route ${req.method} ${req.originalUrl} not found`,
      path: req.originalUrl
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
