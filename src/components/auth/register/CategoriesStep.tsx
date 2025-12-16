"use client";

import {
  CheckSquare2,
  Repeat2,
  Clapperboard,
  Laptop,
  BarChart3,
  Briefcase,
  Sparkles,
  Rocket,
  Film,
  Landmark,
  HeartPulse,
  Globe,
  BarChartBig,
  Drama,
  Leaf,
  Newspaper,
} from "lucide-react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useEffect, useState } from "react";

export default function CategoriesStep({
  categories,
  toggleCategory,
  onContinue,
  onBack,
}: any) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const canContinue = categories.length >= 3;

  return (
    <>
      {isMobile ? (
        <MobileLayout
          categories={categories}
          toggleCategory={toggleCategory}
          canContinue={canContinue}
          onContinue={onContinue}
        />
      ) : (
        <DesktopLayout
          categories={categories}
          toggleCategory={toggleCategory}
          canContinue={canContinue}
          onContinue={onContinue}
          onBack={onBack}
        />
      )}
    </>
  );
}

/* ---------------------------------- */
/* Desktop Layout (unchanged UI) */
/* ---------------------------------- */

function DesktopLayout({
  categories,
  toggleCategory,
  canContinue,
  onContinue,
  onBack,
}: any) {
  return (
    <div className="w-full flex flex-col items-center justify-center">
      <Title />
      <CategoriesGrid categories={categories} toggleCategory={toggleCategory} />

      <div className="mt-8 flex flex-col items-center gap-6">
        <CTAButton canContinue={canContinue} onContinue={onContinue} />
        <BackButton onBack={onBack} />
      </div>
    </div>
  );
}

/* ---------------------------------- */
/* Mobile Layout (keyboard-aware CTA) */
/* ---------------------------------- */

function MobileLayout({
  categories,
  toggleCategory,
  canContinue,
  onContinue,
}: any) {
  return (
    <div className="w-full h-full flex flex-col">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-32">
        <Title />
        <CategoriesGrid
          categories={categories}
          toggleCategory={toggleCategory}
          maxWidth="max-w-full"
        />
      </div>

      {/* Fixed Bottom CTA */}
      <div className="fixed left-0 right-0 bottom-0 bg-white px-4 py-4 pb-[calc(env(safe-area-inset-bottom)+16px)]">
        <CTAButton canContinue={canContinue} onContinue={onContinue} />
      </div>
    </div>
  );
}


/* ---------------------------------- */
/* Shared Components */
/* ---------------------------------- */

function Title() {
  return (
    <div className="text-center mb-8">
      <h1 className="text-[32px] font-bold text-[#0C1014] leading-[38px]">
        Please select Topics you
        <br />
        are interested in
      </h1>
    </div>
  );
}

function CategoriesGrid({
  categories,
  toggleCategory,
  maxWidth = "max-w-[580px]",
}: any) {
  const allCategories = [
  { label: "Tech", icon: Laptop, color: "text-blue-600" },
  { label: "Startups", icon: Rocket, color: "text-orange-600" },
  { label: "Business", icon: BarChartBig, color: "text-indigo-600" },
  { label: "Finance", icon: Landmark, color: "text-emerald-600" },
  { label: "Crypto", icon: Repeat2, color: "text-yellow-600" },
  { label: "News", icon: Newspaper, color: "text-gray-600" },
  { label: "Culture", icon: Drama, color: "text-purple-600" },
  { label: "Entertainment", icon: Clapperboard, color: "text-pink-600" },
  { label: "Productivity", icon: CheckSquare2, color: "text-green-600" },
  { label: "Personal Growth", icon: Leaf, color: "text-green-700" },
];


  return (
    <div className={`flex flex-wrap justify-center gap-3 ${maxWidth}`}>
      {allCategories.map(({ label, icon: Icon,color }) => {
        const active = categories.includes(label);

        return (
          <button
            key={label}
            onClick={() => toggleCategory(label)}
            className={`
              flex items-center gap-3
              px-4 py-2.5 rounded-2xl md:rounded-full border
              text-[17px] whitespace-nowrap transition-all
              ${
                active
                  ? "bg-[#F6ECE7] border-[#C46A54]"
                  : "bg-[#F5F5F5] border-transparent hover:bg-[#ECECEC]"
              }
            `}
          >
            <Icon
              size={18}
              className={`
                transition-all
                ${color}
                ${
                  active
                    ? "text-[#C46A54]"
                    : "text-[#0C1014]"
                }
              `}
            />

            <span className="text-[18px] text-[#0C1014]">
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function CTAButton({ canContinue, onContinue }: any) {
  return (
    <button
      disabled={!canContinue}
      onClick={onContinue}
      className={`
        w-full  p-4 text-white
        text-[19px] font-medium mx-auto
        rounded-2xl md:rounded-full
        ${canContinue ? "bg-[#C46A54]" : "bg-[#d8a89c] cursor-not-allowed"}
      `}
    >
      Select at least 3 to Continue
    </button>
  );
}


function BackButton({ onBack }: any) {
  return (
    <button
      onClick={onBack}
      className="text-[#0C1014] font-semibold underline text-md"
    >
      ← Back
    </button>
  );
}
