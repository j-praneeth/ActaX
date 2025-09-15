import { Router } from "express";
import { container } from "../core/container/container";
import { IAuthService } from "../core/interfaces/services";

const router = Router();

// In-memory storage for integrations (in production, use database)
let integrations: any[] = [];

// Initialize global integrations if not exists
if (!global.integrations) {
  global.integrations = integrations;
}

// Test endpoint to create a mock integration
router.post("/test", async (req, res) => {
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

    // Create a test integration
    const testIntegration = {
      id: `test-${user.id}-${Date.now()}`,
      provider: 'jira',
      userId: user.id,
      isActive: true,
      createdAt: new Date(),
    };

    // Store in memory
    integrations.push(testIntegration);
    global.integrations = integrations; // Keep global in sync
    
    console.log('Test integration created:', testIntegration);
    console.log('Total integrations:', integrations.length);

    res.json({ success: true, integration: testIntegration });
  } catch (error) {
    console.error("Test integration error:", error);
    res.status(500).json({ message: "Failed to create test integration" });
  }
});

// Get integrations
router.get("/", async (req, res) => {
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

    // Get integrations for this user
    console.log('Getting integrations for user:', user.id);
    console.log('User object:', user);
    console.log('Local integrations:', integrations);
    console.log('Global integrations:', global.integrations);
    
    const allIntegrations = integrations;
    console.log('All integrations:', allIntegrations);
    
    const userIntegrations = allIntegrations
      .filter((integration: any) => {
        console.log(`Checking integration ${integration.id}: userId=${integration.userId}, currentUser=${user.id}, match=${integration.userId === user.id}`);
        return integration.userId === user.id;
      })
      .map((integration: any) => ({
        id: integration.id,
        provider: integration.provider,
        isActive: integration.isActive,
        createdAt: integration.createdAt,
        settings: { connected: true }
      }));

    console.log('User integrations:', userIntegrations);
    res.json(userIntegrations);
  } catch (error) {
    console.error("Get integrations error:", error);
    res.status(500).json({ message: "Failed to fetch integrations" });
  }
});

// Connect integration
router.post("/:provider/connect", async (req, res) => {
  try {
    console.log('🔗 OAuth connect request received');
    console.log('Provider:', req.params.provider);
    console.log('Headers:', req.headers);
    
    // Get user from authentication token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log('❌ No auth header found');
      return res.status(401).json({ message: "Authentication token required" });
    }
    
    const token = authHeader.substring(7);
    console.log('Token:', token.substring(0, 20) + '...');
    
    const authService = container.get<IAuthService>('authService');
    const user = await authService.verifySessionToken(token);
    
    if (!user) {
      console.log('❌ Invalid user token');
      return res.status(401).json({ message: "Invalid authentication token" });
    }

    console.log('✅ User authenticated:', user.id);
    const { provider } = req.params;
    
    if (provider === 'jira') {
      // Generate state parameter for OAuth security
      const state = Buffer.from(JSON.stringify({ 
        userId: user.id, 
        timestamp: Date.now() 
      })).toString('base64');
      
      // Jira OAuth 2.0 authorization URL
      const clientId = process.env.JIRA_CLIENT_ID;
      const baseUrl = process.env.CALLBACK_BASE_URL || 'http://localhost:5000';
      const redirectUri = baseUrl.endsWith('/api/integrations/callback') 
        ? baseUrl 
        : `${baseUrl}/api/integrations/callback`;

      if (!clientId || clientId === 'your-jira-client-id') {
        console.error('❌ JIRA_CLIENT_ID environment variable is not set or is using placeholder value');
        return res.status(500).json({ 
          message: "Jira OAuth configuration error. Please set JIRA_CLIENT_ID environment variable." 
        });
      }
      
      // Use basic scopes that are commonly available
      // You can add more scopes based on what your Jira OAuth app supports
      const scopes = [
        'read:jira-work',
        'write:jira-work'
        // Add more scopes here if your app supports them:
        // 'manage:jira-project',
        // 'read:jira-user',
        // 'offline_access'
      ].join(' ');
      
      console.log('🔧 OAuth Configuration:');
      console.log('Client ID:', clientId);
      console.log('Redirect URI:', redirectUri);
      console.log('Scopes:', scopes);
      console.log('State:', state);
      
      const authUrl = `https://auth.atlassian.com/authorize?` +
        `audience=api.atlassian.com&` +
        `client_id=${clientId}&` +
        `scope=${encodeURIComponent(scopes)}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `state=${state}&` +
        `response_type=code&` +
        `prompt=consent`;
      
      console.log('🔗 Generated Auth URL:', authUrl);
      res.json({ authUrl, state });
    } else {
      // Generic OAuth for other providers
      const authUrl = `https://${provider}.com/oauth/authorize`;
      res.json({ authUrl });
    }
  } catch (error) {
    console.error("OAuth connect error:", error);
    res.status(500).json({ message: "Failed to initiate OAuth connection" });
  }
});

