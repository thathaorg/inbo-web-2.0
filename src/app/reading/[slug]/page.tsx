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
} from "lucide-react";
import TTSPlayerModal from "@/components/TTSPlayerModal";
import ReadModeSettings from "@/components/reading/ReadModeSettings";
import MobileReadingSection from "./MobileReadingSection";

/* ------------------------------------------------------------------ */
/* TYPES */
/* ------------------------------------------------------------------ */
type PageProps = {
  params: Promise<{ slug: string }>;
};

/* ------------------------------------------------------------------ */
/* DEMO DATA — FULL CONTENT RETAINED */
/* ------------------------------------------------------------------ */
type DemoItem = {
  title: string;
  author: string;
  published: string;
  readTime: string;
  hero: string;
  content: string[];
  tools: { id: string; icon: React.ReactNode }[];
};

const DEMO: Record<string, DemoItem> = {
  "24h-1": {
    title:
      "Exploring modern system design: patterns, constraints, and trade-offs shaping today’s platforms",
    author: "ByteByteGo Newsletter",
    published: "Oct 3rd · 6 min read",
    readTime: "6 mins",
    hero: "/logos/sample-img.png",
    content: [
      "This demo article is rendered with placeholder content.",
      "The reading surface keeps a focused, full-screen experience with minimal chrome.",
      "Typography uses Tailwind tokens from the app, ensuring consistency across devices.",
      "System design today requires balancing scalability, reliability, and developer velocity.",
      "Trade-offs emerge between consistency and availability, latency and throughput.",
      "This demo article is rendered with placeholder content.",
      "The reading surface keeps a focused, full-screen experience with minimal chrome.",
      "Typography uses Tailwind tokens from the app, ensuring consistency across devices.",
      "System design today requires balancing scalability, reliability, and developer velocity.",
      "Trade-offs emerge between consistency and availability, latency and throughput.",
      "This demo article is rendered with placeholder content.",
      "The reading surface keeps a focused, full-screen experience with minimal chrome.",
      "Typography uses Tailwind tokens from the app, ensuring consistency across devices.",
      "System design today requires balancing scalability, reliability, and developer velocity.",
      "Trade-offs emerge between consistency and availability, latency and throughput.",
    ],
    tools: [
      { id: "save", icon: <Bookmark size={22} /> },
      { id: "share", icon: <Share2 size={22} /> },
      { id: "open", icon: <ExternalLink size={22} /> },
      { id: "more", icon: <LucideCircleEllipsis size={22} /> },
    ],
  },
};

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
  onEnableReader,
  value = "system",
}: {
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  onEnableReader: () => void;
  value?: ThemeMode;
}) {
  if (!anchorRef.current) return null;

  const rect = anchorRef.current.getBoundingClientRect();
  const [selected, setSelected] = useState<ThemeMode>(value);

  return (
    <div
      className="fixed z-[100]"
      style={{ top: rect.bottom + 10, left: rect.left - 140 }}
    >
      <div className="w-[340px] rounded-2xl bg-white p-5 border border-gray-200/60 shadow-[0_12px_32px_rgba(0,0,0,0.18)]">
        <div className="flex justify-between items-center mb-4">
          <p className="font-semibold text-sm">Set your reading style</p>
          <button onClick={onClose}>
            <X size={14} />
          </button>
        </div>

        <button
          onClick={onEnableReader}
          className="w-full h-11 rounded-full bg-[#B46952] hover:bg-[#C46A54] text-white font-medium mb-4"
        >
          Turn on Reader Mode
        </button>

        <div className="flex gap-2">
          <ThemeButton label="Light" icon={<Sun size={14} />} active={selected === "light"} onClick={() => setSelected("light")} />
          <ThemeButton label="Dark" icon={<Moon size={14} />} active={selected === "dark"} onClick={() => setSelected("dark")} />
          <ThemeButton label="System" icon={<Laptop size={14} />} active={selected === "system"} onClick={() => setSelected("system")} />
        </div>
      </div>
    </div>
  );
}

