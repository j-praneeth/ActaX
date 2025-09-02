// Test your application's data storage
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testAppStorage() {
  try {
    console.log('🔍 Testing application data storage...');
    
    // Check current data in tables
    const users = await prisma.user.findMany();
    const meetings = await prisma.meeting.findMany();
    const organizations = await prisma.organization.findMany();
    
    console.log(`📊 Current data in Supabase:`);
    console.log(`   Users: ${users.length}`);
    console.log(`   Meetings: ${meetings.length}`);
    console.log(`   Organizations: ${organizations.length}`);
    
    if (meetings.length > 0) {
      console.log('\n📋 Sample meeting data:');
      meetings.forEach((meeting, index) => {
        console.log(`   Meeting ${index + 1}:`);
        console.log(`     Title: ${meeting.title}`);
        console.log(`     Status: ${meeting.status}`);
        console.log(`     Platform: ${meeting.platform}`);
        console.log(`     Created: ${meeting.createdAt}`);
      });
    }
    
    console.log('\n✅ Data storage verification complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testAppStorage();