// OAuth callback (GET - for OAuth redirects)
router.get("/callback", async (req, res) => {
  try {
    console.log('🔄 OAuth callback received (GET)');
    console.log('Query params:', req.query);
    console.log('Request URL:', req.url);
    console.log('Request headers:', req.headers);
    
    const { code, state, error } = req.query;
    
    if (error) {
      console.log('❌ OAuth error:', error);
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
      return res.redirect(`${clientUrl}/oauth-handler?error=${encodeURIComponent(error)}`);
    }
    
    if (!code || !state) {
      console.log('❌ Missing OAuth parameters');
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
      return res.redirect(`${clientUrl}/oauth-handler?error=missing_parameters`);
    }
    
    console.log('✅ OAuth parameters received:', { 
      code: code.substring(0, 10) + '...', 
      state, 
      provider: 'jira' 
    });

    // Verify state parameter
    let stateData;
    try {
      stateData = JSON.parse(Buffer.from(state as string, 'base64').toString());
    } catch (error) {
      console.log('❌ Invalid state parameter');
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
      return res.redirect(`${clientUrl}/oauth-handler?error=invalid_state`);
    }

    // Check if state is not too old (5 minutes)
    if (Date.now() - stateData.timestamp > 5 * 60 * 1000) {
      console.log('❌ OAuth state expired');
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
      return res.redirect(`${clientUrl}/oauth-handler?error=state_expired`);
    }

    // Exchange code for access token
    const clientId = process.env.JIRA_CLIENT_ID || 'your-jira-client-id';
    const clientSecret = process.env.JIRA_CLIENT_SECRET || 'your-jira-client-secret';
    const baseUrl = process.env.CALLBACK_BASE_URL || 'http://localhost:5000';
    const redirectUri = baseUrl.endsWith('/api/integrations/callback') 
      ? baseUrl 
      : `${baseUrl}/api/integrations/callback`;
    
    console.log('🔄 Exchanging code for token...');
    console.log('Token exchange config:', { clientId, redirectUri });
    
    const tokenResponse = await fetch('https://auth.atlassian.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        redirect_uri: redirectUri,
      }),
    });

    console.log('Token response status:', tokenResponse.status);
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.log('❌ Token exchange failed:', errorText);
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
      return res.redirect(`${clientUrl}/oauth-handler?error=token_exchange_failed`);
    }

    const tokenData = await tokenResponse.json();
    console.log('✅ Token exchange successful');
    
    // Store integration in database
    console.log('Creating integration for userId:', stateData.userId);
    console.log('State data:', stateData);
    
    const integration = {
      id: `jira-${stateData.userId}-${Date.now()}`,
      provider: 'jira',
      userId: stateData.userId,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
      isActive: true,
      createdAt: new Date(),
    };

    // Store in memory for now (in production, save to database)
    integrations.push(integration);
    global.integrations = integrations; // Keep global in sync
    console.log('Jira integration created and stored:', integration);
    console.log('Total integrations now:', integrations.length);
    console.log('All integrations:', integrations);

    // Redirect back to client with success message
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const redirectUrl = `${clientUrl}/oauth-handler?success=true&provider=jira&integrationId=${integration.id}`;
    console.log('🔄 Redirecting to client:', redirectUrl);
    res.redirect(redirectUrl);
    
  } catch (error) {
    console.error('OAuth callback error:', error);
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    res.redirect(`${clientUrl}/oauth-handler?error=callback_failed`);
  }
});

