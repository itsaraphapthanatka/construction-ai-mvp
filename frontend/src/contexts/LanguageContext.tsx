'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { en } from '../locales/en';
import { th } from '../locales/th';

type Language = 'en' | 'th';
type Dictionary = typeof en;

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string, params?: Record<string, string | number>) => any;
    dict: Dictionary;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const dictionaries = {
    en,
    th
};

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>('en');
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        // Load saved language on mount
        const savedLang = localStorage.getItem('app_language') as Language;
        if (savedLang && (savedLang === 'en' || savedLang === 'th')) {
            setLanguageState(savedLang);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('app_language', lang);
    };

    // Helper function to resolve dot-notation keys
    const getNestedValue = (obj: any, path: string) => {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    };

    const t = (key: string, params?: Record<string, string | number>) => {
        const dict = dictionaries[language];
        let value = getNestedValue(dict, key);

        // Fallback to English if key missing in Thai
        if (value === undefined && language !== 'en') {
            value = getNestedValue(dictionaries['en'], key);
        }

        if (value === undefined) {
            console.warn(`Translation key missing: ${key}`);
            return key;
        }

        // Replace parameters if any, e.g. "Across {count} developments"
        if (params && typeof value === 'string') {
            let templatedValue = value;
            Object.entries(params).forEach(([k, v]) => {
                templatedValue = templatedValue.replace(`{${k}}`, String(v));
            });
            return templatedValue;
        }

        return value;
    };

    // Avoid hydration mismatch by waiting for client load, though context provider can still render
    // Instead of null, we return the children directly to allow server render but keys might flash
    // since `isClient` is tracked, we'll just deal with it normally or return standard strings.

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, dict: dictionaries[language] }}>
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
