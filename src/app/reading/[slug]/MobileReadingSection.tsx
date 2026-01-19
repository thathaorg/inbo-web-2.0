"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import MobileFloatingNavbar from "@/components/reading/MobileFloatingNavbar";
import MobileReadingMenu from "@/components/reading/MobileReadingMenu";
import MobileReadingHeader from "@/components/reading/MobileReadingHeader";
import ReadModeSettings from "@/components/reading/ReadModeSettings";
import emailService from "@/services/email";

type ThemeMode = "light" | "dark" | "system";
type PageColor = "white" | "paper" | "calm";
type FontFamily = "sans" | "serif" | "mono";
type FontType =
  | "System Default"
  | "Georgia"
  | "Merriweather"
  | "Lora"
  | "Charter"
  | "Palatino"
  | "Times New Roman"
  | "Helvetica"
  | "Inter"
  | "SF Pro"
  | "Roboto";

interface MobileReadingSectionProps {
  id: string;
  title: string;
  author: string;
  readTime: string;
  published: string;
  content: string[];
  isReadLater?: boolean;
  isFavorite?: boolean;
  isRead?: boolean;
  onBack?: () => void;
  // Shared appearance state
  themeMode: ThemeMode;
  setThemeMode: (v: ThemeMode) => void;
  fontSize: number;
  setFontSize: (v: number) => void;
  pageColor: PageColor;
  setPageColor: (v: PageColor) => void;
  fontFamily: FontFamily;
  setFontFamily: (v: FontFamily) => void;
  fontType: FontType;
  setFontType: (v: FontType) => void;
}

