import { Link } from "wouter";

export function Footer() {
  const footerSections = [
    {
      title: "Product",
      links: [
        { name: "Agents", href: "#" },
        { name: "Mobile Apps", href: "#" },
        { name: "Chrome Extension", href: "#" },
        { name: "Integrations", href: "#" },
      ],
    },
    {
      title: "Resources",
      links: [
        { name: "Documentation", href: "#" },
        { name: "Support", href: "#" },
        { name: "Privacy Policy", href: "#" },
        { name: "Terms of Service", href: "#" },
      ],
    },
  ];

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <Link href="/" data-testid="footer-logo">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <span className="text-xl font-bold">Acta</span>
              </div>
            </Link>
            <p className="text-gray-400 mb-4" data-testid="footer-description">
              AI-powered meeting assistant that transforms conversations into actionable insights.
            </p>
          </div>
          
          {footerSections.map((section, index) => (
            <div key={section.title}>
              <h3 className="font-semibold mb-4" data-testid={`footer-section-${index}`}>
                {section.title}
              </h3>
              <ul className="space-y-2 text-gray-400">
                {section.links.map((link, linkIndex) => (
                  <li key={link.name}>
                    <a 
                      href={link.href} 
                      className="hover:text-white transition-colors"
                      data-testid={`footer-link-${index}-${linkIndex}`}
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          
          <div>
            <h3 className="font-semibold mb-4" data-testid="footer-connect-title">Connect</h3>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
                data-testid="footer-twitter"
              >
                <span className="text-xl">🐦</span>
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
                data-testid="footer-linkedin"
              >
                <span className="text-xl">💼</span>
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
                data-testid="footer-github"
              >
                <span className="text-xl">🐙</span>
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p data-testid="footer-copyright">&copy; 2024 Acta AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
