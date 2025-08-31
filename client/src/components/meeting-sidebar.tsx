import { Link, useLocation } from "wouter";
import { ArrowLeft, Zap, FileText, Users } from "lucide-react";

interface MeetingSidebarProps {
  currentPage: string;
  meetingId?: string;
}

export function MeetingSidebar({ currentPage, meetingId = "1" }: MeetingSidebarProps) {
  const [location] = useLocation();
  
  const navItems = [
    {
      id: "highlights",
      label: "Highlights",
      icon: Zap,
      path: `/meeting/${meetingId}/highlights`,
    },
    {
      id: "analytics",
      label: "Analytics", 
      icon: FileText,
      path: `/meeting/${meetingId}/analytics`,
    },
    {
      id: "transcript",
      label: "Transcript",
      icon: FileText,
      path: `/meeting/${meetingId}/transcript`,
    },
    {
      id: "agents",
      label: "Agents",
      icon: Users,
      path: `/meeting/${meetingId}/agents`,
    },
  ];

  return (
    <div className="w-64 bg-gray-50 min-h-screen pt-16">
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-8">
          <Link href="/dashboard">
            <ArrowLeft className="h-5 w-5 text-gray-600 hover:text-gray-900 cursor-pointer" />
          </Link>
          <span className="text-lg font-semibold text-gray-900 capitalize">{currentPage}</span>
        </div>
        
        <nav className="space-y-2">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = location === item.path;
            
            return (
              <Link key={item.id} href={item.path}>
                <div className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                  isActive 
                    ? "bg-blue-100 text-blue-700" 
                    : "text-gray-600 hover:bg-gray-100"
                }`}>
                  <IconComponent className="h-5 w-5" />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
