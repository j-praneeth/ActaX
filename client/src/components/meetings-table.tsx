import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Trash2, Search, Video } from "lucide-react";

interface Meeting {
  id: number;
  subject: string;
  platform: string;
  date: string;
  startTime: string;
}

interface MeetingsTableProps {
  meetings: Meeting[];
  onEdit: (meeting: Meeting) => void;
  onDelete: (meetingId: number) => void;
}

export function MeetingsTable({ meetings, onEdit, onDelete }: MeetingsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMeetings = meetings.filter(meeting =>
    meeting.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              placeholder="Search by subject..."
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
                <th className="text-left py-3 px-2">#</th>
                <th className="text-left py-3 px-2">Subject</th>
                <th className="text-left py-3 px-2">Platform</th>
                <th className="text-left py-3 px-2">Date</th>
                <th className="text-left py-3 px-2">Start Time</th>
                <th className="text-left py-3 px-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredMeetings.map((meeting) => (
                <tr key={meeting.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-2">{meeting.id}</td>
                  <td className="py-3 px-2 font-medium">{meeting.subject}</td>
                  <td className="py-3 px-2">
                    <div className="flex items-center space-x-2">
                      <Video className="h-4 w-4 text-green-500" />
                      <span>{meeting.platform}</span>
                    </div>
                  </td>
                  <td className="py-3 px-2">{meeting.date}</td>
                  <td className="py-3 px-2">{meeting.startTime}</td>
                  <td className="py-3 px-2">
                    <div className="flex space-x-2">
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
