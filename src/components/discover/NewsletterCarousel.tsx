"use client";

import { useRef } from "react";
import Image from "next/image";
import NewsletterCard, { NewsletterEntry } from "@/components/discover/NewsletterCarouselItem";

interface CarouselProps {
  title: string;
  items: NewsletterEntry[];
  showArrows?: boolean; 
  onReachEnd?: () => void;
}

export default function NewsletterCarousel({
  title,
  items = [],
  showArrows = true,
  onReachEnd,
}: CarouselProps) {
  // 🔥 Create a slug-safe ID from the title
  const carouselId = `carousel-${title.toLowerCase().replace(/\s+/g, "-")}`;

  // Needed so arrows scroll the carousel
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 320; // width of one card + gap
    
    // Check if we are near the end before scrolling (for button click)
    if (direction === "right" && onReachEnd) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      if (scrollLeft + clientWidth >= scrollWidth - (amount * 2)) {
        onReachEnd();
      }
    }

    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  const handleScroll = () => {
    if (!scrollRef.current || !onReachEnd) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const amount = 320;
    // Trigger when within 2 cards of end
    if (scrollLeft + clientWidth >= scrollWidth - (amount * 2)) {
      onReachEnd();
    }
  };

  return (
    <div
      id={carouselId}   // <-- 🔥 NEW ID HERE
      className="flex flex-col gap-4 w-full relative"
    >
      {/* Title */}
      <h3 className="text-[24px] ml-2 font-semibold leading-[28px] text-[#0F0F0F]">
        {title}
      </h3>

      {/* Wrapper (relative so arrows can sit over it) */}
      <div className="relative">
        {/* LEFT ARROW */}
        {showArrows && (
          <button
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-black rounded-full shadow-md"
            onClick={() => scroll("left")}
          >
            <Image
              src="/icons/carouselarrow-icon.png"
              alt="Scroll left"
              width={32}
              height={32}
            />
          </button>
        )}

        {/* Scroll Container */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="carousel-scroll flex gap-4 overflow-x-auto pb-3"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {items.map((item, i) => (
            <div key={i} className="min-w-[260px] relative pointer-events-auto">
              <NewsletterCard {...item} />
            </div>
          ))}
        </div>

        {/* RIGHT ARROW */}
        {showArrows && (
          <button
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-black rounded-full shadow-md"
            onClick={() => scroll("right")}
          >
            <Image
              src="/icons/carouselarrow-icon.png"
              alt="Scroll right"
              width={32}
              height={32}
              className="rotate-180"
            />
          </button>
        )}
      </div>

      {/* Hide scrollbar */}
      <style jsx>{`
        .carousel-scroll {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .carousel-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
