import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function FaqSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: "What is ActaX and how can it help my team?",
      answer: "ActaX is an AI-powered meeting intelligence platform that automatically transcribes, summarizes, and extracts actionable insights from your meetings. It helps teams stay organized, track action items, and make meetings more productive.",
    },
    {
      question: "What languages does ActaX support?",
      answer: "ActaX supports over 50 languages, ensuring that teams can collaborate effectively regardless of their native language. The platform provides real-time translation and multilingual normalization features.",
    },
    {
      question: "Can ActaX integrate with my existing tools?",
      answer: "Yes, ActaX integrates seamlessly with popular tools like Jira, Asana, Trello, Slack, Microsoft Teams, Google Meet, and many others. This allows you to create tasks and tickets directly from meeting discussions.",
    },
    {
      question: "How secure is my data with ActaX?",
      answer: "ActaX takes security seriously. We use AES-256 encryption for data at rest, OAuth 2.0 authentication, and are GDPR compliant and SOC2 certified. Your data is protected with industry-leading security standards.",
    },
  ];

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6" data-testid="faq-title">
            Frequently Asked Questions
          </h2>
        </div>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-gray-200 rounded-lg" data-testid={`faq-item-${index}`}>
              <button
                className="w-full text-left p-6 hover:bg-gray-50 transition-colors"
                onClick={() => toggleFaq(index)}
                data-testid={`faq-toggle-${index}`}
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {faq.question}
                  </h3>
                  <ChevronDown 
                    className={`h-5 w-5 text-gray-500 transform transition-transform ${
                      openFaq === index ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>
              {openFaq === index && (
                <div className="p-6 pt-0 text-gray-600" data-testid={`faq-content-${index}`}>
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
