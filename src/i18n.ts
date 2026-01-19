"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import English translations (default)
import commonEn from "../public/locales/en/common.json";
import authEn from "../public/locales/en/auth.json";

// Import Spanish translations
import commonEs from "../public/locales/es/common.json";
import authEs from "../public/locales/es/auth.json";

// Import Chinese translations
import commonZh from "../public/locales/zh/common.json";
import authZh from "../public/locales/zh/auth.json";

// Import Hindi translations
import commonHi from "../public/locales/hi/common.json";
import authHi from "../public/locales/hi/auth.json";

// Import Bengali translations
import commonBn from "../public/locales/bn/common.json";
import authBn from "../public/locales/bn/auth.json";

// Import Arabic translations
import commonAr from "../public/locales/ar/common.json";
import authAr from "../public/locales/ar/auth.json";

// Import French translations
import commonFr from "../public/locales/fr/common.json";
import authFr from "../public/locales/fr/auth.json";

// Import Portuguese translations
import commonPt from "../public/locales/pt/common.json";
import authPt from "../public/locales/pt/auth.json";

// Import Russian translations
import commonRu from "../public/locales/ru/common.json";
import authRu from "../public/locales/ru/auth.json";

// Import Japanese translations
import commonJa from "../public/locales/ja/common.json";
import authJa from "../public/locales/ja/auth.json";

// Storage key for persisting language preference
const LANGUAGE_STORAGE_KEY = "inbo_preferred_language";

// Get saved language or default to English
const getSavedLanguage = (): string => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved) return saved;
    
    // Try to detect browser language
    const browserLang = navigator.language.split("-")[0];
    const supportedLangs = ["en", "es", "zh", "hi", "bn", "ar", "fr", "pt", "ru", "ja"];
    if (supportedLangs.includes(browserLang)) {
      return browserLang;
    }
  }
  return "en";
};

i18n
  .use(initReactI18next)
  .init({
    lng: getSavedLanguage(),
    fallbackLng: "en",
    defaultNS: "common",
    ns: ["common", "auth"],
    resources: {
      en: {
        common: commonEn,
        auth: authEn,
      },
      es: {
        common: commonEs,
        auth: authEs,
      },
      zh: {
        common: commonZh,
        auth: authZh,
      },
      hi: {
        common: commonHi,
        auth: authHi,
      },
      bn: {
        common: commonBn,
        auth: authBn,
      },
      ar: {
        common: commonAr,
        auth: authAr,
      },
      fr: {
        common: commonFr,
        auth: authFr,
      },
      pt: {
        common: commonPt,
        auth: authPt,
      },
      ru: {
        common: commonRu,
        auth: authRu,
      },
      ja: {
        common: commonJa,
        auth: authJa,
      },
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

// Listen for language changes and save to localStorage
i18n.on("languageChanged", (lng) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
    // Update document direction for RTL languages
    document.documentElement.dir = lng === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lng;
  }
});

export default i18n;
