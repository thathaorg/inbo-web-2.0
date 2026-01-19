"use client";

import { useState, useCallback, useEffect } from "react";
import { translateText, translateBatch, translateHTML, LanguageCode, SUPPORTED_LANGUAGES } from "@/services/translation";

const LANGUAGE_STORAGE_KEY = "inbo_preferred_language";

interface UseContentTranslationOptions {
  autoTranslate?: boolean; // Auto-translate when language changes
}

interface UseContentTranslationReturn {
  // Current language
  currentLanguage: LanguageCode;
  setCurrentLanguage: (lang: LanguageCode) => void;
  
  // Translation state
  isTranslating: boolean;
  translationEnabled: boolean;
  setTranslationEnabled: (enabled: boolean) => void;
  
  // Translation functions
  translate: (text: string) => Promise<string>;
  translateMultiple: (texts: string[]) => Promise<string[]>;
  translateHtml: (html: string) => Promise<string>;
  
  // Utilities
  languages: typeof SUPPORTED_LANGUAGES;
  getLanguageName: (code: string) => string;
  isRTL: boolean;
}

/**
 * Hook for content translation in reading pages and inbox
 */
export function useContentTranslation(
  options: UseContentTranslationOptions = {}
): UseContentTranslationReturn {
  const { autoTranslate = false } = options;
  
  const [currentLanguage, setCurrentLanguageState] = useState<LanguageCode>("en");
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationEnabled, setTranslationEnabled] = useState(false);
  
  // Load saved language preference on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY) as LanguageCode;
      if (saved && SUPPORTED_LANGUAGES.some(l => l.code === saved)) {
        setCurrentLanguageState(saved);
        // Auto-enable translation if language is not English
        if (autoTranslate && saved !== "en") {
          setTranslationEnabled(true);
        }
      }
    }
  }, [autoTranslate]);
  
  // Save language preference when changed
  const setCurrentLanguage = useCallback((lang: LanguageCode) => {
    setCurrentLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    }
    // Enable/disable translation based on language
    if (autoTranslate) {
      setTranslationEnabled(lang !== "en");
    }
  }, [autoTranslate]);
  
  // Translate single text
  const translate = useCallback(async (text: string): Promise<string> => {
    if (!translationEnabled || currentLanguage === "en" || !text.trim()) {
      return text;
    }
    
    setIsTranslating(true);
    try {
      return await translateText(text, currentLanguage, "en");
    } finally {
      setIsTranslating(false);
    }
  }, [translationEnabled, currentLanguage]);
  
  // Translate multiple texts
  const translateMultiple = useCallback(async (texts: string[]): Promise<string[]> => {
    if (!translationEnabled || currentLanguage === "en") {
      return texts;
    }
    
    setIsTranslating(true);
    try {
      return await translateBatch(texts, currentLanguage, "en");
    } finally {
      setIsTranslating(false);
    }
  }, [translationEnabled, currentLanguage]);
  
  // Translate HTML content
  const translateHtml = useCallback(async (html: string): Promise<string> => {
    if (!translationEnabled || currentLanguage === "en" || !html.trim()) {
      return html;
    }
    
    setIsTranslating(true);
    try {
      return await translateHTML(html, currentLanguage, "en");
    } finally {
      setIsTranslating(false);
    }
  }, [translationEnabled, currentLanguage]);
  
  // Get language name
  const getLanguageName = useCallback((code: string): string => {
    const lang = SUPPORTED_LANGUAGES.find(l => l.code === code) as { code: string; name: string; nativeName: string } | undefined;
    return lang?.nativeName || lang?.name || code;
  }, []);
  
  // Check if current language is RTL
  const isRTL = currentLanguage === "ar";
  
  return {
    currentLanguage,
    setCurrentLanguage,
    isTranslating,
    translationEnabled,
    setTranslationEnabled,
    translate,
    translateMultiple,
    translateHtml,
    languages: SUPPORTED_LANGUAGES,
    getLanguageName,
    isRTL,
  };
}

export default useContentTranslation;
