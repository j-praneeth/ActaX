import { Header } from "@/components/header";
import { MeetingSidebar } from "@/components/meeting-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckSquare, Smile, CheckCircle, ArrowRight, Mic } from "lucide-react";

export default function MeetingAnalytics() {
  const analyticsData = [
    {
      title: "Meeting Type",
      content: "Estimate: General Discussion",
      icon: null
    },
    {
      title: "Smart Tags",
      content: "No smart tags available.",
      icon: null,
      isEmpty: true
    },
    {
      title: "Precise Summary",
      content: "The main topic seems to be related to a company named 'Covid 1919' and possibly some aspect of 'watch screens' and 'pa' (personal assistant or public announcement). However, the context and significance are unclear due to limited information.",
      icon: FileText
    },
    {
      title: "Next Action Plan",
      content: "Estimate: The transcript does not provide enough information to determine a specific next action plan.",
      icon: CheckSquare
    },
    {
      title: "Sentiment Analysis",
      content: "Estimate: Neutral. The provided text is too limited to assess any sentiment accurately.",
      icon: Smile
    },
    {
      title: "Decisions Made",
      content: "No decisions can be extracted from the provided text.",
      icon: CheckCircle
    },
    {
      title: "Follow-ups",
      content: "No follow-up actions can be identified from the provided text.",
      icon: ArrowRight
    },
    {
      title: "Speaker Analytics",
      content: "Naveen Bandari",
      icon: Mic,
      progress: 100
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="flex">
        <MeetingSidebar currentPage="analytics" />
        
        {/* Main Content */}
        <div className="flex-1 pt-16">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {analyticsData.map((item, index) => (
                <Card key={index} className="bg-gray-50">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-lg">
                      {item.icon && <item.icon className="h-5 w-5" />}
                      <span>{item.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {item.isEmpty ? (
                      <div className="bg-gray-200 rounded-lg p-8 text-center">
                        <span className="text-gray-500">{item.content}</span>
                      </div>
                    ) : item.progress ? (
                      <div>
                        <div className="mb-2">{item.content}</div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${item.progress}%` }}
                          ></div>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">{item.progress}%</div>
                      </div>
                    ) : (
                      <p className="text-gray-700">{item.content}</p>
                    )}
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
