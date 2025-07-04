'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/contexts/language-context';

export function Header() {
  const { language, setLanguage } = useTranslation();

  const handleLanguageChange = (checked: boolean) => {
    setLanguage(checked ? 'es' : 'en');
  };

  return (
    <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto flex items-center justify-between p-4">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/assets/LogoInnvo.png" alt="Innvo Logo" width={40} height={40} />
          <span className="font-bold text-xl text-foreground">Agendamiento Innvo</span>
        </Link>
        <div className="flex items-center space-x-2">
          <Label htmlFor="language-switch" className={language === 'en' ? 'font-bold' : ''}>
            EN
          </Label>
          <Switch
            id="language-switch"
            checked={language === 'es'}
            onCheckedChange={handleLanguageChange}
            aria-label="Language switcher"
          />
          <Label htmlFor="language-switch" className={language === 'es' ? 'font-bold' : ''}>
            ES
          </Label>
        </div>
      </div>
    </header>
  );
}
