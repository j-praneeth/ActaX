import { Lock, Key, Shield, Cloud } from "lucide-react";

export function SecuritySection() {
  const securityFeatures = [
    {
      icon: Lock,
      title: "AES-256 Encryption",
      description: "All your data, both in transit and at rest, is protected with industry-leading encryption standards.",
    },
    {
      icon: Key,
      title: "OAuth 2.0 Authentication",
      description: "Secure access control through industry-standard OAuth 2.0, ensuring only authorized users can access your data.",
    },
    {
      icon: Shield,
      title: "GDPR Compliant",
      description: "We adhere to strict General Data Protection Regulation (GDPR) standards to keep your data private.",
    },
    {
      icon: Cloud,
      title: "SOC2 Certified",
      description: "Our business processes are audited and certified to meet SOC2 security standards.",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6" data-testid="security-title">
            Your Data is Secure
          </h2>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {securityFeatures.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div 
                key={feature.title}
                className="text-center"
                data-testid={`security-feature-${index}`}
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
