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

            // Google OAuth routes
          app.get("/api/auth/google", async (req, res) => {
            try {
              const authUrl = googleAuthService.getAuthUrl();
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
      const { code, error } = req.query;
      
      if (error) {
        console.error("Google OAuth error:", error);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5000';
        return res.redirect(`${frontendUrl}/login?error=oauth_error`);
      }
      
      if (!code || typeof code !== 'string') {
        console.error("No authorization code received");
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5000';
        return res.redirect(`${frontendUrl}/login?error=no_code`);
      }

      console.log("Received authorization code:", code.substring(0, 20) + "...");
      
      const { user, token } = await googleAuthService.handleCallback(code);
      
      console.log("User authenticated:", user.email);
      
      // Redirect to frontend with token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5000';
      res.redirect(`${frontendUrl}/dashboard?token=${token}`);
    } catch (error) {
      console.error("Google OAuth callback error:", error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5000';
      res.redirect(`${frontendUrl}/login?error=callback_failed`);
    }
  });

  // Meetings routes
  app.get("/api/meetings", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;
      const organizations = await storage.getOrganizationsByOwner(user.id);
      
      if (organizations.length === 0) {
        return res.json([]);
      }

      const meetings = await storage.getMeetingsByOrganization(organizations[0].id);
      res.json(meetings);
    } catch (error) {
      console.error("Get meetings error:", error);
      res.status(500).json({ message: "Failed to fetch meetings" });
    }
  });

  app.post("/api/meetings", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;
      const organizations = await storage.getOrganizationsByOwner(user.id);
      
      if (organizations.length === 0) {
        return res.status(400).json({ message: "No organization found" });
      }

      const meetingData = insertMeetingSchema.parse({
        ...req.body,
        organizationId: organizations[0].id,
      });

      const meeting = await storage.createMeeting(meetingData);

      // Start Recall.ai bot if meeting URL is provided
      if (meeting.meetingUrl) {
        try {
          const botId = await recallAIService.startBot(meeting.meetingUrl, meeting.id);
          await storage.updateMeeting(meeting.id, { recallBotId: botId });
        } catch (error) {
          console.error("Failed to start Recall.ai bot:", error);
        }
      }

      res.json(meeting);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid meeting data", errors: error.errors });
      }
      console.error("Create meeting error:", error);
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

  // Webhook routes
  app.post("/api/webhooks/recall", async (req, res) => {
    try {
      const event = insertWebhookEventSchema.parse({
        source: "recall_ai",
        eventType: req.body.event || "unknown",
        payload: req.body,
      });

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

  const httpServer = createServer(app);
  return httpServer;
}
