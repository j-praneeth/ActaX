import { useState, useEffect } from "react";
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
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signUp, signUpWithGoogle } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Check for OAuth errors in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    
    if (error) {
      let errorMessage = "Authentication failed";
      switch (error) {
        case 'oauth_error':
          errorMessage = "Google OAuth authentication failed";
          break;
        case 'no_code':
          errorMessage = "No authorization code received from Google";
          break;
        case 'callback_failed':
          errorMessage = "Failed to process Google authentication";
          break;
      }
      
      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast]);

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

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    try {
      await signUpWithGoogle();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to sign up with Google",
        variant: "destructive",
      });
      setGoogleLoading(false);
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
                    onClick={handleGoogleSignup}
                    disabled={googleLoading}
                  >
                    {googleLoading ? (
                      <>
                        <span className="mr-2 animate-spin">⏳</span>
                        Connecting with Google...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                    Continue with Google
                      </>
                    )}
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
