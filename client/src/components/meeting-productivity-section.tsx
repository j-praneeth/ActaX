import { Check } from "lucide-react";

export function MeetingProductivitySection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Boost Your Productivity
          </h2>
        </div>
        
        <div className="space-y-20">
          {/* Instant Meeting Summaries */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">Instant Meeting Summaries</h3>
              <p className="text-lg text-gray-600 mb-8">
                Leverage AI to automatically condense lengthy discussions into brief, actionable summaries, saving hours of review time and ensuring no detail is missed.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Key takeaways highlighted</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Customizable summary length</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Few-word answers</span>
                </div>
              </div>
            </div>
            <div>
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="bg-gray-700 rounded p-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">🔔</span>
                    </div>
                    <div>
                      <div className="h-2 bg-gray-300 rounded w-24 mb-1"></div>
                      <div className="h-1 bg-gray-400 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-gray-300 rounded w-full"></div>
                    <div className="h-2 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-2 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Seamless Task & Ticket Creation */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="space-y-4">
                  <div className="bg-gray-700 rounded p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="h-2 bg-gray-300 rounded w-32"></div>
                      <div className="h-2 bg-gray-300 rounded w-16"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 bg-gray-300 rounded w-full"></div>
                      <div className="h-2 bg-gray-300 rounded w-2/3"></div>
                    </div>
                  </div>
                  <div className="bg-gray-700 rounded p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="h-2 bg-gray-300 rounded w-28"></div>
                      <div className="h-2 bg-gray-300 rounded w-20"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 bg-gray-300 rounded w-full"></div>
                      <div className="h-2 bg-gray-300 rounded w-3/4"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">Seamless Task & Ticket Creation</h3>
              <p className="text-lg text-gray-600 mb-8">
                Transform discussions into tasks or tickets directly within your meeting notes, integrating with your favorite project management tools for streamlined workflows.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Direct integration with Jira, Asana, Trello</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Automated task creation</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Advanced workflows</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
