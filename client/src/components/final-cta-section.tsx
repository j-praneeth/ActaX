import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function FinalCtaSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6" data-testid="final-cta-title">
          Ready to Transform Your Meetings?
        </h2>
        
        <p className="text-xl text-gray-600 mb-12" data-testid="final-cta-subtitle">
          Join thousands of teams who are already leveraging ActaX to make their meetings more efficient and effective.
        </p>
        
        <Link href="/signup">
          <Button 
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
            data-testid="get-started-button"
          >
            Get Started for Free
          </Button>
        </Link>
      </div>
    </section>
  );
}
