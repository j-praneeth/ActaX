// Test redirect URI generation
const baseUrl1 = 'http://localhost:5000';
const baseUrl2 = 'http://localhost:5000/api/integrations/callback';

function generateRedirectUri(baseUrl) {
  return baseUrl.endsWith('/api/integrations/callback') 
    ? baseUrl 
    : `${baseUrl}/api/integrations/callback`;
}

console.log('Testing redirect URI generation:');
console.log('Base URL 1:', baseUrl1);
console.log('Generated URI 1:', generateRedirectUri(baseUrl1));
console.log('');
console.log('Base URL 2:', baseUrl2);
console.log('Generated URI 2:', generateRedirectUri(baseUrl2));
console.log('');

// Test with environment variable simulation
process.env.CALLBACK_BASE_URL = 'http://localhost:5000/api/integrations/callback';
const envBaseUrl = process.env.CALLBACK_BASE_URL || 'http://localhost:5000';
const envRedirectUri = envBaseUrl.endsWith('/api/integrations/callback') 
  ? envBaseUrl 
  : `${envBaseUrl}/api/integrations/callback`;

console.log('Environment simulation:');
console.log('CALLBACK_BASE_URL:', process.env.CALLBACK_BASE_URL);
console.log('Generated URI:', envRedirectUri);
