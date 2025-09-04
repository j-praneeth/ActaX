import { supabase } from './supabase';
import type { User } from '@shared/schema';
import { safeFetch, fetchWithErrorHandling } from './safe-fetch';

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

    // Create user in custom users table using the signup endpoint
    try {
      const response = await safeFetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.user.email,
          name: name,
          role: 'member',
          authUserId: data.user.id,
        }),
      });

      if (!response.ok || response.error) {
        console.error('Failed to create user in custom table:', response.error);
        // Don't throw here as the auth user was created successfully
        // The user can still use the app, and we can sync later
      }
    } catch (error) {
      console.warn('Error creating user in custom table:', error);
      // Don't throw here as the auth user was created successfully
    }

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

    // Ensure user exists in custom users table
    try {
      const response = await safeFetch('/api/auth/sync-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${data.session?.access_token}`,
        },
      });
      
      if (!response.ok || response.error) {
        console.warn('Failed to sync user, but sign in succeeded:', response.error);
      }
    } catch (error) {
      console.warn('Failed to sync user, but sign in succeeded:', error);
    }

    return {
      id: data.user.id,
      email: data.user.email!,
      name: data.user.user_metadata?.name || '',
      role: data.user.user_metadata?.role || 'member',
    };
  },

  async signInWithGoogle(): Promise<void> {
    try {
      const response = await safeFetch<{ authUrl: string }>('/api/auth/google');
      
      if (!response.ok || response.error || !response.data) {
        throw new Error(response.error || 'Failed to get Google auth URL');
      }
      
      // Redirect to Google OAuth
      window.location.href = response.data.authUrl;
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  },

  async signUpWithGoogle(): Promise<void> {
    try {
      const response = await safeFetch<{ authUrl: string }>('/api/auth/google?state=signup');
      
      if (!response.ok || response.error || !response.data) {
        throw new Error(response.error || 'Failed to get Google auth URL');
      }
      
      // Redirect to Google OAuth (same flow as sign in - the server handles user creation if needed)
      window.location.href = response.data.authUrl;
    } catch (error) {
      console.error('Google sign up error:', error);
      throw error;
    }
  },

  async signInWithToken(token: string): Promise<AuthUser> {
    try {
      const response = await safeFetch<{ user: AuthUser }>('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok || response.error || !response.data) {
        throw new Error(response.error || 'Token verification failed');
      }

      return response.data.user;
    } catch (error) {
      console.error('Token sign in error:', error);
      throw error;
    }
  },

  async signOut(): Promise<void> {
    try {
      // Clear localStorage token
      localStorage.removeItem('auth_token');
      
      // Sign out from Supabase session
      await supabase.auth.signOut();
      
      // Redirect to home page
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
      // Even if Supabase signout fails, clear localStorage and redirect
      localStorage.removeItem('auth_token');
      window.location.href = '/';
    }
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      // First, try to get current Supabase session (most reliable)
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (!sessionError && session?.user) {
        // We have a valid Supabase session
        try {
          // Ensure user exists in custom users table
          const response = await safeFetch('/api/auth/sync-user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
            },
          });
          
          if (!response.ok || response.error) {
            console.warn('Failed to sync user during getCurrentUser:', response.error);
          }

          return {
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.name || '',
            role: session.user.user_metadata?.role || 'member',
          };
        } catch (error) {
          console.warn('Failed to sync user, but session is valid:', error);
          // Return user even if sync fails
          return {
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.name || '',
            role: session.user.user_metadata?.role || 'member',
          };
        }
      }

      // If no Supabase session, check for stored custom token (backward compatibility)
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const user = await this.signInWithToken(token);
          return user;
        } catch (error) {
          // Token is invalid, remove it
          console.warn('Stored token is invalid, removing:', error);
          localStorage.removeItem('auth_token');
        }
      }

      // No valid session found
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
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

  async getCurrentSessionToken(): Promise<string | null> {
    try {
      // First, check for stored token (for backward compatibility)
      const storedToken = localStorage.getItem('auth_token');
      if (storedToken) {
        // Verify the stored token is still valid
        try {
          const user = await this.signInWithToken(storedToken);
          if (user) {
            return storedToken;
          }
        } catch (error) {
          // Token is invalid, remove it
          localStorage.removeItem('auth_token');
        }
      }

      // Fallback to Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token || null;
    } catch (error) {
      console.error('Error getting session token:', error);
      return null;
    }
  },

  async refreshSession(): Promise<AuthUser | null> {
    try {
      // Try to refresh the current Supabase session
      const { data: { session }, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.warn('Session refresh failed:', error);
        
        // Try using server refresh endpoint as fallback
        try {
          const storedToken = localStorage.getItem('auth_token');
          if (storedToken) {
            const response = await safeFetch<{ user: AuthUser; newToken?: string }>('/api/auth/refresh', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ token: storedToken }),
            });

            if (response.ok && response.data) {
              // Update token if new one was provided
              if (response.data.newToken) {
                localStorage.setItem('auth_token', response.data.newToken);
              }
              return response.data.user;
            }
          }
        } catch (refreshError) {
          console.warn('Server refresh also failed:', refreshError);
        }
        
        return null;
      }

      if (session?.user) {
        // Session refreshed successfully
        return {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name || '',
          role: session.user.user_metadata?.role || 'member',
        };
      }

      return null;
    } catch (error) {
      console.error('Error refreshing session:', error);
      return null;
    }
  },

  async ensureValidSession(): Promise<AuthUser | null> {
    // First try to get current user
    let user = await this.getCurrentUser();
    
    if (!user) {
      // Try to refresh session
      user = await this.refreshSession();
    }
    
    return user;
  },
};
