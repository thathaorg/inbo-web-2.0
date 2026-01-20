
"use client";

import React, { use, useState, useRef, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { SEOHead } from "@/components/seo/SEOHead";
import {
  Bookmark,
  Share2,
  LucideCircleEllipsis,
  Link2,
  X,
  ArrowUp,
  ArrowDown,
  Star,
  Trash2,
  Eraser,
  Highlighter,
  Type,
  Volume2,
  Clock,
  CheckCircle,
} from "lucide-react";
import TTSPlayerModal from "@/components/TTSPlayerModal";
import ReadModeSettings from "@/components/reading/ReadModeSettings";
import AISummaryModal from "@/components/reading/AISummaryModal";
import EmailSkeletonLoader from "@/components/reading/EmailSkeletonLoader";
import MobileReadingSection from "./MobileReadingSection";
import emailService, { extractNewsletterName, extractFirstImage } from "@/services/email";
import type { EmailDetail } from "@/services/email";

/* ------------------------------------------------------------------ */
/* TYPES */
/* ------------------------------------------------------------------ */
type PageProps = {
  params: Promise<{ slug: string }>;
};

type ThemeMode = "light" | "dark" | "system";

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
      className="h-9 w-9 rounded-full flex items-center justify-center border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
      style={{ backgroundColor: '#ffffff' }}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* PAGE */
/* ------------------------------------------------------------------ */
/* ------------------------------------------------------------------ */
/* HELPER: HIGHLIGHTING */
/* ------------------------------------------------------------------ */
function applyHighlights(text: string, highlights: any[] | null | undefined, onHighlightClick?: (h: any) => void) {
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
          <mark
            key={`hl-${hIdx}`}
            id={`highlight-${h.id}`}
            className="bg-yellow-200 text-black rounded-sm px-0.5 cursor-pointer hover:bg-yellow-300 transition-colors relative z-10"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault(); // Prevent selection when clicking to erase
              onHighlightClick?.(h);
            }}
          >
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
  const searchParams = useSearchParams();

  const [emailData, setEmailData] = useState<EmailDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Reading Mode State (must be first) ---
  const [isReadingMode, setIsReadingMode] = useState(false);

  // --- Highlight/Eraser Tool State ---
  const [activeTool, setActiveTool] = useState<'highlighter' | 'eraser' | null>(null);
  const [localHighlights, setLocalHighlights] = useState<any[]>([]); // [{text, range, ...}]
  const pendingSavesRef = useRef<any[]>([]); // Ref to track pending saves without dependency cycles

  // Scroll to highlight if param exists
  useEffect(() => {
    const highlightId = searchParams.get('highlight');
    if (highlightId && emailData && isReadingMode) {
      // Wait a bit for rendering
      setTimeout(() => {
        const el = document.getElementById(`highlight-${highlightId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Optional: Add a flash effect
          el.style.transition = 'background-color 0.5s';
          const originalBg = el.style.backgroundColor;
          el.style.backgroundColor = '#ff9966'; // Darker orange flash
          setTimeout(() => {
            el.style.backgroundColor = originalBg;
          }, 1000);
        }
      }, 500);
    }
  }, [searchParams, emailData, isReadingMode]);

  // --- Custom Cursor Logic ---
  useEffect(() => {
    if (!isReadingMode) {
      document.body.style.cursor = '';
      return;
    }
    if (activeTool === 'highlighter') {
      document.body.style.cursor = 'url(/icons/highlight-icon.png), auto'; // Fallback to auto if custom cursor fails
    } else if (activeTool === 'eraser') {
      document.body.style.cursor = 'cell'; // Use cell cursor for eraser (crosshair-like)
    } else {
      document.body.style.cursor = '';
    }
    return () => { document.body.style.cursor = ''; };
  }, [activeTool, isReadingMode]);

  // --- Batch Save Logic ---
  const savePendingHighlights = useCallback(async () => {
    const highlightsToSave = pendingSavesRef.current;
    if (highlightsToSave.length === 0 || !emailData) return;

    console.log("Batch saving highlights:", highlightsToSave.length);
    
    // Clear pending immediately to avoid double saves
    pendingSavesRef.current = [];
    
    // Process in parallel
    const savePromises = highlightsToSave.map(h => 
      emailService.addHighlight(emailData.id, h.text, {}, 'yellow')
        .catch(err => console.error("Failed to save highlight:", h.text, err))
    );

    try {
      await Promise.all(savePromises);
      console.log("Batch save complete");
      
      // Update local emailData
      setEmailData(prev => {
        if (!prev) return null;
        // Merge saved highlights (assuming they saved successfully)
        // Ideally we should get the IDs back from server, but for now we trust the text matching
        const newHighlights = [...(prev.highlights || []), ...highlightsToSave.map(h => ({
            ...h,
            // If server returns real ID we should use it, but here we keep local ID or generate temp one
            // We'll rely on refresh for real IDs later
        }))];
        return { ...prev, highlights: newHighlights };
      });

      // Clear local highlights since they are now "saved" (merged into emailData)
      setLocalHighlights([]);

    } catch (err) {
      console.error("Batch save failed", err);
    }
  }, [emailData]);

  // Save when leaving reading mode
  useEffect(() => {
    if (!isReadingMode) {
      savePendingHighlights();
    }
  }, [isReadingMode, savePendingHighlights]);

  // Save on unmount
  useEffect(() => {
    return () => {
      savePendingHighlights();
    };
  }, [savePendingHighlights]);

  // --- Highlighting Logic (MouseUp) ---
  useEffect(() => {
    if (!isReadingMode || activeTool !== 'highlighter' || !emailData) return;

    const handleMouseUp = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) return;

      const rawText = selection.toString();
      const text = rawText.replace(/\s+/g, ' ').trim();

      if (text.length < 3) return;

      // Check if text exists in content (to avoid cross-paragraph highlights)
      const content = parseEmailBody(emailData.body);
      const existsInContent = content.some(p => p.includes(text));

      if (!existsInContent) {
        selection.removeAllRanges();
        toast.error('Please highlight text within a single paragraph.');
        return;
      }

      // Create new highlight
      const newHighlight = { 
        text, 
        id: `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, 
        color: 'yellow',
        createdAt: new Date().toISOString()
      };

      setLocalHighlights(prev => [...prev, newHighlight]);
      pendingSavesRef.current.push(newHighlight);
      
      selection.removeAllRanges();
      // toast.success('Highlighted'); // Optional: too many toasts might be annoying
    };

    const el = contentRef.current;
    if (el) el.addEventListener('mouseup', handleMouseUp);
    return () => {
      if (el) el.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isReadingMode, activeTool, emailData, localHighlights]);

  // --- Eraser Logic ---
  const handleHighlightClick = async (highlight: any) => {
    if (activeTool !== 'eraser' || !emailData) return;

    if (highlight.id.toString().startsWith('local-')) {
      // Remove from local
      setLocalHighlights(prev => prev.filter(h => h.id !== highlight.id));
      pendingSavesRef.current = pendingSavesRef.current.filter(h => h.id !== highlight.id);
      toast.success('Highlight removed');
    } else {
      // Remove from server
      try {
        await emailService.deleteHighlight(emailData.id, highlight.id);
        
        // Update local emailData
        setEmailData(prev => {
          if (!prev) return null;
          return { ...prev, highlights: (prev.highlights || []).filter(h => h.id !== highlight.id) };
        });
        toast.success('Highlight removed');
      } catch (err) {
        console.error("Failed to delete highlight", err);
        toast.error('Failed to remove highlight');
      }
    }
  };

  const [showReadSettings, setShowReadSettings] = useState(false);
  const [ttsOpen, setTtsOpen] = useState(false);
  // Default to FALSE so we show the Original HTML first
  // const [isReadingMode, setIsReadingMode] = useState(false); // Duplicate removed
  const [showAISummary, setShowAISummary] = useState(false);

  // READING APPEARANCE STATE
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");
  const [fontSize, setFontSize] = useState(18); // Default 18px
  const [pageColor, setPageColor] = useState<"white" | "paper" | "calm">("white");
  const [fontFamily, setFontFamily] = useState<"sans" | "serif" | "mono">("sans");
  const [fontType, setFontType] = useState<FontType>("Georgia");

  // HIGHLIGHT STATE
  // const [isHighlightMode, setIsHighlightMode] = useState(false); // REMOVED: using activeTool
  // const [isEraserMode, setIsEraserMode] = useState(false); // REMOVED: using activeTool

  // SCROLL STATE
  const [atTop, setAtTop] = useState(true);
  const [atBottom, setAtBottom] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Navigation state for next/previous emails
  const [nextEmailId, setNextEmailId] = useState<string | null>(null);
  const [prevEmailId, setPrevEmailId] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

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
          console.log('📧 Marking email as read on open:', slug);
          emailService.markEmailAsRead(slug)
            .then(() => {
              // Update local state to reflect read status
              setEmailData(prev => prev ? { ...prev, isRead: true } : null);
              
              // Dispatch event so inbox knows about the change
              if (typeof window !== 'undefined') {
                const event = new CustomEvent('emailStatusChanged', {
                  detail: {
                    emailId: slug,
                    isRead: true,
                    timestamp: new Date().toISOString()
                  }
                });
                window.dispatchEvent(event);
              }
            })
            .catch(err => {
              console.warn('Failed to mark email as read:', err);
            });
        }
      } catch (err: any) {
        console.error('Failed to fetch email:', err);
        setError(err.message || 'Failed to load email');
      } finally {
        setLoading(false);
      }
    };

    fetchEmail();
  }, [slug]);

  // Fetch inbox and preload adjacent emails
  useEffect(() => {
    const loadAdjacentEmails = async () => {
      try {
        // Get all cached inbox pages to find the email
        let allEmails: any[] = [];
        let page = 1;
        let found = false;
        
        // Try to find the email in cached pages first, then fetch if needed
        while (page <= 20 && !found) { // Limit to 20 pages max (1000 emails)
          const inboxData = await emailService.getInboxEmails('latest', undefined, page, false);
          
          if (!Array.isArray(inboxData) || inboxData.length === 0) {
            break;
          }
          
          allEmails = [...allEmails, ...inboxData];
          
          // Check if current email is in this batch
          const currentIndex = allEmails.findIndex((email: any) => email.id === slug);
          if (currentIndex !== -1) {
            found = true;
            console.log('📧 Found email at index:', currentIndex, 'after fetching', page, 'pages');
            
            const nextId = currentIndex < allEmails.length - 1 ? allEmails[currentIndex + 1].id : null;
            const prevId = currentIndex > 0 ? allEmails[currentIndex - 1].id : null;
            
            console.log('📧 Navigation IDs - prev:', prevId, 'next:', nextId);
            
            setNextEmailId(nextId);
            setPrevEmailId(prevId);
            
            // Preload adjacent emails
            if (nextId) {
              emailService.getEmailDetail(nextId).catch(() => {});
            }
            if (prevId) {
              emailService.getEmailDetail(prevId).catch(() => {});
            }
            break;
          }
          
          page++;
        }
        
        if (!found) {
          console.log('📧 Email not found in first', page - 1, 'pages (', allEmails.length, 'emails)');
        }
      } catch (err) {
        console.warn('Failed to load adjacent emails:', err);
      }
    };

    loadAdjacentEmails();
  }, [slug]);

  // Navigation handlers
  const handleNavigate = async (emailId: string) => {
    setIsNavigating(true);
    router.push(`/reading/${emailId}`);
    // Reset will happen on slug change
    setTimeout(() => setIsNavigating(false), 300);
  };

  const handleToggleRead = useCallback(async (forcedStatus?: boolean) => {
    if (!emailData) return;
    const nextStatus = forcedStatus !== undefined ? forcedStatus : !emailData.isRead;

    // If we're forcing status and it already matches, skip
    if (forcedStatus !== undefined && emailData.isRead === nextStatus) return;

    try {
      // Use toggleReadStatus which handles both read and unread
      await emailService.toggleReadStatus(emailData.id, nextStatus);
      // Optimistically update UI
      setEmailData(prev => prev ? { ...prev, isRead: nextStatus } : null);
      
      // Broadcast to parent window/tabs so inbox updates immediately
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('emailStatusChanged', {
          detail: {
            emailId: emailData.id,
            isRead: nextStatus,
            timestamp: new Date().toISOString()
          }
        });
        window.dispatchEvent(event);
      }
    } catch (e) {
      console.error("Failed to toggle read status", e);
    }
  }, [emailData]);

  const handleMoveToTrash = async () => {
    if (!emailData) return;
    if (confirm("Are you sure you want to move this to trash?")) {
      try {
        await emailService.moveToTrash(emailData.id);
        
        toast.success('Moved to trash', {
          description: 'Email has been moved to trash',
          action: {
            label: 'View',
            onClick: () => router.push('/delete'),
          },
        });
        
        // Navigate after a short delay to allow toast to show
        setTimeout(() => router.push('/inbox'), 500);
      } catch (e) {
        console.error("Failed to delete", e);
        toast.error('Failed to move to trash');
      }
    }
  };

  const handleToggleReadLater = async () => {
    if (!emailData) return;
    try {
      const nextStatus = !emailData.isReadLater;
      await emailService.toggleReadLater(emailData.id, nextStatus);
      setEmailData(prev => prev ? { ...prev, isReadLater: nextStatus } : null);
      
      if (nextStatus) {
        toast.success('Added to Read Later', {
          description: 'Email saved for later reading',
          action: {
            label: 'View',
            onClick: () => router.push('/read_later'),
          },
        });
      } else {
        toast.success('Removed from Read Later');
      }
    } catch (e) {
      console.error("Failed to toggle read later", e);
      toast.error('Failed to update read later');
    }
  };

  const handleToggleFavorite = async () => {
    if (!emailData) return;
    try {
      const nextStatus = !emailData.isFavorite;
      await emailService.toggleFavorite(emailData.id, nextStatus);
      setEmailData(prev => prev ? { ...prev, isFavorite: nextStatus } : null);
      
      if (nextStatus) {
        toast.success('Added to Favorites', {
          description: 'Email marked as favorite',
          action: {
            label: 'View',
            onClick: () => router.push('/favorite'),
          },
        });
      } else {
        toast.success('Removed from Favorites');
      }
    } catch (e) {
      console.error("Failed to toggle favorite", e);
      toast.error('Failed to update favorite');
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
    
    // Prevent multiple share calls
    if (showSharePopup === false) return;
    
    const shareUrl = `${window.location.origin}/reading/${emailData.id}`;
    const shareData = {
      title: title || 'Check out this article',
      text: title || 'Check out this article on Inbo',
      url: shareUrl,
    };
    
    // Close popup first to prevent multiple calls
    setShowSharePopup(false);
    
    try {
      if (navigator.share) {
        await navigator.share(shareData);
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

  // Ref to track if we've already triggered auto-mark-as-read to avoid duplicate calls
  const hasAutoMarkedAsReadRef = useRef(false);

  // Update ref when emailData changes
  useEffect(() => {
    if (emailData?.isRead) {
      hasAutoMarkedAsReadRef.current = true;
    }
  }, [emailData?.isRead]);

  /* ---------------- SCROLL STATE ---------------- */
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const handleScroll = () => {
      const atTopVal = el.scrollTop <= 5;
      const atBottomVal = el.scrollTop + el.clientHeight >= el.scrollHeight - 5;

      setAtTop(atTopVal);
      setAtBottom(atBottomVal);

      // Auto-mark as read when user scrolls to bottom (only once)
      if (atBottomVal && !hasAutoMarkedAsReadRef.current) {
        hasAutoMarkedAsReadRef.current = true;
        console.log('📖 User reached bottom of article - marking as read');
        handleToggleRead(true);
      }

      const progress = el.scrollTop / (el.scrollHeight - el.clientHeight);
      setScrollProgress(Math.min(100, Math.max(0, Math.round(progress * 100))));
    };

    handleScroll();
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleToggleRead]);

  // BACKGROUND CLASSES
  const getAppearanceClasses = () => {
    // If Dark Mode active
    if (themeMode === 'dark') {
      return "bg-[#1C1C1E] text-white"; // Standard Dark
    }

    // Light Mode (check Page Color) - Reading-optimized
    switch (pageColor) {
      case "paper": return "bg-[#F7F3E9] text-[#3A3A3A]"; // Warm sepia paper tone
      case "calm": return "bg-[#E8F4F8] text-[#2A2A2A]"; // Soft blue-gray calm
      default: return "bg-white text-gray-900"; // Pure white
    }
  };

  // TEXT COLOR FOR READING CONTENT
  const getTextColorClass = () => {
    if (themeMode === 'dark') return 'text-gray-100';
    switch (pageColor) {
      case "paper": return 'text-[#3A3A3A]';
      case "calm": return 'text-[#2A2A2A]';
      default: return 'text-gray-900';
    }
  };

  // SUBTLE BORDER COLOR
  const getBorderColorClass = () => {
    if (themeMode === 'dark') return 'border-gray-700';
    switch (pageColor) {
      case "paper": return 'border-[#E5DFC8]';
      case "calm": return 'border-[#D0E8F0]';
      default: return 'border-gray-200';
    }
  };

  const getFontFamily = () => {
    switch (fontFamily) {
      case "serif": return "font-serif";
      case "mono": return "font-mono";
      default: return "font-sans";
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

  if (loading) {
    return <EmailSkeletonLoader pageColor={pageColor} />;
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
        fontType={fontType}
        setFontType={setFontType}
      />
    );
  }

  const appearanceClass = getAppearanceClasses();

  return (
    <>
      <SEOHead title={title} description={emailData.contentPreview || "Reading view"} />

      {/* PROGRESS BAR */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200/50 z-[99999]">
        <div 
          className="h-full bg-[#C46A54] transition-all duration-300 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* MODAL CONTAINER */}
      <div className={`relative z-10 h-screen w-full flex hide-scrollbar ${appearanceClass} transition-colors duration-300`}>
        {/* Previous Email Button - Subtle, non-distracting */}
        {prevEmailId && (
          <button
            onClick={() => handleNavigate(prevEmailId)}
            disabled={isNavigating}
            className="fixed left-0 top-1/2 -translate-y-1/2 z-[9999] group"
            aria-label="Previous email"
            style={{ position: 'fixed', left: '0px', top: '50%', transform: 'translateY(-50%)' }}
          >
            <div className="w-8 h-20 rounded-r-2xl bg-gray-200/40 backdrop-blur-sm flex items-center justify-center transition-all duration-300 group-hover:w-10 group-hover:bg-gray-300/60 group-hover:shadow-lg group-disabled:opacity-30 group-disabled:cursor-not-allowed">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 group-hover:text-gray-700 transition-colors">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </div>
          </button>
        )}

        {/* Next Email Button - Subtle, non-distracting */}
        {nextEmailId && (
          <button
            onClick={() => handleNavigate(nextEmailId)}
            disabled={isNavigating}
            className="fixed right-0 top-1/2 -translate-y-1/2 z-[9999] group"
            aria-label="Next email"
            style={{ position: 'fixed', right: '0px', top: '50%', transform: 'translateY(-50%)' }}
          >
            <div className="w-8 h-20 rounded-l-2xl bg-gray-200/40 backdrop-blur-sm flex items-center justify-center transition-all duration-300 group-hover:w-10 group-hover:bg-gray-300/60 group-hover:shadow-lg group-disabled:opacity-30 group-disabled:cursor-not-allowed">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 group-hover:text-gray-700 transition-colors">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </div>
          </button>
        )}

        <div className="flex flex-col w-full min-h-screen bg-white">
          {/* HEADER - Isolated from newsletter content with forced white background */}
          <header 
            className={`h-[64px] flex items-center justify-end px-6 border-b border-gray-200 transition-all relative z-[100] ${isReadingMode ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`} 
            style={{ backgroundColor: '#ffffff !important' }}
          >
            <div className="flex items-center gap-2" style={{ backgroundColor: 'transparent' }}>
              <IconButton
                onClick={() => setIsReadingMode(true)}
              >
                <Type size={20} className="text-gray-700" />
              </IconButton>

              <IconButton onClick={() => setTtsOpen(prev => !prev)}>
                <Volume2 size={20} className="text-gray-700" />
              </IconButton>

              <div className="relative group">
                <IconButton onClick={handleToggleReadLater}>
                  <Clock size={20} className={emailData.isReadLater ? 'fill-current text-blue-500' : 'text-gray-700'} />
                </IconButton>
                <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-50">
                  {emailData.isReadLater ? 'Remove from Read Later' : 'Add to Read Later'}
                </div>
              </div>

              <div className="relative group">
                <IconButton onClick={handleToggleRead}>
                  <div className="relative">
                    <CheckCircle size={20} className={emailData.isRead ? 'fill-current text-green-500' : 'text-gray-700'} />
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
              onClick={() => router.push('/inbox')}
              className="ml-4 h-9 w-9 rounded-lg flex items-center justify-center border border-gray-300 hover:bg-gray-100 transition-colors"
              aria-label="Close and return to inbox"
              style={{ backgroundColor: '#ffffff' }}
            >
              <X size={20} className="text-gray-700" />
            </button>
          </header>

          {/* CONTENT AREA */}
          <div className="relative flex flex-1 overflow-hidden">
            {/* Scroll Buttons - Standard Mode Only */}
            {!isReadingMode && (
              <div className="absolute left-4 top-6 z-50 flex flex-col gap-2">
                <button
                  disabled={atTop}
                  onClick={() => {
                    console.log("Scrolling to top...");
                    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`h-9 w-9 rounded-xl flex items-center justify-center transition-all ${atTop ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-black text-white hover:scale-110"}`}
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
              className={`flex-1 overflow-y-auto py-10 hide-scrollbar transition-all duration-300 ${getAppearanceClasses()} ${activeTool === 'highlighter' ? 'cursor-text selection:bg-yellow-200 selection:text-black' : activeTool === 'eraser' ? 'cursor-pointer selection:bg-red-200 selection:text-black' : ''}`}
            >
              <div
                className={`mx-auto max-w-[760px] px-10 transition-all duration-300 ${getFontFamily()}`}
              >
                <div className={`mb-10 pb-8 border-b ${getBorderColorClass()}`}>
                  <h1 className={`text-4xl font-serif font-bold mb-4 ${getTextColorClass()} tracking-tight`}>{title}</h1>
                  <p className={`text-sm font-medium ${themeMode === 'dark' ? 'text-gray-400' : pageColor === 'paper' ? 'text-[#6B6B6B]' : pageColor === 'calm' ? 'text-[#5A5A5A]' : 'text-gray-600'}`}>{author} • {published}</p>
                </div>

                {isReadingMode && hero && (
                  <div className="rounded-xl overflow-hidden border border-gray-200/60 shadow-md hover:shadow-lg transition-shadow mb-10">
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

                {/* CONDITIONAL RENDERING - Reader mode shows parsed content, default shows HTML */}
                {isReadingMode ? (
                  <article 
                    className={`max-w-3xl mx-auto [&_a]:text-blue-600 [&_a]:underline [&_a]:hover:text-blue-700 [&_strong]:font-bold [&_em]:italic [&_ul]:ml-6 [&_ol]:ml-6 [&_li]:mb-2 ${getTextColorClass()}`}
                    style={{ 
                      fontSize: `${fontSize}px`, 
                      lineHeight: 1.8,
                      fontFamily: getFontFamilyCSS(),
                      letterSpacing: '0.3px'
                    }}
                  >
                    {content.map((p, i) => (
                      <p key={i} className="mb-6 leading-relaxed first-letter:ml-8" style={{ opacity: 0.95 }}>
                        {applyHighlights(p, [...(emailData?.highlights || []), ...localHighlights], handleHighlightClick)}
                      </p>
                    ))}
                  </article>
                ) : (
                  <div
                    className={`max-w-3xl mx-auto prose prose-lg prose-headings:font-serif prose-p:leading-8 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:font-bold prose-em:italic prose-blockquote:border-l-4 prose-blockquote:pl-4 [&_*]:!text-inherit [&_strong]:!font-semibold [&_ul]:ml-6 [&_ol]:ml-6 [&_li]:mb-2 ${getTextColorClass()} ${getBorderColorClass()}`}
                    style={{ 
                      fontSize: `${fontSize}px`,
                      fontFamily: getFontFamilyCSS(),
                      lineHeight: 1.8,
                      letterSpacing: '0.3px',
                      isolation: 'isolate'
                    }}
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
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-200/60 flex flex-col">
            <button
              onClick={() => setShowReadSettings(true)}
              className="p-3 rounded-t-3xl hover:bg-gray-100 bg-gray-50/50 transition-colors"
            >
              <img src="/icons/read-style-icon.png" alt="style" className="w-6 h-6" />
            </button>
            <button
              onClick={() => setActiveTool(activeTool === 'highlighter' ? null : 'highlighter')}
              className={`p-3 hover:bg-gray-100 transition-colors ${activeTool === 'highlighter' ? 'bg-yellow-100 hover:bg-yellow-200' : ''}`}
              title="Toggle Highlight Mode"
            >
              <Highlighter size={24} className="text-gray-700" />
            </button>
            <button
              onClick={() => setActiveTool(activeTool === 'eraser' ? null : 'eraser')}
              className={`p-3 rounded-b-3xl hover:bg-gray-100 transition-colors ${activeTool === 'eraser' ? 'bg-yellow-100 hover:bg-yellow-200' : ''}`}
              title="Toggle Eraser Mode"
            >
              <Eraser size={24} className="text-gray-700" />
            </button>
            <button 
              onClick={() => setShowAISummary(true)}
              className="p-3 hover:bg-purple-50 transition-colors"
              title="AI Summary"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500">
                <path d="M12 3l1.09 3.41L16.5 7.5l-3.41 1.09L12 12l-1.09-3.41L7.5 7.5l3.41-1.09L12 3z"/>
                <path d="M19 10l.54 1.69L21.23 12l-1.69.54L19 14l-.54-1.69L16.77 12l1.69-.54L19 10z"/>
                <path d="M5 15l.54 1.69L7.23 17l-1.69.54L5 19l-.54-1.69L2.77 17l1.69-.54L5 15z"/>
              </svg>
            </button>
            <div className="relative" data-share-popup>
              <button
                onClick={() => setShowSharePopup(v => !v)}
                className={`p-3 hover:bg-gray-100 transition-colors ${showSharePopup ? 'bg-gray-100' : ''}`}
                title="Share"
              >
                <Link2 size={24} className="text-gray-700" />
              </button>

              {showSharePopup && (
                <div className="absolute left-full ml-2 top-0 w-52 bg-white rounded-xl shadow-lg border p-2 z-50">
                  <p className="text-xs font-semibold text-gray-500 px-3 py-1">Share</p>
                  <button
                    onClick={handleCopyLink}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg text-sm font-medium flex items-center gap-2 text-gray-700"
                  >
                    <Link2 size={16} className="text-gray-500" />
                    {copySuccess ? 'Copied!' : 'Copy Link'}
                  </button>
                  {typeof window !== 'undefined' && 'share' in navigator && (
                    <button
                      onClick={handleNativeShare}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg text-sm font-medium flex items-center gap-2 text-gray-700"
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
                <LucideCircleEllipsis size={24} className="text-gray-700" />
              </button>

              {showMoreMenu && (
                <div className="absolute left-full ml-2 bottom-0 w-48 bg-white rounded-xl shadow-lg border p-2 z-50">
                  <button
                    onClick={handleToggleReadLater}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg text-sm font-medium flex items-center gap-2 text-gray-700"
                  >
                    <Bookmark size={16} className={emailData.isReadLater ? 'fill-current text-blue-500' : 'text-gray-500'} />
                    {emailData.isReadLater ? 'Remove Read Later' : 'Read Later'}
                  </button>
                  <button
                    onClick={handleToggleFavorite}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg text-sm font-medium flex items-center gap-2 text-gray-700"
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

      {/* READ MODE SETTINGS MODAL - Only in Reading Mode */}
      {showReadSettings && isReadingMode && (
        <ReadModeSettings
          isOpen={showReadSettings}
          onClose={() => setShowReadSettings(false)}
          // Share the same appearance state as the page so controls work
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
          // Full settings for reading mode
          showFontSelector={true}
          position='center'
          activeTool={activeTool}
          setActiveTool={setActiveTool}
        />
      )}

      <TTSPlayerModal
        isOpen={ttsOpen}
        onRequestClose={() => setTtsOpen(false)}
        title={title}
        // TTS always uses the parsed text
        content={content.join(" ")}
      />

      <AISummaryModal
        isOpen={showAISummary}
        onClose={() => setShowAISummary(false)}
        emailId={emailData.id}
        title={title}
        existingSummary={emailData.summary}
      />

      <style jsx global>{`
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </>
  );
}
