import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { safeFetch } from '@/lib/safe-fetch';
import { authService } from '@/lib/auth';

export default function IntegrationsCallback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const location = useLocation();

  useEffect(() => {
    handleOAuthCallback();
  }, []);

  const handleOAuthCallback = async () => {
    try {
      const urlParams = new URLSearchParams(location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');

      if (error) {
        setStatus('error');
        setMessage(`OAuth error: ${error}`);
        return;
      }

      if (!code || !state) {
        setStatus('error');
        setMessage('Missing OAuth parameters');
        return;
      }

      // Get session token
      const sessionToken = await authService.getCurrentSessionToken();
      if (!sessionToken) {
        setStatus('error');
        setMessage('User not authenticated');
        return;
      }

      // Send callback to server
      const response = await safeFetch('/api/integrations/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          code,
          state,
          provider: 'jira'
        }),
      });

      if (!response.ok || response.error) {
        throw new Error(response.error || 'OAuth callback failed');
      }

      setStatus('success');
      setMessage('Jira integration connected successfully!');

      // Handle OAuth success for new tab
      if (window.opener) {
        console.log('Sending success message to parent window');
        console.log('Parent window:', window.opener);
        console.log('Message data:', { type: 'OAUTH_SUCCESS', provider: 'jira' });
        
        window.opener.postMessage({ type: 'OAUTH_SUCCESS', provider: 'jira' }, window.location.origin);
        
        // Redirect to integrations page after sending message
        setTimeout(() => {
          window.location.href = '/integrations';
        }, 1000);
      } else {
        // If not in popup, redirect to integrations page
        setTimeout(() => {
          window.location.href = '/integrations';
        }, 2000);
      }

    } catch (error) {
      console.error('OAuth callback error:', error);
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'OAuth callback failed');
    }
  };

      const handleRetry = () => {
        window.location.href = '/integrations';
      };

      const handleGoToIntegrations = () => {
        window.location.href = '/integrations';
      };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2">
            {status === 'loading' && <Loader2 className="h-6 w-6 animate-spin text-blue-500" />}
            {status === 'success' && <CheckCircle className="h-6 w-6 text-green-500" />}
            {status === 'error' && <XCircle className="h-6 w-6 text-red-500" />}
            <span>
              {status === 'loading' && 'Connecting to Jira...'}
              {status === 'success' && 'Connection Successful'}
              {status === 'error' && 'Connection Failed'}
            </span>
          </CardTitle>
          <CardDescription>
            {status === 'loading' && 'Please wait while we complete the OAuth flow...'}
            {status === 'success' && 'You can now close this window and return to the integrations page.'}
            {status === 'error' && 'There was an error connecting to Jira. Please try again.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {message && (
            <p className={`text-sm mb-4 ${
              status === 'success' ? 'text-green-600' : 
              status === 'error' ? 'text-red-600' : 
              'text-gray-600'
            }`}>
              {message}
            </p>
          )}
          
          {status === 'error' && (
            <Button onClick={handleRetry} className="w-full">
              Return to Integrations
            </Button>
          )}
          
          {status === 'success' && (
            <Button onClick={handleGoToIntegrations} className="w-full">
              Go to Integrations
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
