import { createClient } from '@supabase/supabase-js';
import { storage } from '../storage';
import type { User } from '@shared/schema';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

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
};
