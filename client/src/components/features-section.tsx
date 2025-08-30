export function FeaturesSection() {
  const features = [
    { name: "Executive Summary", color: "purple", description: "Comprehensive meeting overviews" },
    { name: "Key Topics", color: "blue", description: "Automatic topic identification" },
    { name: "Action Points", color: "indigo", description: "Actionable next steps" },
    { name: "Ask ACTA", color: "purple", description: "AI-powered insights" },
    { name: "Questions & Answers", color: "cyan", description: "Meeting Q&A tracking" },
    { name: "Transcript", color: "blue", description: "Full conversation records" },
    { name: "Decisions", color: "green", description: "Decision tracking" },
    { name: "Takeaways", color: "orange", description: "Key insights extraction" },
    { name: "Sentiment", color: "pink", description: "Meeting mood analysis" },
    { name: "Reports", color: "violet", description: "Detailed analytics" },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <img 
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&h=700" 
              alt="Modern meeting room with digital displays" 
              className="rounded-2xl shadow-2xl w-full h-auto"
              data-testid="features-main-image"
            />
          </div>
          <div>
            <div className="grid grid-cols-2 gap-4 text-center">
              {features.map((feature, index) => (
                <div 
                  key={feature.name}
                  className={`bg-${feature.color}-50 p-6 rounded-xl card-hover`}
                  data-testid={`feature-card-${index}`}
                >
                  <h3 className={`font-semibold text-${feature.color}-900 mb-2`}>
                    {feature.name}
                  </h3>
                  <p className={`text-sm text-${feature.color}-700`}>
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