function ThemeButton({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 h-10 rounded-full flex items-center justify-center gap-2 text-sm font-medium ${
        active
          ? "bg-black text-white"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}


/* ------------------------------------------------------------------ */
/* PAGE */
/* ------------------------------------------------------------------ */
export default function ReadingPage(props: PageProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { slug } = use(props.params);
  const router = useRouter();
  const data = DEMO[slug] ?? DEMO["24h-1"];
  const [showReadSettings, setShowReadSettings] = useState(false);
  const [ttsOpen, setTtsOpen] = useState(false);
  const [isReadingMode, setIsReadingMode] = useState(false);
  const [showReadingStyle, setShowReadingStyle] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const [atBottom, setAtBottom] = useState(false);

  const typeBtnRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  /* ---------------- SCROLL STATE ---------------- */
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const handleScroll = () => {
      setAtTop(el.scrollTop <= 0);
      setAtBottom(el.scrollTop + el.clientHeight >= el.scrollHeight - 1);
    };

    handleScroll();
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

    if (isMobile) {
      return (
        <MobileReadingSection
          title={data.title}
          author={data.author}
          readTime={data.readTime}
          published={data.published}
          content={data.content}
          onBack={() => router.back()}
        />
      );
    }


  return (
    <>
      <SEOHead title={data.title} description="Reading view" />

      {/* MODAL CONTAINER */}
      <div className="relative z-10 h-screen w-full flex hide-scrollbar">
        <div className="bg-white shadow-xl flex flex-col w-full">
          {/* HEADER */}
          {!isReadingMode && (
            <header className="h-[64px] flex items-center justify-between px-6 border-b">
              <div />

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

                <IconButton>
                  <img src="/icons/read-timer-icon.png" alt="timer" />
                </IconButton>

                <IconButton>
                  <img src="/icons/read-check-icon.png" alt="check" />
                </IconButton>

                <IconButton>
                  <img src="/icons/read-more-icon.png" alt="more" />
                </IconButton>
              </div>

              <button
                onClick={() => router.back()}
                className="h-9 w-9 rounded-lg flex items-center justify-center border hover:bg-gray-100"
              >
                <X size={24} />
              </button>
            </header>
          )}

          {/* CONTENT AREA */}
          <div className="relative flex flex-1 overflow-hidden">
            {!isReadingMode && (
              <div className="absolute left-4 top-6 z-50 flex flex-col gap-2">
                <button
                  disabled={atTop}
                  onClick={() =>
                    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" })
                  }
                  className={`h-9 w-9 rounded-xl flex items-center justify-center transition-all ${
                    atTop
                      ? "bg-gray-200 text-gray-400"
                      : "bg-black text-white hover:scale-110"
                  }`}
                >
                  <ArrowUp size={16} />
                </button>

                <button
                  disabled={atBottom}
                  onClick={() =>
                    contentRef.current?.scrollTo({
                      top: contentRef.current.scrollHeight,
                      behavior: "smooth",
                    })
                  }
                  className={`h-9 w-9 rounded-xl flex items-center justify-center transition-all ${
                    atBottom
                      ? "bg-gray-200 text-gray-400"
                      : "bg-black text-white hover:scale-110"
                  }`}
                >
                  <ArrowDown size={16} />
                </button>
              </div>
            )}

            <div ref={contentRef} className="flex-1 overflow-y-auto py-10 hide-scrollbar">
              <div className="mx-auto max-w-[760px] px-10">
                <h1 className="text-[34px] font-bold mb-8">{data.title}</h1>

                {!isReadingMode && (
                  <div className="rounded-2xl overflow-hidden border mb-10">
                    <Image
                      src={data.hero}
                      alt=""
                      width={1200}
                      height={600}
                      className="w-full"
                    />
                  </div>
                )}

                <article className="prose prose-lg">
                  {data.content.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </article>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* READER MODE TOOLBAR */}
      {isReadingMode && (
        <div className="fixed left-5 top-1/2 -translate-y-1/2 z-50">
          <div className="bg-white rounded-3xl shadow-xl border flex flex-col">
            <button 
            onClick={() => setShowReadSettings(true)} 
            className="p-3 rounded-t-3xl hover:bg-gray-100"
            >
              <img src="/icons/read-style-icon.png" alt="style" />
            </button>
            <button className="p-3 hover:bg-gray-100">
              <img src="/icons/highlight-icon.png" alt="highlight" />
            </button>
            <button className="p-3 hover:bg-gray-100">
              <img src="/icons/note-icon.png" alt="note" />
            </button>
            <button className="p-3 hover:bg-gray-100">
              <Link2 size={24} />
            </button>
            <button
              onClick={() => setIsReadingMode(false)}
              className="p-3 border-t rounded-b-3xl hover:bg-gray-100"
            >
              <img src="/icons/close-icon.png" alt="close" />
            </button>
          </div>
        </div>
      )}

      {showReadingStyle && (
        <ReadingStylePopover
          anchorRef={typeBtnRef}
          onClose={() => setShowReadingStyle(false)}
          onEnableReader={() => {
            setShowReadingStyle(false);
            setIsReadingMode(true);
          }}
        />
      )}
      <ReadModeSettings
        isOpen={showReadSettings}
        onClose={() => setShowReadSettings(false)}
      />


      <TTSPlayerModal
        isOpen={ttsOpen}
        onRequestClose={() => setTtsOpen(false)}
        title={data.title}
        content={data.content.join(" ")}
      />
    <style jsx global>{`
      .hide-scrollbar {
        -ms-overflow-style: none;  /* IE & Edge */
        scrollbar-width: none;     /* Firefox */
      }

      .hide-scrollbar::-webkit-scrollbar {
        display: none;             /* Chrome, Safari */
      }
    `}</style>
    
    </>
    
  );
}


