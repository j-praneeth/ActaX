import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Integration {
  id: string;
  provider: string;
  isActive: boolean;
  createdAt: string;
  settings?: any;
}

interface IntegrationsPanelProps {
  onIntegrationAdded?: (integration: Integration) => void;
}

export function IntegrationsPanel({ onIntegrationAdded }: IntegrationsPanelProps) {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const response = await fetch('/api/integrations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch integrations');
      }

      const data = await response.json();
      setIntegrations(data);
    } catch (error) {
      console.error('Error fetching integrations:', error);
      toast({
        title: "Error",
        description: "Failed to load integrations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (provider: string) => {
    setConnecting(provider);
    try {
      const response = await fetch(`/api/integrations/${provider}/connect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to initiate ${provider} connection`);
      }

      const { authUrl } = await response.json();
      
      // Open OAuth flow in new window
      const popup = window.open(
        authUrl,
        `${provider}-oauth`,
        'width=600,height=700,scrollbars=yes,resizable=yes'
      );

      // Listen for popup completion
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          setConnecting(null);
          // Refresh integrations
          fetchIntegrations();
        }
      }, 1000);

    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to connect ${provider}`,
        variant: "destructive",
      });
      setConnecting(null);
    }
  };

  const handleDisconnect = async (integrationId: string) => {
    try {
      const response = await fetch(`/api/integrations/${integrationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to disconnect integration');
      }

      toast({
        title: "Success",
        description: "Integration disconnected successfully",
      });

      fetchIntegrations();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to disconnect integration",
        variant: "destructive",
      });
    }
  };

  const getProviderInfo = (provider: string) => {
    const providers = {
      jira: {
        name: 'Jira',
        description: 'Sync meeting summaries and action items to Jira issues',
        icon: '🎯',
        color: 'bg-blue-100 text-blue-800',
      },
      slack: {
        name: 'Slack',
        description: 'Share meeting summaries to Slack channels',
        icon: '💬',
        color: 'bg-purple-100 text-purple-800',
      },
      notion: {
        name: 'Notion',
        description: 'Save meeting notes and insights to Notion pages',
        icon: '📝',
        color: 'bg-gray-100 text-gray-800',
      },
      linear: {
        name: 'Linear',
        description: 'Create Linear issues from meeting action items',
        icon: '📊',
        color: 'bg-green-100 text-green-800',
      },
      salesforce: {
        name: 'Salesforce',
        description: 'Create Salesforce tasks from meeting outcomes',
        icon: '☁️',
        color: 'bg-blue-100 text-blue-800',
      },
      hubspot: {
        name: 'HubSpot',
        description: 'Sync meeting data to HubSpot CRM',
        icon: '🎯',
        color: 'bg-orange-100 text-orange-800',
      },
    };

    return providers[provider as keyof typeof providers] || {
      name: provider,
      description: 'Integration with ' + provider,
      icon: '🔗',
      color: 'bg-gray-100 text-gray-800',
    };
  };

  const availableProviders = ['jira', 'slack', 'notion', 'linear', 'salesforce', 'hubspot'];
  const connectedProviders = integrations.map(i => i.provider);
  const unconnectedProviders = availableProviders.filter(p => !connectedProviders.includes(p));

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
          <CardDescription>Manage your third-party integrations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="w-5 h-5" />
          <span>Integrations</span>
        </CardTitle>
        <CardDescription>
          Connect your favorite tools to automatically sync meeting data
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Connected Integrations */}
        {integrations.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Connected</h3>
            <div className="grid gap-4">
              {integrations.map((integration) => {
                const info = getProviderInfo(integration.provider);
                return (
                  <div key={integration.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{info.icon}</span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{info.name}</h4>
                          <Badge className={info.color}>
                            {integration.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{info.description}</p>
                        <p className="text-xs text-gray-500">
                          Connected {new Date(integration.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {integration.isActive ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-yellow-500" />
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDisconnect(integration.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {integrations.length > 0 && unconnectedProviders.length > 0 && <Separator />}

        {/* Available Integrations */}
        {unconnectedProviders.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Available</h3>
            <div className="grid gap-4">
              {unconnectedProviders.map((provider) => {
                const info = getProviderInfo(provider);
                return (
                  <div key={provider} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{info.icon}</span>
                      <div>
                        <h4 className="font-medium">{info.name}</h4>
                        <p className="text-sm text-gray-600">{info.description}</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleConnect(provider)}
                      disabled={connecting === provider}
                      className="flex items-center space-x-2"
                    >
                      {connecting === provider ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Connecting...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          <span>Connect</span>
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {integrations.length === 0 && unconnectedProviders.length === 0 && (
          <div className="text-center py-8">
            <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No integrations available</h3>
            <p className="text-gray-600">Check back later for new integration options.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

