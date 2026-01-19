"use client";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import InterestedIn from "@/components/discover/InterestedIn";
import NewsletterCarousel from "@/components/discover/NewsletterCarousel";
import PublicationList from "@/components/discover/PublicationList";
import PersonalizeDiscover from "@/components/discover/PersonalizeDiscover";
import MobileDiscoverSection from "./MobileDiscoverSection";
import discoverService, { type Newsletter } from "@/services/discover";

// Transform Newsletter to carousel item format
const transformToCarouselItem = (newsletter: Newsletter, tagLabel?: string, tagIcon?: string) => ({
  id: newsletter.id,
  title: newsletter.name,
  description: newsletter.description || "Discover curated content delivered to your inbox.",
  imageUrl: "/logos/sample-img.png", // Default image, API doesn't provide images
  frequency: newsletter.contentFrequency || "Weekly",
  ctaLabel: "Subscribe",
  tagLabel,
  tagIcon,
  websiteUrl: newsletter.url, // Newsletter's website for subscription
});

export default function DiscoverPage() {
    const { t } = useTranslation("common");
    const [forYouItems, setForYouItems] = useState<any[]>([]);
    const [techItems, setTechItems] = useState<any[]>([]);
    const [cryptoItems, setCryptoItems] = useState<any[]>([]);
    const [aiItems, setAiItems] = useState<any[]>([]);
    const [businessItems, setBusinessItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchData = async () => {
        try {
          setLoading(true);
          
          // Fetch data in parallel
          const [forYou, tech, crypto, ai, business] = await Promise.all([
            discoverService.getTrendingNewsletters(8).catch(() => discoverService.getPopularNewsletters(8)),
            discoverService.getNewslettersByCategory("Technology"),
            discoverService.getNewslettersByCategory("Crypto"),
            discoverService.getNewslettersByCategory("AI"),
            discoverService.getNewslettersByCategory("Business"),
          ]);

          // Transform data for carousel
          setForYouItems(forYou.map((n, i) => 
            transformToCarouselItem(n, i === 0 ? "Trending" : undefined, i === 0 ? "🔥" : undefined)
          ));
          setTechItems(tech.map(n => transformToCarouselItem(n)));
          setCryptoItems(crypto.map(n => transformToCarouselItem(n)));
          setAiItems(ai.map(n => transformToCarouselItem(n)));
          setBusinessItems(business.map(n => transformToCarouselItem(n)));
        } catch (error) {
          console.error("Failed to fetch discover data:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, []);

  return (
      <div className="flex flex-col w-full">

        {/* ======================= */}
        {/* MOBILE VERSION (only <768px) */}
        {/* ======================= */}
        <MobileDiscoverSection
          forYouItems={forYouItems}
          techItems={techItems}
          cryptoItems={cryptoItems}
          loading={loading}
        />

        {/* ======================= */}
        {/* DESKTOP/TABLET VERSION */}
        {/* ======================= */}
        <div className="hidden md:block w-full">
          {/* ========== CONTAINER 1: HEADER ========== */}
          <div className="w-full">
            <div className="w-full h-[78px] bg-white border border-[#E5E7EB] flex items-center justify-between px-6 shadow-sm">
              <h2 className="text-[26px] font-bold text-[#0C1014]">{t("discover.title")}</h2>
            </div>
          </div>

          {/* ========== CONTAINER 2: MAIN CONTENT ========== */}
          <div className="flex flex-col gap-10 w-full px-6 py-10">

            <InterestedIn />

            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
              </div>
            ) : (
              <>
                <NewsletterCarousel title={t("discover.forYou")} items={forYouItems} showArrows={false} />

                <PublicationList title={t("discover.popular")} />

                <NewsletterCarousel title="Technology" items={techItems} />

                <NewsletterCarousel title="AI & Machine Learning" items={aiItems} />

                <NewsletterCarousel title="Business" items={businessItems} />

                <NewsletterCarousel title="Crypto" items={cryptoItems} />
              </>
            )}

            <PersonalizeDiscover />
          </div>
        </div>
      </div>
    );
}