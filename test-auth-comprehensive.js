// Comprehensive test script to verify authentication fix
// Run with: node test-auth-comprehensive.js

const testAuthenticationComprehensive = async () => {
  const baseUrl = 'http://localhost:5000'; // Adjust as needed
  
  console.log('🧪 Comprehensive Authentication Test...\n');
  
  // Test 1: Test meeting endpoints without authentication (should return 401)
  console.log('=== Test 1: Unauthenticated Requests ===');
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
  console.log('=== Test 2: Invalid Token ===');
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
  
  // Test 3: Test auth endpoints
  console.log('\n=== Test 3: Auth Endpoints ===');
  const authEndpoints = [
    { path: '/api/auth/verify', method: 'POST', body: { token: 'test' } },
    { path: '/api/auth/signup', method: 'POST', body: { email: 'test@example.com', name: 'Test User', role: 'member' } },
    { path: '/api/auth/sync-user', method: 'POST', body: {} }
  ];
  
  for (const endpoint of authEndpoints) {
    try {
      const response = await fetch(`${baseUrl}${endpoint.path}`, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(endpoint.body)
      });
      
      const contentType = response.headers.get('content-type');
      const text = await response.text();
      
      console.log(`${endpoint.method} ${endpoint.path}:`);
      console.log(`  Status: ${response.status}`);
      console.log(`  Content-Type: ${contentType}`);
      
      if (contentType && contentType.includes('application/json')) {
        try {
          const json = JSON.parse(text);
          console.log(`  ✅ Returns JSON:`, json);
        } catch (parseError) {
          console.log(`  ❌ Returns invalid JSON:`, text.substring(0, 100));
        }
      } else {
        console.log(`  ❌ Does not return JSON content-type`);
        console.log(`  Response preview:`, text.substring(0, 100));
      }
      console.log('');
    } catch (error) {
      console.log(`❌ Error testing ${endpoint.path}:`, error.message);
    }
  }
  
  // Test 4: Test non-API routes (should return HTML)
  console.log('\n=== Test 4: Non-API Routes ===');
  try {
    const response = await fetch(`${baseUrl}/dashboard`);
    const contentType = response.headers.get('content-type');
    const text = await response.text();
    
    console.log('Non-API route test (/dashboard):');
    console.log(`  Status: ${response.status}`);
    console.log(`  Content-Type: ${contentType}`);
    
    if (contentType && contentType.includes('text/html')) {
      console.log('  ✅ Returns HTML (expected for SPA)');
    } else if (contentType && contentType.includes('application/json')) {
      console.log('  ⚠️  Returns JSON (unexpected for non-API route)');
    } else {
      console.log('  ❓ Returns unexpected content type');
    }
    console.log(`  Response preview:`, text.substring(0, 100));
  } catch (error) {
    console.log('❌ Error testing non-API route:', error.message);
  }
  
  console.log('\n🎉 Comprehensive authentication test completed!');
  console.log('\nSummary:');
  console.log('- All /api/* routes should return JSON responses');
  console.log('- Unauthenticated API requests should return 401 JSON');
  console.log('- Invalid tokens should return 401 JSON');
  console.log('- Non-API routes should return HTML for SPA routing');
  console.log('\nNext steps:');
  console.log('1. Test with valid Supabase JWT tokens');
  console.log('2. Verify bot joining functionality works');
  console.log('3. Test the complete meeting workflow');
  console.log('4. Use the AuthDebug component in the UI to check authentication state');
};

// Run the test
testAuthenticationComprehensive().catch(console.error);
