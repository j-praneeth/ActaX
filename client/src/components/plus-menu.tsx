import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Upload, CircleDot } from "lucide-react";

interface PlusMenuProps {
  onInviteLiveMeeting: () => void;
  onUploadAudio: () => void;
  onRecordAudio: () => void;
}

export function PlusMenu({ onInviteLiveMeeting, onUploadAudio, onRecordAudio }: PlusMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const menuItems = [
    {
      icon: Mic,
      label: "Invite live meeting",
      onClick: () => {
        onInviteLiveMeeting();
        setIsOpen(false);
      }
    },
    {
      icon: Upload,
      label: "Upload audio file",
      onClick: () => {
        onUploadAudio();
        setIsOpen(false);
      }
    },
    {
      icon: CircleDot,
      label: "Record audio",
      onClick: () => {
        onRecordAudio();
        setIsOpen(false);
      }
    }
  ];

  return (
    <div className="relative" ref={menuRef}>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
      >
        <span className="text-2xl font-bold text-gray-800">+</span>
      </Button>
      
      {isOpen && (
        <div className="absolute top-14 right-0 bg-gray-800 rounded-lg shadow-lg py-2 min-w-[200px] z-50">
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <button
                key={index}
                onClick={item.onClick}
                className="w-full flex items-center space-x-3 px-4 py-3 text-white hover:bg-gray-700 transition-colors"
              >
                <IconComponent className="h-4 w-4" />
                <span className="text-sm">{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
