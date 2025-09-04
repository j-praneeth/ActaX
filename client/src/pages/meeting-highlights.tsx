import { Header } from "@/components/header";
import { MeetingSidebar } from "@/components/meeting-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Trash2, Send, Download, RefreshCw } from "lucide-react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { Meeting } from "@shared/schema";
import { authService } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export default function MeetingHighlights() {
  const params = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [isLoadingTranscript, setIsLoadingTranscript] = useState(false);
  const { toast } = useToast();
  
  const { data: meeting, isLoading } = useQuery<Meeting | null>({
    queryKey: ["/api/meetings", params.id],
    enabled: !!params?.id,
  });

  const fetchTranscriptMutation = useMutation({
    mutationFn: async () => {
      const sessionToken = await authService.getCurrentSessionToken();
      
      if (!sessionToken) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`/api/meetings/${params.id}/fetch-transcript`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch transcript');
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Refetch the meeting data to get updated transcript
      queryClient.invalidateQueries({ queryKey: ["/api/meetings", params.id] });
      setIsLoadingTranscript(false);
      toast({
        title: "Success",
        description: "Transcript fetched and stored successfully!",
      });
    },
    onError: (error) => {
      console.error('Failed to fetch transcript:', error);
      setIsLoadingTranscript(false);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch transcript",
      });
    }
  });

  const handleFetchTranscript = () => {
    setIsLoadingTranscript(true);
    fetchTranscriptMutation.mutate();
  };

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

                {/* Transcript Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-purple-500 rounded"></div>
                        <span>Meeting Transcript</span>
                      </div>
                      {meeting?.recallBotId && (
                        <Button 
                          onClick={handleFetchTranscript}
                          disabled={isLoadingTranscript || fetchTranscriptMutation.isPending}
                          size="sm"
                          variant="outline"
                        >
                          {isLoadingTranscript || fetchTranscriptMutation.isPending ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Fetching...
                            </>
                          ) : (
                            <>
                              <Download className="h-4 w-4 mr-2" />
                              Fetch Transcript
                            </>
                          )}
                        </Button>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {meeting?.transcript ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            Transcript retrieved from Recall.ai Bot ID: {meeting.recallBotId}
                          </span>
                          <Button 
                            onClick={handleFetchTranscript}
                            disabled={isLoadingTranscript || fetchTranscriptMutation.isPending}
                            size="sm"
                            variant="ghost"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          <div className="whitespace-pre-wrap text-sm text-gray-700 p-4 bg-gray-50 rounded-lg border leading-relaxed">
                            {typeof meeting.transcript === 'string' 
                              ? meeting.transcript 
                              : JSON.stringify(meeting.transcript, null, 2)
                            }
                          </div>
                        </div>
                        {meeting.transcript && (
                          <div className="text-xs text-gray-400 mt-2">
                            Last updated: {new Date(meeting.updatedAt).toLocaleString()}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500 mb-4">No transcript available yet.</p>
                        {meeting?.recallBotId ? (
                          <div className="space-y-4">
                            <p className="text-sm text-gray-400">
                              Bot ID: {meeting.recallBotId}
                            </p>
                            <p className="text-sm text-gray-600">
                              Click "Fetch Transcript" to retrieve the latest transcript from Recall.ai.
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400">
                            No recording bot associated with this meeting.
                          </p>
                        )}
                      </div>
                    )}
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
