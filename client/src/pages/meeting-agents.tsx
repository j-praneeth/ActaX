import { Header } from "@/components/header";
import { MeetingSidebar } from "@/components/meeting-sidebar";
import { MeetingAgents } from "@/components/meeting-agents";

export default function MeetingAgentsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="flex">
        <MeetingSidebar currentPage="agents" />
        
        {/* Main Content */}
        <div className="flex-1 pt-16">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <MeetingAgents hasAgents={false} />
          </div>
        </div>
      </div>
    </div>
  );
}
