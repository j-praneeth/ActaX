import { useAuth } from '@/hooks/use-auth';
import { authService } from '@/lib/auth';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function AuthDebug() {
  const { user, loading } = useAuth();
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [localStorageToken, setLocalStorageToken] = useState<string | null>(null);

  useEffect(() => {
    const checkTokens = async () => {
      const token = await authService.getCurrentSessionToken();
      setSessionToken(token);
      setLocalStorageToken(localStorage.getItem('auth_token'));
    };
    
    checkTokens();
  }, [user]);

  if (loading) {
    return <div>Loading auth debug...</div>;
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Authentication Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <strong>Auth Context User:</strong>
          {user ? (
            <Badge variant="default" className="ml-2">Authenticated</Badge>
          ) : (
            <Badge variant="destructive" className="ml-2">Not Authenticated</Badge>
          )}
          {user && (
            <div className="mt-2 text-sm text-gray-600">
              <div>ID: {user.id}</div>
              <div>Email: {user.email}</div>
              <div>Name: {user.name}</div>
              <div>Role: {user.role}</div>
            </div>
          )}
        </div>

        <div>
          <strong>Session Token:</strong>
          {sessionToken ? (
            <Badge variant="default" className="ml-2">Available</Badge>
          ) : (
            <Badge variant="destructive" className="ml-2">Not Available</Badge>
          )}
          {sessionToken && (
            <div className="mt-2 text-sm text-gray-600">
              Token: {sessionToken.substring(0, 20)}...
            </div>
          )}
        </div>

        <div>
          <strong>LocalStorage Token:</strong>
          {localStorageToken ? (
            <Badge variant="default" className="ml-2">Available</Badge>
          ) : (
            <Badge variant="destructive" className="ml-2">Not Available</Badge>
          )}
          {localStorageToken && (
            <div className="mt-2 text-sm text-gray-600">
              Token: {localStorageToken.substring(0, 20)}...
            </div>
          )}
        </div>

        <div className="pt-4 border-t">
          <strong>Recommendations:</strong>
          <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
            {!user && <li>User needs to sign in</li>}
            {user && !sessionToken && <li>Session token not available - try refreshing the page</li>}
            {user && sessionToken && <li>Authentication looks good!</li>}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
