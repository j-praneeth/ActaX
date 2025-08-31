import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useState } from "react";

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: "Basic",
      price: "$0",
      period: "",
      description: "Perfect for individuals & small teams to try ActaX.",
      features: [
        "Limited transcription",
        "Basic storage",
        "Community support",
        "Email support",
      ],
      buttonText: "Get Started for Free",
      buttonVariant: "outline" as const,
      highlighted: false,
    },
    {
      name: "Pro",
      price: "$49/month",
      period: "",
      description: "Advanced features for growing teams & power users.",
      features: [
        "Unlimited meetings",
        "AI-powered summaries",
        "CRM & PM integrations",
        "Priority support",
        "AI business insights",
      ],
      buttonText: "Start Your Free Trial",
      buttonVariant: "default" as const,
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "Contact Sales",
      period: "",
      description: "Tailored solutions for large organizations with custom needs.",
      features: [
        "All Pro features",
        "Dedicated account manager",
        "Custom integrations",
        "Enhanced security features",
        "Scale & compliance",
        "VIP premium support",
      ],
      buttonText: "Contact Us",
      buttonVariant: "outline" as const,
      highlighted: false,
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6" data-testid="pricing-title">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Choose the plan that's right for your team, from free trials to enterprise-grade solutions.
          </p>
          
          {/* Pricing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-12">
            <span className={`text-gray-600 ${!isAnnual ? 'text-blue-600 font-semibold' : ''}`}>
              Monthly
            </span>
            <button 
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors"
              onClick={() => setIsAnnual(!isAnnual)}
              data-testid="pricing-toggle"
            >
              <span 
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isAnnual ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-gray-600 ${isAnnual ? 'text-blue-600 font-semibold' : ''}`}>
              Annually (Save 20%)
            </span>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card 
              key={plan.name}
              className={`${
                plan.highlighted 
                  ? 'border-2 border-pink-500 transform scale-105' 
                  : 'border border-gray-200'
              } relative`}
              data-testid={`pricing-plan-${index}`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{plan.name}</h3>
                  <div className="text-4xl font-bold text-gray-900 mb-2">{plan.price}</div>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                </div>
                
                <Button 
                  variant={plan.buttonVariant}
                  className={`w-full mb-8 ${
                    plan.highlighted 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  data-testid={`pricing-button-${index}`}
                >
                  {plan.buttonText}
                </Button>
                
                <ul className="space-y-4 text-gray-600">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={feature} className="flex items-center" data-testid={`feature-${index}-${featureIndex}`}>
                      <Check className="h-4 w-4 mr-3 text-green-500" />
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
