const fetch = require('node-fetch');

async function testIntegrations() {
  try {
    console.log('Testing integrations API...');
    
    // First, let's test creating a test integration
    console.log('\n1. Creating test integration...');
    const testResponse = await fetch('http://localhost:5000/api/integrations/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer your-test-token-here' // Replace with actual token
      }
    });
    
    if (testResponse.ok) {
      const testData = await testResponse.json();
      console.log('Test integration created:', testData);
    } else {
      console.log('Test integration failed:', testResponse.status, await testResponse.text());
    }
    
    // Then, let's test getting integrations
    console.log('\n2. Getting integrations...');
    const getResponse = await fetch('http://localhost:5000/api/integrations', {
      headers: {
        'Authorization': 'Bearer your-test-token-here' // Replace with actual token
      }
    });
    
    if (getResponse.ok) {
      const integrations = await getResponse.json();
      console.log('Integrations retrieved:', integrations);
    } else {
      console.log('Get integrations failed:', getResponse.status, await getResponse.text());
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testIntegrations();
