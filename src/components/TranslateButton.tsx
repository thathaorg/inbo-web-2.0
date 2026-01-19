"use client";

import { useState, useRef, useEffect } from "react";
import { Languages, Check, Loader2, ChevronDown } from "lucide-react";
import { SUPPORTED_LANGUAGES, LanguageCode } from "@/services/translation";
import { useTranslation } from "react-i18next";

interface TranslateButtonProps {
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  isTranslating?: boolean;
  translationEnabled: boolean;
  onToggleTranslation: (enabled: boolean) => void;
  variant?: "default" | "compact" | "icon";
  className?: string;
}

export default function TranslateButton({
  currentLanguage,
  onLanguageChange,
  isTranslating = false,
  translationEnabled,
  onToggleTranslation,
  variant = "default",
  className = "",
}: TranslateButtonProps) {
  const { t } = useTranslation("common");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentLang = SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage);

  // Compact variant - just an icon toggle
  if (variant === "icon") {
    return (
      <button
        onClick={() => onToggleTranslation(!translationEnabled)}
        className={`p-2 rounded-full transition-colors ${
          translationEnabled 
            ? "bg-blue-100 text-blue-600" 
            : "hover:bg-gray-100 text-gray-500"
        } ${className}`}
        title={translationEnabled ? t("translation.disable") : t("translation.enable")}
      >
        {isTranslating ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <Languages size={18} />
        )}
      </button>
    );
  }

  // Compact variant - small button with language code
  if (variant === "compact") {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm transition-colors ${
            translationEnabled
              ? "bg-blue-100 text-blue-600"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {isTranslating ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Languages size={14} />
          )}
          <span className="uppercase font-medium">{currentLanguage}</span>
          <ChevronDown size={12} />
        </button>

        {isOpen && (
          <div className="absolute left-0 top-full mt-1 w-52 bg-white rounded-xl shadow-2xl border border-gray-200 py-1.5 z-[100] max-h-72 overflow-y-auto">
            {/* Show Original option when translation is enabled */}
            {translationEnabled && (
              <button
                onClick={() => {
                  onToggleTranslation(false);
                  setIsOpen(false);
                }}
                className="w-full px-3 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100 text-gray-700"
              >
                <span>📄</span>
                <span>{t("translation.showOriginal")}</span>
              </button>
            )}

            {/* Language list */}
            <div className="py-1">
              {SUPPORTED_LANGUAGES.filter(l => l.code !== "en").map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    onLanguageChange(lang.code);
                    onToggleTranslation(true);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center justify-between ${
                    currentLanguage === lang.code && translationEnabled ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{getFlagEmoji(lang.code)}</span>
                    <span>{lang.nativeName}</span>
                  </div>
                  {currentLanguage === lang.code && translationEnabled && (
                    <Check size={14} className="text-blue-500" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default variant - full button with label
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
          translationEnabled
            ? "bg-blue-500 text-white shadow-md"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        {isTranslating ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Languages size={16} />
        )}
        <span>
          {translationEnabled
            ? `${currentLang?.nativeName || currentLanguage}`
            : t("translation.translate")}
        </span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-[100] max-h-80 overflow-y-auto">
          {/* Show Original button */}
          {translationEnabled && (
            <button
              onClick={() => {
                onToggleTranslation(false);
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100"
            >
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-base">📄</span>
              </div>
              <span className="font-medium">{t("translation.showOriginal")}</span>
            </button>
          )}

          {/* Language selection */}
          <p className="px-4 py-2 text-xs text-gray-400 font-semibold uppercase tracking-wide">
            {t("translation.selectLanguage")}
          </p>
          
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                onLanguageChange(lang.code);
                if (lang.code !== "en") {
                  onToggleTranslation(true);
                } else {
                  onToggleTranslation(false);
                }
                setIsOpen(false);
              }}
              className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between ${
                currentLanguage === lang.code && translationEnabled ? "bg-blue-50" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{getFlagEmoji(lang.code)}</span>
                <div>
                  <p className="text-sm font-medium">{lang.nativeName}</p>
                  <p className="text-xs text-gray-400">{lang.name}</p>
                </div>
              </div>
              {currentLanguage === lang.code && translationEnabled && (
                <Check size={16} className="text-blue-500" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Helper function to get flag emoji
function getFlagEmoji(langCode: string): string {
  const flags: Record<string, string> = {
    en: "🇺🇸",
    es: "🇪🇸",
    zh: "🇨🇳",
    hi: "🇮🇳",
    bn: "🇧🇩",
    ar: "🇸🇦",
    fr: "🇫🇷",
    pt: "🇧🇷",
    ru: "🇷🇺",
    ja: "🇯🇵",
  };
  return flags[langCode] || "🌐";
}
