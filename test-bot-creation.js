// Test bot creation with Recall.ai API
import { recallAIService } from './server/services/recall-ai.ts';

async function testBotCreation() {
  try {
    console.log('🔍 Testing Recall.ai bot creation...');
    
    // Test with a real Google Meet URL format
    const testMeetingUrl = 'https://meet.google.com/abc-defg-hij';
    const testMeetingId = 'test-meeting-123';
    
    console.log('📋 Meeting URL:', testMeetingUrl);
    console.log('📋 Meeting ID:', testMeetingId);
    
    console.log('🤖 Attempting to create bot...');
    const botId = await recallAIService.startBot(testMeetingUrl, testMeetingId);
    
    console.log('✅ Bot created successfully!');
    console.log('📋 Bot ID:', botId);
    
  } catch (error) {
    console.error('❌ Bot creation failed:');
    console.error('Error message:', error.message);
    console.error('Error details:', error);
    
    // Check if it's an API key issue
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      console.log('🔑 Issue: API key is invalid or expired');
    } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
      console.log('🔑 Issue: API key lacks permissions');
    } else if (error.message.includes('400') || error.message.includes('Bad Request')) {
      console.log('🔧 Issue: Invalid request parameters');
    } else if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
      console.log('🔧 Issue: Recall.ai server error');
    } else {
      console.log('🔧 Issue: Unknown error');
    }
  }
}

testBotCreation();
