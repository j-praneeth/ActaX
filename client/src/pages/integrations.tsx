import { Header } from "@/components/header";
import { MainSidebar } from "@/components/main-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Integrations() {
  const integrations = [
    {
      id: "1",
      name: "Jira",
      description: "Streamline project management and bug tracking by linking issues directly to ActaX operations.",
      status: "Connected",
      icon: "🔷",
      iconBg: "bg-blue-100",
      buttonText: "Manage",
      buttonVariant: "default" as const,
    },
    {
      id: "2",
      name: "Salesforce",
      description: "Sync customer data and sales activities to automate workflows and enhance CRM capabilities.",
      status: "Not Connected",
      icon: "☁️",
      iconBg: "bg-blue-100",
      buttonText: "Connect",
      buttonVariant: "default" as const,
    },
    {
      id: "3",
      name: "HubSpot",
      description: "Automate marketing, sales, and customer service tasks with a unified platform experience.",
      status: "Connected",
      icon: "🔶",
      iconBg: "bg-orange-100",
      buttonText: "Manage",
      buttonVariant: "default" as const,
    },
    {
      id: "4",
      name: "Linear",
      description: "Modern issue tracking and project management for software teams, integrated for seamless workflows.",
      status: "Not Connected",
      icon: "⬢",
      iconBg: "bg-gray-100",
      buttonText: "Connect",
      buttonVariant: "default" as const,
    },
    {
      id: "5",
      name: "Trello",
      description: "Organize projects and track progress visually with boards, lists, and cards.",
      status: "Not Connected",
      icon: "📋",
      iconBg: "bg-blue-100",
      buttonText: "Connect",
      buttonVariant: "default" as const,
    },
    {
      id: "6",
      name: "Zendesk",
      description: "Enhance customer service and support with integrated ticketing and communication tools.",
      status: "Connected",
      icon: "🎫",
      iconBg: "bg-green-100",
      buttonText: "Manage",
      buttonVariant: "default" as const,
    },
  ];

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
              {integrations.map((integration) => (
                <Card key={integration.id} className="bg-white hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4 mb-4">
                      <div className={`p-3 rounded-lg ${integration.iconBg} flex items-center justify-center text-2xl`}>
                        {integration.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{integration.name}</h3>
                        <p className="text-sm text-gray-600 mb-3">{integration.description}</p>
                        <p className={`text-sm font-medium ${
                          integration.status === "Connected" ? "text-blue-600" : "text-gray-500"
                        }`}>
                          {integration.status}
                        </p>
                      </div>
                    </div>
                    <Button 
                      className={`w-full ${
                        integration.status === "Connected" 
                          ? "bg-blue-600 hover:bg-blue-700" 
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                    >
                      {integration.buttonText}
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
