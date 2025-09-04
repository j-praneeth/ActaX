import { Header } from "@/components/header";
import { MeetingSidebar } from "@/components/meeting-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Trash2, Send, Download, RefreshCw, ArrowLeft } from "lucide-react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import type { Meeting } from "@shared/schema";
import { authService } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

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
        title: "Transcript Ready",
        description: "Meeting transcript has been successfully retrieved and is now available!",
      });

      // Automatically trigger insights generation after transcript is fetched
      if (data.meeting?.transcript) {
        generateInsightsMutation.mutate();
      }
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

  const generateInsightsMutation = useMutation({
    mutationFn: async () => {
      const sessionToken = await authService.getCurrentSessionToken();

      if (!sessionToken) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`/api/meetings/${params.id}/generate-insights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate insights');
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Refetch the meeting data to get updated insights
      queryClient.invalidateQueries({ queryKey: ["/api/meetings", params.id] });
      toast({
        title: "Insights Generated",
        description: "AI-powered meeting insights have been generated successfully!",
      });
    },
    onError: (error) => {
      console.error('Failed to generate insights:', error);
      toast({
        variant: "destructive",
        title: "Insights Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate insights",
      });
    }
  });

  const handleFetchTranscript = () => {
    setIsLoadingTranscript(true);
    fetchTranscriptMutation.mutate();
  };

  // Automatically fetch transcript when page loads if not available
  useEffect(() => {
    if (meeting && meeting.recallBotId && !meeting.transcript && !isLoadingTranscript && !fetchTranscriptMutation.isPending) {
      console.log('🔄 Auto-fetching transcript for meeting:', meeting.id);
      handleFetchTranscript();
    }
  }, [meeting, isLoadingTranscript, fetchTranscriptMutation.isPending]);

  // Automatically generate insights when transcript is available but insights are missing
  useEffect(() => {
    if (meeting && meeting.transcript &&
      (!meeting.summary || !meeting.actionItems || !meeting.keyTopics || !meeting.takeaways) &&
      !generateInsightsMutation.isPending) {
      console.log('🧠 Auto-generating insights for meeting:', meeting.id);
      generateInsightsMutation.mutate();
    }
  }, [meeting?.transcript, meeting?.summary, meeting?.actionItems, meeting?.keyTopics, meeting?.takeaways, generateInsightsMutation.isPending]);

  // Retry fetching transcript periodically if it failed and meeting is still in progress
  useEffect(() => {
    if (meeting && meeting.recallBotId && !meeting.transcript &&
      (meeting.status === 'in_progress' || meeting.status === 'completed') &&
      !isLoadingTranscript && !fetchTranscriptMutation.isPending) {

      const retryInterval = setInterval(() => {
        console.log('🔄 Retrying transcript fetch for in-progress meeting');
        handleFetchTranscript();
      }, 30000); // Retry every 30 seconds

      // Clear interval after 10 minutes or when transcript is found
      const timeout = setTimeout(() => {
        clearInterval(retryInterval);
      }, 600000); // 10 minutes

      return () => {
        clearInterval(retryInterval);
        clearTimeout(timeout);
      };
    }
  }, [meeting?.transcript, meeting?.status, isLoadingTranscript, fetchTranscriptMutation.isPending]);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="flex">
        {/* <MeetingSidebar currentPage="highlights" /> */}

        {/* Main Content */}
        <div className="flex-1 pt-16">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Main Content */}
              <div className="lg:col-span-2 space-y-8">

                <Link href="/dashboard" className="flex items-center space-x-2 gap-2  p-2 w-fit mb-4">
                  <Button size="sm"
                      variant="outline"
                      className="relative right-0"><ArrowLeft className="h-5 w-5 text-gray-600 hover:text-gray-900 cursor-pointer" /> Back</Button>
                </Link>
                {/* Transcript Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-purple-500 rounded"></div>
                        <span>Meeting Transcript</span>
                        {(isLoadingTranscript || fetchTranscriptMutation.isPending) && (
                          <RefreshCw className="h-4 w-4 animate-spin text-purple-500" />
                        )}
                      </div>
                      {/* {meeting?.recallBotId && meeting?.transcript && (
                        <Button 
                          onClick={handleFetchTranscript}
                          disabled={isLoadingTranscript || fetchTranscriptMutation.isPending}
                          size="sm"
                          variant="ghost"
                          title="Refresh transcript"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      )} */}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {meeting?.transcript ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          {/* <span className="text-sm text-gray-500">
                            Transcript retrieved from Recall.ai Bot ID: {meeting.recallBotId}
                          </span> */}
                          {/* <Button 
                            onClick={handleFetchTranscript}
                            disabled={isLoadingTranscript || fetchTranscriptMutation.isPending}
                            size="sm"
                            variant="ghost"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button> */}
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          <div className="whitespace-pre-wrap text-sm text-gray-700 p-4 bg-gray-50 rounded-lg border leading-relaxed">
                            {typeof meeting.transcript === 'string'
                              ? meeting.transcript
                              : JSON.stringify(meeting.transcript, null, 2)
                            }
                          </div>
                        </div>
                        {/* {meeting.transcript && (
                          <div className="text-xs text-gray-400 mt-2">
                            Last updated: {new Date(meeting.updatedAt).toLocaleString()}
                          </div>
                        )} */}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        {(isLoadingTranscript || fetchTranscriptMutation.isPending) ? (
                          <div className="space-y-4">
                            {/* <RefreshCw className="h-8 w-8 animate-spin text-purple-500 mx-auto" /> */}
                            {/* <p className="text-gray-600">Fetching transcript from Recall.ai...</p> */}
                            {/* <p className="text-sm text-gray-400">
                              Bot ID: {meeting?.recallBotId}
                            </p> */}
                          </div>
                        ) : (
                          <div>
                            <p className="text-gray-500 mb-4">Retrieving transcript and generating AI insights...</p>
                            {meeting?.recallBotId ? (
                              <div className="space-y-4">
                                <p className="text-sm text-gray-400">
                                  Bot ID: {meeting.recallBotId}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Transcript will be automatically fetched when available.
                                </p>
                                <Button
                                  onClick={handleFetchTranscript}
                                  disabled={isLoadingTranscript || fetchTranscriptMutation.isPending}
                                  size="sm"
                                  variant="outline"
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Try Fetch Now
                                </Button>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-400">
                                {/* No recording bot associated with this meeting. */}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Generating Button for Summary, Action Items, Key Topics, and Takeaways */}
                <div className="flex justify-end">
                  {meeting?.transcript && (!meeting?.actionItems || !Array.isArray(meeting?.actionItems) || meeting?.actionItems.length === 0) && (
                    <Button
                      onClick={() => generateInsightsMutation.mutate()}
                      disabled={generateInsightsMutation.isPending}
                      size="sm"
                      variant="outline"
                      className="relative right-0"
                    >
                      Generate Meeting Insights
                    </Button>
                  )}
                </div>


                {/* Meeting Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-green-500 rounded"></div>
                        <span>Meeting Summary</span>
                        {generateInsightsMutation.isPending && (
                          <RefreshCw className="h-4 w-4 animate-spin text-green-500" />
                        )}
                      </div>
                      
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {generateInsightsMutation.isPending ? (
                      <div className="flex items-center space-x-2">
                        <RefreshCw className="h-4 w-4 animate-spin text-green-500" />
                        <p className="text-gray-600">Generating AI-powered summary...</p>
                      </div>
                    ) : (
                      <p className="text-gray-700">{meeting?.summary || 'Summary will be generated automatically once transcript is available.'}</p>
                    )}
                  </CardContent>
                </Card>

                {/* Action Points */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-blue-500 rounded"></div>
                        <span>Action Points</span>
                        {generateInsightsMutation.isPending && (
                          <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
                        )}
                      </div>

                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {generateInsightsMutation.isPending ? (
                      <div className="flex items-center space-x-2">
                        <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
                        <p className="text-gray-600">Generating action items...</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        {Array.isArray(meeting?.actionItems) && meeting.actionItems.length > 0 ? (
                          <table className="w-full">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-2">#</th>
                                <th className="text-left py-2">ACTION ITEM</th>
                                <th className="text-left py-2">OWNER</th>
                                <th className="text-left py-2">ACTION</th>
                              </tr>
                            </thead>
                            <tbody>
                              {meeting.actionItems.map((point: any, idx: number) => (
                                <tr key={idx} className="border-b">
                                  <td className="py-3">{idx + 1}</td>
                                  <td className="py-3 text-sm">{point}</td>
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
                        ) : (
                          <p className="text-gray-500 text-center py-4">
                            {meeting?.transcript ? 'No Action items for this transcript' : 'Action items will be available once transcript is processed.'}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Topics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                        <span>Key Topics</span>
                        {generateInsightsMutation.isPending && (
                          <RefreshCw className="h-4 w-4 animate-spin text-yellow-500" />
                        )}
                      </div>
                      
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {generateInsightsMutation.isPending ? (
                      <div className="flex items-center space-x-2">
                        <RefreshCw className="h-4 w-4 animate-spin text-yellow-500" />
                        <p className="text-gray-600">Identifying key topics...</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        {Array.isArray(meeting?.keyTopics) && meeting.keyTopics.length > 0 ? (
                          <table className="w-full">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-2">#</th>
                                <th className="text-left py-2">TOPIC</th>
                                <th className="text-left py-2">ACTION</th>
                              </tr>
                            </thead>
                            <tbody>
                              {meeting.keyTopics.map((topic: any, idx: number) => (
                                <tr key={idx} className="border-b">
                                  <td className="py-3">{idx + 1}</td>
                                  <td className="py-3 text-sm">{topic}</td>
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
                        ) : (
                          <p className="text-gray-500 text-center py-4">
                            {meeting?.transcript ? 'Key topics will be generated automatically.' : 'Key topics will be available once transcript is processed.'}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Key Takeaways */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-green-500 rounded"></div>
                        <span>Key Takeaways</span>
                        {generateInsightsMutation.isPending && (
                          <RefreshCw className="h-4 w-4 animate-spin text-green-500" />
                        )}
                      </div>
                      
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {generateInsightsMutation.isPending ? (
                      <div className="flex items-center space-x-2">
                        <RefreshCw className="h-4 w-4 animate-spin text-green-500" />
                        <p className="text-gray-600">Extracting key takeaways...</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        {Array.isArray(meeting?.takeaways) && meeting.takeaways.length > 0 ? (
                          <table className="w-full">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-2">#</th>
                                <th className="text-left py-2">TAKEAWAY</th>
                                <th className="text-left py-2">ACTION</th>
                              </tr>
                            </thead>
                            <tbody>
                              {meeting.takeaways.map((text: any, idx: number) => (
                                <tr key={idx} className="border-b">
                                  <td className="py-3">{idx + 1}</td>
                                  <td className="py-3 text-sm">{text}</td>
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
                        ) : (
                          <p className="text-gray-500 text-center py-4">
                            {meeting?.transcript ? 'Key takeaways will be generated automatically.' : 'Key takeaways will be available once transcript is processed.'}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Sidebar */}
              <div className="space-y-8">
                {/* Participants - dynamic when available */}
                <Card className="mt-16">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Participants</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-600">Participants data not available.</div>
                  </CardContent>
                </Card>

                {/* Ask Section
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
                </Card> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
