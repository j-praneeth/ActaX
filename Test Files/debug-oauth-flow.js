const fetch = require('node-fetch');

async function debugOAuthFlow() {
  console.log('🔍 Debugging OAuth Flow...\n');
  
  try {
    // Step 1: Test getting integrations (should show empty array initially)
    console.log('1️⃣ Testing GET /api/integrations...');
    const getResponse = await fetch('http://localhost:5000/api/integrations', {
      headers: {
        'Authorization': 'Bearer test-token' // Replace with actual token
      }
    });
    
    if (getResponse.ok) {
      const integrations = await getResponse.json();
      console.log('✅ Integrations retrieved:', integrations);
    } else {
      console.log('❌ Get integrations failed:', getResponse.status, await getResponse.text());
    }
    
    // Step 2: Test creating a test integration
    console.log('\n2️⃣ Testing POST /api/integrations/test...');
    const testResponse = await fetch('http://localhost:5000/api/integrations/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // Replace with actual token
      }
    });
    
    if (testResponse.ok) {
      const testData = await testResponse.json();
      console.log('✅ Test integration created:', testData);
    } else {
      console.log('❌ Test integration failed:', testResponse.status, await testResponse.text());
    }
    
    // Step 3: Test OAuth connect endpoint
    console.log('\n3️⃣ Testing POST /api/integrations/jira/connect...');
    const connectResponse = await fetch('http://localhost:5000/api/integrations/jira/connect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // Replace with actual token
      }
    });
    
    if (connectResponse.ok) {
      const connectData = await connectResponse.json();
      console.log('✅ OAuth connect response:', connectData);
      console.log('🔗 Auth URL:', connectData.authUrl);
    } else {
      console.log('❌ OAuth connect failed:', connectResponse.status, await connectResponse.text());
    }
    
    // Step 4: Test OAuth callback endpoint
    console.log('\n4️⃣ Testing POST /api/integrations/callback...');
    const callbackResponse = await fetch('http://localhost:5000/api/integrations/callback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: 'test-code',
        state: 'test-state',
        provider: 'jira'
      })
    });
    
    if (callbackResponse.ok) {
      const callbackData = await callbackResponse.json();
      console.log('✅ OAuth callback response:', callbackData);
    } else {
      console.log('❌ OAuth callback failed:', callbackResponse.status, await callbackResponse.text());
    }
    
    // Step 5: Check integrations again
    console.log('\n5️⃣ Checking integrations after test...');
    const finalResponse = await fetch('http://localhost:5000/api/integrations', {
      headers: {
        'Authorization': 'Bearer test-token' // Replace with actual token
      }
    });
    
    if (finalResponse.ok) {
      const finalIntegrations = await finalResponse.json();
      console.log('✅ Final integrations:', finalIntegrations);
    } else {
      console.log('❌ Final integrations failed:', finalResponse.status, await finalResponse.text());
    }
    
  } catch (error) {
    console.error('💥 Debug failed:', error);
  }
}

debugOAuthFlow();
