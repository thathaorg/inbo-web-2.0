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
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { userService, type Category } from "@/services/user";

// Icon mapping for categories
const categoryIconMap: Record<string, LucideIcon> = {
  tech: Laptop,
  technology: Laptop,
  startups: Rocket,
  startup: Rocket,
  business: BarChartBig,
  finance: Landmark,
  crypto: Repeat2,
  cryptocurrency: Repeat2,
  news: Newspaper,
  culture: Drama,
  entertainment: Clapperboard,
  productivity: CheckSquare2,
  "personal growth": Leaf,
  "personal-growth": Leaf,
  health: HeartPulse,
  wellness: HeartPulse,
  default: Sparkles,
};

// Color mapping for categories
const categoryColorMap: Record<string, string> = {
  tech: "text-blue-600",
  technology: "text-blue-600",
  startups: "text-orange-600",
  startup: "text-orange-600",
  business: "text-indigo-600",
  finance: "text-emerald-600",
  crypto: "text-yellow-600",
  cryptocurrency: "text-yellow-600",
  news: "text-gray-600",
  culture: "text-purple-600",
  entertainment: "text-pink-600",
  productivity: "text-green-600",
  "personal growth": "text-green-700",
  "personal-growth": "text-green-700",
  health: "text-red-500",
  wellness: "text-red-500",
  default: "text-gray-500",
};

// Helper to get icon for a category
const getCategoryIcon = (name: string): LucideIcon => {
  const key = name.toLowerCase();
  return categoryIconMap[key] || categoryIconMap.default;
};

// Helper to get color for a category
const getCategoryColor = (name: string): string => {
  const key = name.toLowerCase();
  return categoryColorMap[key] || categoryColorMap.default;
};

interface CategoriesStepProps {
  categories: string[];
  toggleCategory: (category: string) => void;
  onContinue: () => void;
  onBack: () => void;
}

export default function CategoriesStep({
  categories,
  toggleCategory,
  onContinue,
  onBack,
}: CategoriesStepProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { t } = useTranslation("auth");
  const canContinue = categories.length >= 3;
  
  // State for fetched categories
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await userService.getCategories();
        if (response.categories && response.categories.length > 0) {
          setAvailableCategories(response.categories);
        } else {
          // Fallback to default categories if API returns empty
          setAvailableCategories(defaultCategories);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setError("Failed to load categories");
        // Use fallback categories on error
        setAvailableCategories(defaultCategories);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-[#C46A54]" size={40} />
        <p className="mt-4 text-[#6F7680]">{t("onboarding.loadingCategories") || "Loading categories..."}</p>
      </div>
    );
  }

  return (
    <>
      {isMobile ? (
        <MobileLayout
          categories={categories}
          toggleCategory={toggleCategory}
          canContinue={canContinue}
          onContinue={onContinue}
          availableCategories={availableCategories}
        />
      ) : (
        <DesktopLayout
          categories={categories}
          toggleCategory={toggleCategory}
          canContinue={canContinue}
          onContinue={onContinue}
          onBack={onBack}
          availableCategories={availableCategories}
        />
      )}
    </>
  );
}

// Default/fallback categories
const defaultCategories: Category[] = [
  { id: "1", name: "Tech" },
  { id: "2", name: "Startups" },
  { id: "3", name: "Business" },
  { id: "4", name: "Finance" },
  { id: "5", name: "Crypto" },
  { id: "6", name: "News" },
  { id: "7", name: "Culture" },
  { id: "8", name: "Entertainment" },
  { id: "9", name: "Productivity" },
  { id: "10", name: "Personal Growth" },
];

/* ---------------------------------- */
/* Desktop Layout (unchanged UI) */
/* ---------------------------------- */

interface LayoutProps {
  categories: string[];
  toggleCategory: (category: string) => void;
  canContinue: boolean;
  onContinue: () => void;
  onBack?: () => void;
  availableCategories: Category[];
}

function DesktopLayout({
  categories,
  toggleCategory,
  canContinue,
  onContinue,
  onBack,
  availableCategories,
}: LayoutProps) {
  return (
    <div className="w-full flex flex-col items-center justify-center">
      <Title />
      <CategoriesGrid 
        categories={categories} 
        toggleCategory={toggleCategory} 
        availableCategories={availableCategories}
      />

      <div className="mt-5 flex flex-col items-center gap-4">
        <CTAButton canContinue={canContinue} onContinue={onContinue} />
        {onBack && <BackButton onBack={onBack} />}
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
  availableCategories,
}: LayoutProps) {
  return (
    <div className="max-w-screen max-h-screen flex flex-col">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-32">
        <Title />
        <CategoriesGrid
          categories={categories}
          toggleCategory={toggleCategory}
          maxWidth="max-w-full"
          availableCategories={availableCategories}
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
  const { t } = useTranslation("auth");
  return (
    <div className="text-center mb-5">
      <h1 className="text-[26px] font-bold text-[#0C1014] leading-[32px]">
        {t("onboarding.selectCategories")}
      </h1>
    </div>
  );
}

interface CategoriesGridProps {
  categories: string[];
  toggleCategory: (category: string) => void;
  maxWidth?: string;
  availableCategories: Category[];
}

function CategoriesGrid({
  categories,
  toggleCategory,
  maxWidth = "max-w-[580px]",
  availableCategories,
}: CategoriesGridProps) {
  return (
    <div className={`flex flex-wrap justify-center gap-2 ${maxWidth}`}>
      {availableCategories.map((category) => {
        const active = categories.includes(category.name);
        const Icon = getCategoryIcon(category.name);
        const color = getCategoryColor(category.name);

        return (
          <button
            key={category.id}
            onClick={() => toggleCategory(category.name)}
            className={`
              flex items-center gap-2
              px-3 py-2 rounded-2xl md:rounded-full border
              text-[15px] whitespace-nowrap transition-all
              ${
                active
                  ? "bg-[#F6ECE7] border-[#C46A54]"
                  : "bg-[#F5F5F5] border-transparent hover:bg-[#ECECEC]"
              }
            `}
          >
            <Icon
              size={16}
              className={`
                transition-all
                ${active ? "text-[#C46A54]" : color}
              `}
            />

            <span className="text-[18px] text-[#0C1014]">
              {category.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function CTAButton({ canContinue, onContinue }: any) {
  const { t } = useTranslation("auth");
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
      {t("onboarding.minCategories", { count: 3 })}
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
