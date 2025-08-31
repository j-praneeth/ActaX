import { Check } from "lucide-react";

export function WhyActaSection() {
  const features = [
    {
      title: "Automated Summaries",
      description: "Get concise, accurate meeting summaries automatically.",
    },
    {
      title: "Actionable Insights",
      description: "Identify key decisions, action items, and follow-up automatically.",
    },
    {
      title: "Seamless Integrations",
      description: "Connect with your favorite task, like Slack, Jira, and CRM systems.",
    },
    {
      title: "Enhanced Collaboration",
      description: "Share notes, assign tasks, and track progress effortlessly.",
    },
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6" data-testid="why-acta-title">
            Why ActaX?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto" data-testid="why-acta-subtitle">
            ActaX goes beyond simple transcription, offering a suite of AI-powered tools designed to make your meetings more productive and actionable.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="flex items-start space-x-4"
                data-testid={`why-acta-feature-${index}`}
              >
                <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-1">
                  <Check className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div>
            <div className="bg-gray-100 rounded-lg p-8">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 bg-blue-600 rounded"></div>
                    </div>
                    <div>
                      <div className="h-2 bg-gray-200 rounded w-32 mb-1"></div>
                      <div className="h-1 bg-gray-100 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-gray-200 rounded w-full"></div>
                    <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="flex space-x-2">
                    <div className="h-6 bg-green-100 rounded px-3 flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <div className="h-1 bg-green-500 rounded w-16"></div>
                    </div>
                    <div className="h-6 bg-blue-100 rounded px-3 flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      <div className="h-1 bg-blue-500 rounded w-12"></div>
                    </div>
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
