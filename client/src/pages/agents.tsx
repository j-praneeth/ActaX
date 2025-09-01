import { Header } from "@/components/header";
import { MainSidebar } from "@/components/main-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

export default function Agents() {
  const { user } = useAuth();
  const { data: agents = [] } = useQuery<any[]>({
    queryKey: ["/api/agents"],
    enabled: !!user,
  });

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="flex">
        <MainSidebar currentPage="agents" />

        {/* Main Content */}
        <div className="flex-1 pt-16">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Agents</h1>
              <p className="text-gray-600">Streamline your workflow with customized Agents tailored to your needs.</p>
            </div>

            {/* Agents Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent) => (
                <Card key={agent.id} className="bg-white hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className={`p-3 rounded-lg bg-blue-600 flex items-center justify-center`}>
                          <span className="text-white font-bold">{(agent.name || 'A').slice(0,1)}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{agent.name}</h3>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Goal:</span> {agent.goal}
                          </p>
                        </div>
                      </div>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        Add Agent
                      </Button>
                    </div>
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
