"use client";

import React, { use, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { SEOHead } from "@/components/seo/SEOHead";
import {
  Bookmark,
  Share2,
  ExternalLink,
  LucideCircleEllipsis,
  Link2,
  X,
  ArrowUp,
  ArrowDown,
  Sun,
  Moon,
  Laptop,
  Book,
  Star,
  Trash2,
} from "lucide-react";
import TTSPlayerModal from "@/components/TTSPlayerModal";
import ReadModeSettings from "@/components/reading/ReadModeSettings";
import MobileReadingSection from "./MobileReadingSection";
import emailService, { extractNewsletterName, extractFirstImage } from "@/services/email";
import type { EmailDetail } from "@/services/email";

/* ------------------------------------------------------------------ */
/* TYPES */
/* ------------------------------------------------------------------ */
type PageProps = {
  params: Promise<{ slug: string }>;
};

/* ------------------------------------------------------------------ */
/* UTILITY FUNCTIONS */
/* ------------------------------------------------------------------ */

/**
 * Parse HTML body and extract text content as paragraphs
 */
function parseEmailBody(htmlBody: string | null | undefined): string[] {
  if (!htmlBody) return [];

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlBody, 'text/html');

    // 1. Remove obvious noise and non-content tags
    const noiseTags = ['script', 'style', 'noscript', 'iframe', 'svg', 'button', 'input', 'nav', 'footer', 'aside', 'header', 'form'];
    noiseTags.forEach(tag => doc.querySelectorAll(tag).forEach(el => el.remove()));

    // 2. Select meaningful text containers
    // We intentionally exclude DIV to avoid duplication (divs often wrap paragraphs). 
    // We include LI, BLOCKQUOTE to capture lists and quotes.
    const elements = doc.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, blockquote, article');

    // Use Set to deduplicate identical lines (common in footers/headers)
    const uniqueParagraphs = new Set<string>();
    const paragraphs: string[] = [];

    elements.forEach(el => {
      let text = el.textContent?.trim() || "";

      // Cleanup whitespace
      text = text.replace(/\s+/g, ' ');

      // 3. Rigorous Content Filters

      // a. Length check: Too short is usually noise ("Share", "Link")
      if (text.length < 20) return;

      // b. Skip if plain URL
      if (/^https?:\/\//i.test(text)) return;

      // c. Skip typical email footer noise containing keywords
      const footerNoise = /unsubscribe|view in browser|view this post|view online|privacy policy|terms of service|manage preferences|update profile/i;
      if (footerNoise.test(text) && text.length < 150) return; // Allow if it's a long sentence using these words naturally

      // d. Skip copyright lines
      if (/copyright ©|all rights reserved/i.test(text) && text.length < 100) return;

      // e. Deduplication
      if (uniqueParagraphs.has(text)) return;

      uniqueParagraphs.add(text);
      paragraphs.push(text);
    });

    // 4. Fallback: If structured parsing yields nothing (e.g. plain text email wrapped in just DIVs), try fallback
    if (paragraphs.length === 0) {
      const allText = doc.body.textContent?.trim();
      if (allText) {
        // Filter the raw text dump too
        const splitText = allText.split(/\n\n+|\.\s+/);
        splitText.forEach(line => {
          const cleanLine = line.trim().replace(/\s+/g, ' ');
          if (cleanLine.length > 20
            && !/^https?:\/\//i.test(cleanLine)
            && !/unsubscribe|privacy policy/i.test(cleanLine)) {
            if (!uniqueParagraphs.has(cleanLine)) {
              paragraphs.push(cleanLine);
              uniqueParagraphs.add(cleanLine);
            }
          }
        });
      }
    }

    return paragraphs.length > 0 ? paragraphs : ["No content available to read."];
  } catch (error) {
    console.error('Error parsing email body:', error);
    // Ultimate fallback
    const plainText = htmlBody.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return plainText ? [plainText] : ["No content available."];
  }
}

