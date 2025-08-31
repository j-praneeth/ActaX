import { Link, useLocation } from "wouter";
import { Bell, Users, CheckCircle, Key } from "lucide-react";

interface MainSidebarProps {
  currentPage?: string;
}

export function MainSidebar({ currentPage = "dashboard" }: MainSidebarProps) {
  const [location] = useLocation();
  
  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Bell,
      path: "/dashboard",
    },
    {
      id: "agents",
      label: "Agents",
      icon: Users,
      path: "/agents",
    },
    {
      id: "integrations",
      label: "Integrations",
      icon: CheckCircle,
      path: "/integrations",
    },
    {
      id: "settings",
      label: "Settings",
      icon: Key,
      path: "/settings",
    },
  ];

  return (
    <div className="w-64 bg-gray-50 min-h-screen pt-16">
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-8">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <span className="text-xl font-bold text-gray-900">ActaX</span>
        </div>
        
        <nav className="space-y-2">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = location === item.path;
            
            return (
              <Link key={item.id} href={item.path}>
                <div className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                  isActive 
                    ? "bg-gray-200 text-gray-900" 
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
