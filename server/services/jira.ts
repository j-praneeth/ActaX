import { storage } from "../storage";
import type { Meeting } from "@shared/schema";

export interface JiraProject {
  id: string;
  key: string;
  name: string;
  projectTypeKey: string;
}

export interface JiraBoard {
  id: number;
  name: string;
  type: string;
  location: {
    projectId: string;
    projectKey: string;
    projectName: string;
  };
}

export interface JiraIssue {
  id: string;
  key: string;
  fields: {
    summary: string;
    description?: any;
    status: {
      name: string;
    };
    issuetype: {
      name: string;
    };
    priority?: {
      name: string;
    };
  };
}

export interface JiraIssueType {
  id: string;
  name: string;
  subtask: boolean;
}

export interface JiraPriority {
  id: string;
  name: string;
}

export class JiraService {
  private async getCloudId(accessToken: string): Promise<string> {
    const response = await fetch("https://api.atlassian.com/oauth/token/accessible-resources", {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get Jira cloud ID: ${response.status} ${response.statusText}`);
    }

    const resources = await response.json();
    if (!resources || resources.length === 0) {
      throw new Error("No accessible Jira resources found");
    }

    return resources[0].id;
  }

  async getProjects(accessToken: string): Promise<JiraProject[]> {
    const cloudId = await this.getCloudId(accessToken);
    
    const response = await fetch(`https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/project`, {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Jira projects: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  async getBoards(accessToken: string, projectKey?: string): Promise<JiraBoard[]> {
    const cloudId = await this.getCloudId(accessToken);
    
    let url = `https://api.atlassian.com/ex/jira/${cloudId}/rest/agile/1.0/board`;
    if (projectKey) {
      url += `?projectKeyOrId=${projectKey}`;
    }
    
    const response = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Jira boards: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.values || [];
  }

  async getBoardIssues(accessToken: string, boardId: number): Promise<JiraIssue[]> {
    const cloudId = await this.getCloudId(accessToken);
    
    const response = await fetch(`https://api.atlassian.com/ex/jira/${cloudId}/rest/agile/1.0/board/${boardId}/issue`, {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch board issues: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.issues || [];
  }

  async getIssueTypes(accessToken: string, projectKey: string): Promise<JiraIssueType[]> {
    const cloudId = await this.getCloudId(accessToken);
    
    const response = await fetch(`https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/project/${projectKey}`, {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch project details: ${response.status} ${response.statusText}`);
    }

    const project = await response.json();
    return project.issueTypes || [];
  }

  async getPriorities(accessToken: string): Promise<JiraPriority[]> {
    const cloudId = await this.getCloudId(accessToken);
    
    const response = await fetch(`https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/priority`, {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch priorities: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  async createIssue(accessToken: string, projectKey: string, issueData: {
    summary: string;
    description: string;
    issueType: string;
    priority?: string;
  }): Promise<JiraIssue> {
    const cloudId = await this.getCloudId(accessToken);
    
    const fields: any = {
      project: { key: projectKey },
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
      issuetype: { name: issueData.issueType },
    };

    if (issueData.priority) {
      fields.priority = { name: issueData.priority };
    }

    const response = await fetch(`https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/issue`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create Jira issue: ${response.status} ${errorText}`);
    }

    return await response.json();
  }

  async updateIssue(accessToken: string, issueKey: string, updates: {
    summary?: string;
    description?: string;
    priority?: string;
  }): Promise<void> {
    const cloudId = await this.getCloudId(accessToken);
    
    const fields: any = {};
    
    if (updates.summary) {
      fields.summary = updates.summary;
    }
    
    if (updates.description) {
      fields.description = {
        type: "doc",
        version: 1,
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: updates.description
              }
            ]
          }
        ]
      };
    }
    
    if (updates.priority) {
      fields.priority = { name: updates.priority };
    }

    const response = await fetch(`https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/issue/${issueKey}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update Jira issue: ${response.status} ${errorText}`);
    }
  }

  async findIssueByTitle(accessToken: string, projectKey: string, title: string): Promise<JiraIssue | null> {
    const cloudId = await this.getCloudId(accessToken);
    
    const jql = `project = "${projectKey}" AND summary ~ "${title.replace(/"/g, '\\"')}"`;
    
    const response = await fetch(`https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/search`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jql,
        maxResults: 1,
        fields: ["summary", "description", "status", "issuetype", "priority"]
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to search Jira issues: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.issues && data.issues.length > 0 ? data.issues[0] : null;
  }

  async syncMeetingToJira(
    accessToken: string, 
    meeting: Meeting, 
    projectKey: string,
    options: {
      createSummaryIssue?: boolean;
      createActionItemIssues?: boolean;
      summaryIssueType?: string;
      actionItemIssueType?: string;
      priority?: string;
    } = {}
  ): Promise<{ summaryIssue?: JiraIssue; actionItemIssues: JiraIssue[] }> {
    const result: { summaryIssue?: JiraIssue; actionItemIssues: JiraIssue[] } = {
      actionItemIssues: []
    };

    const {
      createSummaryIssue = true,
      createActionItemIssues = true,
      summaryIssueType = "Story",
      actionItemIssueType = "Task",
      priority = "Medium"
    } = options;

    // Create or update main meeting summary issue
    if (createSummaryIssue) {
      const summaryTitle = `Meeting Summary: ${meeting.title}`;
      const existingSummaryIssue = await this.findIssueByTitle(accessToken, projectKey, summaryTitle);
      
      const summaryDescription = this.generateMeetingDescription(meeting);
      
      if (existingSummaryIssue) {
        // Update existing issue
        await this.updateIssue(accessToken, existingSummaryIssue.key, {
          summary: summaryTitle,
          description: summaryDescription,
          priority
        });
        result.summaryIssue = existingSummaryIssue;
      } else {
        // Create new issue
        result.summaryIssue = await this.createIssue(accessToken, projectKey, {
          summary: summaryTitle,
          description: summaryDescription,
          issueType: summaryIssueType,
          priority
        });
      }
    }

    // Create or update action item issues
    if (createActionItemIssues && meeting.actionItems && Array.isArray(meeting.actionItems)) {
      for (const actionItem of meeting.actionItems) {
        try {
          const actionTitle = `Action: ${actionItem}`;
          const existingActionIssue = await this.findIssueByTitle(accessToken, projectKey, actionTitle);
          
          const actionDescription = `Action item from meeting: ${meeting.title}\n\nMeeting Date: ${meeting.startTime ? new Date(meeting.startTime).toLocaleDateString() : 'N/A'}\n\nDetails: ${actionItem}`;
          
          if (existingActionIssue) {
            // Update existing action item
            await this.updateIssue(accessToken, existingActionIssue.key, {
              summary: actionTitle,
              description: actionDescription,
              priority: "High"
            });
            result.actionItemIssues.push(existingActionIssue);
          } else {
            // Create new action item issue
            const actionIssue = await this.createIssue(accessToken, projectKey, {
              summary: actionTitle,
              description: actionDescription,
              issueType: actionItemIssueType,
              priority: "High"
            });
            result.actionItemIssues.push(actionIssue);
          }
        } catch (error) {
          console.error(`Failed to create/update action item issue: ${actionItem}`, error);
        }
      }
    }

    return result;
  }

  private generateMeetingDescription(meeting: Meeting): string {
    const parts = [];
    
    parts.push(`Meeting: ${meeting.title}`);
    
    if (meeting.startTime) {
      parts.push(`Date: ${new Date(meeting.startTime).toLocaleDateString()}`);
    }
    
    if (meeting.startTime && meeting.endTime) {
      const duration = Math.round((new Date(meeting.endTime).getTime() - new Date(meeting.startTime).getTime()) / (1000 * 60));
      parts.push(`Duration: ${duration} minutes`);
    }
    
    if (meeting.summary) {
      parts.push(`\n📝 Summary:\n${meeting.summary}`);
    }
    
    if (meeting.actionItems && Array.isArray(meeting.actionItems) && meeting.actionItems.length > 0) {
      parts.push(`\n✅ Action Items:`);
      meeting.actionItems.forEach(item => parts.push(`• ${item}`));
    }
    
    if (meeting.keyTopics && Array.isArray(meeting.keyTopics) && meeting.keyTopics.length > 0) {
      parts.push(`\n🔑 Key Topics:`);
      meeting.keyTopics.forEach(topic => parts.push(`• ${topic}`));
    }
    
    if (meeting.decisions && Array.isArray(meeting.decisions) && meeting.decisions.length > 0) {
      parts.push(`\n📋 Decisions:`);
      meeting.decisions.forEach(decision => parts.push(`• ${decision}`));
    }
    
    if (meeting.takeaways && Array.isArray(meeting.takeaways) && meeting.takeaways.length > 0) {
      parts.push(`\n💡 Key Takeaways:`);
      meeting.takeaways.forEach(takeaway => parts.push(`• ${takeaway}`));
    }
    
    if (meeting.sentiment) {
      parts.push(`\n📊 Sentiment: ${meeting.sentiment}`);
    }
    
    return parts.join('\n');
  }
}

export const jiraService = new JiraService(); 