// OAuth callback (POST - for manual API calls)
router.post("/callback", async (req, res) => {
  try {
    console.log('🔄 OAuth callback received');
    console.log('Body:', req.body);
    
    const { code, state, provider } = req.body;
    
    if (!code || !state || !provider) {
      console.log('❌ Missing OAuth parameters');
      return res.status(400).json({ message: "Missing OAuth parameters" });
    }
    
    console.log('✅ OAuth parameters received:', { code: code.substring(0, 10) + '...', state, provider });

    // Verify state parameter
    let stateData;
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64').toString());
    } catch (error) {
      return res.status(400).json({ message: "Invalid state parameter" });
    }

    // Check if state is not too old (5 minutes)
    if (Date.now() - stateData.timestamp > 5 * 60 * 1000) {
      return res.status(400).json({ message: "OAuth state expired" });
    }

    if (provider === 'jira') {
      // Exchange code for access token
      const clientId = process.env.JIRA_CLIENT_ID;
      const clientSecret = process.env.JIRA_CLIENT_SECRET;
      const baseUrl = process.env.CALLBACK_BASE_URL || 'http://localhost:5000';
      const redirectUri = baseUrl.endsWith('/api/integrations/callback') 
        ? baseUrl 
        : `${baseUrl}/api/integrations/callback`;

      if (!clientId || !clientSecret || clientId === 'your-jira-client-id' || clientSecret === 'your-jira-client-secret') {
        console.error('❌ Jira OAuth credentials not properly configured');
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        return res.redirect(`${clientUrl}/oauth-handler?error=oauth_config_error`);
      }
      
      console.log('🔄 Exchanging code for token...');
      console.log('Token exchange config:', { clientId, redirectUri });
      
      const tokenResponse = await fetch('https://auth.atlassian.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          client_id: clientId,
          client_secret: clientSecret,
          code: code,
          redirect_uri: redirectUri,
        }),
      });

      console.log('Token response status:', tokenResponse.status);
      
      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.log('❌ Token exchange failed:', errorText);
        throw new Error(`Failed to exchange code for token: ${errorText}`);
      }

      const tokenData = await tokenResponse.json();
      console.log('✅ Token exchange successful');
      
      // Store integration in database
      console.log('Creating integration for userId:', stateData.userId);
      console.log('State data:', stateData);
      
      const integration = {
        id: `jira-${stateData.userId}-${Date.now()}`,
        provider: 'jira',
        userId: stateData.userId,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
        isActive: true,
        createdAt: new Date(),
      };

      // Store in memory for now (in production, save to database)
      integrations.push(integration);
      global.integrations = integrations; // Keep global in sync
      console.log('Jira integration created and stored:', integration);
      console.log('Total integrations now:', integrations.length);
      console.log('All integrations:', integrations);

      // Redirect back to client with success message
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
      res.redirect(`${clientUrl}/oauth-handler?success=true&provider=jira&integrationId=${integration.id}`);
    } else {
      // Generic OAuth callback for other providers
      res.json({ success: true, integration: { provider, connected: true } });
    }
  } catch (error) {
    console.error("OAuth callback error:", error);
    res.status(500).json({ message: "OAuth callback failed" });
  }
});

// Disconnect integration
router.delete("/:id", async (req, res) => {
  try {
    const integrationId = req.params.id;
    
    // Placeholder for integration deletion
    res.json({ success: true, message: "Integration disconnected successfully" });
  } catch (error) {
    console.error("Delete integration error:", error);
    res.status(500).json({ message: "Failed to disconnect integration" });
  }
});

// Helper function to get Jira cloud ID
async function getJiraCloudId(accessToken: string): Promise<{ cloudId: string; jiraUrl: string }> {
  const tokenInfoResponse = await fetch('https://api.atlassian.com/oauth/token/accessible-resources', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json'
    }
  });

  if (!tokenInfoResponse.ok) {
    const errorText = await tokenInfoResponse.text();
    console.error('❌ Failed to get accessible resources:', tokenInfoResponse.status, errorText);
    throw new Error(`Failed to get accessible resources: ${tokenInfoResponse.status} - ${errorText}`);
  }

  const accessibleResources = await tokenInfoResponse.json();
  console.log('✅ Accessible resources:', accessibleResources);

  if (!accessibleResources || accessibleResources.length === 0) {
    throw new Error('No accessible Jira resources found');
  }

  // Use the first accessible resource (Jira cloud)
  const jiraCloud = accessibleResources[0];
  return {
    cloudId: jiraCloud.id,
    jiraUrl: jiraCloud.url
  };
}

// Jira Integration Endpoints

