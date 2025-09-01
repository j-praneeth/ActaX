import { createClient } from '@supabase/supabase-js';
import { storage } from '../storage';
import type { User } from '@shared/schema';

const supabaseUrl = process.env.SUPABASE_URL || 'https://mtmubjshdqxkgxvcazfi.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10bXVianNoZHF4a2d4dmNhemZpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjU4MjMwNSwiZXhwIjoyMDcyMTU4MzA1fQ.lYPiH0VRYTiXmOQh9pEfxnF5WedFkMEyFy7q69asYkw';

console.log('supabaseUrl', supabaseUrl);  
console.log('supabaseServiceKey', supabaseServiceKey);

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const supabaseService = {
  async createUserInDatabase(authUser: any): Promise<User> {
    const user = await storage.createUser({
      email: authUser.email,
      name: authUser.user_metadata?.name || '',
      role: 'member',
    });

    // Create default organization for the user
    await storage.createOrganization({
      name: `${user.name}'s Organization`,
      ownerId: user.id,
    });

    return user;
  },

  async getUserFromAuth(authUserId: string): Promise<User | null> {
    // In a real implementation, you might store the mapping between Supabase auth IDs and your user IDs
    // For now, we'll use email as the lookup
    const { data: authUser } = await supabase.auth.admin.getUserById(authUserId);
    if (!authUser.user?.email) return null;

    const user = await storage.getUserByEmail(authUser.user.email);
    if (!user) {
      // Create user if they don't exist
      return await this.createUserInDatabase(authUser.user);
    }

    return user;
  },

  async verifyAuthToken(token: string): Promise<User | null> {
    try {
      const { data: { user: authUser }, error } = await supabase.auth.getUser(token);
      
      if (error || !authUser) return null;

      return await this.getUserFromAuth(authUser.id);
    } catch (error) {
      console.error('Auth verification error:', error);
      return null;
    }
  },

  async createSessionToken(user: User): Promise<string> {
    try {
      // Create a JWT token for the user session
      const { data, error } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: user.email,
        options: {
          redirectTo: `${process.env.CALLBACK_BASE_URL || 'http://localhost:5000'}/dashboard`
        }
      });

      if (error) throw error;

      // For simplicity, we'll create a custom token
      // In production, you might want to use a proper JWT library
      const token = Buffer.from(JSON.stringify({
        userId: user.id,
        email: user.email,
        exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      })).toString('base64');

      return token;
    } catch (error) {
      console.error('Session token creation error:', error);
      throw new Error('Failed to create session token');
    }
  },

  async verifySessionToken(token: string): Promise<User | null> {
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      
      if (decoded.exp < Date.now()) {
        return null; // Token expired
      }

      return await storage.getUserById(decoded.userId);
    } catch (error) {
      console.error('Session token verification error:', error);
      return null;
    }
  },
};
