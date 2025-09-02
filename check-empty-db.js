// Check if database is empty
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkData() {
  try {
    const users = await prisma.user.findMany();
    const meetings = await prisma.meeting.findMany();
    const organizations = await prisma.organization.findMany();
    const agents = await prisma.agent.findMany();
    const integrations = await prisma.integration.findMany();
    const webhooks = await prisma.webhookEvent.findMany();
    
    console.log('📊 Current data in database:');
    console.log('   Users:', users.length);
    console.log('   Meetings:', meetings.length);
    console.log('   Organizations:', organizations.length);
    console.log('   Agents:', agents.length);
    console.log('   Integrations:', integrations.length);
    console.log('   Webhook Events:', webhooks.length);
    
    if (users.length === 0 && meetings.length === 0 && organizations.length === 0) {
      console.log('✅ Database is completely empty - no sample data!');
    } else {
      console.log('⚠️  Database still contains some data');
    }
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
