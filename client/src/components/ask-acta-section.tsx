import { Check, TrendingUp, Users, UserCheck } from "lucide-react";

export function AskActaSection() {
  const features = [
    {
      title: "Track Decisions",
      description: "Ask Acta to summarize the key decisions made during the meeting.",
      icon: Check,
      color: "bg-purple-600",
    },
    {
      title: "Monitor Deals",
      description: "Ask Acta to check if any Finance deals were finalized during the call.",
      icon: TrendingUp,
      color: "bg-blue-600",
    },
    {
      title: "Review Contributions",
      description: "Ask Acta to provide insights on Mark's contributions during the meeting.",
      icon: Users,
      color: "bg-indigo-600",
    },
    {
      title: "Evaluate Candidates",
      description: "Ask Acta if the candidate can proceed to the technical interview stage.",
      icon: UserCheck,
      color: "bg-green-600",
    },
  ];

  return (
    <section className="py-20 hero-gradient relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6" data-testid="ask-acta-title">
              Ask Acta Agent
            </h2>
            <p className="text-xl text-gray-300 mb-8" data-testid="ask-acta-subtitle">
              Get instant insights from your meeting conversations. Ask Acta to help you track key decisions, tasks, and contributions from your meetings with ease.
            </p>
            
            <div className="space-y-6">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div 
                    key={feature.title}
                    className="flex items-start space-x-4"
                    data-testid={`ask-acta-feature-${index}`}
                  >
                    <div className={`w-8 h-8 ${feature.color} rounded-full flex items-center justify-center flex-shrink-0 mt-1`}>
                      <IconComponent className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-300">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div>
            <img 
              src="https://images.unsplash.com/photo-1642790106117-e829e14a795f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&h=700" 
              alt="AI-powered business dashboard with analytics" 
              className="rounded-2xl shadow-2xl w-full h-auto"
              data-testid="ask-acta-image"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
