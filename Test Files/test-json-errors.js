// Test script to verify JSON error handling fixes
// Run with: node test-json-errors.js

const testJsonErrorHandling = async () => {
  const baseUrl = 'http://localhost:5000'; // Adjust as needed
  
  console.log('🧪 Testing JSON Error Handling...\n');
  
  // Test 1: Test non-existent endpoint (should return JSON 404)
  try {
    const response = await fetch(`${baseUrl}/api/nonexistent-endpoint`);
    const text = await response.text();
    
    if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
      console.log('❌ Non-existent endpoint returns HTML instead of JSON');
      console.log('Response preview:', text.substring(0, 200));
    } else {
      try {
        const json = JSON.parse(text);
        console.log('✅ Non-existent endpoint returns JSON:', json);
      } catch (parseError) {
        console.log('❌ Non-existent endpoint returns invalid JSON:', text.substring(0, 200));
      }
    }
  } catch (error) {
    console.log('❌ Error testing non-existent endpoint:', error.message);
  }
  
  // Test 2: Test auth endpoints
  const authEndpoints = [
    '/api/auth/signup',
    '/api/auth/sync-user',
    '/api/auth/webhook',
    '/api/auth/verify'
  ];
  
  for (const endpoint of authEndpoints) {
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });
      
      const text = await response.text();
      
      if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
        console.log(`❌ ${endpoint} returns HTML instead of JSON`);
        console.log('Response preview:', text.substring(0, 200));
      } else {
        try {
          const json = JSON.parse(text);
          console.log(`✅ ${endpoint} returns JSON:`, json);
        } catch (parseError) {
          console.log(`❌ ${endpoint} returns invalid JSON:`, text.substring(0, 200));
        }
      }
    } catch (error) {
      console.log(`❌ Error testing ${endpoint}:`, error.message);
    }
  }
  
  // Test 3: Test meeting endpoints
  const meetingEndpoints = [
    '/api/meetings/validate',
    '/api/meetings/join-bot',
    '/api/meetings'
  ];
  
  for (const endpoint of meetingEndpoints) {
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });
      
      const text = await response.text();
      
      if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
        console.log(`❌ ${endpoint} returns HTML instead of JSON`);
        console.log('Response preview:', text.substring(0, 200));
      } else {
        try {
          const json = JSON.parse(text);
          console.log(`✅ ${endpoint} returns JSON:`, json);
        } catch (parseError) {
          console.log(`❌ ${endpoint} returns invalid JSON:`, text.substring(0, 200));
        }
      }
    } catch (error) {
      console.log(`❌ Error testing ${endpoint}:`, error.message);
    }
  }
  
  // Test 4: Test integrations endpoints
  const integrationEndpoints = [
    '/api/integrations',
    '/api/integrations/slack/connect',
    '/api/integrations/github/connect'
  ];
  
  for (const endpoint of integrationEndpoints) {
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const text = await response.text();
      
      if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
        console.log(`❌ ${endpoint} returns HTML instead of JSON`);
        console.log('Response preview:', text.substring(0, 200));
      } else {
        try {
          const json = JSON.parse(text);
          console.log(`✅ ${endpoint} returns JSON:`, json);
        } catch (parseError) {
          console.log(`❌ ${endpoint} returns invalid JSON:`, text.substring(0, 200));
        }
      }
    } catch (error) {
      console.log(`❌ Error testing ${endpoint}:`, error.message);
    }
  }
  
  console.log('\n🎉 JSON error handling test completed!');
  console.log('\nSummary:');
  console.log('- All endpoints should return JSON responses');
  console.log('- HTML responses indicate server configuration issues');
  console.log('- Client-side safe-fetch utility handles both cases gracefully');
  console.log('\nNext steps:');
  console.log('1. Fix any endpoints that return HTML');
  console.log('2. Test the application with the new safe-fetch utility');
  console.log('3. Verify error messages are user-friendly');
};

// Run the test
testJsonErrorHandling().catch(console.error);
