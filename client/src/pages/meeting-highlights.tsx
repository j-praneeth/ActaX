import { Header } from "@/components/header";
import { MeetingSidebar } from "@/components/meeting-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Trash2, Send } from "lucide-react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Meeting } from "@shared/schema";

export default function MeetingHighlights() {
  const params = useParams<{ id: string }>();
  const { data: meeting } = useQuery<Meeting | null>({
    queryKey: ["/api/meetings", params.id],
    enabled: !!params?.id,
  });

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="flex">
        <MeetingSidebar currentPage="highlights" />
        
        {/* Main Content */}
        <div className="flex-1 pt-16">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Meeting Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Meeting Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{meeting?.summary || 'No summary yet.'}</p>
                  </CardContent>
                </Card>

                {/* Action Points */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <span>Action Points</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">#</th>
                            <th className="text-left py-2">POINT</th>
                            <th className="text-left py-2">OWNER</th>
                            <th className="text-left py-2">ACTION</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(Array.isArray(meeting?.actionItems) ? meeting?.actionItems : []).map((point: any, idx: number) => (
                            <tr key={idx} className="border-b">
                              <td className="py-3">{idx + 1}</td>
                              <td className="py-3">{point}</td>
                              <td className="py-3">-</td>
                              <td className="py-3">
                                <div className="flex space-x-2">
                                  <Button variant="ghost" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Topics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                      <span>Topics</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">#</th>
                            <th className="text-left py-2">TOPIC</th>
                            <th className="text-left py-2">DESCRIPTION</th>
                            <th className="text-left py-2">SPEAKER</th>
                            <th className="text-left py-2">ACTION</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(Array.isArray(meeting?.keyTopics) ? meeting?.keyTopics : []).map((topic: any, idx: number) => (
                            <tr key={idx} className="border-b">
                              <td className="py-3">{idx + 1}</td>
                              <td className="py-3">{topic}</td>
                              <td className="py-3">-</td>
                              <td className="py-3">-</td>
                              <td className="py-3">
                                <div className="flex space-x-2">
                                  <Button variant="ghost" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Key Takeaways */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span>Key Takeaways</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">#</th>
                            <th className="text-left py-2">TEXT</th>
                            <th className="text-left py-2">ACTION</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(Array.isArray(meeting?.takeaways) ? meeting?.takeaways : []).map((text: any, idx: number) => (
                            <tr key={idx} className="border-b">
                              <td className="py-3">{idx + 1}</td>
                              <td className="py-3">{text}</td>
                              <td className="py-3">
                                <div className="flex space-x-2">
                                  <Button variant="ghost" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Sidebar */}
              <div className="space-y-6">
                {/* Participants - dynamic when available */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Participants</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-600">Participants data not available.</div>
                  </CardContent>
                </Card>

                {/* Ask Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>Ask?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[(meeting?.title && `What are the next steps for ${meeting.title}?`) || 'What are the next steps?'].map((question, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg border cursor-pointer hover:bg-gray-100 transition-colors">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">{question}</span>
                            <div className="w-4 h-4 border-l-2 border-b-2 border-gray-400 transform rotate-45"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex space-x-2">
                        <Input 
                          placeholder="Ask anything about meeting..." 
                          className="flex-1"
                        />
                        <Button size="sm">
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
