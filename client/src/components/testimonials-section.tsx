import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

export function TestimonialsSection() {
  const testimonials = [
    {
      quote: "The automatic transcription is spot on, and the instant summaries save us so much time. It's a must-have tool for anyone looking to streamline their meetings!",
      author: "Sophia G",
      initials: "SG",
      color: "bg-purple-600",
      cardColor: "from-purple-50 to-purple-100",
    },
    {
      quote: "Acta has simplified our team meetings tremendously. Its AI-driven transcription and note-taking are invaluable for staying organized and tracking action items efficiently!",
      author: "John M",
      initials: "JM",
      color: "bg-blue-600",
      cardColor: "from-blue-50 to-blue-100",
    },
    {
      quote: "The automated meeting summaries save us so much time! Our team can focus on strategy without worrying about missing details. Acta is a game-changer for any fast-paced business",
      author: "Sarah L",
      initials: "SL",
      color: "bg-green-600",
      cardColor: "from-green-50 to-green-100",
    },
    {
      quote: "Acta has transformed how our meetings are documented. With automated summaries and action points, we're always on top of our tasks. It's easy to use and reliable—highly recommend it!",
      author: "Liam R",
      initials: "LR",
      color: "bg-orange-600",
      cardColor: "from-orange-50 to-orange-100",
    },
    {
      quote: "I've never been this organized with meeting notes before. Acta makes note-taking seamless and gives me the flexibility to focus fully on brainstorming sessions",
      author: "Aisha B",
      initials: "AB",
      color: "bg-pink-600",
      cardColor: "from-pink-50 to-pink-100",
    },
    {
      quote: "As a tech team, accurate meeting records are critical, and Acta delivers. From summarizing discussions to organizing action points, it's the perfect tool for productivity.",
      author: "David S",
      initials: "DS",
      color: "bg-indigo-600",
      cardColor: "from-indigo-50 to-indigo-100",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6" data-testid="testimonials-title">
            Testimonials
          </h2>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={testimonial.author}
              className={`bg-gradient-to-br ${testimonial.cardColor} card-hover border-0`}
              data-testid={`testimonial-${index}`}
            >
              <CardContent className="p-8">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 ${testimonial.color} rounded-full flex items-center justify-center`}>
                    <span className="text-white font-semibold">{testimonial.initials}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.author}</h4>
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
