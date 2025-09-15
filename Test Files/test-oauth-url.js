// Test OAuth URL generation
const state = Buffer.from(JSON.stringify({ 
  userId: 'test-user-id', 
  timestamp: Date.now() 
})).toString('base64');

const clientId = 'your-jira-client-id';
const redirectUri = 'http://localhost:5000/api/integrations/callback';

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

console.log('Generated OAuth URL:');
console.log(authUrl);
console.log('');
console.log('State:', state);
console.log('Redirect URI:', redirectUri);
console.log('Scopes:', scopes);
