import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, FileAudio } from "lucide-react";

interface UploadAudioProps {
  isOpen: boolean;
  onClose: () => void;
  onFileUpload: (file: File) => void;
}

export function UploadAudio({ isOpen, onClose, onFileUpload }: UploadAudioProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const audioFile = files.find(file => 
      file.type === 'audio/mpeg' || 
      file.type === 'audio/mp4' || 
      file.name.endsWith('.mp3') || 
      file.name.endsWith('.m4a')
    );
    
    if (audioFile) {
      onFileUpload(audioFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Upload Audio File</h2>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-gray-700">
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              isDragOver 
                ? 'border-blue-400 bg-blue-50 bg-opacity-10' 
                : 'border-gray-300'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <FileAudio className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Drag & drop</h3>
            <p className="text-gray-400 mb-4">MP3, M4A</p>
            <Button 
              onClick={handleBrowseClick}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Browse Files
            </Button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".mp3,.m4a,audio/mpeg,audio/mp4"
            onChange={handleFileSelect}
            className="hidden"
          />
        </CardContent>
      </Card>
    </div>
  );
}
