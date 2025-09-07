import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X, CheckCircle, AlertCircle, Loader2, Bot, Video, Mic, Monitor, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { safeFetch } from "@/lib/safe-fetch";
import { authService } from "@/lib/auth";
import { useAuth } from "@/hooks/use-auth";

interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: { subject: string; url: string }) => void;
}

interface MeetingStatus {
  isActive: boolean;
  meetingId: string;
  canJoin: boolean;
  message: string;
}

interface BotAdmissionResult {
  success: boolean;
  botId?: string;
  message: string;
  requiresAdmission: boolean;
}

interface PlatformInfo {
  name: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

export function MeetingModal({ isOpen, onClose, onSubmit }: MeetingModalProps) {
  const [subject, setSubject] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'validating' | 'joining' | 'success' | 'error'>('form');
  const [meetingStatus, setMeetingStatus] = useState<MeetingStatus | null>(null);
  const [botResult, setBotResult] = useState<BotAdmissionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Platform detection and info
  const getPlatformInfo = (url: string): PlatformInfo | null => {
    if (url.includes('meet.google.com')) {
      return {
        name: 'Google Meet',
        icon: <Video className="w-5 h-5" />,
        color: 'text-blue-600',
        description: 'Google Meet meeting'
      };
    } else if (url.includes('zoom.us') || url.includes('zoom.com')) {
      return {
        name: 'Zoom',
        icon: <Monitor className="w-5 h-5" />,
        color: 'text-blue-500',
        description: 'Zoom meeting'
      };
    } else if (url.includes('teams.microsoft.com') || url.includes('teams.live.com')) {
      return {
        name: 'Microsoft Teams',
        icon: <Users className="w-5 h-5" />,
        color: 'text-purple-600',
        description: 'Microsoft Teams meeting'
      };
    }
    return null;
  };

  const platformInfo = getPlatformInfo(url);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject.trim() || !url.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Check if platform is supported
    if (!platformInfo) {
      toast({
        title: "Unsupported Platform",
        description: "Please use Google Meet, Zoom, or Microsoft Teams meeting URLs",
        variant: "destructive",
      });
      return;
    }

    // Check if user is authenticated
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to join meetings",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setStep('validating');
    setError(null);

    try {
      // Get current session token
      const sessionToken = await authService.getCurrentSessionToken();
      console.log('Session token retrieved:', sessionToken ? 'Token found' : 'No token');
      
      if (!sessionToken) {
        // Check if user is authenticated through auth context
        const { user } = useAuth();
        if (!user) {
          throw new Error('User not authenticated. Please sign in again.');
        } else {
          throw new Error('Authentication token not available. Please refresh the page and try again.');
        }
      }

      // Step 1: Validate meeting URL and check status
      const statusResponse = await safeFetch<MeetingStatus>('/api/meetings/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ url }),
      });

      if (!statusResponse.ok || statusResponse.error || !statusResponse.data) {
        throw new Error(statusResponse.error || 'Failed to validate meeting URL');
      }

      const statusData = statusResponse.data;
      setMeetingStatus(statusData);

      if (!statusData.isActive || !statusData.canJoin) {
        setStep('error');
        setError(statusData.message || 'Meeting is not active or cannot be joined');
        return;
      }

      // Step 2: Join meeting with bot
      setStep('joining');
      const botResponse = await safeFetch<BotAdmissionResult>('/api/meetings/join-bot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ 
          url, 
          subject,
          meetingId: statusData.meetingId 
        }),
      });

      if (!botResponse.ok || botResponse.error || !botResponse.data) {
        throw new Error(botResponse.error || 'Failed to join meeting with bot');
      }

      const botData = botResponse.data;
      setBotResult(botData);

      if (botData.success) {
        setStep('success');
        toast({
          title: "Success",
          description: "Bot has joined the meeting! Please admit the bot when prompted.",
        });
      } else {
        setStep('error');
        setError(botData.message);
      }

    } catch (error) {
      console.error('Meeting submission error:', error);
      setStep('error');
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to process meeting',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSubject("");
    setUrl("");
    setStep('form');
    setMeetingStatus(null);
    setBotResult(null);
    setError(null);
    onClose();
  };

  const handleRetry = () => {
    setStep('form');
    setError(null);
    setMeetingStatus(null);
    setBotResult(null);
  };

  if (!isOpen) return null;

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="subject" className="text-white">Subject</Label>
        <Input
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Enter your subject"
          className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
        />
      </div>
      
      <div>
        <Label htmlFor="url" className="text-white">
          Meeting URL <span className="text-red-500">*</span>
        </Label>
        <Input
          id="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://meet.google.com/... or https://zoom.us/j/... or https://teams.microsoft.com/l/..."
          className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
          required
        />
        {platformInfo && (
          <div className="mt-2 flex items-center gap-2 text-sm">
            <span className={platformInfo.color}>
              {platformInfo.icon}
            </span>
            <span className="text-gray-400">
              {platformInfo.description} detected
            </span>
          </div>
        )}
        {url && !platformInfo && (
          <div className="mt-2 flex items-center gap-2 text-sm text-red-400">
            <AlertCircle className="w-4 h-4" />
            <span>Unsupported platform. Please use Google Meet, Zoom, or Microsoft Teams.</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-2 text-gray-400 text-sm">
        <span>Supported Platforms:</span>
        <div className="flex space-x-2">
          <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
            <Video className="w-3 h-3 text-white" />
          </div>
          <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
            <Monitor className="w-3 h-3 text-white" />
          </div>
          <div className="w-6 h-6 bg-purple-600 rounded flex items-center justify-center">
            <Users className="w-3 h-3 text-white" />
          </div>
        </div>
      </div>
      
      <div className="flex space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleClose}
          className="flex-1 bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="flex-1 bg-white text-gray-800 hover:bg-gray-100"
        >
          {loading ? "Processing..." : "Submit"}
        </Button>
      </div>
    </form>
  );

  const renderValidating = () => (
    <div className="space-y-4 text-center">
      <div className="flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
      <div>
        <h3 className="text-white text-lg font-semibold">Validating Meeting</h3>
        <p className="text-gray-400 text-sm">Checking if the meeting is active and accessible...</p>
      </div>
    </div>
  );

  const renderJoining = () => (
    <div className="space-y-4 text-center">
      <div className="flex justify-center">
        <Bot className="h-8 w-8 text-green-500 animate-pulse" />
      </div>
      <div>
        <h3 className="text-white text-lg font-semibold">Joining Meeting</h3>
        <p className="text-gray-400 text-sm">Sending bot to join the meeting for recording...</p>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="space-y-4 text-center">
      <div className="flex justify-center">
        <CheckCircle className="h-12 w-12 text-green-500" />
      </div>
      <div>
        <h3 className="text-white text-lg font-semibold">Bot Joined Successfully!</h3>
        <p className="text-gray-400 text-sm mb-4">
          The recording bot has joined your meeting. Please admit the bot when prompted in Google Meet.
        </p>
        {botResult?.botId && (
          <div className="bg-gray-700 p-3 rounded text-left">
            <p className="text-white text-sm font-medium">Bot ID: {botResult.botId}</p>
            <p className="text-gray-400 text-xs">Use this ID to track recording status</p>
          </div>
        )}
      </div>
      <div className="flex space-x-3 pt-4">
        <Button
          variant="outline"
          onClick={handleClose}
          className="flex-1 bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
        >
          Close
        </Button>
        <Button
          onClick={() => window.open(url, '_blank')}
          className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
        >
          Open Meeting
        </Button>
      </div>
    </div>
  );

  const renderError = () => (
    <div className="space-y-4 text-center">
      <div className="flex justify-center">
        <AlertCircle className="h-12 w-12 text-red-500" />
      </div>
      <div>
        <h3 className="text-white text-lg font-semibold">Error</h3>
        <Alert className="bg-red-900/20 border-red-500/50">
          <AlertDescription className="text-red-200">
            {error || 'An unexpected error occurred'}
          </AlertDescription>
        </Alert>
      </div>
      <div className="flex space-x-3 pt-4">
        <Button
          variant="outline"
          onClick={handleRetry}
          className="flex-1 bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
        >
          Try Again
        </Button>
        <Button
          onClick={handleClose}
          className="flex-1 bg-red-600 text-white hover:bg-red-700"
        >
          Close
        </Button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white text-xl">+ Invite Weblink</CardTitle>
          <Button variant="ghost" size="sm" onClick={handleClose} className="text-white hover:bg-gray-700">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {step === 'form' && renderForm()}
          {step === 'validating' && renderValidating()}
          {step === 'joining' && renderJoining()}
          {step === 'success' && renderSuccess()}
          {step === 'error' && renderError()}
        </CardContent>
      </Card>
    </div>
  );
}
