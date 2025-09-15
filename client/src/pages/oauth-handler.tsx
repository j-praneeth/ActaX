import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { safeFetch } from '@/lib/safe-fetch';

export default function OAuthHandler() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [location] = useLocation();

  useEffect(() => {
    handleOAuthCallback();
  }, []);

  const handleOAuthCallback = async () => {
    console.log('🔍 OAuth Handler - Current URL:', window.location.href);
    console.log('🔍 OAuth Handler - Location search:', location.search);
    console.log('🔍 OAuth Handler - Window location:', window.location);
    console.log('🔍 OAuth Handler - Document URL:', document.URL);
    
    const urlParams = new URLSearchParams(location.search);
    const success = urlParams.get('success');
    const provider = urlParams.get('provider') || 'jira';
    const integrationId = urlParams.get('integrationId');
    const error = urlParams.get('error');
    
    console.log('🔍 OAuth Handler - Parsed parameters:', {
      success,
      provider,
      integrationId,
      error,
      allParams: Object.fromEntries(urlParams.entries())
    });
    
    // Also check if we're in a popup
    console.log('🔍 OAuth Handler - Window opener:', !!window.opener);
    console.log('🔍 OAuth Handler - Window name:', window.name);

    // Check if this is a success redirect from server
    if (success === 'true' && integrationId) {
      console.log('✅ Success redirect detected');
      setStatus('success');
      setMessage(`${provider} integration connected successfully!`);

      // Send success message to parent window and close
      if (window.opener) {
        console.log('Sending success message to parent window');
        console.log('Parent window:', window.opener);
        console.log('Message data:', { type: 'OAUTH_SUCCESS', provider });
        
        // Send message to parent window
        window.opener.postMessage({ type: 'OAUTH_SUCCESS', provider }, window.location.origin);
        
        // Close this window immediately
        setTimeout(() => {
          window.close();
        }, 500);
      } else {
        // If not in popup, redirect to integrations page
        setTimeout(() => {
          window.location.href = '/integrations';
        }, 2000);
      }
      return;
    }

    // Check if this is an error redirect from server
    if (error) {
      console.log('❌ Error redirect detected:', error);
      setStatus('error');
      
      let errorMessage = `OAuth Error: ${error}`;
      if (error === 'oauth_config_error') {
        errorMessage = 'OAuth configuration error. Please check your Jira OAuth app settings.';
      } else if (error === 'missing_parameters') {
        errorMessage = 'OAuth parameters missing. Please try connecting again.';
      }
      
      setMessage(errorMessage);
      return;
    }

    // Fallback: try to process OAuth callback with code and state
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (!code || !state) {
      console.log('❌ Missing OAuth parameters - code:', !!code, 'state:', !!state);
      setStatus('error');
      setMessage('Missing OAuth code or state parameter.');
      
      // If we're in a popup and no parameters, it might be a timeout or error
      if (window.opener) {
        console.log('Sending error message to parent window');
        window.opener.postMessage({ type: 'OAUTH_ERROR', provider: 'jira', error: 'missing_parameters' }, window.location.origin);
        
        // Close after a delay
        setTimeout(() => {
          window.close();
        }, 2000);
      }
      return;
    }

    try {
      const response = await safeFetch<{ success: boolean; integration?: any; message?: string }>(
        '/api/integrations/callback',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code, state, provider }),
        }
      );

      if (!response.ok || response.error || !response.data?.success) {
        throw new Error(response.error || response.data?.message || 'OAuth callback failed');
      }

      setStatus('success');
      setMessage(`${provider} integration connected successfully!`);

      // Send success message to parent window and close
      if (window.opener) {
        console.log('Sending success message to parent window');
        console.log('Parent window:', window.opener);
        console.log('Message data:', { type: 'OAUTH_SUCCESS', provider });
        
        // Send message to parent window
        window.opener.postMessage({ type: 'OAUTH_SUCCESS', provider }, window.location.origin);
        
        // Close this window immediately
        setTimeout(() => {
          window.close();
        }, 500);
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

  const handleClose = () => {
    if (window.opener) {
      window.close();
    } else {
      window.location.href = '/integrations';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {status === 'loading' && <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />}
          {status === 'success' && <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />}
          {status === 'error' && <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />}
          <CardTitle className="text-2xl font-bold">
            {status === 'loading' && 'Connecting Integration...'}
            {status === 'success' && 'Integration Connected!'}
            {status === 'error' && 'Connection Failed'}
          </CardTitle>
          <CardDescription className="text-gray-600">{message}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {status === 'error' && (
            <Button onClick={handleClose} className="w-full">
              Close Window
            </Button>
          )}
          {status === 'success' && (
            <p className="text-sm text-gray-500">
              This window will close automatically...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
