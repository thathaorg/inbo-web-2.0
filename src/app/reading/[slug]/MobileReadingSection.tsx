"use client";

import { useEffect, useRef, useState } from "react";
import MobileFloatingNavbar from "@/components/reading/MobileFloatingNavbar";
import MobileReadingMenu from "@/components/reading/MobileReadingMenu";
import MobileReadingHeader from "@/components/reading/MobileReadingHeader";
import ReadModeSettings from "@/components/reading/ReadModeSettings";

interface MobileReadingSectionProps {
  title: string;
  author: string;
  readTime: string;
  published: string;
  content: string[];
  onBack?: () => void;
}

export default function MobileReadingSection({
  title,
  author,
  readTime,
  published,
  content,
  onBack,
}: MobileReadingSectionProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  const [atTop, setAtTop] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [showReadSettings, setShowReadSettings] = useState(false);

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

  return (
    <div className="relative h-screen bg-[#F5F5F5] overflow-hidden">
      {/* ================= HEADER ================= */}
      {atTop && (
        <MobileReadingHeader
          title="ByteByteGo Newsletter"
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
          <div className="bg-white rounded-2xl px-5 py-6 shadow-sm">
            <article className="space-y-6 text-[17px] leading-relaxed text-gray-900">
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
        <MobileReadingMenu onClose={() => setShowMenu(false)} />
      )}

      {/* ================= READ MODE SETTINGS (ROOT) ================= */}
      {showReadSettings && (
        <ReadModeSettings
          isOpen={showReadSettings}
          onClose={() => setShowReadSettings(false)}
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
