import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Header } from "@/components/header";
import { MainSidebar } from "@/components/main-sidebar";
import { MeetingCard } from "@/components/meeting-card";
import { MeetingModal } from "@/components/meeting-modal";
import { PlusMenu } from "@/components/plus-menu";
import { UploadAudio } from "@/components/upload-audio";
import { MeetingsTable } from "@/components/meetings-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { Plus, Search, Calendar, Clock, Users, TrendingUp, Bell, CheckCircle, UserPlus, Key } from "lucide-react";
import type { Meeting } from "@shared/schema";

export default function Dashboard() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const { data: meetings = [], isLoading } = useQuery<Meeting[]>({
    queryKey: ["/api/meetings"],
    enabled: !!user,
  });

  // Mock data for meetings table
  const mockMeetings = [
    {
      id: 1,
      subject: "one",
      platform: "Google Meet",
      date: "2025-08-31",
      startTime: "4:24 PM"
    },
    {
      id: 2,
      subject: "hello",
      platform: "Google Meet", 
      date: "2025-08-30",
      startTime: "3:00 PM"
    }
  ];

  const handleMeetingSubmit = (data: { subject: string; url: string }) => {
    console.log("Meeting submitted:", data);
    // Handle meeting submission logic here
  };

  const handleFileUpload = (file: File) => {
    console.log("File uploaded:", file);
    // Handle file upload logic here
  };

  const handleEditMeeting = (meeting: any) => {
    console.log("Edit meeting:", meeting);
    // Handle edit meeting logic here
  };

  const handleDeleteMeeting = (meetingId: number) => {
    console.log("Delete meeting:", meetingId);
    // Handle delete meeting logic here
  };

  const handleInviteLiveMeeting = () => {
    setIsMeetingModalOpen(true);
  };

  const handleUploadAudio = () => {
    setIsUploadModalOpen(true);
  };

  const handleRecordAudio = () => {
    console.log("Record audio");
    // Handle record audio logic here
  };

  const filteredMeetings = meetings.filter(meeting =>
    meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    meeting.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const completedMeetings = filteredMeetings.filter(m => m.status === "completed");
  const scheduledMeetings = filteredMeetings.filter(m => m.status === "scheduled");
  const inProgressMeetings = filteredMeetings.filter(m => m.status === "in_progress");

  const stats = [
    {
      title: "Total Meetings",
      value: "128",
      icon: Calendar,
      color: "text-blue-600",
    },
    {
      title: "Upcoming This Week",
      value: "5",
      icon: Bell,
      color: "text-blue-600",
    },
    {
      title: "Avg. Participants",
      value: "8",
      icon: Users,
      color: "text-blue-600",
    },
  ];

  const upcomingMeetings = [
    {
      id: "1",
      title: "Q3 Planning Session",
      date: "October 26, 2024",
      time: "10:00 AM - 11:00 AM",
      platform: "Zoom Meeting",
      participants: 2,
    },
    {
      id: "2",
      title: "Client Review - Project Alpha",
      date: "October 27, 2024",
      time: "02:00 PM - 03:00 PM",
      platform: "Google Meet",
      participants: 2,
    },
    {
      id: "3",
      title: "Team Standup",
      date: "October 28, 2024",
      time: "09:30 AM - 10:00 AM",
      platform: "Microsoft Teams",
      participants: 3,
    },
    {
      id: "4",
      title: "Integration Sync - Jira",
      date: "October 28, 2024",
      time: "04:00 PM - 05:00 PM",
      platform: "Zoom Meeting",
      participants: 2,
    },
  ];

  const recentActivity = [
    {
      id: "1",
      message: "Alice Johnson updated 'Q3 Planning Session' meeting details.",
      icon: Bell,
      time: "2 hours ago",
    },
    {
      id: "2",
      message: "New agent 'Mark V.' joined the platform.",
      icon: UserPlus,
      time: "5 hours ago",
    },
    {
      id: "3",
      message: "Jira integration re-authenticated successfully.",
      icon: CheckCircle,
      time: "Yesterday",
    },
    {
      id: "4",
      message: "Charlie Brown accepted invitation for 'Client Review - Project Alpha'.",
      icon: Calendar,
      time: "2 days ago",
    },
  ];

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

            {/* Overview Stats */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => {
                  const IconComponent = stat.icon;
                  return (
                    <Card key={stat.title} className="bg-white">
                      <CardContent className="flex items-center p-6">
                        <div className="p-2 rounded-lg bg-blue-100 mr-4">
                          <IconComponent className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                          <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Upcoming Meetings */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Meetings</h2>
              <div className="space-y-4">
                {upcomingMeetings.map((meeting) => (
                  <Card key={meeting.id} className="bg-white">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{meeting.title}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>{meeting.date}</span>
                            <span>{meeting.time}</span>
                            <span>{meeting.platform}</span>
                            <div className="flex items-center space-x-1">
                              <Users className="h-4 w-4" />
                              <span>{meeting.participants}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                         <Link href={`/meeting/${meeting.id}/highlights`}> <Button variant="outline" size="sm">View Details</Button></Link>
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">Join</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {recentActivity.map((activity) => {
                  const IconComponent = activity.icon;
                  return (
                    <div key={activity.id} className="flex items-start space-x-3 p-4 bg-white rounded-lg border">
                      <div className="p-2 rounded-lg bg-gray-100">
                        <IconComponent className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* My Meetings Table */}
            <div className="mb-8">
              <MeetingsTable
                meetings={mockMeetings}
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
    </div>
  );
}
