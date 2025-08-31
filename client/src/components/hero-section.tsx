import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import { Link } from "wouter";

export function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-screen flex items-center pt-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight" data-testid="hero-title">
              Go beyond meeting notes with{' '}
              <span className="text-blue-600">
                Acta Agents
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed" data-testid="hero-subtitle">
              Acta empowers teams to unlock the full potential of every meeting with intelligent AI agents for automated summaries, action item tracking, and deep insights.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link href="/signup">
                <Button 
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  data-testid="start-free-trial-button"
                >
                  Start Your Free Trial
                </Button>
              </Link>
              <Button 
                size="lg"
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
                data-testid="book-demo-button"
              >
                Book a Demo
              </Button>
            </div>
          </div>
          
          {/* Right Content - Laptop Image */}
          <div className="relative">
            <div className="bg-gray-100 rounded-lg p-8">
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="bg-white rounded p-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                    <div>
                      <div className="h-2 bg-gray-200 rounded w-24 mb-1"></div>
                      <div className="h-1 bg-gray-100 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-gray-200 rounded w-full"></div>
                    <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
