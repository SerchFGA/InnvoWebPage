'use client';

import { useTranslation } from '@/contexts/language-context';
import Link from 'next/link';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-[#1C3C5E] text-white p-4 mt-auto">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between text-sm">
        <div className="mb-4 md:mb-0">
          <p>&copy; {new Date().getFullYear()} PixanAI. {t('footerAllRightsReserved')}</p>
        </div>
        <nav className="flex gap-4 md:gap-6 mb-4 md:mb-0">
          <Link href="#" className="hover:text-primary transition-colors">{t('footerPrivacyPolicy')}</Link>
          <Link href="#" className="hover:text-primary transition-colors">{t('footerTerms')}</Link>
          <Link href="#" className="hover:text-primary transition-colors">{t('footerAccessibility')}</Link>
        </nav>
        <div>
          <p>{t('footerPoweredBy')} <a href="https://pixan.ai" target="_blank" rel="noopener noreferrer" className="font-bold hover:text-primary transition-colors">PixanAI</a></p>
        </div>
      </div>
    </footer>
  );
}
