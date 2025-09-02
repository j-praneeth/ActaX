import { Header } from "@/components/header";
import { MainSidebar } from "@/components/main-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { safeFetch } from "@/lib/safe-fetch";

export default function Integrations() {
  const { user } = useAuth();
  const { data: integrations = [] } = useQuery<any[]>({
    queryKey: ["/api/integrations"],
    enabled: !!user,
  });

  const handleConnect = async (provider: string) => {
    try {
      const res = await apiRequest("POST", `/api/integrations/${provider}/connect`);
      const { authUrl } = await res.json();
      if (authUrl) {
        window.location.href = authUrl;
      }
    } catch (error) {
      console.error('Failed to connect integration:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="flex">
        <MainSidebar currentPage="integrations" />

        {/* Main Content */}
        <div className="flex-1 pt-16">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Integrations</h1>
              <p className="text-gray-600">
                Connect ActaX with your favorite third-party services to automate workflows, streamline data, and enhance your business operations.
              </p>
            </div>

            {/* Integrations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Jira Section */}
              <Card className="bg-white hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className={`p-3 rounded-lg bg-blue-100 flex items-center justify-center text-2xl`}>
                      🔷
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Jira</h3>
                      <p className="text-sm text-gray-600 mb-3">Streamline project management and bug tracking by linking issues directly to ActaX operations.</p>
                      <p className={`text-sm font-medium text-blue-600`}>
                        {integrations.find((i) => i.provider === 'jira') ? 'Connected' : 'Not Connected'}
                      </p>
                    </div>
                  </div>
                  {integrations.find((i) => i.provider === 'jira') ? (
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">Manage</Button>
                  ) : (
                    <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => handleConnect('jira')}>Connect</Button>
                  )}
                </CardContent>
              </Card>

              {integrations.map((integration) => (
                <Card key={integration.id} className="bg-white hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4 mb-4">
                      <div className={`p-3 rounded-lg bg-gray-100 flex items-center justify-center text-2xl`}>
                        ⚙️
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{integration.provider}</h3>
                        <p className="text-sm text-gray-600 mb-3">Third-party integration</p>
                        <p className={`text-sm font-medium ${
                          integration.isActive ? "text-blue-600" : "text-gray-500"
                        }`}>
                          {integration.isActive ? 'Connected' : 'Not Connected'}
                        </p>
                      </div>
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Manage
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
