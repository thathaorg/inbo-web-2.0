"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

// Top 10 most used languages globally with focus on US + India
export const SUPPORTED_LANGUAGES: Language[] = [
  { code: "en", name: "English (US)", nativeName: "English (US)", flag: "🇺🇸" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { code: "zh", name: "Chinese (Simplified)", nativeName: "简体中文", flag: "🇨🇳" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", flag: "🇧🇩" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇧🇷" },
  { code: "ru", name: "Russian", nativeName: "Русский", flag: "🇷🇺" },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
];

// Storage key for persisting language preference
const LANGUAGE_STORAGE_KEY = "inbo_preferred_language";

/**
 * Save language preference to localStorage
 */
export const saveLanguagePreference = (langCode: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, langCode);
  }
};

/**
 * Get saved language preference from localStorage
 */
export const getLanguagePreference = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(LANGUAGE_STORAGE_KEY);
  }
  return null;
};

interface LanguageSelectorProps {
  /** Style variant: 'default' for auth pages, 'compact' for dashboard */
  variant?: "default" | "compact" | "minimal";
  /** Optional className for custom styling */
  className?: string;
  /** Whether to show the "Language" label */
  showLabel?: boolean;
  /** Label position: 'inline' or 'top' */
  labelPosition?: "inline" | "top";
}

export default function LanguageSelector({
  variant = "default",
  className = "",
  showLabel = true,
  labelPosition = "inline",
}: LanguageSelectorProps) {
  const { i18n, t } = useTranslation("common");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get current language
  const currentLanguage =
    SUPPORTED_LANGUAGES.find((lang) => lang.code === i18n.language) ||
    SUPPORTED_LANGUAGES[0];

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load saved language preference on mount
  useEffect(() => {
    const savedLang = getLanguagePreference();
    if (savedLang && savedLang !== i18n.language) {
      i18n.changeLanguage(savedLang);
    }
  }, [i18n]);

  // Handle language change
  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    saveLanguagePreference(langCode);
    setIsOpen(false);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, langCode?: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (langCode) {
        handleLanguageChange(langCode);
      } else {
        setIsOpen(!isOpen);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  // Variant-specific styles
  const getContainerStyles = () => {
    switch (variant) {
      case "compact":
        return "text-sm";
      case "minimal":
        return "text-xs";
      default:
        return "";
    }
  };

  const getButtonStyles = () => {
    const baseStyles = `
      flex items-center gap-2 bg-transparent cursor-pointer
      hover:bg-gray-100 rounded-lg transition-colors duration-200
      focus:outline-none focus:ring-2 focus:ring-[#C46A54] focus:ring-opacity-50
    `;
    
    switch (variant) {
      case "compact":
        return `${baseStyles} px-2 py-1.5 text-sm`;
      case "minimal":
        return `${baseStyles} px-1.5 py-1 text-xs`;
      default:
        return `${baseStyles} px-3 py-2`;
    }
  };

  const getDropdownStyles = () => {
    const baseStyles = `
      absolute z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg
      overflow-hidden min-w-[200px] max-h-[300px] overflow-y-auto
    `;
    
    switch (variant) {
      case "compact":
      case "minimal":
        return `${baseStyles} min-w-[180px]`;
      default:
        return baseStyles;
    }
  };

  return (
    <div
      ref={dropdownRef}
      className={`relative ${getContainerStyles()} ${className}`}
    >
      {/* Label + Button wrapper */}
      <div
        className={`flex ${
          labelPosition === "top" ? "flex-col items-start gap-1" : "items-center gap-2"
        }`}
      >
        {showLabel && (
          <span className="text-[#6F7680] whitespace-nowrap">
            {t("languageSelector.label", "Language")}
          </span>
        )}

        {/* Dropdown trigger button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={(e) => handleKeyDown(e)}
          className={getButtonStyles()}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label={`Select language, current: ${currentLanguage.name}`}
        >
          <span className="text-lg leading-none" aria-hidden="true">
            {currentLanguage.flag}
          </span>
          <span className="text-[#0C1014] font-medium whitespace-nowrap">
            {currentLanguage.name}
          </span>
          <svg
            className={`w-4 h-4 text-[#6F7680] transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className={getDropdownStyles()}
          role="listbox"
          aria-label="Select language"
        >
          {SUPPORTED_LANGUAGES.map((language) => {
            const isSelected = language.code === i18n.language;
            return (
              <button
                key={language.code}
                type="button"
                onClick={() => handleLanguageChange(language.code)}
                onKeyDown={(e) => handleKeyDown(e, language.code)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 text-left
                  transition-colors duration-150
                  ${
                    isSelected
                      ? "bg-[#FEF3F2] text-[#C46A54]"
                      : "hover:bg-gray-50 text-[#0C1014]"
                  }
                `}
                role="option"
                aria-selected={isSelected}
              >
                <span className="text-xl leading-none" aria-hidden="true">
                  {language.flag}
                </span>
                <div className="flex flex-col min-w-0">
                  <span
                    className={`font-medium truncate ${
                      isSelected ? "text-[#C46A54]" : ""
                    }`}
                  >
                    {language.name}
                  </span>
                  {language.nativeName !== language.name && (
                    <span className="text-sm text-[#6F7680] truncate">
                      {language.nativeName}
                    </span>
                  )}
                </div>
                {isSelected && (
                  <svg
                    className="w-5 h-5 ml-auto text-[#C46A54] flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
