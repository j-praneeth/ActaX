export function BrandsSection() {
  const brands = [
    "Density", "Monyx", "EnrichMoney", "EduHubspot", "Niyom", "FabAlley", 
    "Revinate", "Clarivate", "BITS Pilani", "Webiks", "Expertia", "Paddle", "Informa"
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" data-testid="brands-title">
            Trusted by Leading Organizations
          </h2>
          <p className="text-xl text-gray-600" data-testid="brands-subtitle">
            Join hundreds of innovative companies transforming their meetings with Acta
          </p>
        </div>
        
        {/* Animated Brand Logos */}
        <div className="relative overflow-hidden">
          <div className="flex animate-slide space-x-12 w-max">
            {/* First set of brands */}
            <div className="flex items-center space-x-12">
              {brands.map((brand, index) => (
                <div 
                  key={`${brand}-1`}
                  className="w-32 h-16 bg-gray-100 rounded-lg flex items-center justify-center"
                  data-testid={`brand-logo-${index}`}
                >
                  <span className="text-gray-600 font-semibold text-sm">{brand}</span>
                </div>
              ))}
            </div>
            {/* Duplicate set for seamless animation */}
            <div className="flex items-center space-x-12">
              {brands.map((brand, index) => (
                <div 
                  key={`${brand}-2`}
                  className="w-32 h-16 bg-gray-100 rounded-lg flex items-center justify-center"
                  data-testid={`brand-logo-duplicate-${index}`}
                >
                  <span className="text-gray-600 font-semibold text-sm">{brand}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
