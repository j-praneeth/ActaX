import { useState } from "react";
import { Header } from "@/components/header";
import { MeetingSidebar } from "@/components/meeting-sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Play, Pause, SkipBack, SkipForward, Download } from "lucide-react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Meeting } from "@shared/schema";

export default function MeetingTranscript() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(9);
  const [totalTime] = useState(19);
  const params = useParams<{ id: string }>();
  const { data: meeting } = useQuery<Meeting | null>({
    queryKey: ["/api/meetings", params.id],
    enabled: !!params?.id,
  });

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTime(parseInt(e.target.value));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="flex">
        <MeetingSidebar currentPage="transcript" />
        
        {/* Main Content */}
        <div className="flex-1 pt-16">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search transcript" 
                  className="pl-10"
                />
              </div>
            </div>

            {/* Transcript List */}
            <div className="space-y-4 mb-8">
              <Card className="bg-gray-50">
                <CardContent className="p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {meeting?.transcript || 'No transcript available.'}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Audio Player - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handlePlayPause}>
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm">
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex-1 mx-8">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">{formatTime(currentTime)}</span>
              <input
                type="range"
                min="0"
                max={totalTime}
                value={currentTime}
                onChange={handleSeek}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm text-gray-500">{formatTime(totalTime)}</span>
            </div>
          </div>
          
          <Button variant="ghost" size="sm">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
