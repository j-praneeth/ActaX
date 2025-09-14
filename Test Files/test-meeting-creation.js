// Test meeting creation and bot joining
import { storage } from '../server/storage.ts';

async function testMeetingCreation() {
  // Wait a moment for storage to initialize
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  try {
    console.log('🔍 Testing meeting creation...');
    
    // First, create a test user and organization
    console.log('👤 Creating test user...');
    const testUser = await storage.createUser({
      email: 'test@example.com',
      name: 'Test User',
      role: 'owner'
    });
    console.log('✅ User created:', testUser.id);
    
    console.log('🏢 Creating test organization...');
    const testOrg = await storage.createOrganization({
      name: 'Test Organization',
      ownerId: testUser.id
    });
    console.log('✅ Organization created:', testOrg.id);
    
    // Test meeting data (similar to what Google Meet service creates)
    const testMeetingData = {
      title: `Test Meeting - ${new Date().toLocaleString()}`,
      description: 'Test meeting for debugging',
      platform: 'google_meet',
      meetingUrl: 'https://meet.google.com/test-meeting-123',
      status: 'scheduled',
      startTime: new Date(),
      endTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
      organizationId: testOrg.id, // Use the real organization ID
    };
    
    console.log('📝 Creating meeting with data:', testMeetingData);
    
    // Try to create the meeting
    const meeting = await storage.createMeeting(testMeetingData);
    
    console.log('✅ Meeting created successfully!');
    console.log('📋 Meeting ID:', meeting.id);
    console.log('📋 Meeting Title:', meeting.title);
    console.log('📋 Meeting Status:', meeting.status);
    console.log('📋 Organization ID:', meeting.organizationId);
    
  } catch (error) {
    console.error('❌ Meeting creation failed:');
    console.error('Error message:', error.message);
    console.error('Error details:', error);
    
    if (error.message.includes('Null constraint violation')) {
      console.log('🔧 Issue: Database constraint violation - likely missing required field');
    } else if (error.message.includes('Foreign key constraint')) {
      console.log('🔧 Issue: Invalid organization ID');
    } else {
      console.log('🔧 Issue: Unknown database error');
    }
  }
}

testMeetingCreation();
