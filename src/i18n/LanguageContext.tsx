import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';
import { translations, mealPeriodNames } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.kk;
  getMealName: (meal: keyof typeof mealPeriodNames.kk) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('bil_language') as Language;
    return saved && (saved === 'kk' || saved === 'ru' || saved === 'en') ? saved : 'kk';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('bil_language', lang);
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = translations[language] || translations.kk;

  const getMealName = (meal: keyof typeof mealPeriodNames.kk) => {
    return mealPeriodNames[language][meal] || mealPeriodNames.kk[meal];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, getMealName }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
