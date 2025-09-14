// Verify which storage is being used
import { storage } from './server/storage.js';

async function verifyStorage() {
  try {
    console.log('🔍 Verifying storage configuration...');
    
    // Test creating a user to see which storage is used
    const testUser = await storage.createUser({
      email: 'storage-test@example.com',
      name: 'Storage Test User',
      role: 'member'
    });
    
    console.log('✅ User created successfully:', testUser);
    
    // Try to retrieve the user
    const retrievedUser = await storage.getUserByEmail('storage-test@example.com');
    
    if (retrievedUser) {
      console.log('✅ User retrieved successfully:', retrievedUser);
      console.log('🎉 Storage is working correctly!');
      
      // Check if it's using Prisma (has proper UUID) or in-memory
      if (retrievedUser.id && retrievedUser.id.length > 20) {
        console.log('✅ Using Prisma storage (UUID detected)');
      } else {
        console.log('⚠️  Using in-memory storage (short ID detected)');
      }
    } else {
      console.log('❌ User not found - storage issue');
    }
    
  } catch (error) {
    console.error('❌ Storage verification failed:', error);
  }
}

verifyStorage();
