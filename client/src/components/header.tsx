import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "./language-toggle";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { Menu } from "lucide-react";
import { useState } from "react";

export function Header() {
  const { t } = useLanguage();
  const { user, signOut } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" data-testid="logo-link">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Acta</span>
            </div>
          </Link>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors" data-testid="nav-agents">
              {t('nav.agents')}
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors" data-testid="nav-mobile-apps">
              {t('nav.mobile_apps')}
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors" data-testid="nav-chrome-extension">
              {t('nav.chrome_extension')}
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors" data-testid="nav-tools">
              {t('nav.tools')}
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors" data-testid="nav-resources">
              {t('nav.resources')}
            </a>
          </nav>
          
          {/* CTA Buttons */}
          <div className="flex items-center space-x-4">
            <LanguageToggle />
            {user ? (
              <div className="flex items-center space-x-4">
                <Link href="/dashboard" data-testid="dashboard-link">
                  <Button variant="outline">Dashboard</Button>
                </Link>
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
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg transition-all">
                    {t('button.get_started_free')}
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
      
      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-2 space-y-2">
            <a href="#" className="block py-2 text-gray-600" data-testid="mobile-nav-agents">
              {t('nav.agents')}
            </a>
            <a href="#" className="block py-2 text-gray-600" data-testid="mobile-nav-mobile-apps">
              {t('nav.mobile_apps')}
            </a>
            <a href="#" className="block py-2 text-gray-600" data-testid="mobile-nav-chrome-extension">
              {t('nav.chrome_extension')}
            </a>
            <a href="#" className="block py-2 text-gray-600" data-testid="mobile-nav-tools">
              {t('nav.tools')}
            </a>
            <a href="#" className="block py-2 text-gray-600" data-testid="mobile-nav-resources">
              {t('nav.resources')}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
