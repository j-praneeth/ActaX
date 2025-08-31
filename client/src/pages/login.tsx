import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(email, password);
      toast({
        title: "Success",
        description: "Signed in successfully",
      });
      setLocation("/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to sign in",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-none">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2" data-testid="login-title">
                Welcome Back to ActaX
              </CardTitle>
              <CardDescription className="text-gray-600" data-testid="login-description">
                Log in to your account to continue.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-900">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="h-12"
                    data-testid="login-email-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-900">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="h-12"
                    data-testid="login-password-input"
                  />
                </div>
                <div className="text-right">
                  <Link href="#" className="text-sm text-blue-600 hover:underline">
                    Forgot Password?
                  </Link>
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  disabled={loading}
                  data-testid="login-submit-button"
                >
                  {loading ? "Signing in..." : "Log In"}
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
                Don't have an account?{" "}
                <Link href="/signup" className="text-blue-600 hover:underline font-medium" data-testid="login-signup-link">
                  Sign Up
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Side - Smart Analytics Promotion */}
      <div className="hidden lg:flex lg:flex-1 bg-gray-50 items-center justify-center p-8">
        <div className="max-w-md text-center">
          <div className="mb-8">
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <div className="bg-gray-700 rounded p-4 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                    <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                    <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-gray-600 rounded"></div>
                    <div className="w-4 h-4 bg-gray-600 rounded"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-2 bg-blue-500 rounded w-3/4"></div>
                  <div className="h-2 bg-yellow-500 rounded w-1/2"></div>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="h-8 bg-blue-400 rounded"></div>
                    <div className="h-6 bg-blue-300 rounded"></div>
                    <div className="h-10 bg-blue-500 rounded"></div>
                    <div className="h-4 bg-blue-200 rounded"></div>
                  </div>
                  <div className="flex justify-center">
                    <div className="w-16 h-16 bg-gray-600 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Smart Analytics</h2>
          <p className="text-gray-600 mb-6">
            Gain deep insights with our powerful, intuitive data analytics tools. Visualize trends and make informed decisions effortlessly.
          </p>
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
