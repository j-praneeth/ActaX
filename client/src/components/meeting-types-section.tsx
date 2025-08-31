import { Check } from "lucide-react";

export function MeetingTypesSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Multilingual Normalization
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ensure all team members, regardless of their native language, can easily understand and contribute to meeting discussions with intelligent language processing and translation.
          </p>
        </div>
        
        <div className="flex justify-center">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Check className="h-5 w-5 text-green-500" />
              <span className="text-gray-700">Real-time translation</span>
            </div>
            <div className="flex items-center space-x-3">
              <Check className="h-5 w-5 text-green-500" />
              <span className="text-gray-700">Combine knowledge from various languages</span>
            </div>
            <div className="flex items-center space-x-3">
              <Check className="h-5 w-5 text-green-500" />
              <span className="text-gray-700">Global team collaboration made easy</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
