import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Target, 
  FileText,
  Settings,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { safeFetch } from '@/lib/safe-fetch';
import { authService } from '@/lib/auth';

interface JiraProject {
  id: string;
  key: string;
  name: string;
  projectTypeKey: string;
}

interface JiraBoard {
  id: number;
  name: string;
  type: string;
  location: {
    projectId: string;
    projectKey: string;
    projectName: string;
  };
}

interface JiraIssue {
  id: string;
  key: string;
  fields: {
    summary: string;
    status: {
      name: string;
    };
    issuetype: {
      name: string;
    };
  };
}

interface JiraIssueType {
  id: string;
  name: string;
  subtask: boolean;
}

interface JiraPriority {
  id: string;
  name: string;
}

interface JiraSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: {
    id: string;
    title: string;
    summary?: string;
    actionItems?: string[];
    keyTopics?: string[];
    decisions?: string[];
    takeaways?: string[];
  };
  onSyncComplete?: () => void;
}

export function JiraSyncModal({ isOpen, onClose, meeting, onSyncComplete }: JiraSyncModalProps) {
  const [step, setStep] = useState<'select-project' | 'configure-sync' | 'syncing' | 'complete'>('select-project');
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<JiraProject[]>([]);
  const [issueTypes, setIssueTypes] = useState<JiraIssueType[]>([]);
  const [priorities, setPriorities] = useState<JiraPriority[]>([]);
  
  const [selectedProject, setSelectedProject] = useState<JiraProject | null>(null);
  
  // Sync configuration
  const [syncOptions, setSyncOptions] = useState({
    createSummaryIssue: true,
    createActionItemIssues: true,
    summaryIssueType: 'Story',
    actionItemIssueType: 'Task',
    priority: 'Medium'
  });

  const [syncResult, setSyncResult] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchProjects();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedProject) {
      fetchIssueTypes(selectedProject.key);
    }
  }, [selectedProject]);

  useEffect(() => {
    fetchPriorities();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const sessionToken = await authService.getCurrentSessionToken();
      if (!sessionToken) {
        throw new Error('User not authenticated');
      }

      const response = await safeFetch<JiraProject[]>('/api/integrations/jira/projects', {
        headers: { 'Authorization': `Bearer ${sessionToken}` },
      });

      if (!response.ok || response.error || !response.data) {
        throw new Error(response.error || 'Failed to fetch projects');
      }

      setProjects(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch Jira projects",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };



  const fetchIssueTypes = async (projectKey: string) => {
    try {
      const sessionToken = await authService.getCurrentSessionToken();
      if (!sessionToken) {
        throw new Error('User not authenticated');
      }

      const response = await safeFetch<JiraIssueType[]>(`/api/integrations/jira/projects/${projectKey}/issue-types`, {
        headers: { 'Authorization': `Bearer ${sessionToken}` },
      });

      if (!response.ok || response.error || !response.data) {
        throw new Error(response.error || 'Failed to fetch issue types');
      }

      setIssueTypes(response.data);
    } catch (error) {
      console.error('Failed to fetch issue types:', error);
    }
  };

  const fetchPriorities = async () => {
    try {
      const sessionToken = await authService.getCurrentSessionToken();
      if (!sessionToken) {
        throw new Error('User not authenticated');
      }

      const response = await safeFetch<JiraPriority[]>('/api/integrations/jira/priorities', {
        headers: { 'Authorization': `Bearer ${sessionToken}` },
      });

      if (!response.ok || response.error || !response.data) {
        throw new Error(response.error || 'Failed to fetch priorities');
      }

      setPriorities(response.data);
    } catch (error) {
      console.error('Failed to fetch priorities:', error);
    }
  };

  const handleSync = async () => {
    if (!selectedProject) return;
    
    setStep('syncing');
    try {
      const sessionToken = await authService.getCurrentSessionToken();
      if (!sessionToken) {
        throw new Error('User not authenticated');
      }

      const response = await safeFetch(`/api/meetings/${meeting.id}/sync/jira`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          projectKey: selectedProject.key,
          options: syncOptions
        }),
      });

      if (!response.ok || response.error) {
        throw new Error(response.error || 'Failed to sync to Jira');
      }

      setSyncResult(response.data);
      setStep('complete');
      
      toast({
        title: "Success",
        description: "Meeting synced to Jira successfully",
      });

      onSyncComplete?.();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to sync to Jira",
        variant: "destructive",
      });
      setStep('configure-sync');
    }
  };

  const handleClose = () => {
    setStep('select-project');
    setSelectedProject(null);
    setSyncResult(null);
    onClose();
  };

  const renderProjectSelection = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="project-select">Select Jira Project</Label>
        <Select onValueChange={(value) => {
          const project = projects.find(p => p.key === value);
          setSelectedProject(project || null);
        }}>
          <SelectTrigger id="project-select" className="mt-2">
            <SelectValue placeholder="Choose a project..." />
          </SelectTrigger>
          <SelectContent>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.key}>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{project.name}</span>
                  <Badge variant="outline" className="text-xs">{project.key}</Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedProject && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Selected Project</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{selectedProject.name}</p>
                <p className="text-sm text-gray-600">{selectedProject.key} • {selectedProject.projectTypeKey}</p>
              </div>
              <Button
                onClick={() => setStep('configure-sync')}
                disabled={loading}
              >
                Next: Configure Sync
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );



  const renderSyncConfiguration = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Configure Sync</h3>
          <p className="text-sm text-gray-600">
            {selectedProject?.name}
          </p>
        </div>
        <Button variant="outline" onClick={() => setStep('select-project')}>
          Back
        </Button>
      </div>

      {/* Meeting Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Meeting to Sync</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="font-medium">{meeting.title}</p>
            {meeting.summary && (
              <p className="text-sm text-gray-600 mt-1">{meeting.summary}</p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Action Items:</span>
              <span className="ml-2 text-gray-600">
                {meeting.actionItems?.length || 0}
              </span>
            </div>
            <div>
              <span className="font-medium">Key Topics:</span>
              <span className="ml-2 text-gray-600">
                {meeting.keyTopics?.length || 0}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sync Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Sync Options</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="create-summary"
              checked={syncOptions.createSummaryIssue}
              onCheckedChange={(checked) => 
                setSyncOptions(prev => ({ ...prev, createSummaryIssue: !!checked }))
              }
            />
            <Label htmlFor="create-summary">Create summary issue</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="create-action-items"
              checked={syncOptions.createActionItemIssues}
              onCheckedChange={(checked) => 
                setSyncOptions(prev => ({ ...prev, createActionItemIssues: !!checked }))
              }
            />
            <Label htmlFor="create-action-items">
              Create individual issues for action items ({meeting.actionItems?.length || 0})
            </Label>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="summary-issue-type">Summary Issue Type</Label>
              <Select 
                value={syncOptions.summaryIssueType} 
                onValueChange={(value) => 
                  setSyncOptions(prev => ({ ...prev, summaryIssueType: value }))
                }
              >
                <SelectTrigger id="summary-issue-type" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {issueTypes.filter(type => !type.subtask).map((type) => (
                    <SelectItem key={type.id} value={type.name}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="action-issue-type">Action Item Issue Type</Label>
              <Select 
                value={syncOptions.actionItemIssueType} 
                onValueChange={(value) => 
                  setSyncOptions(prev => ({ ...prev, actionItemIssueType: value }))
                }
              >
                <SelectTrigger id="action-issue-type" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {issueTypes.filter(type => !type.subtask).map((type) => (
                    <SelectItem key={type.id} value={type.name}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select 
              value={syncOptions.priority} 
              onValueChange={(value) => 
                setSyncOptions(prev => ({ ...prev, priority: value }))
              }
            >
              <SelectTrigger id="priority" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {priorities.map((priority) => (
                  <SelectItem key={priority.id} value={priority.name}>
                    {priority.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSync} className="px-6">
          Sync to Jira
        </Button>
      </div>
    </div>
  );

  const renderSyncing = () => (
    <div className="text-center py-8">
      <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
      <h3 className="text-lg font-semibold mb-2">Syncing to Jira...</h3>
      <p className="text-gray-600">This may take a few moments</p>
    </div>
  );

  const renderComplete = () => (
    <div className="text-center py-8 space-y-4">
      <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
      <h3 className="text-lg font-semibold">Sync Complete!</h3>
      <p className="text-gray-600">Your meeting has been successfully synced to Jira</p>
      
      {syncResult?.result && (
        <Card className="text-left">
          <CardHeader>
            <CardTitle className="text-sm">Created Issues</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {syncResult.result.summaryIssue && (
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm font-medium">Summary Issue</span>
                <a 
                  href={`https://${selectedProject?.key.toLowerCase()}.atlassian.net/browse/${syncResult.result.summaryIssue.key}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-blue-600 hover:underline text-sm"
                >
                  <span>{syncResult.result.summaryIssue.key}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
            {syncResult.result.actionItemIssues?.map((issue: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm">Action Item {index + 1}</span>
                <a 
                  href={`https://${selectedProject?.key.toLowerCase()}.atlassian.net/browse/${issue.key}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-blue-600 hover:underline text-sm"
                >
                  <span>{issue.key}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      
      <Button onClick={handleClose} className="mt-4">
        Done
      </Button>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5" />
            <span>Sync to Jira</span>
          </DialogTitle>
          <DialogDescription>
            Sync your meeting data to Jira issues and action items
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {loading && step === 'select-project' ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <>
              {step === 'select-project' && renderProjectSelection()}
              {step === 'configure-sync' && renderSyncConfiguration()}
              {step === 'syncing' && renderSyncing()}
              {step === 'complete' && renderComplete()}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 