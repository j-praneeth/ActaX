import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { MeetingCard } from "@/components/meeting-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { Plus, Search, Calendar, Clock, Users, TrendingUp } from "lucide-react";
import type { Meeting } from "@shared/schema";

export default function Dashboard() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: meetings = [], isLoading } = useQuery<Meeting[]>({
    queryKey: ["/api/meetings"],
    enabled: !!user,
  });

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
      value: meetings.length,
      icon: Calendar,
      color: "text-blue-600",
    },
    {
      title: "Completed",
      value: completedMeetings.length,
      icon: Clock,
      color: "text-green-600",
    },
    {
      title: "Scheduled",
      value: scheduledMeetings.length,
      icon: Users,
      color: "text-yellow-600",
    },
    {
      title: "In Progress",
      value: inProgressMeetings.length,
      icon: TrendingUp,
      color: "text-purple-600",
    },
  ];

  if (!user) {
    return <div>Please log in to access the dashboard.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900" data-testid="dashboard-title">
                Welcome back, {user.name}
              </h1>
              <p className="text-gray-600 mt-1" data-testid="dashboard-subtitle">
                Manage your meetings and AI insights
              </p>
            </div>
            <Button 
              className="bg-gradient-to-r from-purple-600 to-blue-600"
              data-testid="new-meeting-button"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Meeting
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <Card key={stat.title} data-testid={`stat-card-${index}`}>
                  <CardContent className="flex items-center p-6">
                    <div className={`p-2 rounded-lg ${stat.color.replace('text-', 'bg-').replace('-600', '-100')} mr-4`}>
                      <IconComponent className={`h-6 w-6 ${stat.color}`} />
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

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search meetings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="search-meetings-input"
              />
            </div>
          </div>

          {/* Meetings */}
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList data-testid="meetings-tabs">
              <TabsTrigger value="all">All Meetings</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
              <TabsTrigger value="in_progress">In Progress</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              {isLoading ? (
                <div className="text-center py-12" data-testid="loading-state">
                  <p className="text-gray-500">Loading meetings...</p>
                </div>
              ) : filteredMeetings.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2" data-testid="no-meetings-title">
                      No meetings found
                    </h3>
                    <p className="text-gray-600 mb-6" data-testid="no-meetings-description">
                      {searchQuery ? "Try adjusting your search query." : "Get started by scheduling your first meeting."}
                    </p>
                    <Button className="bg-gradient-to-r from-purple-600 to-blue-600" data-testid="create-first-meeting-button">
                      <Plus className="h-4 w-4 mr-2" />
                      Schedule Meeting
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredMeetings.map((meeting) => (
                    <MeetingCard
                      key={meeting.id}
                      meeting={meeting}
                      onClick={() => {
                        // Navigate to meeting details
                        console.log("Open meeting:", meeting.id);
                      }}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedMeetings.map((meeting) => (
                  <MeetingCard key={meeting.id} meeting={meeting} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="scheduled">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {scheduledMeetings.map((meeting) => (
                  <MeetingCard key={meeting.id} meeting={meeting} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="in_progress">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {inProgressMeetings.map((meeting) => (
                  <MeetingCard key={meeting.id} meeting={meeting} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
