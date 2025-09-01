import { Header } from "@/components/header";
import { MeetingSidebar } from "@/components/meeting-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckSquare, Smile, CheckCircle, ArrowRight, Mic } from "lucide-react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Meeting } from "@shared/schema";

export default function MeetingAnalytics() {
  const params = useParams<{ id: string }>();
  const { data: meeting } = useQuery<Meeting | null>({
    queryKey: ["/api/meetings", params.id],
    enabled: !!params?.id,
  });

  const analyticsData = [
    { title: "Meeting Type", content: meeting?.platform || '-', icon: null },
    { title: "Smart Tags", content: (Array.isArray(meeting?.keyTopics) ? meeting?.keyTopics.join(', ') : '-') || '-', icon: null },
    { title: "Precise Summary", content: meeting?.summary || 'No summary.', icon: FileText },
    { title: "Next Action Plan", content: (Array.isArray(meeting?.actionItems) ? meeting?.actionItems.join('; ') : '-') || '-', icon: CheckSquare },
    { title: "Sentiment Analysis", content: meeting?.sentiment || '-', icon: Smile },
    { title: "Decisions Made", content: (Array.isArray(meeting?.decisions) ? meeting?.decisions.join('; ') : '-') || '-', icon: CheckCircle },
    { title: "Follow-ups", content: (Array.isArray(meeting?.takeaways) ? meeting?.takeaways.join('; ') : '-') || '-', icon: ArrowRight },
    { title: "Speaker Analytics", content: '-', icon: Mic, progress: 0 },
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
