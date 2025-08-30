export function WhyActaSection() {
  const features = [
    {
      title: "Role-Aware Intelligence",
      description: "Whether you're in PM, Sales, HR, or any other function, Acta AI adapts to your unique needs.",
    },
    {
      title: "Beyond Note-Taking",
      description: "We don't just record discussions — we power execution by capturing tasks and follow-ups live, not afterward.",
    },
    {
      title: "Structured Outcomes",
      description: "Transform conversations into clear, role-specific deliverables — PRDs for PMs, pipelines for Sales, hire plans for HR, and more.",
    },
    {
      title: "Deep Workflow Integration",
      description: "Seamlessly link with Jira, Notion, and the tools you already use — no extra steps required.",
    },
  ];

  return (
    <section className="py-20 hero-gradient relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 right-20 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6" data-testid="why-acta-title">
            Why Acta Agent?
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto" data-testid="why-acta-subtitle">
            Imagine turning every meeting into real action — instantly and automatically.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 rounded-xl"
                data-testid={`why-acta-feature-${index}`}
              >
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
          
          <div>
            <img 
              src="https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&h=700" 
              alt="AI technology interface and analytics" 
              className="rounded-2xl shadow-2xl w-full h-auto"
              data-testid="why-acta-image"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
