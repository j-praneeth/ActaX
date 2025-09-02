// Test script to verify server returns only JSON for API routes
// Run with: node test-server-json.js

const testServerJsonResponse = async () => {
  const baseUrl = 'http://localhost:5000'; // Adjust as needed
  
  console.log('🧪 Testing Server JSON Response Configuration...\n');
  
  // Test 1: Test non-existent API endpoint (should return JSON 404)
  try {
    const response = await fetch(`${baseUrl}/api/nonexistent-endpoint`);
    const contentType = response.headers.get('content-type');
    const text = await response.text();
    
    console.log(`Status: ${response.status}`);
    console.log(`Content-Type: ${contentType}`);
    
    if (contentType && contentType.includes('application/json')) {
      try {
        const json = JSON.parse(text);
        console.log('✅ Non-existent API endpoint returns JSON:', json);
      } catch (parseError) {
        console.log('❌ Non-existent API endpoint returns invalid JSON:', text.substring(0, 200));
      }
    } else {
      console.log('❌ Non-existent API endpoint does not return JSON content-type');
      console.log('Response preview:', text.substring(0, 200));
    }
  } catch (error) {
    console.log('❌ Error testing non-existent API endpoint:', error.message);
  }
  
  console.log('\n---\n');
  
  // Test 2: Test existing API endpoints
  const apiEndpoints = [
    { path: '/api/auth/signup', method: 'POST' },
    { path: '/api/auth/verify', method: 'POST' },
    { path: '/api/meetings/validate', method: 'POST' },
    { path: '/api/integrations', method: 'GET' }
  ];
  
  for (const endpoint of apiEndpoints) {
    try {
      const response = await fetch(`${baseUrl}${endpoint.path}`, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: endpoint.method === 'POST' ? JSON.stringify({}) : undefined
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
  
  // Test 3: Test non-API routes (should return HTML)
  try {
    const response = await fetch(`${baseUrl}/nonexistent-page`);
    const contentType = response.headers.get('content-type');
    const text = await response.text();
    
    console.log('Non-API route test:');
    console.log(`  Status: ${response.status}`);
    console.log(`  Content-Type: ${contentType}`);
    
    if (contentType && contentType.includes('text/html')) {
      console.log('  ✅ Non-API route returns HTML (expected)');
    } else if (contentType && contentType.includes('application/json')) {
      console.log('  ⚠️  Non-API route returns JSON (unexpected)');
    } else {
      console.log('  ❓ Non-API route returns unexpected content type');
    }
    console.log(`  Response preview:`, text.substring(0, 100));
  } catch (error) {
    console.log('❌ Error testing non-API route:', error.message);
  }
  
  console.log('\n🎉 Server JSON response test completed!');
  console.log('\nSummary:');
  console.log('- All /api/* routes should return JSON with application/json content-type');
  console.log('- Non-API routes should return HTML (for client-side routing)');
  console.log('- 404 errors for API routes should be JSON');
  console.log('\nIf any API routes return HTML, check server configuration.');
};

// Run the test
testServerJsonResponse().catch(console.error);
