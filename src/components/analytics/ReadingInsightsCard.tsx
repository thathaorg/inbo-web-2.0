"use client";

import { useEffect, useState } from "react";
import analyticsService, { ReadingInsights, CategoryData } from "@/services/analytics";

// ---------- Config ----------
const STATIC_CONFIG = {
  ctaText: "Share with Friends",
  socials: [
    { id: "linkedin", src: "/icons/linkedin-icon.png", alt: "LinkedIn" },
    { id: "instagram", src: "/icons/instagram-icon.png", alt: "Instagram" },
    { id: "facebook", src: "/icons/facebook-icon.png", alt: "Facebook" },
    { id: "twitter", src: "/icons/twitter-icon.png", alt: "Twitter" },
  ],
};

// ---------- Component ----------
export default function ReadingInsightsCard() {
  const [insights, setInsights] = useState<ReadingInsights | null>(null);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [insData, catData] = await Promise.all([
          analyticsService.getReadingInsights(),
          analyticsService.getCategoryStats()
        ]);
        setInsights(insData);
        setCategories(catData);
      } catch (err) {
        console.error("Failed to load reading insights", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Stats for Bottom Bar
  const stats = [
    { id: "newsletter", label: "newsletter read", value: insights?.newsletter_read || 0 },
    { id: "favourite", label: "Favourite mark", value: insights?.favourite_mark || 0 },
    { id: "highlights", label: "Highlights made", value: insights?.highlights_made || 0 },
  ];

  // Visual Palette - Background is Purple
  // We stack circles: Largest (Cyan) -> Medium (Pink) -> Small (Orange) -> Smallest (Yellow)
  // But our category data logic returns them in an order. We should map specific indices or ID to the visual layers.

  // Mapping API categories to Visual Layers
  // Visual Layers (Outer to Inner):
  // 1. Background (Purple) - Static container
  // 2. Cyan Layer - "Design" (or 4th cat)
  // 3. Pink Layer - "Business" (or 3rd cat)
  // 4. Orange Layer - "Tech" (or 2nd cat)
  // 5. Yellow Layer - "AI" (or 1st cat)

  // Ensure we have 4 categories for the visual
  const safeCats = [...categories];
  // Fillers if missing
  if (safeCats.length < 4) safeCats.push({ id: 'c1', label: 'Other', value: 10, color: 'from-blue-400 to-blue-500' });
  if (safeCats.length < 4) safeCats.push({ id: 'c2', label: 'General', value: 10, color: 'from-green-400 to-green-500' });

  // Specific Visual Map matching the image
  // Image: Yellow(Left) < Orange < Pink < Cyan < Purple BG
  const layers = [
    { cat: safeCats[3], width: '90%', height: '140%', left: '30%', color: 'bg-cyan-400', gradient: 'bg-gradient-to-r from-[#00BCD4] to-[#26C6DA]' }, // Cyan (Back)
    { cat: safeCats[2], width: '75%', height: '120%', left: '15%', color: 'bg-pink-500', gradient: 'bg-gradient-to-r from-[#EC407A] to-[#F48FB1]' },   // Pink
    { cat: safeCats[1], width: '55%', height: '100%', left: '5%', color: 'bg-orange-500', gradient: 'bg-gradient-to-r from-[#FF7043] to-[#FFAB91]' },  // Orange
    { cat: safeCats[0], width: '35%', height: '80%', left: '-5%', color: 'bg-yellow-400', gradient: 'bg-gradient-to-r from-[#FFCA28] to-[#FFE082]' },   // Yellow (Front)
  ];

  return (
    <div
      className="
        relative w-full
        h-[260px]
        md:h-[240px]
        rounded-2xl
        overflow-hidden
        bg-gradient-to-r from-[#9575CD] to-[#B39DDB] 
      "
    >
      {/* 
        ================= CIRCULAR LAYERS ================= 
        Implementation: Absolute positioned rounded divs.
        Style: Solid/Gradient colors, shadow for depth.
      */}
      <div className="absolute inset-0 overflow-hidden flex items-center">
        {layers.map((layer, i) => (
          <div
            key={i}
            className={`
              absolute rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.15)]
              flex items-center justify-end pr-8
              transition-all duration-1000 ease-out
              ${layer.gradient}
            `}
            style={{
              width: layer.width,
              height: layer.height, // Height > 100% creates the arc effect if centered/clipped
              left: layer.left,
              zIndex: 10 + i,
              // Aspect ratio fix: ensure it looks round. 
              // Since container is rect, using % height might distort. 
              // Better to use aspect-square or fixed pixels calculated.
              // For simplicity in this constrained environment, we use strict aspect ratio via padding or min-height.
              // Actually, simply making them huge squares centered vertically works.
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          >
            {/* LABEL */}
            <span className="text-white/90 font-semibold text-lg drop-shadow-md">
              {layer.cat?.label}
            </span>
          </div>
        ))}

        {/* Soft Glare Overlay */}
        <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-white/20 blur-3xl rounded-full z-20 pointer-events-none" />
      </div>

      {/* ================= BOTTOM BAR ================= */}
      <div
        className="
          absolute bottom-0 left-0 right-0
          bg-white/10
          backdrop-blur-md
          border-t border-white/20
          
          px-4 py-3
          flex flex-col gap-3

          md:h-[60px]
          md:flex-row
          md:items-center
          md:px-6
          md:gap-6
          z-30
        "
      >
        {/* Stats */}
        <div className="hidden md:flex items-center gap-4 text-white text-sm truncate flex-1 font-medium drop-shadow-sm">
          {stats.map((stat, i) => (
            <span key={stat.id} className="flex items-center gap-2">
              <span className="opacity-90">{stat.value}</span>
              <span className="opacity-70">{stat.label}</span>
              {i < stats.length - 1 && <span className="opacity-40 mx-1">•</span>}
            </span>
          ))}
        </div>

        {/* Mobile Stats */}
        <div className="md:hidden flex justify-between text-white text-xs font-medium">
          <span>{insights?.newsletter_read || 0} Read</span>
          <span>{insights?.favourite_mark || 0} Fav</span>
          <span>{insights?.highlights_made || 0} Highlight</span>
        </div>

        {/* CTA + Socials */}
        <div className="flex items-center justify-end gap-3 md:gap-4 shrink-0">
          <div className="flex items-center gap-2">
            {STATIC_CONFIG.socials.map(({ id, src, alt }) => (
              <button key={id} className="opacity-80 hover:opacity-100 hover:scale-110 transition">
                <img src={src} alt={alt} className="h-5 w-5" />
              </button>
            ))}
          </div>
          <button className="bg-[#C46A54] text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-lg hover:bg-[#D87D67] transition">
            {STATIC_CONFIG.ctaText}
          </button>
        </div>
      </div>
    </div>
  );
}
