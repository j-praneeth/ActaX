import { Button } from "@/components/ui/button";

export function FinalCtaSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-purple-600 to-blue-600 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mx-auto mb-8">
          <span className="text-purple-600 font-bold text-xl">A</span>
        </div>
        
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6" data-testid="final-cta-title">
          Ready To See Acta Agent In Action ?
        </h2>
        
        <p className="text-xl text-gray-100 mb-12" data-testid="final-cta-subtitle">
          Claim your free trial or book a free demo
        </p>
        
        <Button 
          size="lg"
          className="bg-white text-purple-600 hover:shadow-2xl transition-all transform hover:scale-105"
          data-testid="book-demo-button"
        >
          Book A Demo
        </Button>
      </div>
    </section>
  );
}
