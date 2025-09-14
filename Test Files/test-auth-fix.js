// Test script to verify authentication fix for meeting endpoints
// Run with: node test-auth-fix.js

const testAuthenticationFix = async () => {
  const baseUrl = 'http://localhost:5000'; // Adjust as needed
  
  console.log('🧪 Testing Authentication Fix for Meeting Endpoints...\n');
  
  // Test 1: Test meeting endpoints without authentication (should return 401)
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
      
      const contentType = response.headers.get('content-type');
      const text = await response.text();
      
      console.log(`POST ${endpoint}:`);
      console.log(`  Status: ${response.status}`);
      console.log(`  Content-Type: ${contentType}`);
      
      if (response.status === 401) {
        if (contentType && contentType.includes('application/json')) {
          try {
            const json = JSON.parse(text);
            console.log(`  ✅ Returns JSON 401:`, json);
          } catch (parseError) {
            console.log(`  ❌ Returns invalid JSON:`, text.substring(0, 100));
          }
        } else {
          console.log(`  ❌ Does not return JSON content-type`);
          console.log(`  Response preview:`, text.substring(0, 100));
        }
      } else {
        console.log(`  ⚠️  Expected 401, got ${response.status}`);
        console.log(`  Response preview:`, text.substring(0, 100));
      }
      console.log('');
    } catch (error) {
      console.log(`❌ Error testing ${endpoint}:`, error.message);
    }
  }
  
  // Test 2: Test with invalid token (should return 401)
  try {
    const response = await fetch(`${baseUrl}/api/meetings/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid-token-12345',
      },
      body: JSON.stringify({ url: 'https://meet.google.com/test' })
    });
    
    const contentType = response.headers.get('content-type');
    const text = await response.text();
    
    console.log('Test with invalid token:');
    console.log(`  Status: ${response.status}`);
    console.log(`  Content-Type: ${contentType}`);
    
    if (response.status === 401) {
      if (contentType && contentType.includes('application/json')) {
        try {
          const json = JSON.parse(text);
          console.log(`  ✅ Returns JSON 401:`, json);
        } catch (parseError) {
          console.log(`  ❌ Returns invalid JSON:`, text.substring(0, 100));
        }
      } else {
        console.log(`  ❌ Does not return JSON content-type`);
        console.log(`  Response preview:`, text.substring(0, 100));
      }
    } else {
      console.log(`  ⚠️  Expected 401, got ${response.status}`);
      console.log(`  Response preview:`, text.substring(0, 100));
    }
  } catch (error) {
    console.log('❌ Error testing with invalid token:', error.message);
  }
  
  console.log('\n🎉 Authentication fix test completed!');
  console.log('\nSummary:');
  console.log('- All meeting endpoints should return 401 JSON responses when not authenticated');
  console.log('- Invalid tokens should return 401 JSON responses');
  console.log('- No more HTML responses for API endpoints');
  console.log('\nNext steps:');
  console.log('1. Test with valid Supabase JWT tokens');
  console.log('2. Verify bot joining functionality works');
  console.log('3. Test the complete meeting workflow');
};

// Run the test
testAuthenticationFix().catch(console.error);
