import { createContext, useContext, useEffect, useState } from 'react';
import { authService, type AuthUser } from '@/lib/auth';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUpWithGoogle: () => Promise<void>;
  signInWithToken: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let sessionCheckInterval: NodeJS.Timeout;

    const initializeAuth = async () => {
      // Check for token in URL (from Google OAuth callback)
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const error = urlParams.get('error');
      const welcome = urlParams.get('welcome');
      
      if (error) {
        // Handle OAuth errors
        console.error('OAuth error:', error);
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
        setLoading(false);
        return;
      }
      
      if (token) {
        // Store token and sign in
        localStorage.setItem('auth_token', token);
        try {
          const user = await authService.signInWithToken(token);
          setUser(user);
          
          // Show welcome message for new users
          if (welcome === 'true') {
            // We can add a toast or other welcome UI here if needed
            console.log('Welcome new user!', user.email);
          }
        } catch (error) {
          console.error('Token auth failed:', error);
        }
        
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
        setLoading(false);
        return;
      }

      // Try to restore session using enhanced method
      try {
        const user = await authService.ensureValidSession();
        setUser(user);
      } catch (error) {
        // Only log actual errors, not missing sessions
        if (error instanceof Error && error.message !== 'Auth session missing!') {
          console.error('Auth error:', error);
        }
      } finally {
        setLoading(false);
      }

      // Set up periodic session validation (every 5 minutes)
      sessionCheckInterval = setInterval(async () => {
        try {
          const currentUser = await authService.getCurrentUser();
          if (!currentUser && user) {
            // Session expired, clear user
            setUser(null);
          } else if (currentUser && !user) {
            // Session restored, set user
            setUser(currentUser);
          }
        } catch (error) {
          console.warn('Periodic session check failed:', error);
        }
      }, 5 * 60 * 1000); // 5 minutes
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange(setUser);

    return () => {
      subscription.unsubscribe();
      if (sessionCheckInterval) {
        clearInterval(sessionCheckInterval);
      }
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const user = await authService.signIn(email, password);
    setUser(user);
  };

  const signUp = async (email: string, password: string, name: string) => {
    const user = await authService.signUp(email, password, name);
    setUser(user);
  };

  const signInWithGoogle = async () => {
    await authService.signInWithGoogle();
  };

  const signUpWithGoogle = async () => {
    await authService.signUpWithGoogle();
  };

  const signInWithToken = async (token: string) => {
    const user = await authService.signInWithToken(token);
    setUser(user);
  };

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signInWithGoogle, signUpWithGoogle, signInWithToken, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
