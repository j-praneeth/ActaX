import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, FileText } from "lucide-react";
import type { Meeting } from "@shared/schema";

interface MeetingCardProps {
  meeting: Meeting;
  onClick?: () => void;
}

export function MeetingCard({ meeting, onClick }: MeetingCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "scheduled":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Not scheduled";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  return (
    <Card className="card-hover cursor-pointer" onClick={onClick} data-testid={`meeting-card-${meeting.id}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg line-clamp-2" data-testid="meeting-title">
            {meeting.title}
          </CardTitle>
          <Badge 
            className={getStatusColor(meeting.status)}
            data-testid="meeting-status"
          >
            {meeting.status.replace("_", " ")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {meeting.description && (
          <p className="text-sm text-gray-600 line-clamp-2" data-testid="meeting-description">
            {meeting.description}
          </p>
        )}
        
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span data-testid="meeting-start-time">{formatDate(meeting.startTime)}</span>
          </div>
          {meeting.platform && (
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span className="capitalize" data-testid="meeting-platform">{meeting.platform.replace("_", " ")}</span>
            </div>
          )}
        </div>

        {meeting.status === "completed" && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              {meeting.transcript && (
                <div className="flex items-center space-x-1">
                  <FileText className="h-3 w-3" />
                  <span data-testid="meeting-transcript-indicator">Transcript</span>
                </div>
              )}
              {meeting.summary && (
                <div className="flex items-center space-x-1">
                  <FileText className="h-3 w-3" />
                  <span data-testid="meeting-summary-indicator">Summary</span>
                </div>
              )}
            </div>
            <Button 
              variant="outline" 
              size="sm"
              data-testid="view-meeting-button"
            >
              View
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
