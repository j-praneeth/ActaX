import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Header } from "@/components/header";
import { MainSidebar } from "@/components/main-sidebar";
import { MeetingCard } from "@/components/meeting-card";
import { MeetingModal } from "@/components/meeting-modal";
import { AudioRecorder } from "@/components/meeting/AudioRecorder";
import { PlusMenu } from "@/components/plus-menu";
import { UploadAudio } from "@/components/upload-audio";
import { MeetingsTable } from "@/components/meetings-table";
import { MeetingCreationModal } from "@/components/meeting-creation-modal";
import { MeetingDetailsCard } from "@/components/meeting-details-card";
import { IntegrationsPanel } from "@/components/integrations-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { Plus, Search } from "lucide-react";
import type { Meeting } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export default function Dashboard() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);

  const { data: meetings = [], isLoading, refetch } = useQuery<Meeting[]>({
    queryKey: ["/api/meetings"],
    enabled: !!user,
  });

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

  const handleEditMeeting = (meeting: any) => {
    console.log("Edit meeting:", meeting);
    // Handle edit meeting logic here
  };

  const handleDeleteMeeting = async (meetingId: string) => {
    // Optional: Implement DELETE route when available
    console.log("Delete meeting:", meetingId);
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

  const filteredMeetings = meetings.filter(meeting =>
    meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    meeting.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const completedMeetings = filteredMeetings.filter(m => m.status === "completed");
  const scheduledMeetings = filteredMeetings.filter(m => m.status === "scheduled");
  const inProgressMeetings = filteredMeetings.filter(m => m.status === "in_progress");

  // Removed static recent activities and upcoming meetings

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
                      meeting={selectedMeeting} 
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
                      <div className="text-2xl font-bold">{meetings.length}</div>
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
