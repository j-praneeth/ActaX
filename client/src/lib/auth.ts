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
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) throw error;
    if (!user) return null;

    return {
      id: user.id,
      email: user.email!,
      name: user.user_metadata?.name || '',
      role: user.user_metadata?.role || 'member',
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
