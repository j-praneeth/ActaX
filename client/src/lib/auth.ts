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

  async signInWithGoogle(): Promise<void> {
    try {
      const response = await fetch('/api/auth/google');
      const { authUrl } = await response.json();
      
      if (!response.ok) {
        throw new Error('Failed to get Google auth URL');
      }
      
      // Redirect to Google OAuth
      window.location.href = authUrl;
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  },

  async signInWithToken(token: string): Promise<AuthUser> {
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        throw new Error('Token verification failed');
      }

      const { user } = await response.json();
      return user;
    } catch (error) {
      console.error('Token sign in error:', error);
      throw error;
    }
  },

  async signOut(): Promise<void> {
    // Clear any stored tokens
    localStorage.removeItem('auth_token');
    window.location.href = '/';
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    // Check for stored token first
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        return await this.signInWithToken(token);
      } catch (error) {
        // Token is invalid, remove it
        localStorage.removeItem('auth_token');
      }
    }

    // Fallback to Supabase session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
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
