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
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Good Afternoon, {user?.name || 'User'}</h1>
                  <p className="text-gray-600">Sunday, August 31, 2025</p>
                </div>
                <PlusMenu
                  onInviteLiveMeeting={handleInviteLiveMeeting}
                  onUploadAudio={handleUploadAudio}
                  onRecordAudio={handleRecordAudio}
                />
              </div>
            </div>

            

            {/* My Meetings Table */}
            <div className="mb-8">
              <MeetingsTable
                meetings={filteredMeetings}
                onEdit={handleEditMeeting}
                onDelete={handleDeleteMeeting}
              />
            </div>
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
