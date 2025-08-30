import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function MeetingProductivitySection() {
  const features = [
    {
      title: "Meeting Summary",
      description: "Receive a concise summary of your meeting's key points, decisions, and takeaways.",
      icon: "📝",
      color: "from-purple-50 to-purple-100",
      textColor: "text-purple-600",
    },
    {
      title: "Action Items",
      description: "Automatically generate a list of action items, ensuring accountability and follow-through.",
      icon: "✅",
      color: "from-blue-50 to-blue-100",
      textColor: "text-blue-600",
    },
    {
      title: "Key Topics",
      description: "Automatically generate a list of Key Topics discussed during the meeting.",
      icon: "💡",
      color: "from-indigo-50 to-indigo-100",
      textColor: "text-indigo-600",
    },
    {
      title: "Takeaways",
      description: "Able to define key Takeaways from meeting.",
      icon: "⭐",
      color: "from-green-50 to-green-100",
      textColor: "text-green-600",
    },
    {
      title: "Integrations",
      description: "Integrates with popular video conferencing platforms like Google Meet, Zoom and Microsoft Teams.",
      icon: "🔌",
      color: "from-orange-50 to-orange-100",
      textColor: "text-orange-600",
    },
    {
      title: "Calendar Integration",
      description: "Acta able to integrate google and MS teams calendar",
      icon: "📅",
      color: "from-pink-50 to-pink-100",
      textColor: "text-pink-600",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6" data-testid="productivity-title">
            Boost Meeting Productivity using Acta Agent
          </h2>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={feature.title}
              className={`bg-gradient-to-br ${feature.color} card-hover border-0`}
              data-testid={`productivity-feature-${index}`}
            >
              <CardContent className="p-8">
                <div className="text-4xl mb-6">{feature.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-700 mb-6">
                  {feature.description}
                </p>
                <Button 
                  variant="link" 
                  className={`${feature.textColor} p-0 font-semibold`}
                  data-testid={`learn-more-${index}`}
                >
                  Learn more →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
