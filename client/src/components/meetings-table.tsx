import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Search, Eye, Plus, Pencil, Check, X } from "lucide-react";
import { Link } from "wouter";
import type { Meeting } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { ApiService } from "@/core/services/api.service";
import { authService } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface MeetingsTableProps {
  meetings: Meeting[];
  onEdit: (meeting: Meeting) => void;
  onDelete: (meetingId: string) => void;
  onView?: (meeting: Meeting) => void;
}

export function MeetingsTable({ meetings, onEdit, onDelete, onView }: MeetingsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const apiService = new ApiService();
  
  // Set token when user is available
  useEffect(() => {
    if (user) {
      authService.getCurrentSessionToken().then(token => {
        if (token) {
          apiService.setToken(token);
        }
      });
    }
  }, [user]);

  const filteredMeetings = useMemo(() => {
    return (meetings || []).filter((meeting) => {
      const title = meeting.title || "";
      return title.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [meetings, searchTerm]);

  const getPlatformIcon = (platform: string | null | undefined) => {
    if (!platform) return null;
    
    const platformLower = platform.toLowerCase();
    if (platformLower.includes('google') || platformLower.includes('meet')) {
      return '/icons8-google-meet-48.png';
    } else if (platformLower.includes('teams') || platformLower.includes('microsoft')) {
      return '/icons8-microsoft-teams-48.png';
    } else if (platformLower.includes('zoom')) {
      return '/icons8-zoom-48.png';
    }
    return null;
  };

  const handleEditTitle = (meeting: Meeting) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to edit meeting titles",
        variant: "destructive",
      });
      return;
    }
    setEditingId(meeting.id);
    setEditingTitle(meeting.title || "");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingTitle("");
  };

  const handleSaveTitle = async (meetingId: string) => {
    if (!editingTitle.trim()) return;
    
    setIsUpdating(true);
    try {
      // Ensure we have a valid token before making the API call
      const token = await authService.getCurrentSessionToken();
      if (!token) {
        throw new Error('No authentication token available');
      }
      
      // Set the token on the API service
      apiService.setToken(token);
      
      await apiService.put(`/api/meetings/${meetingId}`, {
        title: editingTitle.trim()
      });
      
      // Update the local meetings array by calling onEdit with updated meeting
      const updatedMeeting = meetings.find(m => m.id === meetingId);
      if (updatedMeeting) {
        onEdit({ ...updatedMeeting, title: editingTitle.trim() });
      }
      
      setEditingId(null);
      setEditingTitle("");
      
      toast({
        title: "Success",
        description: "Meeting title updated successfully",
      });
    } catch (error) {
      console.error('Failed to update meeting title:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update meeting title",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span>My Meetings</span>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {filteredMeetings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No meetings found</h3>
            <p className="text-gray-600 mb-4">Create a meeting to display meetings</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  {/* <th className="text-left py-3 px-2">id</th> */}
                  <th className="text-left py-3 px-2">Title</th>
                  <th className="text-left py-3 px-2">Platform</th>
                  <th className="text-left py-3 px-2">Start</th>
                  <th className="text-left py-3 px-2">End</th>
                  <th className="text-left py-3 px-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredMeetings.map((meeting) => {
                  const platformAlt = (meeting.platform ?? 'Platform') as string;
                  const platformIcon = getPlatformIcon(meeting.platform);
                  return (
                    <tr key={meeting.id} className="border-b hover:bg-gray-50">
                      {/* <td className="py-3 px-2">{meeting.id}</td> */}
                      <td className="py-3 px-2 font-medium">
                        {editingId === meeting.id ? (
                          <div className="flex items-center space-x-2">
                            <Input
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              className="flex-1"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleSaveTitle(meeting.id);
                                } else if (e.key === 'Escape') {
                                  handleCancelEdit();
                                }
                              }}
                              autoFocus
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSaveTitle(meeting.id)}
                              disabled={isUpdating || !editingTitle.trim()}
                              className="text-green-600 hover:text-green-700"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleCancelEdit}
                              disabled={isUpdating}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <Link href={`/meeting/${meeting.id}/highlights`}>{meeting.title}</Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditTitle(meeting)}
                              className="text-blue-600 hover:text-blue-700 ml-2"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center justify-center">
                          {platformIcon ? (
                            <img 
                              src={platformIcon} 
                              alt={platformAlt} 
                              className="h-6 w-6"
                            />
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-2">{meeting.startTime ? new Date(meeting.startTime).toLocaleString() : '-'}</td>
                      <td className="py-3 px-2">{meeting.endTime ? new Date(meeting.endTime).toLocaleString() : '-'}</td>
                      <td className="py-3 px-2">
                        <div className="flex space-x-2">
                          {onView && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onView(meeting)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(meeting.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
