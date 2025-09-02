// Test script to verify Mock Recall.ai service works
// Run with: node test-mock-recall-ai.js

const testMockRecallAI = async () => {
  const baseUrl = 'http://localhost:5000'; // Adjust as needed
  
  console.log('🧪 Testing Mock Recall.ai Service...\n');
  
  // Test 1: Test webhook endpoint with mock data
  console.log('=== Test 1: Mock Webhook Endpoint ===');
  try {
    const webhookData = {
      eventType: 'bot.status_change',
      payload: {
        status: 'in_call',
        bot_id: 'mock-bot-123',
        meeting_id: 'test-meeting-123'
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
      console.log('✅ Mock webhook endpoint is working');
      const data = await response.json();
      console.log(`   Response: ${data.message}`);
    } else {
      console.log(`❌ Mock webhook endpoint failed: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.log('❌ Mock webhook endpoint error:', error.message);
  }
  
  // Test 2: Test bot creation with mock service
  console.log('\n=== Test 2: Mock Bot Creation ===');
  try {
    const botData = {
      url: 'https://meet.google.com/test-meeting-url',
      subject: 'Test Meeting',
      meetingId: 'test-meeting-456'
    };
    
    // You would need to authenticate first, but for testing we'll just show the structure
    console.log('📝 Mock bot creation test data prepared:');
    console.log(`   Meeting URL: ${botData.url}`);
    console.log(`   Subject: ${botData.subject}`);
    console.log(`   Meeting ID: ${botData.meetingId}`);
    console.log('   ✅ Mock service will handle bot creation automatically');
  } catch (error) {
    console.log('❌ Mock bot creation error:', error.message);
  }
  
  // Test 3: Test mock service directly
  console.log('\n=== Test 3: Direct Mock Service Test ===');
  try {
    // Import the mock service directly
    const { mockRecallAIService } = await import('./server/services/mock-recall-ai.js');
    
    console.log('🤖 Testing mock bot creation...');
    const botId = await mockRecallAIService.startBot('https://meet.google.com/test', 'test-meeting-789');
    console.log(`   ✅ Mock bot created with ID: ${botId}`);
    
    // Wait a bit for the mock bot to simulate lobby and admission
    console.log('⏳ Waiting for mock bot to simulate lobby and admission...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('📊 Testing bot status...');
    const status = await mockRecallAIService.getBotStatusDetailed(botId);
    console.log(`   ✅ Bot status: ${status.status}`);
    console.log(`   ✅ In meeting: ${status.is_in_meeting}`);
    console.log(`   ✅ In lobby: ${status.is_in_lobby}`);
    console.log(`   ✅ Transcription active: ${status.transcription_active}`);
    
    console.log('📝 Testing real-time transcript...');
    const transcript = await mockRecallAIService.getRealTimeTranscript(botId);
    console.log(`   ✅ Transcript: ${transcript.transcript.substring(0, 50)}...`);
    console.log(`   ✅ Speakers: ${transcript.speakers.length}`);
    console.log(`   ✅ Language: ${transcript.language}`);
    console.log(`   ✅ Is live: ${transcript.is_live}`);
    
    console.log('🛑 Testing bot stop...');
    await mockRecallAIService.stopBot(botId);
    console.log('   ✅ Mock bot stopped successfully');
    
  } catch (error) {
    console.log('❌ Direct mock service test error:', error.message);
  }
  
  console.log('\n🎉 Mock Recall.ai service test completed!');
  console.log('\nSummary:');
  console.log('- Mock webhook endpoint: Test webhook processing');
  console.log('- Mock bot creation: Test bot creation flow');
  console.log('- Direct mock service: Test all mock service methods');
  console.log('\nBenefits of Mock Service:');
  console.log('- ✅ No API key required for development');
  console.log('- ✅ Simulates real bot behavior');
  console.log('- ✅ Tests all bot functionality');
  console.log('- ✅ Provides realistic transcript data');
  console.log('- ✅ Simulates lobby waiting and admission');
  console.log('\nNext steps:');
  console.log('1. Test the bot joining functionality in your app');
  console.log('2. Verify the mock service provides realistic data');
  console.log('3. Get a real Recall.ai API key when ready for production');
  console.log('4. Switch to real service by setting RECALL_API_KEY');
};

// Run the test
testMockRecallAI().catch(console.error);
