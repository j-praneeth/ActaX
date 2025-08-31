import { Calendar, Globe, PenTool, Lightbulb } from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      icon: Calendar,
      title: "Live Capture",
      description: "Capture in-meeting, post-meeting, and even from your CRM to create more accurate notes.",
    },
    {
      icon: Globe,
      title: "Multi-lingual Transcripts",
      description: "Support for over 50 languages ensures everyone can participate and collaborate in their native language.",
    },
    {
      icon: PenTool,
      title: "Actionable Notes",
      description: "Extracts action items, decisions, and key takeaways to create more productive meeting outcomes.",
    },
    {
      icon: Lightbulb,
      title: "Meeting Insights",
      description: "Provides actionable insights into meeting patterns, participant engagement, and overall meeting effectiveness.",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Powerful Features
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div 
                key={feature.title}
                className="text-center"
                data-testid={`feature-card-${index}`}
              >
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <IconComponent className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
