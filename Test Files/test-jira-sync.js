const fetch = require('node-fetch');

async function testJiraSync() {
  try {
    console.log('🧪 Testing Jira Sync Endpoint...\n');

    // First, let's test if we can get integrations
    console.log('1. Testing GET /api/integrations...');
    const integrationsResponse = await fetch('http://localhost:5000/api/integrations', {
      headers: {
        'Authorization': 'Bearer eyJ1c2VySWQiOiIxOWU5NDRiYy0yZDRlLTRmZmMtOTc4MC03NTVhMmFhMWQxNjciLCJlbWFpbCI6InByYW5lZXRobmFnYXNhaW5hcmF5YW5AZ21haWwuY29tIiwiZXhwIjoxNzU4MDI3ODIyNDMxfQ==',
        'Content-Type': 'application/json'
      }
    });

    const integrations = await integrationsResponse.json();
    console.log('✅ Integrations response:', integrations);

    if (!integrations || integrations.length === 0) {
      console.log('❌ No integrations found. Please connect Jira first.');
      return;
    }

    // Test Jira sync endpoint
    console.log('\n2. Testing POST /api/meetings/{id}/sync/jira...');
    const meetingId = '8d16b4b7-524d-428a-9a95-4608e855e0d4';
    
    const syncData = {
      projectKey: 'ACTA',
      issueType: 'Task',
      priority: 'Medium',
      summary: 'Test sync from ActaX',
      description: 'This is a test sync from ActaX meeting management system',
      actionItems: [
        {
          title: 'Test Action Item 1',
          description: 'This is the first test action item'
        },
        {
          title: 'Test Action Item 2', 
          description: 'This is the second test action item'
        }
      ]
    };

    console.log('📤 Sending sync data:', syncData);

    const syncResponse = await fetch(`http://localhost:5000/api/meetings/${meetingId}/sync/jira`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer eyJ1c2VySWQiOiIxOWU5NDRiYy0yZDRlLTRmZmMtOTc4MC03NTVhMmFhMWQxNjciLCJlbWFpbCI6InByYW5lZXRobmFnYXNhaW5hcmF5YW5AZ21haWwuY29tIiwiZXhwIjoxNzU4MDI3ODIyNDMxfQ==',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(syncData)
    });

    console.log('📊 Sync response status:', syncResponse.status);
    
    const syncResult = await syncResponse.json();
    console.log('📋 Sync response:', JSON.stringify(syncResult, null, 2));

    if (syncResponse.ok) {
      console.log('✅ Jira sync test completed successfully!');
      console.log(`Created ${syncResult.createdIssues?.length || 0} issues`);
    } else {
      console.log('❌ Jira sync test failed');
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testJiraSync();
