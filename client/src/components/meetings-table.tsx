import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Trash2, Search, Video, Eye } from "lucide-react";
import { Link } from "wouter";
import type { Meeting } from "@shared/schema";

interface MeetingsTableProps {
  meetings: Meeting[];
  onEdit: (meeting: Meeting) => void;
  onDelete: (meetingId: string) => void;
  onView?: (meeting: Meeting) => void;
}

export function MeetingsTable({ meetings, onEdit, onDelete, onView }: MeetingsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const filteredMeetings = useMemo(() => {
    return (meetings || []).filter((meeting) => {
      const title = meeting.title || "";
      return title.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [meetings, searchTerm]);

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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2">id</th>
                <th className="text-left py-3 px-2">Title</th>
                <th className="text-left py-3 px-2">Platform</th>
                <th className="text-left py-3 px-2">Start</th>
                <th className="text-left py-3 px-2">End</th>
                <th className="text-left py-3 px-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredMeetings.map((meeting) => (
                <tr key={meeting.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-2">{meeting.id}</td>
                  <td className="py-3 px-2 font-medium"><Link href={`/meeting/${meeting.id}/highlights`}>{meeting.title}</Link></td>
                  <td className="py-3 px-2">
                    <div className="flex items-center space-x-2">
                      <Video className="h-4 w-4 text-green-500" />
                      <span>{meeting.platform || '-'}</span>
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
                        onClick={() => onEdit(meeting)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
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
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
