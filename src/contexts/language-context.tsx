'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';
import { translations, TranslationKey, InterpolationData } from '@/lib/i18n';

type Language = 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, data?: InterpolationData) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('es');

  const t = (key: TranslationKey, data?: InterpolationData) => {
    let text = translations[language][key] || translations['en'][key];
    if (data) {
      Object.entries(data).forEach(([dataKey, value]) => {
        text = text.replace(`{{${dataKey}}}`, String(value));
      });
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
