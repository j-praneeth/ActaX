import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Video } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { safeFetch } from '@/lib/safe-fetch';
import { authService } from '@/lib/auth';

interface MeetingCreationModalProps {
  onMeetingCreated?: (meeting: any) => void;
}

export function MeetingCreationModal({ onMeetingCreated }: MeetingCreationModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [platform, setPlatform] = useState('google_meet');
  const [startDate, setStartDate] = useState<Date>();
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('60');
  const [meetingUrl, setMeetingUrl] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startDate || !startTime) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const [hours, minutes] = startTime.split(':').map(Number);
      const startDateTime = new Date(startDate);
      startDateTime.setHours(hours, minutes, 0, 0);
      
      const endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(endDateTime.getMinutes() + parseInt(duration));

      const meetingData = {
        title,
        description,
        platform,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        meetingUrl: meetingUrl || undefined,
      };

      // Get current session token
      const sessionToken = await authService.getCurrentSessionToken();
      if (!sessionToken) {
        throw new Error('User not authenticated. Please sign in again.');
      }

      const response = await safeFetch('/api/meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
        body: JSON.stringify(meetingData),
      });

      if (!response.ok || response.error || !response.data) {
        throw new Error(response.error || 'Failed to create meeting');
      }

      const meeting = response.data;
      
      toast({
        title: "Success",
        description: "Meeting created successfully",
      });

      setOpen(false);
      setTitle('');
      setDescription('');
      setStartDate(undefined);
      setStartTime('');
      setDuration('60');
      setMeetingUrl('');
      
      onMeetingCreated?.(meeting);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create meeting",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // return (
  //   <Dialog open={open} onOpenChange={setOpen}>
  //     <DialogTrigger asChild>
  //       <Button className="bg-blue-600 hover:bg-blue-700 text-white">
  //         <Plus className="w-4 h-4 mr-2" />
  //         Create Meeting
  //       </Button>
  //     </DialogTrigger>
  //     <DialogContent className="sm:max-w-[600px]">
  //       <DialogHeader>
  //         <DialogTitle>Create New Meeting</DialogTitle>
  //         <DialogDescription>
  //           Set up a new meeting with automatic transcription and AI insights.
  //         </DialogDescription>
  //       </DialogHeader>
        
  //       <form onSubmit={handleSubmit} className="space-y-6">
  //         <div className="grid grid-cols-2 gap-4">
  //           <div className="space-y-2">
  //             <Label htmlFor="title">Meeting Title *</Label>
  //             <Input
  //               id="title"
  //               value={title}
  //               onChange={(e) => setTitle(e.target.value)}
  //               placeholder="e.g., Q4 Planning Meeting"
  //               required
  //             />
  //           </div>
            
  //           <div className="space-y-2">
  //             <Label htmlFor="platform">Platform</Label>
  //             <Select value={platform} onValueChange={setPlatform}>
  //               <SelectTrigger>
  //                 <SelectValue />
  //               </SelectTrigger>
  //               <SelectContent>
  //                 <SelectItem value="google_meet">Google Meet</SelectItem>
  //                 <SelectItem value="zoom">Zoom</SelectItem>
  //                 <SelectItem value="teams">Microsoft Teams</SelectItem>
  //               </SelectContent>
  //             </Select>
  //           </div>
  //         </div>

  //         <div className="space-y-2">
  //           <Label htmlFor="description">Description</Label>
  //           <Textarea
  //             id="description"
  //             value={description}
  //             onChange={(e) => setDescription(e.target.value)}
  //             placeholder="Meeting agenda and objectives..."
  //             rows={3}
  //           />
  //         </div>

  //         <div className="grid grid-cols-3 gap-4">
  //           <div className="space-y-2">
  //             <Label>Start Date *</Label>
  //             <Popover>
  //               <PopoverTrigger asChild>
  //                 <Button
  //                   variant="outline"
  //                   className={cn(
  //                     "w-full justify-start text-left font-normal",
  //                     !startDate && "text-muted-foreground"
  //                   )}
  //                 >
  //                   <CalendarIcon className="mr-2 h-4 w-4" />
  //                   {startDate ? format(startDate, "PPP") : "Pick a date"}
  //                 </Button>
  //               </PopoverTrigger>
  //               <PopoverContent className="w-auto p-0">
  //                 <Calendar
  //                   mode="single"
  //                   selected={startDate}
  //                   onSelect={setStartDate}
  //                   initialFocus
  //                 />
  //               </PopoverContent>
  //             </Popover>
  //           </div>

  //           <div className="space-y-2">
  //             <Label htmlFor="startTime">Start Time *</Label>
  //             <Input
  //               id="startTime"
  //               type="time"
  //               value={startTime}
  //               onChange={(e) => setStartTime(e.target.value)}
  //               required
  //             />
  //           </div>

  //           <div className="space-y-2">
  //             <Label htmlFor="duration">Duration (min)</Label>
  //             <Select value={duration} onValueChange={setDuration}>
  //               <SelectTrigger>
  //                 <SelectValue />
  //               </SelectTrigger>
  //               <SelectContent>
  //                 <SelectItem value="30">30 minutes</SelectItem>
  //                 <SelectItem value="60">1 hour</SelectItem>
  //                 <SelectItem value="90">1.5 hours</SelectItem>
  //                 <SelectItem value="120">2 hours</SelectItem>
  //               </SelectContent>
  //             </Select>
  //           </div>
  //         </div>

  //         <div className="space-y-2">
  //           <Label htmlFor="meetingUrl">Meeting URL (Optional)</Label>
  //           <Input
  //             id="meetingUrl"
  //             value={meetingUrl}
  //             onChange={(e) => setMeetingUrl(e.target.value)}
  //             placeholder="https://meet.google.com/..."
  //           />
  //           <p className="text-sm text-gray-500">
  //             If not provided, a Google Meet link will be generated automatically
  //           </p>
  //         </div>

  //         <div className="flex justify-end space-x-3">
  //           <Button
  //             type="button"
  //             variant="outline"
  //             onClick={() => setOpen(false)}
  //           >
  //             Cancel
  //           </Button>
  //           <Button
  //             type="submit"
  //             disabled={loading}
  //             className="bg-blue-600 hover:bg-blue-700"
  //           >
  //             {loading ? "Creating..." : "Create Meeting"}
  //           </Button>
  //         </div>
  //       </form>
  //     </DialogContent>
  //   </Dialog>
  // );
}

