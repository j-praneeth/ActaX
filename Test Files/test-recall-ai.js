// Test script to verify Recall.ai integration
// Run with: node test-recall-ai.js

const testRecallAI = async () => {
  const baseUrl = 'http://localhost:5000'; // Adjust as needed
  
  console.log('🧪 Testing Recall.ai Integration...\n');
  
  // Test 1: Check if API key is configured
  console.log('=== Test 1: API Key Configuration ===');
  const apiKey = process.env.RECALL_API_KEY;
  
  if (!apiKey || apiKey === 'demo_key') {
    console.log('❌ RECALL_API_KEY not configured or using demo key');
    console.log('   Please set RECALL_API_KEY environment variable with a valid Recall.ai API key');
    console.log('   Get your API key from: https://recall.ai');
    return;
  } else {
    console.log('✅ RECALL_API_KEY is configured');
    console.log(`   Key: ${apiKey.substring(0, 10)}...`);
  }
  
  // Test 2: Test Recall.ai API directly
  console.log('\n=== Test 2: Recall.ai API Connection ===');
  try {
    const response = await fetch('https://us-west-2.recall.ai/api/v1/bot', {
      method: 'GET',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      console.log('✅ Recall.ai API connection successful');
      const data = await response.json();
      console.log(`   Found ${data.length || 0} existing bots`);
    } else {
      console.log(`❌ Recall.ai API connection failed: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.log(`   Error: ${errorText}`);
    }
  } catch (error) {
    console.log('❌ Recall.ai API connection error:', error.message);
  }
  
  // Test 3: Test webhook endpoint
  console.log('\n=== Test 3: Webhook Endpoint ===');
  try {
    const webhookData = {
      eventType: 'bot.status_change',
      payload: {
        status: 'in_call',
        bot_id: 'test-bot-id',
        meeting_id: 'test-meeting-id'
      }
    };
    
    const response = await fetch(`${baseUrl}/api/webhooks/recall`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(webhookData)
    });
    
    if (response.ok) {
      console.log('✅ Webhook endpoint is working');
      const data = await response.json();
      console.log(`   Response: ${data.message}`);
    } else {
      console.log(`❌ Webhook endpoint failed: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.log('❌ Webhook endpoint error:', error.message);
  }
  
  // Test 4: Test bot creation (with dummy data)
  console.log('\n=== Test 4: Bot Creation Test ===');
  try {
    const botData = {
      meeting_url: 'https://meet.google.com/test-meeting-url',
      recording_config: {
        transcript: {
          provider: {
            recallai_streaming: {}
          }
        }
      },
      bot_name: 'Acta AI Test Bot'
    };
    
    const response = await fetch('https://us-west-2.recall.ai/api/v1/bot', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(botData)
    });
    
    if (response.ok) {
      const bot = await response.json();
      console.log('✅ Bot creation successful');
      console.log(`   Bot ID: ${bot.id}`);
      console.log(`   Status: ${bot.status}`);
      
      // Clean up - delete the test bot
      try {
        await fetch(`https://us-west-2.recall.ai/api/v1/bot/${bot.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Token ${apiKey}`
          }
        });
        console.log('   Test bot cleaned up');
      } catch (cleanupError) {
        console.log('   Warning: Could not clean up test bot');
      }
    } else {
      console.log(`❌ Bot creation failed: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.log(`   Error: ${errorText}`);
    }
  } catch (error) {
    console.log('❌ Bot creation error:', error.message);
  }
  
  console.log('\n🎉 Recall.ai integration test completed!');
  console.log('\nSummary:');
  console.log('- API key configuration: Check if RECALL_API_KEY is set');
  console.log('- API connection: Verify connection to Recall.ai API');
  console.log('- Webhook endpoint: Test webhook processing');
  console.log('- Bot creation: Test bot creation with enhanced features');
  console.log('\nNext steps:');
  console.log('1. Set up a valid RECALL_API_KEY if not configured');
  console.log('2. Configure webhook URL in Recall.ai dashboard');
  console.log('3. Test with a real Google Meet meeting');
  console.log('4. Monitor webhook events and bot status');
};

// Run the test
testRecallAI().catch(console.error);
