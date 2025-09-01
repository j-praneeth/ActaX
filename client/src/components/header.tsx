import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "./language-toggle";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { Menu, Globe, Clock, User } from "lucide-react";
import { useState } from "react";

export function Header() {
  const { t } = useLanguage();
  const { user, signOut } = useAuth();
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      setLocation("/login");
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" data-testid="logo-link">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="text-xl font-bold text-gray-900">ActaX</span>
            </div>
          </Link>
          
         
          
          {/* CTA Buttons */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Globe className="h-4 w-4" />
                  <span>English</span>
                </div>
                {/* <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>15 Days Left In Trial</span>
                </div> */}
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">{user.name || 'User'}</div>
                    <div className="text-gray-600">{user.email}</div>
                  </div>
                </div>
                <Button variant="outline" onClick={handleSignOut} data-testid="sign-out-button">
                  Sign Out
                </Button>
              </div>
            ) : (
              <>
                <Link href="/login" data-testid="login-link">
                  <Button variant="ghost">{t('button.login')}</Button>
                </Link>
                <Link href="/signup" data-testid="signup-link">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile Menu */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="mobile-menu-button"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
    </header>
  );
}
