// Test OAuth URL generation with debugging
const state = Buffer.from(JSON.stringify({ 
  userId: 'test-user-id', 
  timestamp: Date.now() 
})).toString('base64');

const clientId = process.env.JIRA_CLIENT_ID || 'your-jira-client-id';
const baseUrl = process.env.CALLBACK_BASE_URL || 'http://localhost:5000';
const redirectUri = baseUrl.endsWith('/api/integrations/callback') 
  ? baseUrl 
  : `${baseUrl}/api/integrations/callback`;

const scopes = [
  'read:jira-work',
  'write:jira-work'
].join(' ');

const authUrl = `https://auth.atlassian.com/authorize?` +
  `audience=api.atlassian.com&` +
  `client_id=${clientId}&` +
  `scope=${encodeURIComponent(scopes)}&` +
  `redirect_uri=${encodeURIComponent(redirectUri)}&` +
  `state=${state}&` +
  `response_type=code&` +
  `prompt=consent`;

console.log('=== OAuth URL Debug ===');
console.log('Client ID:', clientId);
console.log('Redirect URI:', redirectUri);
console.log('State:', state);
console.log('Scopes:', scopes);
console.log('');
console.log('Generated OAuth URL:');
console.log(authUrl);
console.log('');
console.log('=== Instructions ===');
console.log('1. Make sure your Jira OAuth app has this callback URL:', redirectUri);
console.log('2. Make sure your Jira OAuth app has these scopes:', scopes);
console.log('3. Test the OAuth URL in a browser to see if it works');
