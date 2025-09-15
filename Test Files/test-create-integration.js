const fetch = require('node-fetch');

async function createTestIntegration() {
  try {
    console.log('🧪 Creating Test Jira Integration...\n');

    const response = await fetch('http://localhost:5000/api/integrations/test', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer eyJ1c2VySWQiOiIxOWU5NDRiYy0yZDRlLTRmZmMtOTc4MC03NTVhMmFhMWQxNjciLCJlbWFpbCI6InByYW5lZXRobmFnYXNhaW5hcmF5YW5AZ21haWwuY29tIiwiZXhwIjoxNzU4MDI3ODIyNDMxfQ==',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        provider: 'jira',
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
        expiresAt: new Date(Date.now() + 3600000).toISOString()
      })
    });

    console.log('📊 Response status:', response.status);
    const result = await response.json();
    console.log('📋 Response:', JSON.stringify(result, null, 2));

    if (response.ok) {
      console.log('✅ Test integration created successfully!');
    } else {
      console.log('❌ Failed to create test integration');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createTestIntegration();
