import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";

export function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      data-testid="language-toggle"
      className="text-sm"
    >
      {language === 'original' ? 'Original' : 'English'} ↔ {language === 'original' ? 'English' : 'Original'}
    </Button>
  );
}
