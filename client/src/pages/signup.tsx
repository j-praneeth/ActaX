import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signUp(email, password, name);
      toast({
        title: "Success",
        description: "Account created successfully",
      });
      setLocation("/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Signup Form */}
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-none">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2" data-testid="signup-title">
                Create Your Account
              </CardTitle>
              <CardDescription className="text-gray-600" data-testid="signup-description">
                Start your journey with ActaX today.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-900">Name</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400">👤</span>
                    </div>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Full Name"
                      className="h-12 pl-10"
                      data-testid="signup-name-input"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-900">Email</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400">✉️</span>
                    </div>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="Email Address"
                      className="h-12 pl-10"
                      data-testid="signup-email-input"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-900">Password</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400">🔒</span>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      placeholder="Create Password"
                      className="h-12 pl-10 pr-10"
                      data-testid="signup-password-input"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button type="button" className="text-gray-400 hover:text-gray-600">
                        <span className="text-sm">👁️</span>
                      </button>
                    </div>
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  disabled={loading}
                  data-testid="signup-submit-button"
                >
                  {loading ? "Creating account..." : "Sign Up"}
                </Button>
              </form>
              
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">OR</span>
                  </div>
                </div>
                
                <div className="mt-6 space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full h-12 border-gray-300 hover:bg-gray-50"
                  >
                    <span className="mr-2">G</span>
                    Continue with Google
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full h-12 border-gray-300 hover:bg-gray-50"
                  >
                    <span className="mr-2">⊞</span>
                    Continue with Microsoft
                  </Button>
                </div>
              </div>
              
              <div className="mt-6 text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/login" className="text-blue-600 hover:underline font-medium" data-testid="signup-login-link">
                  Log In
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Side - Decorative Image */}
      <div className="hidden lg:flex lg:flex-1 bg-gray-50 items-center justify-center p-8">
        <div className="max-w-md">
          <div className="bg-gray-800 rounded-lg p-8 mb-6">
            <div className="space-y-6">
              {/* Market Research Chart */}
              <div className="bg-white rounded p-4">
                <div className="text-xs font-bold text-gray-800 mb-3">MARKET RESEARCH</div>
                <div className="space-y-2">
                  <div className="h-3 bg-pink-500 rounded w-3/4"></div>
                  <div className="h-3 bg-pink-400 rounded w-1/2"></div>
                  <div className="h-3 bg-pink-300 rounded w-2/3"></div>
                  <div className="h-3 bg-pink-200 rounded w-1/3"></div>
                </div>
              </div>
              
              {/* Red Notebook */}
              <div className="bg-red-500 rounded p-4 relative">
                <div className="absolute top-2 right-2 w-6 h-6 bg-black rounded-full"></div>
                <div className="h-8 bg-red-400 rounded"></div>
              </div>
              
              {/* Blue Folder */}
              <div className="bg-blue-500 rounded p-4">
                <div className="h-6 bg-blue-400 rounded"></div>
              </div>
              
              {/* Pencils */}
              <div className="flex space-x-2">
                <div className="w-1 h-16 bg-blue-500 rounded transform rotate-12"></div>
                <div className="w-1 h-16 bg-red-500 rounded transform -rotate-12"></div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
