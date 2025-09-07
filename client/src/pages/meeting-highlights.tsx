import { Header } from "@/components/header";
import { MeetingSidebar } from "@/components/meeting-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EditableTableList } from "@/components/ui/editable-list";
import { Edit, Trash2, Send, Download, RefreshCw, ArrowLeft, Bot, User, Monitor } from "lucide-react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import type { Meeting } from "@shared/schema";
import { authService } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";


interface QuestionAnswer {
  id: string;
  question: string;
  answer: string;
  timestamp: Date;
}

interface Participant {
  id: number;
  name: string;
  is_host: boolean;
  platform: string;
  extra_data?: {
    zoom?: {
      conf_user_id: string;
      user_guid: string;
      guest: boolean;
      os: number;
    };
    google_meet?: {
      name: string;
    };
    microsoft_teams?: {
      name: string;
    };
  };
}

export default function MeetingHighlights() {
  const params = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [isLoadingTranscript, setIsLoadingTranscript] = useState(false);
  const [question, setQuestion] = useState("");
  const [qaHistory, setQaHistory] = useState<QuestionAnswer[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(false);
  const { toast } = useToast();

  const { data: meeting, isLoading } = useQuery<Meeting | null>({
    queryKey: ["/api/meetings", params.id],
    enabled: !!params?.id,
  });

  // Extract participants from transcript
  const extractParticipantsFromTranscript = (transcript: any): Participant[] => {
    const participants: Participant[] = [];

    if (typeof transcript === 'string') {
      // Parse transcript string to extract speaker names
      // Look for patterns like "Speaker Name: text" or "Name: text"
      const lines = transcript.split('\n');
      const speakerSet = new Set<string>();

      lines.forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine && trimmedLine.includes(':')) {
          const colonIndex = trimmedLine.indexOf(':');
          const potentialSpeaker = trimmedLine.substring(0, colonIndex).trim();

          // Filter out common non-speaker patterns
          if (potentialSpeaker &&
            !potentialSpeaker.toLowerCase().includes('speaker') &&
            !potentialSpeaker.match(/^\d+$/) && // not just numbers
            potentialSpeaker.length > 1 &&
            potentialSpeaker.length < 50) {
            speakerSet.add(potentialSpeaker);
          }
        }
      });

      // Convert to participants array
      Array.from(speakerSet).forEach((name, index) => {
        participants.push({
          id: index + 1,
          name: name,
          is_host: false,
          platform: 'unknown',
        });
      });
    } else if (Array.isArray(transcript)) {
      // Handle array format (if transcript is structured data)
      const speakerSet = new Set<string>();

      transcript.forEach((item: any) => {
        if (item.participant && item.participant.name) {
          speakerSet.add(item.participant.name);
        } else if (item.speaker) {
          speakerSet.add(item.speaker);
        } else if (item.name) {
          speakerSet.add(item.name);
        }
      });

      Array.from(speakerSet).forEach((name, index) => {
        participants.push({
          id: index + 1,
          name: name,
          is_host: false,
          platform: 'unknown',
        });
      });
    }

    return participants;
  };

  // Fetch participants from API
  const fetchParticipants = async () => {
    if (!meeting?.recallBotId) return;

    setIsLoadingParticipants(true);
    try {
      const sessionToken = await authService.getCurrentSessionToken();
      if (!sessionToken) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`/api/meetings/${params.id}/participants`, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch participants: ${response.status}`);
      }

      const data = await response.json();
      setParticipants(data.participants || []);
    } catch (error) {
      console.error('Failed to fetch participants:', error);
      toast({
        title: "Error",
        description: "Failed to fetch participants. Falling back to transcript parsing.",
        variant: "destructive",
      });

      // Fallback to transcript parsing
      if (meeting?.transcript) {
        setParticipants(extractParticipantsFromTranscript(meeting.transcript));
      }
    } finally {
      setIsLoadingParticipants(false);
    }
  };

  // Fetch participants when meeting data is available
  useEffect(() => {
    if (meeting?.recallBotId) {
      fetchParticipants();
    } else if (meeting?.transcript) {
      // Fallback to transcript parsing if no bot ID
      setParticipants(extractParticipantsFromTranscript(meeting.transcript));
    }
  }, [meeting?.recallBotId, meeting?.transcript]);

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

  const askQuestionMutation = useMutation({
    mutationFn: async (questionText: string) => {
      const sessionToken = await authService.getCurrentSessionToken();

      if (!sessionToken) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`/api/meetings/${params.id}/ask-question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ question: questionText }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get answer');
      }

      return response.json();
    },
    onSuccess: (data) => {
      const newQA: QuestionAnswer = {
        id: Date.now().toString(),
        question: question,
        answer: data.answer,
        timestamp: new Date(),
      };
      setQaHistory(prev => [...prev, newQA]);
      setQuestion("");
      // toast({
      //   title: "Answer Generated",
      //   description: "AI has provided an answer to your question!",
      // });
    },
    onError: (error) => {
      console.error('Failed to get answer:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get answer",
      });
    }
  });

  // Mutation for updating action items
  const updateActionItemsMutation = useMutation({
    mutationFn: async (actionItems: string[]) => {
      const sessionToken = await authService.getCurrentSessionToken();

      if (!sessionToken) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`/api/meetings/${params.id}/action-items`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ actionItems }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update action items');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meetings", params.id] });
      toast({
        title: "Action Items Updated",
        description: "Action items have been updated successfully!",
      });
    },
    onError: (error) => {
      console.error('Failed to update action items:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update action items",
      });
    }
  });

  // Mutation for updating key topics
  const updateKeyTopicsMutation = useMutation({
    mutationFn: async (keyTopics: string[]) => {
      const sessionToken = await authService.getCurrentSessionToken();

      if (!sessionToken) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`/api/meetings/${params.id}/key-topics`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ keyTopics }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update key topics');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meetings", params.id] });
      toast({
        title: "Key Topics Updated",
        description: "Key topics have been updated successfully!",
      });
    },
    onError: (error) => {
      console.error('Failed to update key topics:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update key topics",
      });
    }
  });

  // Mutation for updating takeaways
  const updateTakeawaysMutation = useMutation({
    mutationFn: async (takeaways: string[]) => {
      const sessionToken = await authService.getCurrentSessionToken();

      if (!sessionToken) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`/api/meetings/${params.id}/takeaways`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ takeaways }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update takeaways');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meetings", params.id] });
      toast({
        title: "Takeaways Updated",
        description: "Key takeaways have been updated successfully!",
      });
    },
    onError: (error) => {
      console.error('Failed to update takeaways:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update takeaways",
      });
    }
  });

  const handleFetchTranscript = () => {
    setIsLoadingTranscript(true);
    fetchTranscriptMutation.mutate();
  };

  const handleAskQuestion = () => {
    if (!question.trim()) return;
    if (!meeting?.transcript) {
      toast({
        variant: "destructive",
        title: "No Transcript Available",
        description: "Please wait for the transcript to be processed before asking questions.",
      });
      return;
    }
    askQuestionMutation.mutate(question);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAskQuestion();
    }
  };

  // Helper functions to convert between data formats
  const convertToStringArray = (data: any): string[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    return [];
  };

  const convertToEditableItems = (data: any) => {
    return convertToStringArray(data).map((item, index) => ({
      id: `item-${index}`,
      text: item,
    }));
  };

  const convertFromEditableItems = (items: any[]) => {
    return items.map(item => item.text);
  };

  // Handlers for updating sections
  const handleActionItemsUpdate = (items: any[]) => {
    const actionItems = convertFromEditableItems(items);
    updateActionItemsMutation.mutate(actionItems);
  };

  const handleKeyTopicsUpdate = (items: any[]) => {
    const keyTopics = convertFromEditableItems(items);
    updateKeyTopicsMutation.mutate(keyTopics);
  };

  const handleTakeawaysUpdate = (items: any[]) => {
    const takeaways = convertFromEditableItems(items);
    updateTakeawaysMutation.mutate(takeaways);
  };

  const getPlatform = (participant: Participant) => {
    if (participant.extra_data?.zoom) {
      return "zoom";
    }
    if (participant.extra_data?.google_meet) {
      return "google_meet";
    }
    if (participant.extra_data?.microsoft_teams) {
      return "microsoft_teams";
    }
    return "unknown";
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
                          <EditableTableList
                            items={convertToEditableItems(meeting.actionItems)}
                            onUpdate={handleActionItemsUpdate}
                            placeholder="Enter action item..."
                            disabled={updateActionItemsMutation.isPending}
                            itemType="action item"
                            columns={[
                              { label: "#", key: "index", width: "w-12" },
                              { label: "ACTION ITEM", key: "text", width: "flex-1" },
                              { label: "ACTION", key: "action", width: "w-24" },
                            ]}
                          />
                        ) : (
                          <div className="text-center py-4">
                            <p className="text-gray-500 mb-4">
                              {meeting?.transcript ? 'No Action items for this transcript' : 'Action items will be available once transcript is processed.'}
                            </p>
                            {meeting?.transcript && (
                              <EditableTableList
                                items={[]}
                                onUpdate={handleActionItemsUpdate}
                                placeholder="Enter action item..."
                                disabled={updateActionItemsMutation.isPending}
                                itemType="action item"
                                columns={[
                                  { label: "#", key: "index", width: "w-12" },
                                  { label: "ACTION ITEM", key: "text", width: "flex-1" },
                                  { label: "ACTION", key: "action", width: "w-24" },
                                ]}
                              />
                            )}
                          </div>
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
                          <EditableTableList
                            items={convertToEditableItems(meeting.keyTopics)}
                            onUpdate={handleKeyTopicsUpdate}
                            placeholder="Enter key topic..."
                            disabled={updateKeyTopicsMutation.isPending}
                            itemType="key topic"
                            columns={[
                              { label: "#", key: "index", width: "w-12" },
                              { label: "TOPIC", key: "text", width: "flex-1" },
                              { label: "ACTION", key: "action", width: "w-24" },
                            ]}
                          />
                        ) : (
                          <div className="text-center py-4">
                            <p className="text-gray-500 mb-4">
                              {meeting?.transcript ? 'Key topics will be generated automatically.' : 'Key topics will be available once transcript is processed.'}
                            </p>
                            {meeting?.transcript && (
                              <EditableTableList
                                items={[]}
                                onUpdate={handleKeyTopicsUpdate}
                                placeholder="Enter key topic..."
                                disabled={updateKeyTopicsMutation.isPending}
                                itemType="key topic"
                                columns={[
                                  { label: "#", key: "index", width: "w-12" },
                                  { label: "TOPIC", key: "text", width: "flex-1" },
                                  { label: "ACTION", key: "action", width: "w-24" },
                                ]}
                              />
                            )}
                          </div>
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
                          <EditableTableList
                            items={convertToEditableItems(meeting.takeaways)}
                            onUpdate={handleTakeawaysUpdate}
                            placeholder="Enter key takeaway..."
                            disabled={updateTakeawaysMutation.isPending}
                            itemType="takeaway"
                            columns={[
                              { label: "#", key: "index", width: "w-12" },
                              { label: "TAKEAWAY", key: "text", width: "flex-1" },
                              { label: "ACTION", key: "action", width: "w-24" },
                            ]}
                          />
                        ) : (
                          <div className="text-center py-4">
                            <p className="text-gray-500 mb-4">
                              {meeting?.transcript ? 'Key takeaways will be generated automatically.' : 'Key takeaways will be available once transcript is processed.'}
                            </p>
                            {meeting?.transcript && (
                              <EditableTableList
                                items={[]}
                                onUpdate={handleTakeawaysUpdate}
                                placeholder="Enter key takeaway..."
                                disabled={updateTakeawaysMutation.isPending}
                                itemType="takeaway"
                                columns={[
                                  { label: "#", key: "index", width: "w-12" },
                                  { label: "TAKEAWAY", key: "text", width: "flex-1" },
                                  { label: "ACTION", key: "action", width: "w-24" },
                                ]}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Sidebar */}
              <div className="space-y-8">
                {/* Participants */}
                <Card className="mt-16">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Participants ({participants.length})</span>
                      {/* <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchParticipants}
                        disabled={isLoadingParticipants || !meeting?.recallBotId}
                        className="flex items-center space-x-2"
                      >
                        <RefreshCw className={`h-4 w-4 ${isLoadingParticipants ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                      </Button> */}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingParticipants ? (
                      <div className="flex items-center justify-center py-8">
                        <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
                        <span className="ml-2 text-sm text-gray-600">Loading participants...</span>
                      </div>
                    ) : participants.length > 0 ? (
                      <div className="space-y-3">
                        {participants.map((participant) => (
                          <div key={participant.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium ${participant.is_host ? 'bg-blue-500' : 'bg-blue-500'
                              }`}>
                              {participant.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-900 truncate">
                                  {participant.name}
                                </span>
                                {participant.is_host && (
                                  <div className="flex items-center space-x-1 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                                    <User className="h-3 w-3" />
                                    <span className="font-medium">{participant.is_host ? 'Host' : 'Member'}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            {participant.extra_data && (
                              <div className="text-xs text-gray-400">
                                <div className="text-center flex flex-col items-center">
                                  <div className="w-6 h-6 rounded flex justify-center items-center">
                                    {/* <Monitor className="h-3 w-3 text-blue-600" /> */}
                                    
                                      {participant.extra_data.zoom ? <img src='../../public/icons8-zoom-48.png' alt="Zoom" className="h-6 w-6" /> : participant.extra_data.google_meet ? <img src='../../public/icons8-google-meet-48.png' alt="Google Meet" className="h-6 w-6" /> : participant.extra_data.microsoft_teams ? <img src="../../public/icons8-microsoft-teams-48.png" alt="Microsoft Teams" className="h-6 w-6" /> : <span>Unknown</span>}
                                    
                                  </div>
                                  <span className="mt-1 block">
                                    {participant.extra_data.zoom
                                      ? "Zoom"
                                      : participant.extra_data.google_meet
                                        ? "Google Meet"
                                        : participant.extra_data.microsoft_teams
                                          ? "Microsoft Teams"
                                          : "Unknown"}
                                  </span>
                                </div>
                              </div>
                            )}

                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <div className="text-sm text-gray-600">
                          {meeting?.recallBotId
                            ? 'No participants found. The meeting may still be in progress or participants data may not be available yet.'
                            : 'Participants will be available once the meeting is processed.'
                          }
                        </div>
                        {meeting?.recallBotId && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={fetchParticipants}
                            className="mt-3"
                          >
                            Try Again
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Ask Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Bot className="h-5 w-5 text-blue-500" />
                      <span>Ask AI Assistant</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[].map((question, index) => (
                        <div
                          key={index}
                          className="p-3 bg-gray-50 rounded-lg border cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => setQuestion(question)}
                        >
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
                          placeholder="Ask anything about this meeting..."
                          className="flex-1"
                          value={question}
                          onChange={(e) => setQuestion(e.target.value)}
                          onKeyPress={handleKeyPress}
                          disabled={askQuestionMutation.isPending || !meeting?.transcript}
                        />
                        <Button
                          size="sm"
                          onClick={handleAskQuestion}
                          disabled={askQuestionMutation.isPending || !question.trim() || !meeting?.transcript}
                        >
                          {askQuestionMutation.isPending ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Q&A History */}
                    {qaHistory.length > 0 && (
                      <div className="mt-6 space-y-4">
                        <h4 className="text-sm font-medium text-gray-700">Recent Questions & Answers</h4>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {qaHistory.map((qa) => (
                            <div key={qa.id} className="space-y-2">
                              <div className="flex items-start space-x-2">
                                <User className="h-4 w-4 text-gray-500 mt-1 flex-shrink-0" />
                                <div className="flex-1">
                                  <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded-lg">
                                    {qa.question}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-start space-x-2">
                                <Bot className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                                <div className="flex-1">
                                  <p className="text-sm text-gray-600 bg-blue-50 p-2 rounded-lg">
                                    {qa.answer}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