export default function MobileReadingSection({
  id,
  title,
  author,
  readTime,
  published,
  content,
  isReadLater: initialReadLater,
  isFavorite: initialFavorite,
  isRead: initialRead,
  onBack,
  // Shared appearance state from parent
  themeMode,
  setThemeMode,
  fontSize,
  setFontSize,
  pageColor,
  setPageColor,
  fontFamily,
  setFontFamily,
  fontType,
  setFontType,
}: MobileReadingSectionProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation("common");

  const [atTop, setAtTop] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [showReadSettings, setShowReadSettings] = useState(false);

  // Local state for email status (for optimistic UI updates)
  const [isReadLater, setIsReadLater] = useState(initialReadLater);
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [isRead, setIsRead] = useState(initialRead);

  // Ref to track if we've already triggered auto-mark-as-read to avoid duplicate calls
  const hasAutoMarkedAsReadRef = useRef(false);

  // Update ref when initial read status is already true
  useEffect(() => {
    if (isRead) {
      hasAutoMarkedAsReadRef.current = true;
    }
  }, [isRead]);

  // Handler for auto-marking as read when scrolling to bottom
  const handleAutoMarkAsRead = useCallback(async () => {
    if (hasAutoMarkedAsReadRef.current) return;
    hasAutoMarkedAsReadRef.current = true;
    
    console.log('📖 Mobile: User reached bottom of article - marking as read');
    
    try {
      await emailService.toggleReadStatus(id, true);
      setIsRead(true);
      
      // Broadcast event so inbox updates
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('emailStatusChanged', {
          detail: {
            emailId: id,
            isRead: true,
            timestamp: new Date().toISOString()
          }
        });
        window.dispatchEvent(event);
      }
    } catch (err) {
      console.error("Failed to auto-mark as read", err);
    }
  }, [id]);

  /* ---------------- SCROLL HANDLER ---------------- */
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const handleScroll = () => {
      setAtTop(el.scrollTop < 8);
      
      // Check if scrolled to bottom
      const atBottomVal = el.scrollTop + el.clientHeight >= el.scrollHeight - 5;
      if (atBottomVal && !hasAutoMarkedAsReadRef.current) {
        handleAutoMarkAsRead();
      }
    };

    handleScroll();
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleAutoMarkAsRead]);

  // Background classes based on theme and page color
  const getBackgroundClass = () => {
    if (themeMode === 'dark') return 'bg-[#1C1C1E] text-white';
    switch (pageColor) {
      case 'paper': return 'bg-[#F7F3E9] text-[#3A3A3A]';
      case 'calm': return 'bg-[#E8F4F8] text-[#2A2A2A]';
      default: return 'bg-white text-gray-900';
    }
  };

  // Article card background
  const getArticleCardBg = () => {
    if (themeMode === 'dark') return 'bg-[#2C2C2E]';
    switch (pageColor) {
      case 'paper': return 'bg-[#FFFCF5]';
      case 'calm': return 'bg-[#F5FBFD]';
      default: return 'bg-white';
    }
  };

  const getFontFamilyClass = () => {
    switch (fontFamily) {
      case 'serif': return 'font-serif';
      case 'mono': return 'font-mono';
      default: return 'font-sans';
    }
  };

  const getFontFamilyCSS = () => {
    switch (fontType) {
      case "System Default":
        return '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
      case "Georgia":
        return '"Georgia", serif';
      case "Merriweather":
        return '"Merriweather", "Georgia", serif';
      case "Lora":
        return '"Lora", "Georgia", serif';
      case "Charter":
        return '"Charter", "Georgia", serif';
      case "Palatino":
        return '"Palatino Linotype", "Book Antiqua", Palatino, serif';
      case "Times New Roman":
        return '"Times New Roman", Times, serif';
      case "Helvetica":
        return '"Helvetica Neue", Helvetica, Arial, sans-serif';
      case "Inter":
        return '"Inter", -apple-system, BlinkMacSystemFont, sans-serif';
      case "SF Pro":
        return '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", sans-serif';
      case "Roboto":
        return '"Roboto", -apple-system, sans-serif';
      default:
        return '"Georgia", serif';
    }
  };

  return (
    <div className={`relative h-screen overflow-hidden transition-colors duration-300 ${getBackgroundClass()}`}>
      {/* ================= HEADER ================= */}
      {atTop && (
        <MobileReadingHeader
          title={author}
          onBack={onBack}
        />
      )}

      {/* ================= SCROLL AREA ================= */}
      <div
        ref={contentRef}
        className="h-full overflow-y-auto pt-[68px] hide-scrollbar"
      >
        {/* TITLE + META */}
        <div className="px-4">
          <h1 className="text-[26px] font-bold leading-snug mb-4">
            {title}
          </h1>

          <p className="text-sm text-gray-500 mb-6">
            By {author} • {readTime} • {published}
          </p>
        </div>

        {/* ARTICLE BODY */}
        <div className="px-4 pb-10">
          <div className={`rounded-2xl px-5 py-6 shadow-sm ${getArticleCardBg()}`}>
            <article 
              className={`space-y-6 leading-relaxed ${getFontFamilyClass()}`}
              style={{ 
                fontSize: `${fontSize}px`, 
                fontFamily: getFontFamilyCSS(),
                lineHeight: 1.8,
                color: themeMode === 'dark' ? '#E5E5E5' : pageColor === 'paper' ? '#3A3A3A' : pageColor === 'calm' ? '#2A2A2A' : '#1F1F1F'
              }}
            >
              {content.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </article>
          </div>
        </div>
      </div>

      {/* ================= FLOATING NAV ================= */}
      {atTop && !showReadSettings && (
        <MobileFloatingNavbar
          onMore={() => setShowMenu(true)}
          onOpenReadSettings={() => setShowReadSettings(true)}
        />
      )}

      {/* ================= READING MENU ================= */}
      {showMenu && (
        <MobileReadingMenu
          onClose={() => setShowMenu(false)}
          emailId={id}
          title={title}
          isReadLater={isReadLater}
          isFavorite={isFavorite}
          isRead={isRead}
          onReadLaterChange={setIsReadLater}
          onFavoriteChange={setIsFavorite}
          onReadChange={setIsRead}
          onOpenAppearance={() => setShowReadSettings(true)}
        />
      )}

      {/* ================= READ MODE SETTINGS (ROOT) ================= */}
      {showReadSettings && (
        <ReadModeSettings
          isOpen={showReadSettings}
          onClose={() => setShowReadSettings(false)}
          themeMode={themeMode}
          setThemeMode={setThemeMode}
          fontSize={fontSize}
          setFontSize={setFontSize}
          pageColor={pageColor}
          setPageColor={setPageColor}
          fontFamily={fontFamily}
          setFontFamily={setFontFamily}
          fontType={fontType}
          setFontType={setFontType}
        />
      )}

      {/* ================= GLOBAL STYLES ================= */}
      <style jsx global>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
