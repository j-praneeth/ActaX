import { Card, CardContent } from "@/components/ui/card";

export function TestimonialsSection() {
  const testimonials = [
    {
      quote: "ActaX has revolutionized how our team conducts meetings. Summaries are spot-on, and action items are never missed. It's a game-changer for our remote team.",
      author: "Jason Chen",
      title: "COO, Proto Innovations",
      initials: "JC",
    },
    {
      quote: "The multilingual translation is incredible! Our international collaborations are smoother than ever, breaking down language barriers effortlessly.",
      author: "David Lee",
      title: "Head of Product, Global Solutions",
      initials: "DL",
    },
    {
      quote: "I'm amazed at how well ActaX integrated with our existing tools. Assigning tasks from a meeting directly to Jira saves us so much time!",
      author: "Emily White",
      title: "Product Manager, Creative Minds",
      initials: "EW",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6" data-testid="testimonials-title">
            What Our Users Say
          </h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={testimonial.author}
              className="bg-white border border-gray-200 hover:shadow-lg transition-shadow"
              data-testid={`testimonial-${index}`}
            >
              <CardContent className="p-8">
                <p className="text-gray-700 mb-6 italic">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 font-semibold text-sm">{testimonial.initials}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.author}</h4>
                    <p className="text-sm text-gray-600">{testimonial.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
