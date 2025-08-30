import { Button } from "@/components/ui/button";

export function ChromeExtensionSection() {
  const platforms = [
    { name: "Microsoft Teams", icon: "💼", color: "bg-blue-600" },
    { name: "Google Meet", icon: "🎯", color: "bg-red-600" },
    { name: "Zoom", icon: "📹", color: "bg-blue-500" },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6" data-testid="chrome-extension-title">
            Download Acta Chrome Extension
          </h2>
          <p className="text-xl text-gray-600 mb-12" data-testid="chrome-extension-subtitle">
            One Extension for Google Meet, MS Teams and Zoom
          </p>
          
          <div className="flex justify-center items-center space-x-8 mb-12">
            {platforms.map((platform, index) => (
              <div key={platform.name} className="text-center" data-testid={`platform-${index}`}>
                <div className={`w-16 h-16 ${platform.color} rounded-lg flex items-center justify-center mb-3 mx-auto`}>
                  <span className="text-2xl">{platform.icon}</span>
                </div>
                <span className="text-gray-700 font-medium">{platform.name}</span>
              </div>
            ))}
          </div>
          
          <Button 
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-xl transition-all transform hover:scale-105"
            data-testid="chrome-extension-button"
          >
            <span className="mr-3 text-xl">🌐</span>
            Get It On Chrome
          </Button>
        </div>
      </div>
    </section>
  );
}
