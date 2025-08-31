import { Header } from "@/components/header";
import { MainSidebar } from "@/components/main-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Check, GraduationCap, User, TrendingUp, Book, Calendar, FileText, Settings, DollarSign, Clipboard, Target, Headphones, Presentation } from "lucide-react";

export default function Agents() {
  const agents = [
    {
      id: "1",
      name: "Product Assistant - Ticket Creator",
      goal: "Identifies potential new Jira tickets from meetings.",
      icon: Check,
      iconBg: "bg-yellow-500",
    },
    {
      id: "2",
      name: "Product Manager Agent",
      goal: "Generates PRDs from meeting discussions.",
      icon: GraduationCap,
      iconBg: "bg-amber-600",
    },
    {
      id: "3",
      name: "Recruiting Assistant",
      goal: "Generates candidate assessment reports from interviews.",
      icon: User,
      iconBg: "bg-blue-500",
    },
    {
      id: "4",
      name: "Sales Agent - MEDDPICC",
      goal: "Generates a comprehensive sales report from meetings, focusing on MEDDPICC and related sales aspects.",
      icon: TrendingUp,
      iconBg: "bg-blue-800",
    },
    {
      id: "5",
      name: "Sales Agent - SPICED",
      goal: "Generates a comprehensive sales report from meetings, focusing on SPICED and related sales aspects.",
      icon: TrendingUp,
      iconBg: "bg-gray-400",
    },
    {
      id: "6",
      name: "Sales Agent - SPIN",
      goal: "Generates a comprehensive sales report from meetings, focusing on SPIN and related sales aspects.",
      icon: Book,
      iconBg: "bg-gray-500",
    },
    {
      id: "7",
      name: "Sales Agent - BANT",
      goal: "Generates a comprehensive sales report from meetings, focusing on BANT and related sales aspects.",
      icon: Calendar,
      iconBg: "bg-red-500",
    },
    {
      id: "8",
      name: "Project Assistant",
      goal: "Generates project status reports with visual indicators from meetings.",
      icon: FileText,
      iconBg: "bg-gray-700",
    },
    {
      id: "9",
      name: "CTO Assistant",
      goal: "Generates CTO-focused reports from technical meetings.",
      icon: Settings,
      iconBg: "bg-blue-400",
    },
    {
      id: "10",
      name: "VC Assistant - Dealflow",
      goal: "Generates investment summaries from dealflow meetings.",
      icon: DollarSign,
      iconBg: "bg-teal-500",
    },
    {
      id: "11",
      name: "VC Assistant - Monthly Checkins",
      goal: "Creates concise summaries of company check-in meetings for VCs.",
      icon: Clipboard,
      iconBg: "bg-white",
    },
    {
      id: "12",
      name: "Digital Marketing Assistant",
      goal: "Helps marketing teams analyze, optimize, and coordinate campaigns.",
      icon: Target,
      iconBg: "bg-red-500",
    },
    {
      id: "13",
      name: "Customer Support Assistant",
      goal: "Generate clear, structured summaries of customer support conversations.",
      icon: Headphones,
      iconBg: "bg-amber-600",
    },
    {
      id: "14",
      name: "Product Demo Assistant",
      goal: "Generates Product Demo effectiveness report from meetings.",
      icon: Presentation,
      iconBg: "bg-blue-500",
    },
  ];

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
              {agents.map((agent) => {
                const IconComponent = agent.icon;
                return (
                  <Card key={agent.id} className="bg-white hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className={`p-3 rounded-lg ${agent.iconBg} flex items-center justify-center`}>
                            <IconComponent className="h-6 w-6 text-white" />
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
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
