import { createContext, useContext, useState } from 'react';

type Language = 'original' | 'english';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  original: {
    'hero.title': 'Go beyond meeting notes with Acta Agents',
    'hero.subtitle': 'Acta Agents understand the context, and transform conversations into structured, actionable insights — PRDs, follow-ups, reports, deal summaries, even technical breakdowns.',
    'nav.agents': 'Agents',
    'nav.mobile_apps': 'Mobile Apps',
    'nav.chrome_extension': 'Chrome Extension',
    'nav.tools': 'Tools',
    'nav.resources': 'Resources',
    'button.request_demo': 'Request Demo',
    'button.get_started_free': 'Get Started for Free',
    'button.login': 'Login',
  },
  english: {
    'hero.title': 'Go beyond meeting notes with Acta Agents',
    'hero.subtitle': 'Acta Agents understand the context, and transform conversations into structured, actionable insights — PRDs, follow-ups, reports, deal summaries, even technical breakdowns.',
    'nav.agents': 'Agents',
    'nav.mobile_apps': 'Mobile Apps',
    'nav.chrome_extension': 'Chrome Extension',
    'nav.tools': 'Tools',
    'nav.resources': 'Resources',
    'button.request_demo': 'Request Demo',
    'button.get_started_free': 'Get Started for Free',
    'button.login': 'Login',
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('original');

  const toggleLanguage = () => {
    setLanguage(language === 'original' ? 'english' : 'original');
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.original] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