// Get Jira projects
router.get("/jira/projects", async (req, res) => {
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

    // Get Jira integration for this user
    const jiraIntegration = integrations.find(integration => 
      integration.provider === 'jira' && 
      integration.userId === user.id && 
      integration.isActive
    );

    if (!jiraIntegration) {
      return res.status(404).json({ message: "Jira integration not found. Please connect Jira first." });
    }

    console.log('🔍 Fetching Jira projects for user:', user.id);
    console.log('🔍 Using access token:', jiraIntegration.accessToken.substring(0, 20) + '...');

    // Get Jira cloud ID
    const { cloudId, jiraUrl } = await getJiraCloudId(jiraIntegration.accessToken);
    console.log('🔍 Using Jira cloud ID:', cloudId);
    console.log('🔍 Using Jira URL:', jiraUrl);

    // Fetch real projects from Jira API using cloud ID
    const jiraResponse = await fetch(`https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/project`, {
      headers: {
        'Authorization': `Bearer ${jiraIntegration.accessToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!jiraResponse.ok) {
      const errorText = await jiraResponse.text();
      console.error('❌ Jira API error:', jiraResponse.status, errorText);
      throw new Error(`Jira API error: ${jiraResponse.status} - ${errorText}`);
    }

    const jiraProjects = await jiraResponse.json();
    console.log('✅ Fetched Jira projects:', jiraProjects.length);

    // Transform Jira response to match expected format
    const transformedProjects = jiraProjects.map((project: any) => ({
      id: project.id,
      key: project.key,
      name: project.name,
      projectTypeKey: project.projectTypeKey,
      description: project.description || '',
      lead: project.lead ? {
        accountId: project.lead.accountId,
        displayName: project.lead.displayName
      } : null
    }));

    res.json(transformedProjects);
  } catch (error) {
    console.error("Get Jira projects error:", error);
    res.status(500).json({ 
      message: "Failed to fetch Jira projects", 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Get Jira issue types for a project
router.get("/jira/projects/:projectKey/issue-types", async (req, res) => {
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

    // Get Jira integration for this user
    const jiraIntegration = integrations.find(integration => 
      integration.provider === 'jira' && 
      integration.userId === user.id && 
      integration.isActive
    );

    if (!jiraIntegration) {
      return res.status(404).json({ message: "Jira integration not found. Please connect Jira first." });
    }

    const { projectKey } = req.params;

    console.log('🔍 Fetching Jira issue types for project:', projectKey);

    // Get Jira cloud ID
    const { cloudId } = await getJiraCloudId(jiraIntegration.accessToken);

    // Fetch real issue types from Jira API
    const jiraResponse = await fetch(`https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/project/${projectKey}`, {
      headers: {
        'Authorization': `Bearer ${jiraIntegration.accessToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!jiraResponse.ok) {
      const errorText = await jiraResponse.text();
      console.error('❌ Jira API error:', jiraResponse.status, errorText);
      throw new Error(`Jira API error: ${jiraResponse.status} - ${errorText}`);
    }

    const projectData = await jiraResponse.json();
    console.log('✅ Fetched Jira project data for issue types');

    // Extract issue types from project data
    const issueTypes = projectData.issueTypes || [];
    
    // Transform Jira response to match expected format
    const transformedIssueTypes = issueTypes.map((issueType: any) => ({
      id: issueType.id,
      name: issueType.name,
      description: issueType.description || '',
      iconUrl: issueType.iconUrl || '',
      subtask: issueType.subtask || false
    }));

    res.json(transformedIssueTypes);
  } catch (error) {
    console.error("Get Jira issue types error:", error);
    res.status(500).json({ 
      message: "Failed to fetch Jira issue types", 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Get Jira priorities
router.get("/jira/priorities", async (req, res) => {
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

    // Get Jira integration for this user
    const jiraIntegration = integrations.find(integration => 
      integration.provider === 'jira' && 
      integration.userId === user.id && 
      integration.isActive
    );

    if (!jiraIntegration) {
      return res.status(404).json({ message: "Jira integration not found. Please connect Jira first." });
    }

    console.log('🔍 Fetching Jira priorities');

    // Get Jira cloud ID
    const { cloudId } = await getJiraCloudId(jiraIntegration.accessToken);

    // Fetch real priorities from Jira API
    const jiraResponse = await fetch(`https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/priority`, {
      headers: {
        'Authorization': `Bearer ${jiraIntegration.accessToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!jiraResponse.ok) {
      const errorText = await jiraResponse.text();
      console.error('❌ Jira API error:', jiraResponse.status, errorText);
      throw new Error(`Jira API error: ${jiraResponse.status} - ${errorText}`);
    }

    const jiraPriorities = await jiraResponse.json();
    console.log('✅ Fetched Jira priorities:', jiraPriorities.length);

    // Transform Jira response to match expected format
    const transformedPriorities = jiraPriorities.map((priority: any) => ({
      id: priority.id,
      name: priority.name,
      description: priority.description || '',
      iconUrl: priority.iconUrl || ''
    }));

    res.json(transformedPriorities);
  } catch (error) {
    console.error("Get Jira priorities error:", error);
    res.status(500).json({ 
      message: "Failed to fetch Jira priorities", 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

export { router as integrationRoutes };
