"use client";

import { useEffect, useRef, useState } from "react";
import MobileFloatingNavbar from "@/components/reading/MobileFloatingNavbar";
import MobileReadingMenu from "@/components/reading/MobileReadingMenu";
import MobileReadingHeader from "@/components/reading/MobileReadingHeader";
import ReadModeSettings from "@/components/reading/ReadModeSettings";

type ThemeMode = "light" | "dark" | "system";
type PageColor = "white" | "paper" | "calm";
type FontFamily = "sans" | "serif" | "mono";

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
}: MobileReadingSectionProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  const [atTop, setAtTop] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [showReadSettings, setShowReadSettings] = useState(false);

  // Local state for email status (for optimistic UI updates)
  const [isReadLater, setIsReadLater] = useState(initialReadLater);
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [isRead, setIsRead] = useState(initialRead);

  /* ---------------- SCROLL HANDLER ---------------- */
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const handleScroll = () => {
      setAtTop(el.scrollTop < 8);
    };

    handleScroll();
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  // Background classes based on theme and page color
  const getBackgroundClass = () => {
    if (themeMode === 'dark') return 'bg-[#1C1C1E] text-white';
    switch (pageColor) {
      case 'paper': return 'bg-[#F5F5F3] text-black';
      case 'calm': return 'bg-[#E8F1F5] text-black';
      default: return 'bg-[#F5F5F5] text-black';
    }
  };

  const getFontFamilyClass = () => {
    switch (fontFamily) {
      case 'serif': return 'font-serif';
      case 'mono': return 'font-mono';
      default: return 'font-sans';
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
        <div>
          <div className={`rounded-2xl px-5 py-6 shadow-sm ${themeMode === 'dark' ? 'bg-[#2C2C2E]' : 'bg-white'}`}>
            <article 
              className={`space-y-6 leading-relaxed ${getFontFamilyClass()} ${themeMode === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}
              style={{ fontSize: `${fontSize}px` }}
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
