import { useState } from "react";
import { Header } from "@/components/header";
import { MainSidebar } from "@/components/main-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Key } from "lucide-react";

export default function Settings() {
  const [autoJoinMeetings, setAutoJoinMeetings] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="flex">
        <MainSidebar currentPage="settings" />

        {/* Main Content */}
        <div className="flex-1 pt-16">
          <div className="max-w-4xl mx-auto px-6 py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
            </div>

            <div className="space-y-8">
              {/* General Preferences */}
              <Card className="bg-white">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">General Preferences</h2>
                  <p className="text-gray-600 mb-6">Manage your default application behavior and display settings.</p>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Auto-join Meetings</h3>
                        <p className="text-sm text-gray-600">Automatically join scheduled meetings five minutes before they start.</p>
                      </div>
                      <Switch
                        checked={autoJoinMeetings}
                        onCheckedChange={setAutoJoinMeetings}
                        className="data-[state=checked]:bg-blue-600"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
                        <p className="text-sm text-gray-600">Receive email alerts for important updates and reminders.</p>
                      </div>
                      <Switch
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                        className="data-[state=checked]:bg-blue-600"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Dark Mode (Experimental)</h3>
                        <p className="text-sm text-gray-600">Switch to a darker theme for improved visibility in low light.</p>
                      </div>
                      <Switch
                        checked={darkMode}
                        onCheckedChange={setDarkMode}
                        className="data-[state=checked]:bg-blue-600"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account Management */}
              <Card className="bg-white">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Account Management</h2>
                  <p className="text-gray-600 mb-6">Update your personal information and security settings.</p>
                  
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="email">Change Email Address</Label>
                      <p className="text-sm text-gray-600 mb-2">Update the email address associated with your account.</p>
                      <Input
                        id="email"
                        type="email"
                        defaultValue="user@actax.com"
                        className="max-w-md"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="current-password">Current Password</Label>
                      <p className="text-sm text-gray-600 mb-2">Enter your current password to confirm changes.</p>
                      <Input
                        id="current-password"
                        type="password"
                        placeholder="Enter current password"
                        className="max-w-md"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="new-password">New Password</Label>
                      <p className="text-sm text-gray-600 mb-2">Create a new password for your account.</p>
                      <Input
                        id="new-password"
                        type="password"
                        placeholder="Enter new password"
                        className="max-w-md"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <p className="text-sm text-gray-600 mb-2">Re-enter your new password to confirm.</p>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Confirm new password"
                        className="max-w-md"
                      />
                    </div>
                    
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Update Password
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Integrations */}
              <Card className="bg-white">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Integrations</h2>
                  <p className="text-gray-600 mb-6">Connect or disconnect third-party services with your ActaX account.</p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center text-white font-bold text-sm">
                          J
                        </div>
                        <span className="font-medium text-gray-900">Jira</span>
                      </div>
                      <Button variant="outline" size="sm">
                        Disconnect
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white font-bold text-sm">
                          S
                        </div>
                        <span className="font-medium text-gray-900">Salesforce</span>
                      </div>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        Connect
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          H
                        </div>
                        <span className="font-medium text-gray-900">HubSpot</span>
                      </div>
                      <Button variant="outline" size="sm">
                        Disconnect
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Security */}
              <Card className="bg-white">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Security</h2>
                  <p className="text-gray-600 mb-6">Enhance the security of your ActaX account.</p>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h3>
                        <p className="text-sm text-gray-600">Add an extra layer of security requiring a code from your mobile device.</p>
                      </div>
                      <Switch
                        checked={twoFactorAuth}
                        onCheckedChange={setTwoFactorAuth}
                        className="data-[state=checked]:bg-blue-600"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Active Sessions</h3>
                        <p className="text-sm text-gray-600">View and manage devices currently logged into your account.</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Key className="h-4 w-4 mr-2" />
                        Manage Sessions
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
