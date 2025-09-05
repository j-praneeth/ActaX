import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  Clock, 
  Users, 
  Video, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  RefreshCw,
  MessageSquare,
  Target,
  Lightbulb,
  TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { safeFetch } from '@/lib/safe-fetch';
import { authService } from '@/lib/auth';
import { JiraSyncModal } from './jira-sync-modal';

interface MeetingDetailsCardProps {
  meeting: {
    id: string;
    title: string;
    description?: string;
    status: string;
    platform?: string;
    startTime?: string;
    endTime?: string;
    meetingUrl?: string;
    transcript?: string;
    summary?: string;
    actionItems?: string[];
    keyTopics?: string[];
    decisions?: string[];
    takeaways?: string[];
    sentiment?: string;
  };
  onSync?: (provider: string) => void;
}

export function MeetingDetailsCard({ meeting, onSync }: MeetingDetailsCardProps) {
  const [syncing, setSyncing] = useState<string | null>(null);
  const [isJiraSyncModalOpen, setIsJiraSyncModalOpen] = useState(false);
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      case 'neutral': return 'text-gray-600';
      default: return 'text-gray-400';
    }
  };

  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return <TrendingUp className="w-4 h-4" />;
      case 'negative': return <AlertCircle className="w-4 h-4" />;
      case 'neutral': return <MessageSquare className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const handleSync = async (provider: string) => {
    if (provider === 'jira') {
      setIsJiraSyncModalOpen(true);
      return;
    }

    setSyncing(provider);
    try {
      const sessionToken = await authService.getCurrentSessionToken();
      if (!sessionToken) {
        throw new Error('User not authenticated. Please sign in again.');
      }

      const response = await safeFetch(`/api/meetings/${meeting.id}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ provider }),
      });

      if (!response.ok || response.error) {
        throw new Error(response.error || `Failed to sync to ${provider}`);
      }

      toast({
        title: "Success",
        description: `Meeting synced to ${provider} successfully`,
      });

      onSync?.(provider);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to sync to ${provider}`,
        variant: "destructive",
      });
    } finally {
      setSyncing(null);
    }
  };

  const formatDuration = () => {
    if (!meeting.startTime || !meeting.endTime) return 'Unknown';
    const start = new Date(meeting.startTime);
    const end = new Date(meeting.endTime);
    const minutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
    return `${minutes} minutes`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">{meeting.title}</CardTitle>
            <CardDescription>{meeting.description}</CardDescription>
          </div>
          <Badge className={getStatusColor(meeting.status)}>
            {meeting.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Meeting Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm">
              {meeting.startTime ? format(new Date(meeting.startTime), 'MMM dd, yyyy') : 'TBD'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm">
              {meeting.startTime ? format(new Date(meeting.startTime), 'h:mm a') : 'TBD'} - {formatDuration()}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Video className="w-4 h-4 text-gray-500" />
            <span className="text-sm capitalize">
              {meeting.platform?.replace('_', ' ') || 'Unknown'}
            </span>
          </div>
        </div>

        {meeting.meetingUrl && (
          <div className="flex items-center space-x-2">
            <ExternalLink className="w-4 h-4 text-gray-500" />
            <a 
              href={meeting.meetingUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm"
            >
              Join Meeting
            </a>
          </div>
        )}

        <Separator />

        {/* Meeting Insights */}
        {meeting.status === 'completed' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Meeting Insights</h3>
            
            {/* Sentiment */}
            {meeting.sentiment && (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Sentiment:</span>
                <div className={`flex items-center space-x-1 ${getSentimentColor(meeting.sentiment)}`}>
                  {getSentimentIcon(meeting.sentiment)}
                  <span className="text-sm capitalize">{meeting.sentiment}</span>
                </div>
              </div>
            )}

            {/* Summary */}
            {meeting.summary && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">Summary</span>
                </div>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                  {meeting.summary}
                </p>
              </div>
            )}

            {/* Action Items */}
            {meeting.actionItems && meeting.actionItems.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">Action Items</span>
                </div>
                <ul className="space-y-1">
                  {meeting.actionItems.map((item, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Key Topics */}
            {meeting.keyTopics && meeting.keyTopics.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">Key Topics</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {meeting.keyTopics.map((topic, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Decisions */}
            {meeting.decisions && meeting.decisions.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Lightbulb className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">Decisions</span>
                </div>
                <ul className="space-y-1">
                  {meeting.decisions.map((decision, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>{decision}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Takeaways */}
            {meeting.takeaways && meeting.takeaways.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">Key Takeaways</span>
                </div>
                <ul className="space-y-1">
                  {meeting.takeaways.map((takeaway, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                      <span className="text-purple-500 mt-1">→</span>
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Separator />

            {/* Integration Sync */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Sync to Integrations</h4>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSync('jira')}
                  disabled={syncing === 'jira'}
                  className="flex items-center space-x-2"
                >
                  <Target className="w-3 h-3" />
                  <span>Sync to Jira</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSync('slack')}
                  disabled={syncing === 'slack'}
                  className="flex items-center space-x-2"
                >
                                      <RefreshCw className={`w-3 h-3 ${syncing === 'slack' ? 'animate-spin' : ''}`} />
                  <span>{syncing === 'slack' ? 'Syncing...' : 'Share to Slack'}</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSync('notion')}
                  disabled={syncing === 'notion'}
                  className="flex items-center space-x-2"
                >
                                      <RefreshCw className={`w-3 h-3 ${syncing === 'notion' ? 'animate-spin' : ''}`} />
                  <span>{syncing === 'notion' ? 'Syncing...' : 'Save to Notion'}</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Transcript */}
        {meeting.transcript && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">Transcript</span>
            </div>
            <div className="max-h-40 overflow-y-auto">
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                {meeting.transcript}
              </p>
            </div>
          </div>
        )}
      </CardContent>

      {/* Jira Sync Modal */}
      <JiraSyncModal
        isOpen={isJiraSyncModalOpen}
        onClose={() => setIsJiraSyncModalOpen(false)}
        meeting={meeting}
        onSyncComplete={() => {
          setIsJiraSyncModalOpen(false);
          onSync?.('jira');
        }}
      />
    </Card>
  );
}

