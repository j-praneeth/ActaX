import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useState } from "react";

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      name: "Free",
      price: "₹0",
      period: "per seat/year",
      features: [
        "Unlimited recordings",
        "Unlimited transcriptions",
        "Unlimited meeting duration",
      ],
      buttonText: "Current Plan",
      buttonVariant: "outline" as const,
      highlighted: false,
    },
    {
      name: "Pro",
      price: "₹888",
      period: "per seat/month",
      subtitle: "Billed annually at ₹10,656 💰 Save 11%",
      features: [
        "Unlimited recordings",
        "Unlimited transcriptions",
        "Unlimited meeting duration",
        "Email notifications",
        "Download reports",
        "Chat feature",
        "Consolidation",
        "Integrations",
        "Agents",
      ],
      buttonText: "Buy this plan",
      buttonVariant: "default" as const,
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "Let's Talk",
      period: "",
      features: [
        "Unlimited recordings",
        "Unlimited transcriptions",
        "Unlimited meeting duration",
        "Email notifications",
        "Download reports",
        "Chat feature",
        "Consolidation",
        "Integrations",
        "Agents",
        "API support",
        "White label",
        "On-premises deployment",
      ],
      buttonText: "Let's talk",
      buttonVariant: "outline" as const,
      highlighted: false,
    },
  ];

  return (
    <section className="py-20 hero-gradient relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6" data-testid="pricing-title">
            Monetize meetings with Acta Agent
          </h2>
          
          {/* Pricing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-12">
            <span className={`text-gray-300 ${!isAnnual ? 'text-white font-semibold' : ''}`}>
              Monthly
            </span>
            <button 
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-white/20 transition-colors"
              onClick={() => setIsAnnual(!isAnnual)}
              data-testid="pricing-toggle"
            >
              <span 
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isAnnual ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-gray-300 ${isAnnual ? 'text-white font-semibold' : ''}`}>
              Annually
            </span>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card 
              key={plan.name}
              className={`${
                plan.highlighted 
                  ? 'bg-gradient-to-br from-purple-600 to-blue-600 transform scale-105 border-2 border-white/30' 
                  : 'bg-white/10 backdrop-blur-sm border border-white/20'
              } relative`}
              data-testid={`pricing-plan-${index}`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-4">{plan.name}</h3>
                  <div className="text-4xl font-bold text-white mb-2">{plan.price}</div>
                  {plan.period && <p className={plan.highlighted ? "text-gray-100" : "text-gray-300"}>{plan.period}</p>}
                  {plan.subtitle && <p className="text-sm text-gray-200 mt-1">{plan.subtitle}</p>}
                </div>
                
                <Button 
                  variant={plan.buttonVariant}
                  className={`w-full mb-8 ${
                    plan.highlighted 
                      ? 'bg-white text-purple-600 hover:bg-gray-100' 
                      : 'bg-white/20 text-white border-white/30 hover:bg-white/30'
                  }`}
                  data-testid={`pricing-button-${index}`}
                >
                  {plan.buttonText}
                </Button>
                
                <ul className={`space-y-4 ${plan.highlighted ? 'text-gray-100' : 'text-gray-300'}`}>
                  {plan.features.map((feature, featureIndex) => (
                    <li key={feature} className="flex items-center" data-testid={`feature-${index}-${featureIndex}`}>
                      <Check className={`h-4 w-4 mr-3 ${plan.highlighted ? 'text-green-300' : 'text-green-400'}`} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
