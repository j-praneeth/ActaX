import { storage } from "../storage";
import { randomUUID } from "crypto";
import type { InsertIntegration, Meeting } from "@shared/schema";
import 'dotenv/config';

interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  authUrl: string;
  tokenUrl: string;
  scopes: string[];
  redirectUri: string;
}

class OAuthService {
  private configs: Map<string, OAuthConfig> = new Map();
  private pendingStates: Map<string, { organizationId: string; provider: string }> = new Map();

  constructor() {
    this.initializeConfigs();
  }

  private initializeConfigs(): void {
    const baseRedirectUri = process.env.CALLBACK_BASE_URL || "http://localhost:5000";

    // Jira OAuth Config
    this.configs.set("jira", {
      clientId: process.env.JIRA_CLIENT_ID || "demo_client_id",
      clientSecret: process.env.JIRA_CLIENT_SECRET || "demo_client_secret",
      authUrl: "https://auth.atlassian.com/authorize",
      tokenUrl: "https://auth.atlassian.com/oauth/token",
      scopes: ["read:jira-work", "write:jira-work"],
      redirectUri: `${baseRedirectUri}/api/integrations/callback`,
    });

    // Linear OAuth Config
    this.configs.set("linear", {
      clientId: process.env.LINEAR_CLIENT_ID || "demo_client_id",
      clientSecret: process.env.LINEAR_CLIENT_SECRET || "demo_client_secret",
      authUrl: "https://linear.app/oauth/authorize",
      tokenUrl: "https://api.linear.app/oauth/token",
      scopes: ["read", "write"],
      redirectUri: `${baseRedirectUri}/api/integrations/callback`,
    });

    // Salesforce OAuth Config
    this.configs.set("salesforce", {
      clientId: process.env.SALESFORCE_CLIENT_ID || "demo_client_id",
      clientSecret: process.env.SALESFORCE_CLIENT_SECRET || "demo_client_secret",
      authUrl: "https://login.salesforce.com/services/oauth2/authorize",
      tokenUrl: "https://login.salesforce.com/services/oauth2/token",
      scopes: ["api", "refresh_token"],
      redirectUri: `${baseRedirectUri}/api/integrations/callback`,
    });

    // HubSpot OAuth Config
    this.configs.set("hubspot", {
      clientId: process.env.HUBSPOT_CLIENT_ID || "demo_client_id",
      clientSecret: process.env.HUBSPOT_CLIENT_SECRET || "demo_client_secret",
      authUrl: "https://app.hubspot.com/oauth/authorize",
      tokenUrl: "https://api.hubapi.com/oauth/v1/token",
      scopes: ["contacts", "automation"],
      redirectUri: `${baseRedirectUri}/api/integrations/callback`,
    });

    // Slack OAuth Config
    this.configs.set("slack", {
      clientId: process.env.SLACK_CLIENT_ID || "demo_client_id",
      clientSecret: process.env.SLACK_CLIENT_SECRET || "demo_client_secret",
      authUrl: "https://slack.com/oauth/v2/authorize",
      tokenUrl: "https://slack.com/api/oauth.v2.access",
      scopes: ["channels:read", "chat:write"],
      redirectUri: `${baseRedirectUri}/api/integrations/callback`,
    });

    // Notion OAuth Config
    this.configs.set("notion", {
      clientId: process.env.NOTION_CLIENT_ID || "demo_client_id",
      clientSecret: process.env.NOTION_CLIENT_SECRET || "demo_client_secret",
      authUrl: "https://api.notion.com/v1/oauth/authorize",
      tokenUrl: "https://api.notion.com/v1/oauth/token",
      scopes: [],
      redirectUri: `${baseRedirectUri}/api/integrations/callback`,
    });

    // Google OAuth Config
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
    
    if (googleClientId && googleClientSecret) {
      this.configs.set("google", {
        clientId: googleClientId,
        clientSecret: googleClientSecret,
        authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
        tokenUrl: "https://oauth2.googleapis.com/token",
        scopes: ["openid", "email", "profile", "https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/meetings.space.created"],
        redirectUri: `${baseRedirectUri}/api/auth/google/callback`,
      });
    } else {
      console.warn('Google OAuth not configured - missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
    }
  }

  async getAuthUrl(provider: string, organizationId: string): Promise<string> {
    const config = this.configs.get(provider);
    if (!config) {
      throw new Error(`Unsupported OAuth provider: ${provider}`);
    }

    const state = randomUUID();
    this.pendingStates.set(state, { organizationId, provider });

    // Clean up old states (older than 1 hour)
    setTimeout(() => {
      this.pendingStates.delete(state);
    }, 3600000);

    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      state,
      scope: config.scopes.join(" "),
      response_type: "code",
    });

