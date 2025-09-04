import { geminiService } from './server/services/gemini.ts';

// Test transcript
const sampleTranscript = `
Welcome everyone to our quarterly planning meeting. Today we're discussing the product roadmap for Q2 2024.

John: Let's start with the mobile app development. We need to prioritize the iOS version.
Sarah: Agreed. I'll take ownership of the iOS development. We should have the first beta ready by March 15th.
Mike: What about the Android version?
John: Android will follow after iOS. Sarah, can you also coordinate with the design team?
Sarah: Absolutely. I'll schedule a meeting with them next week.

Let's also discuss the marketing campaign. Mike, you mentioned having some ideas?
Mike: Yes, I think we should focus on social media advertising. I'll prepare a proposal and share it by Friday.
John: Great. We also need to decide on the budget allocation.
Sarah: I suggest we allocate 60% to development and 40% to marketing.
John: That sounds reasonable. Let's finalize this decision next week.

Important takeaway: We need to move faster on product development to meet our Q2 targets.
Another key point: Customer feedback has been very positive about our current features.

Action items summary:
- Sarah will lead iOS development 
- Sarah will meet with design team
- Mike will prepare marketing proposal by Friday
- Budget allocation to be finalized next week
`;

async function testGeminiIntegration() {
  console.log('🧪 Testing Gemini integration...\n');
  
  try {
    console.log('🤖 Checking if Gemini is available...');
    console.log('Available:', geminiService.isAvailable());
    
    if (!geminiService.isAvailable()) {
      console.log('⚠️ Gemini API key not configured. Please set GEMINI_API_KEY environment variable.');
      console.log('📝 Testing fallback analysis instead...\n');
    }
    
    console.log('📄 Sample transcript length:', sampleTranscript.length, 'characters\n');
    
    console.log('🔄 Analyzing transcript...');
    const insights = await geminiService.analyzeMeetingTranscript(sampleTranscript);
    
    console.log('✅ Analysis completed!\n');
    console.log('📋 RESULTS:');
    console.log('='.repeat(50));
    
    console.log('\n📝 SUMMARY:');
    console.log(insights.summary);
    
    console.log('\n🎯 KEY TOPICS:');
    insights.keyTopics.forEach((topic, idx) => {
      console.log(`${idx + 1}. ${topic}`);
    });
    
    console.log('\n✅ ACTION ITEMS:');
    insights.actionItems.forEach((item, idx) => {
      console.log(`${idx + 1}. ${item}`);
    });
    
    console.log('\n💡 KEY TAKEAWAYS:');
    insights.takeaways.forEach((takeaway, idx) => {
      console.log(`${idx + 1}. ${takeaway}`);
    });
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 Gemini integration test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testGeminiIntegration(); 