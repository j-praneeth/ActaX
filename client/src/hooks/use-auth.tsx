import { createContext, useContext, useEffect, useState } from 'react';
import { authService, type AuthUser } from '@/lib/auth';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial user
    authService.getCurrentUser()
      .then(setUser)
      .catch((error) => {
        // Only log actual errors, not missing sessions
        if (error.message !== 'Auth session missing!') {
          console.error('Auth error:', error);
        }
      })
      .finally(() => setLoading(false));

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange(setUser);

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const user = await authService.signIn(email, password);
    setUser(user);
  };

  const signUp = async (email: string, password: string, name: string) => {
    const user = await authService.signUp(email, password, name);
    setUser(user);
  };

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
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
