// Test script to verify GET /api/meetings endpoint works with authentication
// Run with: node test-meetings-endpoint.js

const testMeetingsEndpoint = async () => {
  const baseUrl = 'http://localhost:5000'; // Adjust as needed
  
  console.log('🧪 Testing GET /api/meetings Endpoint...\n');
  
  // Test 1: Test without authentication (should return 401)
  console.log('=== Test 1: Unauthenticated Request ===');
  try {
    const response = await fetch(`${baseUrl}/api/meetings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const contentType = response.headers.get('content-type');
    const text = await response.text();
    
    console.log('GET /api/meetings (no auth):');
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
    console.log('❌ Error testing unauthenticated request:', error.message);
  }
  
  // Test 2: Test with invalid token (should return 401)
  console.log('\n=== Test 2: Invalid Token ===');
  try {
    const response = await fetch(`${baseUrl}/api/meetings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid-token-12345',
      },
    });
    
    const contentType = response.headers.get('content-type');
    const text = await response.text();
    
    console.log('GET /api/meetings (invalid token):');
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
  
  console.log('\n🎉 GET /api/meetings endpoint test completed!');
  console.log('\nSummary:');
  console.log('- Unauthenticated requests should return 401 JSON');
  console.log('- Invalid tokens should return 401 JSON');
  console.log('- Valid tokens should return meeting data');
  console.log('\nNote: To test with valid tokens, you need to:');
  console.log('1. Sign in to the application');
  console.log('2. Get the token from browser dev tools');
  console.log('3. Use it in the Authorization header');
  console.log('\nExample with valid token:');
  console.log('curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/meetings');
};

// Run the test
testMeetingsEndpoint().catch(console.error);
