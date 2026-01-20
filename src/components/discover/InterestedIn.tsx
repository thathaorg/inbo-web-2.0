// InterestedIn.tsx
"use client";

import React, { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMediaQuery } from "@/hooks/useMediaQuery"; // <-- your existing hook

export default function InterestedIn({ categoryImages }: { categoryImages?: Record<string, string[]> }) {
  const categories = [
    "Technology","AI","Economics","Startups","Business",
    "Finance","Career","Productivity","Design","Marketing",
    "Culture","Health","Current Affairs","Crypto",
  ];

  // Desktop: split into two rows
  const row1 = categories.filter((_, i) => i % 2 === 0);
  const row2 = categories.filter((_, i) => i % 2 === 1);

  // Mobile: 1 row contains ALL
  const mobileRow = categories;

  const [selected, setSelected] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 639px)");

  // Convert category → slug (e.g., "Current Affairs" → "current-affairs")
  const slugify = (label: string) =>
    label.toLowerCase().replace(/\s+/g, "-");

  const toggle = (name: string) => {
    setSelected(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;

    const step = el.clientWidth * 0.65;
    const max = el.scrollWidth - el.clientWidth;

    const next =
      dir === "left"
        ? Math.max(0, el.scrollLeft - step)
        : Math.min(max, el.scrollLeft + step);

    el.scrollTo({ left: next, behavior: "smooth" });
  };

  // 🔥 Desktop behavior: scroll to matching carousel ID
  const scrollToCarousel = (label: string) => {
    const slug = slugify(label);
    const el = document.getElementById(`carousel-${slug}`);

    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      // Optionally fine-tune offset if needed (e.g. for sticky header)
      setTimeout(() => {
        window.scrollBy({ top: -20, left: 0, behavior: "smooth" });
      }, 400);
    }
    // Auto-clear active state after scroll
    setTimeout(() => setSelected([]), 600);
  };

    // 🔥 Pill component with desktop + mobile behavior
  const Pill = ({ label }: { label: string }) => {
    const handleClick = () => {
      const slug = slugify(label);

      if (isMobile) {
        // 👉 MOBILE → navigate to dynamic category page
        router.push(`/discover/${slug}`);
        return;
      }

      // 👉 DESKTOP → toggle and scroll to carousel
      toggle(label);
      scrollToCarousel(label);
    };

    const images = categoryImages?.[label] || [];
    const hasImages = images.length > 0;

    return (
      <button
        onClick={handleClick}
        className={
          "px-5 py-2 rounded-full flex items-center gap-3 whitespace-nowrap text-[16px] font-medium transition " +
          (selected.includes(label)
            ? "bg-black text-white"
            : "bg-[#F3F4F6] text-[#0C1014]")
        }
      >
        <div className="relative w-[48px] h-5 flex-shrink-0">
          {hasImages ? (
            <>
              {/* Stacked images from category */}
              {/* 3rd image (bottom) */}
              {images[2] && (
                <img
                  src={images[2]}
                  className="absolute left-[28px] w-5 h-5 rounded-full z-[1] object-cover border border-white"
                  alt=""
                />
              )}
              {/* 2nd image (middle) */}
              {images[1] && (
                <img
                  src={images[1]}
                  className="absolute left-[14px] w-5 h-5 rounded-full z-[2] object-cover border border-white"
                  alt=""
                />
              )}
              {/* 1st image (top) */}
              {images[0] && (
                <img
                  src={images[0]}
                  className="absolute left-0 w-5 h-5 rounded-full z-[3] object-cover border border-white"
                  alt=""
                />
              )}
            </>
          ) : (
            <>
              <span className="absolute left-0 w-5 h-5 rounded-full bg-[#08DC2F] z-[3]" />
              <img
                src='/icons/forbes-icon.png'
                className="absolute left-[14px] w-5 h-5 rounded-full z-[2]"
              />
              <span className="absolute left-[28px] w-5 h-5 rounded-full bg-[#DC4949] z-[1]" />
            </>
          )}
        </div>

        <span>{label}</span>
      </button>
    );
  };

  return (
    <>
      {/* -------- DESKTOP VIEW -------- */}
      <div className="hidden sm:flex bg-white border rounded-2xl p-4 w-full flex-col gap-4">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <img src="/icons/InterestedIn-icon.png" className="w-6 h-6" />
            <p className="text-[16px] font-medium px-2">
              What are you interested in?
            </p>
          </div>

          {/* Desktop arrows */}
          <div className="flex gap-2">
            <button
              onClick={() => scroll("left")}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Scroll wrapper */}
        <div
          ref={scrollRef}
          className="no-scrollbar overflow-x-auto overflow-y-hidden"
        >
          {/* Desktop: 2 rows */}
          <div className="flex flex-col gap-3 w-max">
            <div className="flex gap-4 flex-nowrap">
              {row1.map(item => <Pill key={item} label={item} />)}
            </div>
            <div className="flex gap-4 flex-nowrap">
              {row2.map(item => <Pill key={item} label={item} />)}
            </div>
          </div>
        </div>
      </div>

      {/* -------- MOBILE VIEW -------- */}
      <div className="sm:hidden w-full overflow-x-auto no-scrollbar">
        <div className="flex gap-4 flex-nowrap w-max">
          {mobileRow.map(item => <Pill key={item} label={item} />)}
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display:none; }
        .no-scrollbar { scrollbar-width:none; -ms-overflow-style:none; }
      `}</style>
    </>
  );
}
