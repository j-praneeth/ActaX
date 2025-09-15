const fetch = require('node-fetch');

async function testOAuthFlow() {
  console.log('🧪 Testing OAuth Flow...\n');
  
  try {
    // Test 1: OAuth Connect
    console.log('1️⃣ Testing OAuth Connect...');
    const connectResponse = await fetch('http://localhost:5000/api/integrations/jira/connect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer your-actual-token-here' // Replace with real token
      }
    });
    
    console.log('Connect Status:', connectResponse.status);
    const connectData = await connectResponse.text();
    console.log('Connect Response:', connectData);
    
    if (connectResponse.ok) {
      const parsed = JSON.parse(connectData);
      console.log('✅ Auth URL generated:', parsed.authUrl);
    } else {
      console.log('❌ Connect failed:', connectData);
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

testOAuthFlow();
