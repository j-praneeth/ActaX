import { Card, CardContent } from "@/components/ui/card";

export function MeetingTypesSection() {
  const meetingTypes = [
    {
      title: "Sales Discovery Call Notes",
      description: "Uncover your prospect's needs and identify the key steps to close the deal.",
      icon: "🤝",
      color: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      title: "User Interview Notes",
      description: "Gather valuable feedback to create world-class products.",
      icon: "👥",
      color: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Team Sync Notes",
      description: "Ensure everyone stays aligned and on the same page.",
      icon: "🔄",
      color: "bg-indigo-100",
      iconColor: "text-indigo-600",
    },
    {
      title: "Performance Review Notes",
      description: "Document career goals and manager feedback.",
      icon: "📊",
      color: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Board Meeting Notes",
      description: "Document company priorities and quarterly goals.",
      icon: "🏢",
      color: "bg-orange-100",
      iconColor: "text-orange-600",
    },
    {
      title: "Manager One-on-One Notes",
      description: "Focus on the priorities you and your manager align on.",
      icon: "👔",
      color: "bg-pink-100",
      iconColor: "text-pink-600",
    },
    {
      title: "Daily Standup Notes",
      description: "Keep track of blockers and your team's upcoming tasks.",
      icon: "⏰",
      color: "bg-cyan-100",
      iconColor: "text-cyan-600",
    },
    {
      title: "Business Review Notes",
      description: "Assess customer satisfaction and identify areas for improvement.",
      icon: "💼",
      color: "bg-violet-100",
      iconColor: "text-violet-600",
    },
    {
      title: "Project Meeting Notes",
      description: "Identify bottlenecks in project execution and streamline progress.",
      icon: "📋",
      color: "bg-red-100",
      iconColor: "text-red-600",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {meetingTypes.map((type, index) => (
            <Card 
              key={type.title}
              className="bg-white shadow-lg card-hover border-0"
              data-testid={`meeting-type-${index}`}
            >
              <CardContent className="p-8">
                <div className={`w-16 h-16 ${type.color} rounded-xl flex items-center justify-center mb-6`}>
                  <span className="text-2xl">{type.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {type.title}
                </h3>
                <p className="text-gray-600">
                  {type.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
