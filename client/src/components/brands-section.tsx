export function BrandsSection() {
  const brands = [
    "Atlassian", "Slack", "Microsoft", "Google", "Zoom", "Notion", 
    "Linear", "Jira", "Trello", "Asana", "Monday", "HubSpot"
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-sm text-gray-600 mb-8" data-testid="brands-subtitle">
            Trusted by leading organizations worldwide.
          </p>
        </div>
        
        {/* Brand Logos */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center justify-items-center">
          {brands.map((brand, index) => (
            <div 
              key={brand}
              className="w-24 h-12 bg-gray-100 rounded flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity"
              data-testid={`brand-logo-${index}`}
            >
              <span className="text-gray-600 font-semibold text-xs">{brand}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