/**
 * Calculate read time from words count
 */
function calculateReadTime(wordsCount: number | null | undefined): string {
  if (!wordsCount) return "1 min";
  const minutes = Math.ceil(wordsCount / 200); // Average reading speed: 200 words/min
  return minutes === 1 ? "1 min" : `${minutes} mins`;
}

/**
 * Format date for display
 */
function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "Unknown date";

  try {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const daySuffix = day === 1 || day === 21 || day === 31 ? 'st' :
      day === 2 || day === 22 ? 'nd' :
        day === 3 || day === 23 ? 'rd' : 'th';
    return `${month} ${day}${daySuffix}`;
  } catch (error) {
    return "Unknown date";
  }
}

/* ------------------------------------------------------------------ */
/* ICON BUTTON */
/* ------------------------------------------------------------------ */
function IconButton({
  children,
  onClick,
  buttonRef,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  buttonRef?: React.RefObject<HTMLButtonElement | null>;
}) {
  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      className="h-9 w-9 rounded-full flex items-center justify-center bg-white hover:bg-gray-100 transition"
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* READING STYLE POPOVER */
/* ------------------------------------------------------------------ */
type ThemeMode = "light" | "dark" | "system";

function ReadingStylePopover({
  anchorRef,
  onClose,
  themeMode, setThemeMode,
  fontSize, setFontSize,
  pageColor, setPageColor,
  fontFamily, setFontFamily,
  isReaderMode, onEnableReader
}: {
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  // State props
  themeMode: ThemeMode; setThemeMode: (v: ThemeMode) => void;
  fontSize: number; setFontSize: (v: number) => void;
  pageColor: "white" | "paper" | "calm"; setPageColor: (v: "white" | "paper" | "calm") => void;
  fontFamily: "sans" | "serif" | "mono"; setFontFamily: (v: "sans" | "serif" | "mono") => void;
  isReaderMode: boolean; onEnableReader: () => void;
}) {
  if (!anchorRef.current) return null;
  const rect = anchorRef.current.getBoundingClientRect();

  return (
    <div
      className="fixed z-[100]"
      style={{ top: rect.bottom + 10, left: rect.left - 20 }}
    >
      <div className="w-[300px] rounded-2xl bg-white p-5 border border-gray-200/60 shadow-[0_12px_32px_rgba(0,0,0,0.18)] flex flex-col gap-6">

        {/* Header */}
        <div className="flex justify-between items-center">
          <p className="font-semibold text-sm">Inbo Appearance</p>
          <button onClick={onClose}><X size={16} className="text-gray-400 hover:text-black" /></button>
        </div>

        {/* 1. Theme Toggles */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
          {/* Simple implementation of the toggle switch */}
          <ThemeToggleItem label="Light" icon={<Sun size={14} />} active={themeMode === 'light'} onClick={() => setThemeMode('light')} />
          <ThemeToggleItem label="Dark" icon={<Moon size={14} />} active={themeMode === 'dark'} onClick={() => setThemeMode('dark')} />
          <ThemeToggleItem label="System" icon={<Laptop size={14} />} active={themeMode === 'system'} onClick={() => setThemeMode('system')} />
        </div>

        {/* 2. Reader Mode Button (only if not active) */}
        {!isReaderMode && (
          <button
            onClick={onEnableReader}
            className="w-full h-10 rounded-full bg-black text-white font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 transition"
          >
            <Book size={16} /> Enter Reader Mode
          </button>
        )}

        {/* 3. Size Controls */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500">Size</p>
          <div className="flex gap-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                const newSize = Math.max(14, fontSize - 2);
                setFontSize(newSize);
              }}
              disabled={fontSize <= 14}
              className={`flex-1 h-10 rounded-lg border flex items-center justify-center font-medium transition ${fontSize <= 14 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
            >
              A -
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                const newSize = Math.min(32, fontSize + 2);
                setFontSize(newSize);
              }}
              disabled={fontSize >= 32}
              className={`flex-1 h-10 rounded-lg border flex items-center justify-center font-medium transition ${fontSize >= 32 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
            >
              A +
            </button>
          </div>
          <p className="text-xs text-center text-gray-400">{fontSize}px</p>
        </div>

        {/* 4. Page Color */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500">Page Color</p>
          <div className="flex gap-3">
            <ColorOption mode="white" active={pageColor === 'white'} onClick={() => setPageColor('white')} />
            <ColorOption mode="paper" active={pageColor === 'paper'} onClick={() => setPageColor('paper')} />
            <ColorOption mode="calm" active={pageColor === 'calm'} onClick={() => setPageColor('calm')} />
          </div>
        </div>

        {/* 5. Font Selector */}
        <div className="space-y-2">
          <button
            onClick={() => {
              const map = { sans: 'serif', serif: 'mono', mono: 'sans' } as const;
              setFontFamily(map[fontFamily]);
            }}
            className="w-full h-10 rounded-lg bg-gray-100 px-4 flex items-center justify-between text-sm hover:bg-gray-200"
          >
            <span>Font: {fontFamily === 'sans' ? 'Sans Serif' : fontFamily === 'serif' ? 'Serif' : 'Monospaced'}</span>
            <span className="text-gray-500">{'>'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}

function ThemeToggleItem({ label, icon, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 h-8 rounded-md text-xs font-medium transition-all ${active ? 'bg-white shadow text-black' : 'text-gray-500 hover:text-gray-700'}`}
    >
      {icon} {label}
    </button>
  );
}

function ColorOption({ mode, active, onClick }: { mode: string, active: boolean, onClick: () => void }) {
  const bg = mode === 'white' ? 'bg-white' : mode === 'paper' ? 'bg-[#F5F5F3]' : 'bg-[#E8F1F5]';
  return (
    <button onClick={onClick} className={`flex-1 aspect-[4/3] rounded-lg border-2 flex flex-col items-center justify-center gap-2 ${bg} ${active ? 'border-black' : 'border-transparent hover:border-gray-200'}`}>
      <div className="w-8 h-px bg-gray-300 mb-0.5"></div>
      <div className="w-8 h-px bg-gray-300 mb-0.5"></div>
      <div className="w-5 h-px bg-gray-300"></div>
      <span className="text-[10px] text-gray-500 capitalize mt-1">{mode}</span>
    </button>
  );
}


/* ------------------------------------------------------------------ */
/* PAGE */
/* ------------------------------------------------------------------ */
/* ------------------------------------------------------------------ */
/* HELPER: HIGHLIGHTING */
/* ------------------------------------------------------------------ */
function applyHighlights(text: string, highlights: any[] | null | undefined) {
  if (!highlights || highlights.length === 0) return text;

  let parts: (string | React.JSX.Element)[] = [text];

  highlights.forEach((h, hIdx) => {
    const term = h.text;
    if (!term) return;

    const nextParts: (string | React.JSX.Element)[] = [];
    parts.forEach((part) => {
      if (typeof part !== "string") {
        nextParts.push(part);
        return;
      }

      const index = part.indexOf(term);
      if (index === -1) {
        nextParts.push(part);
      } else {
        const before = part.substring(0, index);
        const match = part.substring(index, index + term.length);
        const after = part.substring(index + term.length);

        if (before) nextParts.push(before);
        nextParts.push(
          <mark key={`hl-${hIdx}`} className="bg-yellow-200 text-black rounded-sm px-0.5">
            {match}
          </mark>
        );
        if (after) nextParts.push(after);
      }
    });
    parts = nextParts;
  });

  return <>{parts}</>;
}

export default function ReadingPage(props: PageProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { slug } = use(props.params);
  const router = useRouter();

  const [emailData, setEmailData] = useState<EmailDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showReadSettings, setShowReadSettings] = useState(false);
  const [ttsOpen, setTtsOpen] = useState(false);
  // Default to FALSE so we show the Original HTML first
  const [isReadingMode, setIsReadingMode] = useState(false);
  const [showReadingStyle, setShowReadingStyle] = useState(false);

  // READING APPEARANCE STATE
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");
  const [fontSize, setFontSize] = useState(18); // Default 18px
  const [pageColor, setPageColor] = useState<"white" | "paper" | "calm">("white");
  const [fontFamily, setFontFamily] = useState<"sans" | "serif" | "mono">("sans");

  // HIGHLIGHT STATE
  const [isHighlightMode, setIsHighlightMode] = useState(false);

  // SCROLL STATE
  const [atTop, setAtTop] = useState(true);
  const [atBottom, setAtBottom] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const typeBtnRef = useRef<HTMLButtonElement>(null);
  const moreBtnRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Fetch email data
  useEffect(() => {
    const fetchEmail = async () => {
      try {
        setLoading(true);
        setError(null);
        const email = await emailService.getEmailDetail(slug);

        // Validate that we got essential data
        if (!email || !email.id) {
          throw new Error('Invalid email data received');
        }

        setEmailData(email);

        // Mark as read when opening (non-blocking)
        if (!email.isRead) {
          emailService.markEmailAsRead(slug).catch(err => {
            console.warn('Failed to mark email as read:', err);
          });
        }
      } catch (err: any) {
        console.error('Failed to fetch email:', err);
        const errorMessage = err.response?.data?.message
          || err.message
          || 'Failed to load email. Please try again.';
        setError(errorMessage);
        setEmailData(null); // Clear email data on error
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchEmail();
    } else {
      setError('Invalid email ID');
      setLoading(false);
    }
  }, [slug]);

  const handleToggleRead = async () => {
    if (!emailData) return;
    const nextStatus = !emailData.isRead;
    try {
      await emailService.toggleReadStatus(emailData.id, nextStatus);
      // Optimistically update UI
      setEmailData(prev => prev ? { ...prev, isRead: nextStatus } : null);
    } catch (e) {
      console.error("Failed to toggle read status", e);
    }
  };

  const handleMoveToTrash = async () => {
    if (!emailData) return;
    if (confirm("Are you sure you want to move this to trash?")) {
      try {
        await emailService.moveToTrash(emailData.id);
        router.push('/inbox');
      } catch (e) {
        console.error("Failed to delete", e);
        alert("Failed to delete email");
      }
    }
  };

  const handleToggleReadLater = async () => {
    if (!emailData) return;
    try {
      const nextStatus = !emailData.isReadLater;
      await emailService.toggleReadLater(emailData.id, nextStatus);
      setEmailData(prev => prev ? { ...prev, isReadLater: nextStatus } : null);
    } catch (e) {
      console.error("Failed to toggle read later", e);
    }
  };

  const handleToggleFavorite = async () => {
    if (!emailData) return;
    try {
      const nextStatus = !emailData.isFavorite;
      await emailService.toggleFavorite(emailData.id, nextStatus);
      setEmailData(prev => prev ? { ...prev, isFavorite: nextStatus } : null);
    } catch (e) {
      console.error("Failed to toggle favorite", e);
    }
  };

  const handleShare = async () => {
    if (!emailData) return;
    
    const shareUrl = `${window.location.origin}/reading/${emailData.id}`;
    const shareData = {
      title: title || 'Check out this article',
      text: title || 'Check out this article on Inbo',
      url: shareUrl,
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      // User cancelled or error
      if ((err as Error).name !== 'AbortError') {
        console.error('Failed to share:', err);
        // Fallback: copy to clipboard
        try {
          await navigator.clipboard.writeText(shareUrl);
          alert('Link copied to clipboard!');
        } catch {
          alert('Failed to share');
        }
      }
    }
  };

  const handleCopyLink = async () => {
    if (!emailData) return;
    const shareUrl = `${window.location.origin}/reading/${emailData.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      setTimeout(() => {
        setCopySuccess(false);
        setShowSharePopup(false);
      }, 1500);
    } catch {
      alert('Failed to copy link');
    }
  };

  const handleNativeShare = async () => {
    if (!emailData) return;
    const shareUrl = `${window.location.origin}/reading/${emailData.id}`;
    const shareData = {
      title: title || 'Check out this article',
      text: title || 'Check out this article on Inbo',
      url: shareUrl,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShowSharePopup(false);
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Failed to share:', err);
      }
    }
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreBtnRef.current && !moreBtnRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
      // Close share popup when clicking outside (except when clicking inside the popup)
      const target = event.target as HTMLElement;
      if (!target.closest('[data-share-popup]')) {
        setShowSharePopup(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Prepare display data
  const newsletterName = emailData ? extractNewsletterName(emailData.sender) : '';
  const title = emailData?.subject || 'Loading...';
  const author = newsletterName || emailData?.sender || 'Unknown';
  const readTime = calculateReadTime(emailData?.wordsCount);
  const published = formatDate(emailData?.dateReceived);

  // FIXED: Only show hero if extracted successfully, NO FALLBACK to sample-img
  const hero = emailData ? extractFirstImage(emailData.body || emailData.contentPreview) : null;

  // Parse content for TTS and Reader Mode
  const content = emailData
    ? parseEmailBody(emailData.body || emailData.contentPreview || null)
    : ['Loading content...'];

  // Original HTML content for default view
  const htmlContent = emailData?.body || emailData?.contentPreview || "<p>No content available</p>";

  /* ---------------- SCROLL STATE ---------------- */
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const handleScroll = () => {
      setAtTop(el.scrollTop <= 0);
      setAtBottom(el.scrollTop + el.clientHeight >= el.scrollHeight - 1);

      const progress = el.scrollTop / (el.scrollHeight - el.clientHeight);
      setScrollProgress(Math.min(100, Math.max(0, Math.round(progress * 100))));
    };

    handleScroll();
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  /* ---------------- HIGHLIGHTING LOGIC ---------------- */
  useEffect(() => {
    if (!isHighlightMode || !isReadingMode) return;

    const handleSelection = async () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) return;

      // STRICT NORMALIZATION: Collapse all whitespace to single spaces to match parseEmailBody logic
      const rawText = selection.toString();
      const text = rawText.replace(/\s+/g, ' ').trim();

      if (text.length < 3) return;

      if (!emailData) return;

      console.log("Attempting to highlight:", text);

      try {
        const result = await emailService.addHighlight(emailData.id, text, {}, 'yellow');

        // Update local state to show highlight immediately
        setEmailData(prev => {
          if (!prev) return null;
          // If result is null (void), shim it
          const newH = result || { text, id: 'temp-' + Date.now(), color: 'yellow' };
          const newHighlights = [...(prev.highlights || []), newH];
          return { ...prev, highlights: newHighlights };
        });

        // Clear selection
        selection.removeAllRanges();
        console.log("Highlight saved!");
      } catch (err) {
        console.error("Failed to save highlight", err);
      }
    };

    const el = contentRef.current;
    if (el) el.addEventListener('mouseup', handleSelection);
    return () => {
      if (el) el.removeEventListener('mouseup', handleSelection);
    };
  }, [isHighlightMode, isReadingMode, emailData]);


  // BACKGROUND CLASSES
  const getAppearanceClasses = () => {
    // If Dark Mode active
    if (themeMode === 'dark') {
      return "bg-[#1C1C1E] text-white"; // Standard Dark
    }

    // Light Mode (check Page Color)
    switch (pageColor) {
      case "paper": return "bg-[#F5F5F3] text-black";
      case "calm": return "bg-[#E8F1F5] text-black";
      default: return "bg-white text-black"; // White
    }
  };

  const getFontFamily = () => {
    switch (fontFamily) {
      case "serif": return "font-serif";
      case "mono": return "font-mono";
      default: return "font-sans";
    }
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading email...</p>
        </div>
      </div>
    );
  }

  if (error || !emailData) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Email not found'}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <MobileReadingSection
        id={emailData.id}
        title={title}
        author={newsletterName || author}
        readTime={readTime}
        published={published}
        content={content}
        isReadLater={emailData.isReadLater}
        isFavorite={emailData.isFavorite}
        isRead={emailData.isRead}
        onBack={() => router.back()}
        // Shared appearance state
        themeMode={themeMode}
        setThemeMode={setThemeMode}
        fontSize={fontSize}
        setFontSize={setFontSize}
        pageColor={pageColor}
        setPageColor={setPageColor}
        fontFamily={fontFamily}
        setFontFamily={setFontFamily}
      />
    );
  }

  const appearanceClass = getAppearanceClasses();

  return (
    <>
      <SEOHead title={title} description={emailData.contentPreview || "Reading view"} />

      {/* MODAL CONTAINER */}
      <div className={`relative z-10 h-screen w-full flex hide-scrollbar ${appearanceClass} transition-colors duration-300`}>
        <div className={`flex flex-col w-full ${appearanceClass}`}>
          {/* HEADER */}
          <header className={`h-[64px] flex items-center justify-between px-6 border-b transition-all ${isReadingMode ? 'opacity-0 h-0 overflow-hidden' : `opacity-100 ${appearanceClass}`}`}>
            <div className="flex items-center gap-4"></div>

            <div className="flex items-center gap-2">
              <IconButton
                buttonRef={typeBtnRef}
                onClick={() => setShowReadingStyle(v => !v)}
              >
                <img src="/icons/read-style-icon.png" alt="style" />
              </IconButton>

              <IconButton onClick={() => setTtsOpen(prev => !prev)}>
                <img src="/icons/read-tts-icon.png" alt="tts" />
              </IconButton>

              <div className="relative group">
                <IconButton onClick={handleToggleReadLater}>
                  <img src="/icons/read-timer-icon.png" alt="read later" />
                </IconButton>
                <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-50">
                  {emailData.isReadLater ? 'Remove from Read Later' : 'Add to Read Later'}
                </div>
              </div>

              <div className="relative group">
                <IconButton onClick={handleToggleRead}>
                  <div className="relative">
                    <img src="/icons/read-check-icon.png" alt="check" />
                    {emailData.isRead && (
                      <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                </IconButton>
                <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-50">
                  {scrollProgress}% read
                </div>
              </div>

              <div className="relative">
                <IconButton
                  buttonRef={moreBtnRef}
                  onClick={() => setShowMoreMenu(v => !v)}
                >
                  <img src="/icons/read-more-icon.png" alt="more" />
                </IconButton>

                {showMoreMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border p-2 z-50">
                    <button
                      onClick={handleToggleReadLater}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg text-sm font-medium flex items-center gap-2"
                    >
                      <Bookmark size={16} className={emailData.isReadLater ? 'fill-current text-blue-500' : 'text-gray-500'} />
                      {emailData.isReadLater ? 'Remove Read Later' : 'Read Later'}
                    </button>
                    <button
                      onClick={handleToggleFavorite}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg text-sm font-medium flex items-center gap-2"
                    >
                      <Star size={16} className={emailData.isFavorite ? 'fill-current text-yellow-500' : 'text-gray-500'} />
                      {emailData.isFavorite ? 'Favorite' : 'Add to Favorite'}
                    </button>
                    <button
                      onClick={handleShare}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg text-sm font-medium flex items-center gap-2"
                    >
                      <Share2 size={16} className="text-gray-500" />
                      Share
                    </button>
                    <div className="h-px bg-gray-100 my-1"></div>
                    <button
                      onClick={handleMoveToTrash}
                      className="w-full text-left px-3 py-2 hover:bg-red-50 rounded-lg text-sm font-medium flex items-center gap-2 text-red-600"
                    >
                      <Trash2 size={16} />
                      Move to Trash
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => router.back()}
              className="ml-4 h-9 w-9 rounded-lg flex items-center justify-center border hover:bg-gray-100"
            >
              <X size={24} />
            </button>
          </header>

          {/* CONTENT AREA */}
          <div className="relative flex flex-1 overflow-hidden">
            {/* Scroll Buttons - Standard Mode Only */}
            {!isReadingMode && (
              <div className="absolute left-4 top-6 z-50 flex flex-col gap-2">
                <button
                  disabled={atTop}
                  onClick={() => contentRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
                  className={`h-9 w-9 rounded-xl flex items-center justify-center transition-all ${atTop ? "bg-gray-200 text-gray-400" : "bg-black text-white hover:scale-110"}`}
                >
                  <ArrowUp size={16} />
                </button>
                <button
                  disabled={atBottom}
                  onClick={() => contentRef.current?.scrollTo({ top: contentRef.current.scrollHeight, behavior: "smooth" })}
                  className={`h-9 w-9 rounded-xl flex items-center justify-center transition-all ${atBottom ? "bg-gray-200 text-gray-400" : "bg-black text-white hover:scale-110"}`}
                >
                  <ArrowDown size={16} />
                </button>
              </div>
            )}

            <div
              ref={contentRef}
              className={`flex-1 overflow-y-auto py-10 hide-scrollbar transition-all duration-300 ${isHighlightMode ? 'cursor-text selection:bg-yellow-200 selection:text-black' : ''}`}
            >
              <div
                className={`mx-auto max-w-[760px] px-10 transition-all duration-300 ${getFontFamily()}`}
              >
                <h1 className="text-[34px] font-bold mb-8">{title}</h1>

                {isReadingMode && hero && (
                  <div className="rounded-2xl overflow-hidden border mb-10">
                    <Image
                      src={hero}
                      alt={title}
                      width={1200}
                      height={600}
                      className="w-full object-cover"
                      style={{ width: "auto", height: "auto" }}
                    />
                  </div>
                )}

                {/* CONDITIONAL RENDERING */}
                {isReadingMode ? (
                  <article className="max-w-none" style={{ fontSize: `${fontSize}px`, lineHeight: 1.7 }}>
                    {content.map((p, i) => (
                      <p key={i} className="mb-4 leading-relaxed">
                        {applyHighlights(p, emailData?.highlights)}
                      </p>
                    ))}
                  </article>
                ) : (
                  <div
                    className="prose prose-lg max-w-none [&_*]:!text-inherit"
                    style={{ fontSize: `${fontSize}px` }}
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* READER MODE FLOATING TOOLBAR */}
      {isReadingMode && (
        <div className="fixed left-5 top-1/2 -translate-y-1/2 z-50">
          <div className="bg-white rounded-3xl shadow-xl border flex flex-col">
            <button
              onClick={() => setShowReadSettings(true)}
              className="p-3 rounded-t-3xl hover:bg-gray-100 bg-gray-50/50"
            >
              <img src="/icons/read-style-icon.png" alt="style" />
            </button>
            <button
              onClick={() => setIsHighlightMode(v => !v)}
              className={`p-3 hover:bg-gray-100 transition-colors ${isHighlightMode ? 'bg-yellow-100 hover:bg-yellow-200' : ''}`}
              title="Toggle Highlight Mode"
            >
              <img src="/icons/highlight-icon.png" alt="highlight" />
            </button>
            <button className="p-3 hover:bg-gray-100">
              <img src="/icons/note-icon.png" alt="note" />
            </button>
            <div className="relative" data-share-popup>
              <button 
                onClick={() => setShowSharePopup(v => !v)}
                className={`p-3 hover:bg-gray-100 transition-colors ${showSharePopup ? 'bg-gray-100' : ''}`}
                title="Share"
              >
                <Link2 size={24} />
              </button>

              {showSharePopup && (
                <div className="absolute left-full ml-2 top-0 w-52 bg-white rounded-xl shadow-lg border p-2 z-50">
                  <p className="text-xs font-semibold text-gray-500 px-3 py-1">Share</p>
                  <button
                    onClick={handleCopyLink}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg text-sm font-medium flex items-center gap-2"
                  >
                    <Link2 size={16} className="text-gray-500" />
                    {copySuccess ? 'Copied!' : 'Copy Link'}
                  </button>
                  {typeof window !== 'undefined' && 'share' in navigator && (
                    <button
                      onClick={handleNativeShare}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg text-sm font-medium flex items-center gap-2"
                    >
                      <Share2 size={16} className="text-gray-500" />
                      Share via...
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => setShowMoreMenu(v => !v)}
                className={`p-3 hover:bg-gray-100 transition-colors ${showMoreMenu ? 'bg-gray-100' : ''}`}
                title="More actions"
              >
                <LucideCircleEllipsis size={24} />
              </button>

              {showMoreMenu && (
                <div className="absolute left-full ml-2 bottom-0 w-48 bg-white rounded-xl shadow-lg border p-2 z-50">
                  <button
                    onClick={handleToggleReadLater}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg text-sm font-medium flex items-center gap-2"
                  >
                    <Bookmark size={16} className={emailData.isReadLater ? 'fill-current text-blue-500' : 'text-gray-500'} />
                    {emailData.isReadLater ? 'Remove Read Later' : 'Read Later'}
                  </button>
                  <button
                    onClick={handleToggleFavorite}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg text-sm font-medium flex items-center gap-2"
                  >
                    <Star size={16} className={emailData.isFavorite ? 'fill-current text-yellow-500' : 'text-gray-500'} />
                    {emailData.isFavorite ? 'Favorite' : 'Add to Favorite'}
                  </button>
                  <div className="h-px bg-gray-100 my-1"></div>
                  <button
                    onClick={handleMoveToTrash}
                    className="w-full text-left px-3 py-2 hover:bg-red-50 rounded-lg text-sm font-medium flex items-center gap-2 text-red-600"
                  >
                    <Trash2 size={16} />
                    Move to Trash
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={() => setIsReadingMode(false)}
              className="p-3 border-t rounded-b-3xl hover:bg-gray-100"
            >
              <img src="/icons/close-icon.png" alt="close" />
            </button>
          </div>
        </div>
      )}

      {/* READ MODE SETTINGS MODAL */}
      {showReadSettings && (
        <ReadModeSettings
          isOpen={showReadSettings}
          onClose={() => setShowReadSettings(false)}
        />
      )}

      {showReadingStyle && (
        <ReadingStylePopover
          anchorRef={typeBtnRef}
          onClose={() => setShowReadingStyle(false)}
          // Props for appearance
          themeMode={themeMode}
          setThemeMode={setThemeMode}
          fontSize={fontSize}
          setFontSize={setFontSize}
          pageColor={pageColor}
          setPageColor={setPageColor}
          fontFamily={fontFamily}
          setFontFamily={setFontFamily}

          isReaderMode={isReadingMode}
          onEnableReader={() => {
            setIsReadingMode(true);
            setShowReadingStyle(false); // Close popover when reader mode is enabled
          }}
        />
      )}

      <TTSPlayerModal
        isOpen={ttsOpen}
        onRequestClose={() => setTtsOpen(false)}
        title={title}
        // TTS always uses the parsed text
        content={content.join(" ")}
      />

      <style jsx global>{`
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </>
  );
}
