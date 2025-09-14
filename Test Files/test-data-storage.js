// Test script to verify data storage in Supabase
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

async function testDataStorage() {
  try {
    console.log('🔍 Testing data storage in Supabase...');
    
    // Test 1: Create a test user
    console.log('\n1. Creating test user...');
    const testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        role: 'member'
      }
    });
    console.log('✅ User created:', testUser);

    // Test 2: Create a test organization
    console.log('\n2. Creating test organization...');
    const testOrg = await prisma.organization.create({
      data: {
        name: 'Test Organization',
        ownerId: testUser.id
      }
    });
    console.log('✅ Organization created:', testOrg);

    // Test 3: Create a test meeting
    console.log('\n3. Creating test meeting...');
    const testMeeting = await prisma.meeting.create({
      data: {
        title: 'Test Meeting - Data Storage Verification',
        description: 'This is a test meeting to verify data storage',
        organizationId: testOrg.id,
        status: 'scheduled',
        platform: 'google_meet',
        meetingUrl: 'https://meet.google.com/test-meeting',
        startTime: new Date(),
        endTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
        transcript: 'This is a test transcript to verify storage',
        summary: 'Test meeting summary for data verification',
        actionItems: ['Test action item 1', 'Test action item 2'],
        keyTopics: ['Topic 1', 'Topic 2', 'Topic 3'],
        decisions: ['Decision 1', 'Decision 2'],
        takeaways: ['Takeaway 1', 'Takeaway 2'],
        sentiment: 'positive'
      }
    });
    console.log('✅ Meeting created:', testMeeting);

    // Test 4: Create a test integration
    console.log('\n4. Creating test integration...');
    const testIntegration = await prisma.integration.create({
      data: {
        organizationId: testOrg.id,
        provider: 'google_meet',
        accessToken: 'test_access_token',
        refreshToken: 'test_refresh_token',
        isActive: true,
        settings: { test: true }
      }
    });
    console.log('✅ Integration created:', testIntegration);

    // Test 5: Create a test agent
    console.log('\n5. Creating test agent...');
    const testAgent = await prisma.agent.create({
      data: {
        organizationId: testOrg.id,
        name: 'Test AI Agent',
        goal: 'Test agent for data verification'
      }
    });
    console.log('✅ Agent created:', testAgent);

    // Test 6: Create a test webhook event
    console.log('\n6. Creating test webhook event...');
    const testWebhook = await prisma.webhookEvent.create({
      data: {
        source: 'recall_ai',
        eventType: 'test_event',
        payload: { test: 'data' },
        processed: false,
        meetingId: testMeeting.id
      }
    });
    console.log('✅ Webhook event created:', testWebhook);

    // Test 7: Verify data retrieval
    console.log('\n7. Verifying data retrieval...');
    const users = await prisma.user.findMany();
    const organizations = await prisma.organization.findMany();
    const meetings = await prisma.meeting.findMany();
    const integrations = await prisma.integration.findMany();
    const agents = await prisma.agent.findMany();
    const webhooks = await prisma.webhookEvent.findMany();

    console.log(`✅ Found ${users.length} users`);
    console.log(`✅ Found ${organizations.length} organizations`);
    console.log(`✅ Found ${meetings.length} meetings`);
    console.log(`✅ Found ${integrations.length} integrations`);
    console.log(`✅ Found ${agents.length} agents`);
    console.log(`✅ Found ${webhooks.length} webhook events`);

    console.log('\n🎉 Data storage test completed successfully!');
    console.log('\n📊 Summary:');
    console.log('- All test data has been created and stored in Supabase');
    console.log('- Data can be retrieved successfully');
    console.log('- Prisma ORM is working correctly');
    console.log('\n🔍 Check Prisma Studio to see the data in your tables!');

  } catch (error) {
    console.error('❌ Data storage test failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testDataStorage();
