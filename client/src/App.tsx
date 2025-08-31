import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { LanguageProvider } from "@/hooks/use-language";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import Dashboard from "@/pages/dashboard";
import Agents from "@/pages/agents";
import Integrations from "@/pages/integrations";
import Settings from "@/pages/settings";
import MeetingHighlights from "@/pages/meeting-highlights";
import MeetingAnalytics from "@/pages/meeting-analytics";
import MeetingTranscript from "@/pages/meeting-transcript";
import MeetingAgentsPage from "@/pages/meeting-agents";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/agents" component={Agents} />
      <Route path="/integrations" component={Integrations} />
      <Route path="/settings" component={Settings} />
      <Route path="/meeting/:id/highlights" component={MeetingHighlights} />
      <Route path="/meeting/:id/analytics" component={MeetingAnalytics} />
      <Route path="/meeting/:id/transcript" component={MeetingTranscript} />
      <Route path="/meeting/:id/agents" component={MeetingAgentsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
