import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Settings } from "lucide-react";
import { Link } from "wouter";

interface MeetingAgentsProps {
  hasAgents?: boolean;
}

export function MeetingAgents({ hasAgents = false }: MeetingAgentsProps) {
  if (!hasAgents) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Agents Enabled</h2>
            <p className="text-gray-600 mb-8 max-w-md">
              No agent summaries are currently available for this meeting. You can enable agents in your settings to view their insights here.
            </p>
            <Link href="/settings">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Settings className="h-4 w-4 mr-2" />
                Go to Agents Page
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If agents are enabled, show agent summaries
  const agentSummaries = [
    {
      id: 1,
      name: "Product Manager Agent",
      summary: "Generated comprehensive PRD based on meeting discussions about feature requirements and user needs.",
      status: "completed"
    },
    {
      id: 2,
      name: "Sales Agent - MEDDPICC",
      summary: "Analyzed sales conversation and identified key decision criteria and next steps for deal progression.",
      status: "processing"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Agent Summaries</h2>
        <Link href="/settings">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Manage Agents
          </Button>
        </Link>
      </div>
      
      <div className="grid gap-6">
        {agentSummaries.map((agent) => (
          <Card key={agent.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{agent.name}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  agent.status === 'completed' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {agent.status}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{agent.summary}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
