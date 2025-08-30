import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function FaqSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: "How does Acta.ai protect our meeting data in transit and at rest?",
      answer: "Acta.ai uses 256-bit AES encryption for data at rest and 256-bit SSL/TLS encryption for data in transit. All data is stored in secure, SOC 2 compliant data centers with multiple layers of security protection.",
    },
    {
      question: "Who can access our data, and can we control or restrict access ourselves?",
      answer: "Only authorized personnel within your organization can access your meeting data. Acta.ai provides comprehensive access controls and role-based permissions to help you manage who can view, edit, or share meeting content.",
    },
    {
      question: "Is Acta.ai compliant with regulations like GDPR, HIPAA, and SOC 2?",
      answer: "Yes, Acta.ai is fully compliant with GDPR, HIPAA, and SOC 2 Type II standards. We undergo regular security audits and maintain all necessary certifications to ensure your data protection requirements are met.",
    },
    {
      question: "Does Acta.ai use our meeting data to train AI models? How is privacy maintained?",
      answer: "No, Acta.ai does not use your meeting data to train AI models. Your data remains private and is only used to provide you with meeting insights and summaries. We maintain strict data privacy protocols.",
    },
    {
      question: "Where is our data stored, and can we choose the storage location?",
      answer: "Data is stored in secure cloud infrastructure with options for regional data residency. Enterprise customers can choose their preferred data storage location to meet compliance requirements.",
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
            Frequently asked questions
          </h2>
          <p className="text-xl text-gray-600" data-testid="faq-subtitle">
            Can't find the answer you're looking for? Reach out to our{' '}
            <a href="#" className="text-purple-600 hover:text-purple-700 underline">
              customer support
            </a>
            {' '}team.
          </p>
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
