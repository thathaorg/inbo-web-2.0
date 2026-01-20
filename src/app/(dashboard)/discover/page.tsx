"use client";
import { useTranslation } from "react-i18next";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import InterestedIn from "@/components/discover/InterestedIn";
import NewsletterCarousel from "@/components/discover/NewsletterCarousel";
import PublicationList from "@/components/discover/PublicationList";
import PublicationModal, { Publication } from "@/components/discover/PublicationModal";
import PersonalizeDiscover from "@/components/discover/PersonalizeDiscover";
import MobileDiscoverSection from "./MobileDiscoverSection";
import discoverService, { type Newsletter } from "@/services/discover";

// Categories for "What are you interested in?" section
const INTEREST_CATEGORIES = [
  "Technology","AI","Economics","Startups","Business",
  "Finance","Career","Productivity","Design","Marketing",
  "Culture","Health","Current Affairs","Crypto",
];

// Helper function to generate favicon URL from domain
const getFaviconUrl = (url: string | null | undefined, size: number = 128): string => {
  if (!url) return "/logos/sample-img.png";
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`;
  } catch {
    return "/logos/sample-img.png";
  }
};

// Transform Newsletter to carousel item format
const transformToCarouselItem = (newsletter: Newsletter, tagLabel?: string, tagIcon?: string) => ({
  id: newsletter.id,
  title: newsletter.name,
  description: newsletter.description || "Discover curated content delivered to your inbox.",
  // Use icon_url from API, fall back to logo_url, then generate from URL, finally default image
  imageUrl: newsletter.icon_url || newsletter.logo_url || getFaviconUrl(newsletter.url) || "/logos/sample-img.png",
  frequency: newsletter.contentFrequency || "Weekly",
  ctaLabel: "Subscribe",
  tagLabel,
  tagIcon,
  websiteUrl: newsletter.url, // Newsletter's website for subscription
});

export default function DiscoverPage() {
  const { t } = useTranslation("common");
  const searchParams = useSearchParams();
  const newsletterId = searchParams.get("newsletter");

  // Lazy initialize state from localStorage to prevent loading flicker
  const [forYouItems, setForYouItems] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
       const cached = localStorage.getItem("discoverData_v2");
       if (cached) {
         try {
           const { data } = JSON.parse(cached);
           return data.forYou || [];
         } catch {}
       }
    }
    return [];
  });

  const [categoryCarousels, setCategoryCarousels] = useState<Record<string, any[]>>(() => {
    if (typeof window !== 'undefined') {
       const cached = localStorage.getItem("discoverData_v2");
       if (cached) {
         try {
           const { data } = JSON.parse(cached);
           return data.categories || {};
         } catch {}
       }
    }
    return {};
  });

  const [categoryImages, setCategoryImages] = useState<Record<string, string[]>>(() => {
    if (typeof window !== 'undefined') {
       const cached = localStorage.getItem("discoverData_v2");
       if (cached) {
         try {
           const { data } = JSON.parse(cached);
           const images: Record<string, string[]> = {};
           if (data.categories) {
             Object.keys(data.categories).forEach(cat => {
                images[cat] = data.categories[cat].slice(0, 3).map((item: any) => item.imageUrl);
             });
           }
           return images;
         } catch {}
       }
    }
    return {};
  });

  const [loading, setLoading] = useState(() => {
    if (typeof window !== 'undefined') {
       const cached = localStorage.getItem("discoverData_v2");
       if (cached) {
         try {
           const { timestamp } = JSON.parse(cached);
           // Cache valid for 1 hour
           if (Date.now() - timestamp < 3600000) return false;
         } catch {}
       }
    }
    return true;
  });

  // Pagination state: current page for each category
  const [categoryPages, setCategoryPages] = useState<Record<string, number>>({});
  const [loadingMore, setLoadingMore] = useState<Record<string, boolean>>({});

  const [modalPublication, setModalPublication] = useState<Publication | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Helper to slugify category for id
  const slugify = (label: string) => label.toLowerCase().replace(/\s+/g, "-");

  // Initial Data Fetch
  useEffect(() => {
    const fetchData = async () => {
      // If we already have data from lazy init, don't refetch unless expired (checked in loading state logic)
      if (!loading && Object.keys(categoryCarousels).length > 0) return;

      try {
        setLoading(true);

        // Fetch trending for "For You"
        const forYou = await discoverService.getTrendingNewsletters(8).catch(() => discoverService.getPopularNewsletters(8));
        const forYouMapped = forYou.map((n, i) =>
          transformToCarouselItem(n, i === 0 ? "Trending" : undefined, i === 0 ? "🔥" : undefined)
        );
        setForYouItems(forYouMapped);

        // Fetch all categories in parallel (Limit 30)
        const results = await Promise.all(
          INTEREST_CATEGORIES.map(cat =>
            discoverService.searchNewsletters({ category: cat, limit: 30 })
              .then(res => res.data.map(n => transformToCarouselItem(n)))
              .catch(() => [])
          )
        );
        const carousels: Record<string, any[]> = {};
        const images: Record<string, string[]> = {};
        const initialPages: Record<string, number> = {};

        INTEREST_CATEGORIES.forEach((cat, i) => {
          carousels[cat] = results[i];
          images[cat] = results[i].slice(0, 3).map((item: any) => item.imageUrl);
          initialPages[cat] = 1; // Start at page 1
        });
        
        setCategoryCarousels(carousels);
        setCategoryImages(images);
        setCategoryPages(initialPages);

        // Save to cache
        localStorage.setItem("discoverData_v2", JSON.stringify({
          timestamp: Date.now(),
          data: { forYou: forYouMapped, categories: carousels }
        }));

      } catch (error) {
        console.error("Failed to fetch discover data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []); // Empty dependency array - run once on mount

  // Handle Load More (Pagination)
  const handleLoadMore = useCallback(async (category: string) => {
    if (loadingMore[category]) return;

    // Check if we already have a lot of items (e.g., > 90) to prevent infinite scrolling if API is limited
    // But user asked for "more and more", so we'll just check if API returns empty
    
    setLoadingMore(prev => ({ ...prev, [category]: true }));

    try {
      const currentPage = categoryPages[category] || 1;
      const nextPage = currentPage + 1;
      
      console.log(`Fetching page ${nextPage} for ${category}...`);

      const result = await discoverService.searchNewsletters({ 
        category: category, 
        page: nextPage,
        limit: 30 
      });

      if (result.data.length > 0) {
        const newItems = result.data.map(n => transformToCarouselItem(n));
        
        setCategoryCarousels(prev => ({
          ...prev,
          [category]: [...(prev[category] || []), ...newItems]
        }));
        
        setCategoryPages(prev => ({ ...prev, [category]: nextPage }));
      }
    } catch (error) {
      console.error(`Failed to load more for ${category}:`, error);
    } finally {
      setLoadingMore(prev => ({ ...prev, [category]: false }));
    }
  }, [categoryPages, loadingMore]);

  // Handle Search Navigation - Scroll to resulted newsletter carousel
  useEffect(() => {
    if (!loading && newsletterId) {
      
      const scrollToNewsletter = (category: string) => {
        const slug = slugify(category);
        const el = document.getElementById(`carousel-${slug}`);
        if (el) {
          setTimeout(() => {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            
            // Optional: highlight effect
            el.style.transition = "background-color 0.5s ease";
            el.style.backgroundColor = "#FFF4EC"; 
            setTimeout(() => {
              el.style.backgroundColor = "transparent";
            }, 2000);
          }, 300);
        }
      };

      // 1. Check if it's already in loaded categories
      let foundCategory = "";
      for (const [cat, items] of Object.entries(categoryCarousels)) {
        if (items.some((item) => item.id === newsletterId)) {
          foundCategory = cat;
          break;
        }
      }

      // 2. Check For You
      if (!foundCategory && forYouItems.some(item => item.id === newsletterId)) {
         foundCategory = t("discover.forYou");
      }
      
      if (foundCategory) {
        scrollToNewsletter(foundCategory);
      } else {
        // 3. Not found? Fetch details and inject it!
        const injectAndScroll = async () => {
          try {
            const details = await discoverService.getNewsletterDetails(newsletterId);
            if (details) {
              // Determine best category
              let targetCategory = "";
              if (details.categories && details.categories.length > 0) {
                 // Try to match one of our known categories
                 targetCategory = details.categories.find(c => INTEREST_CATEGORIES.includes(c)) || "";
              }
              
              if (targetCategory && categoryCarousels[targetCategory]) {
                const item = transformToCarouselItem(details);
                
                // Inject into state
                setCategoryCarousels(prev => ({
                  ...prev,
                  [targetCategory]: [item, ...(prev[targetCategory] || [])] // Prepend so it's visible
                }));
                
                // Wait for render then scroll
                setTimeout(() => scrollToNewsletter(targetCategory), 100);
              } else {
                 // FALLBACK: If cannot inject into a specific carousel, show PublicationModal
                 const pub: Publication = {
                    id: details.id,
                    rank: 0,
                    logo: details.icon_url || details.logo_url || getFaviconUrl(details.url),
                    name: details.name,
                    desc: details.description || "",
                    description: details.description || "",
                    frequency: details.contentFrequency || "Weekly",
                    url: details.url
                 };
                 setModalPublication(pub);
                 setIsModalOpen(true);
              }
            }
          } catch (e) {
            console.error("Failed to fetch/inject searched newsletter", e);
            // FALLBACK 2: API Failed. Google Search.
            const newsletterName = searchParams.get("name");
            if (newsletterName) {
               const query = `${newsletterName} newsletter`;
               const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
               // Open in new window (popup)
               window.open(googleUrl, '_blank', 'width=800,height=700,scrollbars=yes');
            }
          }
        };
        injectAndScroll();
      }
    }
  }, [loading, newsletterId, searchParams, categoryCarousels, forYouItems, t]);

  return (
    <div className="flex flex-col w-full">
      {/* ======================= */}
      {/* MOBILE VERSION (only <768px) */}
      {/* ======================= */}
      <MobileDiscoverSection
        forYouItems={forYouItems}
        techItems={categoryCarousels["Technology"] || []}
        cryptoItems={categoryCarousels["Crypto"] || []}
        loading={loading}
        onLoadMoreTech={() => handleLoadMore("Technology")}
        onLoadMoreCrypto={() => handleLoadMore("Crypto")}
      />

      {/* ======================= */}
      {/* DESKTOP/TABLET VERSION */}
      {/* ======================= */}
      <div className="hidden md:block w-full">
        {/* ========== CONTAINER 1: HEADER - Sticky ========== */}
        <div className="sticky top-0 z-50 w-full h-[78px] bg-white border border-[#E5E7EB] flex items-center justify-between px-6 shadow-sm">
          <h2 className="text-[26px] font-bold text-[#0C1014]">{t("discover.title")}</h2>
        </div>

        {/* ========== CONTAINER 2: MAIN CONTENT ========== */}
        <div className="flex flex-col gap-10 w-full px-6 py-10">
          <InterestedIn categoryImages={categoryImages} />

          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
          ) : (
            <>
              <NewsletterCarousel title={t("discover.forYou")}
                items={forYouItems}
                showArrows={false}
              />

              <PublicationList title={t("discover.popular")} />

              {/* Render a carousel for each category */}
              {INTEREST_CATEGORIES.map(cat => (
                <NewsletterCarousel
                  key={cat}
                  title={cat}
                  items={categoryCarousels[cat] || []}
                  onReachEnd={() => handleLoadMore(cat)}
                />
              ))}
            </>
          )}

          <PersonalizeDiscover />
        </div>
      </div>

      <PublicationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        publication={modalPublication}
      />
    </div>
  );
}
