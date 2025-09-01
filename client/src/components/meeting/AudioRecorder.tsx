import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Mic, Square, Save } from "lucide-react";

interface AudioRecorderProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (blob: Blob) => void;
}

export function AudioRecorder({ isOpen, onClose, onSave }: AudioRecorderProps) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [chunks, setChunks] = useState<BlobPart[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      // Cleanup when closed
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
      setChunks([]);
      setIsRecording(false);
      setError(null);
    }
  }, [isOpen]);

  const requestPermissionAndStart = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      const localChunks: BlobPart[] = [];

      recorder.ondataavailable = (e: BlobEvent) => {
        if (e.data && e.data.size > 0) {
          localChunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        setChunks(localChunks);
        const blob = new Blob(localChunks, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        // Stop tracks
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      setIsRecording(true);
    } catch (e: any) {
      setError(e?.message || "Microphone permission denied");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const handleSave = () => {
    if (chunks.length === 0) return;
    const blob = new Blob(chunks, { type: "audio/webm" });
    onSave(blob);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Record Audio</h2>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-gray-700">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {error && (
            <div className="mb-4 text-sm text-red-400">{error}</div>
          )}

          <div className="flex flex-col items-center space-y-4">
            {audioUrl ? (
              <audio controls src={audioUrl} className="w-full" />
            ) : (
              <div className="text-gray-300 text-sm">Grant microphone access and start recording.</div>
            )}

            <div className="flex space-x-3">
              {!isRecording ? (
                <Button onClick={requestPermissionAndStart} className="bg-blue-600 hover:bg-blue-700">
                  <Mic className="h-4 w-4 mr-2" /> Start
                </Button>
              ) : (
                <Button onClick={stopRecording} variant="destructive">
                  <Square className="h-4 w-4 mr-2" /> Stop
                </Button>
              )}
              <Button onClick={handleSave} variant="outline" disabled={chunks.length === 0}>
                <Save className="h-4 w-4 mr-2" /> Save
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

