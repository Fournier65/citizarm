import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Language = "fr" | "en" | "it" | "de" | "es";

const STORAGE_KEY = "citizarm-language";
const supported: Language[] = ["fr", "en", "it", "de", "es"];

const pageMetadata: Record<Language, { title: string; description: string; locale: string }> = {
  fr: {
    title: "CitiZarm - Armer les esprits pour la démocratie",
    description: "CitiZarm développe des outils numériques innovants pour renforcer la démocratie directe et permettre à chaque citoyen de s'exprimer.",
    locale: "fr_FR",
  },
  en: {
    title: "CitiZarm - Empowering minds for democracy",
    description: "CitiZarm develops innovative digital tools to strengthen direct democracy and help every citizen make their voice heard.",
    locale: "en_GB",
  },
  it: {
    title: "CitiZarm - Formare le menti per la democrazia",
    description: "CitiZarm sviluppa strumenti digitali innovativi per rafforzare la democrazia diretta e dare voce a ogni cittadino.",
    locale: "it_IT",
  },
  de: {
    title: "CitiZarm - Den Geist für die Demokratie stärken",
    description: "CitiZarm entwickelt innovative digitale Werkzeuge, um die direkte Demokratie zu stärken und allen Bürgern eine Stimme zu geben.",
    locale: "de_DE",
  },
  es: {
    title: "CitiZarm - Preparar las mentes para la democracia",
    description: "CitiZarm desarrolla herramientas digitales innovadoras para fortalecer la democracia directa y dar voz a cada ciudadano.",
    locale: "es_ES",
  },
};

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function initialLanguage(): Language {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (supported.includes(saved as Language)) return saved as Language;
  } catch {
    // Private browsing may prevent local storage. French remains the default.
  }
  return "fr";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(initialLanguage);

  useEffect(() => {
    document.documentElement.lang = language;
    const metadata = pageMetadata[language];
    document.title = metadata.title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", metadata.description);
    document.querySelector('meta[property="og:title"]')?.setAttribute("content", metadata.title);
    document.querySelector('meta[property="og:description"]')?.setAttribute("content", metadata.description);
    document.querySelector('meta[property="og:locale"]')?.setAttribute("content", metadata.locale);
    document.querySelector('meta[name="twitter:title"]')?.setAttribute("content", metadata.title);
    document.querySelector('meta[name="twitter:description"]')?.setAttribute("content", metadata.description);
    try {
      window.localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // Changing the language still works for this session.
    }
  }, [language]);

  return <LanguageContext.Provider value={{ language, setLanguage }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}