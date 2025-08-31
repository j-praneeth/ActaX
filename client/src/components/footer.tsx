import { Link } from "wouter";

export function Footer() {
  const footerSections = [
    {
      title: "Product",
      links: [
        { name: "Features", href: "#" },
        { name: "Pricing", href: "#" },
        { name: "Integrations", href: "#" },
        { name: "API", href: "#" },
      ],
    },
    {
      title: "Resources",
      links: [
        { name: "Blog", href: "#" },
        { name: "Support Center", href: "#" },
        { name: "Webinars", href: "#" },
        { name: "Partners", href: "#" },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About Us", href: "#" },
        { name: "Careers", href: "#" },
        { name: "Press", href: "#" },
        { name: "Contact Us", href: "#" },
      ],
    },
    {
      title: "Legal",
      links: [
        { name: "Privacy Policy", href: "#" },
        { name: "Terms of Service", href: "#" },
        { name: "GDPR Compliance", href: "#" },
      ],
    },
  ];

  return (
    <footer className="bg-white border-t border-gray-200 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-5 gap-8">
          <div>
            <Link href="/" data-testid="footer-logo">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <span className="text-xl font-bold text-gray-900">ActaX</span>
              </div>
            </Link>
          </div>
          
          {footerSections.map((section, index) => (
            <div key={section.title}>
              <h3 className="font-semibold mb-4 text-gray-900" data-testid={`footer-section-${index}`}>
                {section.title}
              </h3>
              <ul className="space-y-2 text-gray-600">
                {section.links.map((link, linkIndex) => (
                  <li key={link.name}>
                    <a 
                      href={link.href} 
                      className="hover:text-gray-900 transition-colors"
                      data-testid={`footer-link-${index}-${linkIndex}`}
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="border-t border-gray-200 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">A</span>
            </div>
            <p className="text-gray-600" data-testid="footer-copyright">&copy; 2024 ActaX. All rights reserved.</p>
          </div>
          
          <div className="flex space-x-4">
            <a 
              href="#" 
              className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center hover:bg-gray-200 transition-colors"
              data-testid="footer-facebook"
            >
              <span className="text-sm">f</span>
            </a>
            <a 
              href="#" 
              className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center hover:bg-gray-200 transition-colors"
              data-testid="footer-twitter"
            >
              <span className="text-sm">t</span>
            </a>
            <a 
              href="#" 
              className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center hover:bg-gray-200 transition-colors"
              data-testid="footer-linkedin"
            >
              <span className="text-sm">in</span>
            </a>
            <a 
              href="#" 
              className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center hover:bg-gray-200 transition-colors"
              data-testid="footer-instagram"
            >
              <span className="text-sm">ig</span>
            </a>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            Made with <span className="text-purple-600 font-bold">Visily</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
