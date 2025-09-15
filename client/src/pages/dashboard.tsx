import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { MainSidebar } from "@/components/main-sidebar";
import { MeetingModal } from "@/components/meeting-modal";
import { AudioRecorder } from "@/components/meeting/AudioRecorder";
import { PlusMenu } from "@/components/plus-menu";
import { UploadAudio } from "@/components/upload-audio";
import { MeetingsTable } from "@/components/meetings-table";
import { MeetingDetailsCard } from "@/components/meeting-details-card";
import { IntegrationsPanel } from "@/components/integrations-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import type { Meeting } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [searchQuery] = useState("");
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [updatedMeetings, setUpdatedMeetings] = useState<Meeting[]>([]);

  const { data: meetings = [], refetch } = useQuery<Meeting[]>({
    queryKey: ["/api/meetings"],
    enabled: !!user,
  });

  // Merge fetched meetings with locally updated meetings
  const mergedMeetings = meetings.map(meeting => {
    const updatedMeeting = updatedMeetings.find(updated => updated.id === meeting.id);
    return updatedMeeting || meeting;
  });

  // Note: We don't need to clear updatedMeetings manually
  // The mergedMeetings logic will automatically use fresh server data when available

  const handleMeetingSubmit = async (data: { subject: string; url: string }) => {
    await apiRequest("POST", "/api/meetings", {
      title: data.subject,
      meetingUrl: data.url,
      platform: "google_meet",
      status: "scheduled",
    });
    await refetch();
  };

  const handleFileUpload = (file: File) => {
    console.log("File uploaded:", file);
    // Handle file upload logic here
  };

  const handleEditMeeting = (updatedMeeting: Meeting) => {
    // Update the local state with the edited meeting
    setUpdatedMeetings(prev => {
      const existingIndex = prev.findIndex(m => m.id === updatedMeeting.id);
      if (existingIndex >= 0) {
        // Update existing meeting
        const newUpdated = [...prev];
        newUpdated[existingIndex] = updatedMeeting;
        return newUpdated;
      } else {
        // Add new updated meeting
        return [...prev, updatedMeeting];
      }
    });
  };

  const handleDeleteMeeting = async (meetingId: string) => {
    try {
      // Get the meeting to show confirmation
      const meeting = mergedMeetings.find(m => m.id === meetingId);
      if (!meeting) {
        toast({
          title: "Error",
          description: "Meeting not found",
          variant: "destructive",
        });
        return;
      }

      // Show confirmation dialog
      const confirmed = window.confirm(
        `Are you sure you want to delete the meeting "${meeting.title}"? This action cannot be undone.`
      );
      
      if (!confirmed) {
        return;
      }

      // Make DELETE request (apiRequest handles authentication automatically)
      await apiRequest("DELETE", `/api/meetings/${meetingId}`);

      // Show success message
      toast({
        title: "Success",
        description: "Meeting deleted successfully",
      });

      // Refresh the meetings list
      await refetch();
    } catch (error) {
      console.error('Failed to delete meeting:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete meeting",
        variant: "destructive",
      });
    }
  };

  const handleInviteLiveMeeting = () => {
    setIsMeetingModalOpen(true);
  };

  const handleUploadAudio = () => {
    setIsUploadModalOpen(true);
  };

  const [isRecorderOpen, setIsRecorderOpen] = useState(false);
  const handleRecordAudio = () => {
    setIsRecorderOpen(true);
  };

  const filteredMeetings = mergedMeetings.filter(meeting =>
    meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    meeting.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const completedMeetings = filteredMeetings.filter(m => m.status === "completed");
  const scheduledMeetings = filteredMeetings.filter(m => m.status === "scheduled");

  // Removed static recent activities and upcoming meetings

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <div>Please log in to access the dashboard.</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="flex">
        <MainSidebar currentPage="dashboard" />

        {/* Main Content */}
        <div className="flex-1 pt-16">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome, {user?.name || 'User'}</h1>
                  <p className="text-gray-600">Sunday, August 31, 2025</p>
                </div>
                <PlusMenu
                  onInviteLiveMeeting={handleInviteLiveMeeting}
                  onUploadAudio={handleUploadAudio}
                  onRecordAudio={handleRecordAudio}
                  
                 /> 
              </div>
            </div>

            

            {/* Main Content Tabs */}
            <Tabs defaultValue="meetings" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="meetings">Meetings</TabsTrigger>
                <TabsTrigger value="integrations">Integrations</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="meetings" className="space-y-6">
                
                {/* Meeting Details or Table */}
                {selectedMeeting ? (
                  <div className="space-y-4">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedMeeting(null)}
                      className="mb-4"
                    >
                      ← Back to Meetings
                    </Button>
                    <MeetingDetailsCard 
                      meeting={{
                        ...selectedMeeting,
                        description: selectedMeeting?.description ?? undefined
                      } as any} 
                      onSync={() => refetch()}
                    />
                  </div>
                ) : (
                  <MeetingsTable
                    meetings={filteredMeetings}
                    onEdit={handleEditMeeting}
                    onDelete={handleDeleteMeeting}
                    onView={(meeting) => setSelectedMeeting(meeting)}
                  />
                )}
              </TabsContent>

              <TabsContent value="integrations">
                <IntegrationsPanel onIntegrationAdded={() => refetch()} />
              </TabsContent>

              <TabsContent value="analytics">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Meetings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{mergedMeetings.length}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Completed</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{completedMeetings.length}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{scheduledMeetings.length}</div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Modals */}
      <MeetingModal
        isOpen={isMeetingModalOpen}
        onClose={() => setIsMeetingModalOpen(false)}
        onSubmit={handleMeetingSubmit}
      />
      
      <UploadAudio
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onFileUpload={handleFileUpload}
      />
      {/* Audio Recorder */}
      <AudioRecorder
        isOpen={isRecorderOpen}
        onClose={() => setIsRecorderOpen(false)}
        onSave={(blob) => {
          console.log("Recorded blob", blob);
        }}
      />
    </div>
  );
}
