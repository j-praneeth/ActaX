import { supabase } from './supabase';
import type { User } from '@shared/schema';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export const authService = {
  async signUp(email: string, password: string, name: string): Promise<AuthUser> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) throw error;
    if (!data.user) throw new Error('Sign up failed');

    return {
      id: data.user.id,
      email: data.user.email!,
      name,
      role: 'member',
    };
  },

  async signIn(email: string, password: string): Promise<AuthUser> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error('Sign in failed');

    return {
      id: data.user.id,
      email: data.user.email!,
      name: data.user.user_metadata?.name || '',
      role: data.user.user_metadata?.role || 'member',
    };
  },

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    // First check if there's a valid session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      // If there's a session error, it might be a missing session - that's okay
      console.warn('Session error:', sessionError);
      return null;
    }
    
    if (!session?.user) {
      return null;
    }

    return {
      id: session.user.id,
      email: session.user.email!,
      name: session.user.user_metadata?.name || '',
      role: session.user.user_metadata?.role || 'member',
    };
  },

  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const user: AuthUser = {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name || '',
          role: session.user.user_metadata?.role || 'member',
        };
        callback(user);
      } else {
        callback(null);
      }
    });
  },
};