    return `${config.authUrl}?${params.toString()}`;
  }

  async handleCallback(provider: string, code: string, state: string): Promise<any> {
    const stateInfo = this.pendingStates.get(state);
    if (!stateInfo || stateInfo.provider !== provider) {
      throw new Error("Invalid OAuth state");
    }

    const config = this.configs.get(provider);
    if (!config) {
      throw new Error(`Unsupported OAuth provider: ${provider}`);
    }

    try {
      // Exchange code for access token
      const tokenResponse = await fetch(config.tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "application/json",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          client_id: config.clientId,
          client_secret: config.clientSecret,
          code,
          redirect_uri: config.redirectUri,
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error(`Token exchange failed: ${tokenResponse.status} ${tokenResponse.statusText}`);
      }

      const tokenData = await tokenResponse.json();

      // Store the integration
      const integrationData: InsertIntegration = {
        organizationId: stateInfo.organizationId,
        provider,
        accessToken: this.encryptToken(tokenData.access_token),
        refreshToken: tokenData.refresh_token ? this.encryptToken(tokenData.refresh_token) : null,
        expiresAt: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : null,
        isActive: true,
        settings: {
          scope: tokenData.scope,
          tokenType: tokenData.token_type,
        },
      };

      const integration = await storage.createIntegration(integrationData);
      
      // Clean up state
      this.pendingStates.delete(state);

      return integration;
    } catch (error) {
      console.error(`OAuth callback error for ${provider}:`, error);
      throw error;
    }
  }

  async refreshToken(integration: any): Promise<void> {
    const config = this.configs.get(integration.provider);
    if (!config || !integration.refreshToken) {
      throw new Error("Cannot refresh token");
    }

    try {
      const response = await fetch(config.tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "application/json",
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          client_id: config.clientId,
          client_secret: config.clientSecret,
          refresh_token: this.decryptToken(integration.refreshToken),
        }),
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status} ${response.statusText}`);
      }

      const tokenData = await response.json();

      await storage.updateIntegration(integration.id, {
        accessToken: this.encryptToken(tokenData.access_token),
        refreshToken: tokenData.refresh_token ? this.encryptToken(tokenData.refresh_token) : integration.refreshToken,
        expiresAt: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : null,
      });
    } catch (error) {
      console.error(`Token refresh error for ${integration.provider}:`, error);
      // Mark integration as inactive if refresh fails
      await storage.updateIntegration(integration.id, { isActive: false });
      throw error;
    }
  }

  private encryptToken(token: string): string {
    // In production, use proper encryption
    // For demo purposes, we'll just base64 encode
    return Buffer.from(token).toString('base64');
  }

  private decryptToken(encryptedToken: string): string {
    // In production, use proper decryption
    // For demo purposes, we'll just base64 decode
    return Buffer.from(encryptedToken, 'base64').toString();
  }

  async getDecryptedAccessToken(integration: any): Promise<string> {
    // Check if token needs refresh
    if (integration.expiresAt && new Date() > integration.expiresAt) {
      await this.refreshToken(integration);
      const refreshedIntegration = await storage.getIntegrationByProvider(
        integration.organizationId, 
        integration.provider
      );
      if (!refreshedIntegration) throw new Error("Failed to refresh integration");
      return this.decryptToken(refreshedIntegration.accessToken);
    }

    return this.decryptToken(integration.accessToken);
  }

  async syncMeetingToIntegration(meeting: Meeting, provider: string): Promise<void> {
    try {
      const integration = await storage.getIntegrationByProvider(meeting.organizationId, provider);
      if (!integration || !integration.isActive) {
        console.log(`No active ${provider} integration found`);
        return;
      }

      const accessToken = await this.getDecryptedAccessToken(integration);

      switch (provider) {
        case "jira":
          await this.syncToJira(meeting, accessToken);
          break;
        case "linear":
          await this.syncToLinear(meeting, accessToken);
          break;
        case "salesforce":
          await this.syncToSalesforce(meeting, accessToken);
          break;
        case "hubspot":
          await this.syncToHubspot(meeting, accessToken);
          break;
        case "slack":
          await this.syncToSlack(meeting, accessToken);
          break;
        case "notion":
          await this.syncToNotion(meeting, accessToken);
          break;
      }
    } catch (error) {
      console.error(`Failed to sync meeting to ${provider}:`, error);
    }
  }

  private async syncToJira(meeting: Meeting, accessToken: string): Promise<void> {
    try {
      const { jiraService } = await import('./jira');
      
      // Get the user's default project (this could be configurable in the future)
      const projects = await jiraService.getProjects(accessToken);
      if (projects.length === 0) {
        console.error("No Jira projects found");
        return;
      }
      
      // Use the first project as default (in production, this should be user-configurable)
      const defaultProject = projects[0];
      
      await jiraService.syncMeetingToJira(accessToken, meeting, defaultProject.key, {
        createSummaryIssue: true,
        createActionItemIssues: true,
        summaryIssueType: "Story",
        actionItemIssueType: "Task",
        priority: "Medium"
      });
    } catch (error) {
      console.error("Failed to sync meeting to Jira:", error);
    }
  }

  private async getJiraCloudId(accessToken: string): Promise<string | null> {
    try {
      const response = await fetch("https://api.atlassian.com/oauth/token/accessible-resources", {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Accept": "application/json",
        },
      });

      if (!response.ok) return null;

      const resources = await response.json();
      return resources[0]?.id || null;
    } catch (error) {
      console.error("Failed to get Jira cloud ID:", error);
      return null;
    }
  }

  private async createJiraIssue(cloudId: string, accessToken: string, issueData: {
    summary: string;
    description: string;
    issuetype: string;
    priority: string;
  }): Promise<{ key: string } | null> {
    try {
      const response = await fetch(`https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/issue`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fields: {
            project: { key: "MEET" }, // This would be configurable
            summary: issueData.summary,
            description: {
              type: "doc",
              version: 1,
              content: [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: issueData.description
                    }
                  ]
                }
              ]
            },
            issuetype: { name: issueData.issuetype },
            priority: { name: issueData.priority },
          },
        }),
      });

      if (!response.ok) {
        console.error(`Jira API error: ${response.status} ${response.statusText}`);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to create Jira issue:", error);
      return null;
    }
  }

  private async linkJiraIssues(cloudId: string, accessToken: string, inwardIssue: string, outwardIssue: string, linkType: string): Promise<void> {
    try {
      await fetch(`https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/issueLink`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: { name: linkType },
          inwardIssue: { key: inwardIssue },
          outwardIssue: { key: outwardIssue },
        }),
      });
    } catch (error) {
      console.error("Failed to link Jira issues:", error);
    }
  }

  private generateJiraDescription(meeting: Meeting): string {
    const actionItemsText = Array.isArray(meeting.actionItems) 
      ? meeting.actionItems.map((item: string) => `• ${item}`).join("\n")
      : "No action items";
    
    const keyTopicsText = Array.isArray(meeting.keyTopics)
      ? meeting.keyTopics.map((topic: string) => `• ${topic}`).join("\n")
      : "No key topics";
    
    const decisionsText = Array.isArray(meeting.decisions)
      ? meeting.decisions.map((decision: string) => `• ${decision}`).join("\n")
      : "No decisions recorded";

    return `Meeting Summary: ${meeting.title}

