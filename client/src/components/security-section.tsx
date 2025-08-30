import { Shield, TrendingUp, Code, Search, ClipboardCheck } from "lucide-react";

export function SecuritySection() {
  const securityFeatures = [
    {
      icon: Shield,
      text: "256-bit AES and 256-bit SSL/TLS encryption",
    },
    {
      icon: TrendingUp,
      text: "Security logging, uptime monitoring, and system availability metrics",
    },
    {
      icon: Code,
      text: "Coding practices based on the OWASP Top Ten",
    },
    {
      icon: Search,
      text: "Penetration tests by security experts",
    },
    {
      icon: ClipboardCheck,
      text: "Regular impact assessments",
    },
  ];

  const certifications = [
    {
      title: "SOC 2 Type II",
      description: "Service Organization Control Report",
      icon: "🏆",
      color: "bg-blue-600",
    },
    {
      title: "HIPAA BAA",
      description: "Business Associate Agreement for HIPAA Compliance",
      icon: "🏥",
      color: "bg-green-600",
    },
    {
      title: "GDPR",
      description: "General Data Protection Regulation",
      icon: "🛡️",
      color: "bg-purple-600",
    },
    {
      title: "HIPAA Healthcare",
      description: "HIPAA for healthcare organizations",
      icon: "⚕️",
      color: "bg-red-600",
    },
  ];

  return (
    <section className="py-20 hero-gradient relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6" data-testid="security-title">
            Enterprise grade security
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto" data-testid="security-subtitle">
            Security and customer privacy is our priority at every step of the engineering process
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <ul className="space-y-6 text-gray-300">
              {securityFeatures.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <li key={index} className="flex items-start space-x-3" data-testid={`security-feature-${index}`}>
                    <IconComponent className="h-5 w-5 text-green-400 mt-1 flex-shrink-0" />
                    <span>{feature.text}</span>
                  </li>
                );
              })}
            </ul>
          </div>
          
          <div>
            <img 
              src="https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&h=700" 
              alt="Corporate team meeting in a secure boardroom environment" 
              className="rounded-2xl shadow-2xl w-full h-auto"
              data-testid="security-image"
            />
          </div>
        </div>
        
        {/* Compliance Badges */}
        <div className="grid md:grid-cols-4 gap-8 text-center">
          {certifications.map((cert, index) => (
            <div 
              key={cert.title}
              className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 rounded-xl"
              data-testid={`certification-${index}`}
            >
              <div className={`w-16 h-16 ${cert.color} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                <span className="text-2xl">{cert.icon}</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{cert.title}</h3>
              <p className="text-gray-300 text-sm">{cert.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
