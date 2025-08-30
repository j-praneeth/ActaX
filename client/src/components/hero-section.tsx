import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import { Check } from "lucide-react";

export function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="hero-gradient relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-float" style={{ animationDelay: '-2s' }}></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <div className="mb-6">
              <span className="inline-block px-4 py-2 bg-purple-600/20 text-purple-300 rounded-full text-sm font-medium">
                We are not the First, But we are THE BEST.
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight" data-testid="hero-title">
              Go beyond meeting notes with{' '}
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Acta Agents
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 leading-relaxed" data-testid="hero-subtitle">
              {t('hero.subtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-2xl transition-all transform hover:scale-105"
                data-testid="request-demo-button"
              >
                {t('button.request_demo')}
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all"
                data-testid="get-started-free-button"
              >
                {t('button.get_started_free')}
              </Button>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 text-gray-400 text-sm">
              <span className="flex items-center" data-testid="feature-no-credit-card">
                <Check className="h-4 w-4 text-green-400 mr-2" />
                No credit card required
              </span>
              <span className="flex items-center" data-testid="feature-free-trial">
                <Check className="h-4 w-4 text-green-400 mr-2" />
                14-day free trial
              </span>
              <span className="flex items-center" data-testid="feature-cancel-anytime">
                <Check className="h-4 w-4 text-green-400 mr-2" />
                Cancel Anytime
              </span>
            </div>
          </div>
          
          {/* Right Content - App Screenshots */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <img 
                  src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=600" 
                  alt="Modern conference room meeting" 
                  className="rounded-xl shadow-2xl animate-float w-full h-auto"
                  data-testid="hero-image-1"
                />
                <img 
                  src="https://images.unsplash.com/photo-1611224923853-80b023f02d71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=600" 
                  alt="Professional video conference meeting" 
                  className="rounded-xl shadow-2xl animate-float w-full h-auto" 
                  style={{ animationDelay: '-1s' }}
                  data-testid="hero-image-2"
                />
              </div>
              <div className="space-y-4 mt-8">
                <img 
                  src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=600" 
                  alt="AI technology dashboard" 
                  className="rounded-xl shadow-2xl animate-float w-full h-auto" 
                  style={{ animationDelay: '-2s' }}
                  data-testid="hero-image-3"
                />
                <img 
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=600" 
                  alt="Business analytics dashboard" 
                  className="rounded-xl shadow-2xl animate-float w-full h-auto" 
                  style={{ animationDelay: '-3s' }}
                  data-testid="hero-image-4"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