📝 Summary:
${meeting.summary || "No summary available"}

✅ Action Items:
${actionItemsText}

🔑 Key Topics:
${keyTopicsText}

📋 Decisions:
${decisionsText}

📊 Sentiment: ${meeting.sentiment || "Not analyzed"}

Meeting Date: ${meeting.startTime ? new Date(meeting.startTime).toLocaleDateString() : 'N/A'}
Duration: ${meeting.startTime && meeting.endTime ? 
  Math.round((new Date(meeting.endTime).getTime() - new Date(meeting.startTime).getTime()) / (1000 * 60)) + ' minutes' : 
  'Unknown'}`;
  }

  private async syncToLinear(meeting: Meeting, accessToken: string): Promise<void> {
    // Create Linear issues from action items
    if (!meeting.actionItems || !Array.isArray(meeting.actionItems)) return;

    for (const actionItem of meeting.actionItems) {
      try {
        await fetch("https://api.linear.app/graphql", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `
              mutation IssueCreate($input: IssueCreateInput!) {
                issueCreate(input: $input) {
                  success
                  issue { id title }
                }
              }
            `,
            variables: {
              input: {
                title: actionItem,
                description: `Action item from meeting: ${meeting.title}`,
                teamId: "team_id", // This would be configurable
              },
            },
          }),
        });
      } catch (error) {
        console.error("Failed to create Linear issue:", error);
      }
    }
  }

  private async syncToSalesforce(meeting: Meeting, accessToken: string): Promise<void> {
    // Create Salesforce tasks from action items
    if (!meeting.actionItems || !Array.isArray(meeting.actionItems)) return;

    for (const actionItem of meeting.actionItems) {
      try {
        await fetch("https://instance.salesforce.com/services/data/v57.0/sobjects/Task", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            Subject: actionItem,
            Description: `Action item from meeting: ${meeting.title}`,
            Status: "Not Started",
          }),
        });
      } catch (error) {
        console.error("Failed to create Salesforce task:", error);
      }
    }
  }

  private async syncToHubspot(meeting: Meeting, accessToken: string): Promise<void> {
    // Create HubSpot tasks from action items
    if (!meeting.actionItems || !Array.isArray(meeting.actionItems)) return;

    for (const actionItem of meeting.actionItems) {
      try {
        await fetch("https://api.hubapi.com/crm/v3/objects/tasks", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            properties: {
              hs_task_subject: actionItem,
              hs_task_body: `Action item from meeting: ${meeting.title}`,
              hs_task_status: "NOT_STARTED",
            },
          }),
        });
      } catch (error) {
        console.error("Failed to create HubSpot task:", error);
      }
    }
  }

  private async syncToSlack(meeting: Meeting, accessToken: string): Promise<void> {
    // Post meeting summary to Slack channel
    try {
      const actionItemsText = Array.isArray(meeting.actionItems) 
        ? meeting.actionItems.map((item: string) => `• ${item}`).join("\n")
        : "No action items";
      
      const keyTopicsText = Array.isArray(meeting.keyTopics)
        ? meeting.keyTopics.map((topic: string) => `• ${topic}`).join("\n")
        : "No key topics";
      
      const message = `🎯 Meeting Summary: *${meeting.title}*\n\n` +
        `📝 *Summary:* ${meeting.summary || "No summary available"}\n\n` +
        `✅ *Action Items:*\n${actionItemsText}\n\n` +
        `🔑 *Key Topics:*\n${keyTopicsText}`;

      await fetch("https://slack.com/api/chat.postMessage", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channel: "#meetings", // This would be configurable
          text: message,
        }),
      });
    } catch (error) {
      console.error("Failed to post to Slack:", error);
    }
  }

  private async syncToNotion(meeting: Meeting, accessToken: string): Promise<void> {
    // Create a Notion page for the meeting
    try {
      await fetch("https://api.notion.com/v1/pages", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "Notion-Version": "2022-06-28",
        },
        body: JSON.stringify({
          parent: {
            database_id: "database_id", // This would be configurable
          },
          properties: {
            Name: {
              title: [
                {
                  text: {
                    content: meeting.title,
                  },
                },
              ],
            },
            Status: {
              select: {
                name: meeting.status,
              },
            },
          },
          children: [
            {
              object: "block",
              type: "paragraph",
              paragraph: {
                rich_text: [
                  {
                    type: "text",
                    text: {
                      content: meeting.summary || "No summary available",
                    },
                  },
                ],
              },
            },
          ],
        }),
      });
    } catch (error) {
      console.error("Failed to create Notion page:", error);
    }
  }
}

export const oauthService = new OAuthService();
