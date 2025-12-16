"use client";
import InterestedIn from "@/components/InterestedIn";
import NewsletterCarousel from "@/components/NewsletterCarousel";
import PublicationList from "@/components/PublicationList";
import PersonalizeDiscover from "@/components/PersonalizeDiscover";
import MobileDiscoverSection from "./MobileDiscoverSection";

export default function DiscoverPage() {
    const forYouItems = [
  {
    title: "The Hustle",
    description: "Meta Connect 2025: What to expect and how to watch",
    imageUrl: "/logos/sample-img.png",
    frequency: "Weekly",
    ctaLabel: "Subscribe",
    tagLabel: "Trending",
    tagIcon: "🔥",
  },
  {
    title: "Money Stuff",
    description: "Meta Connect 2025: What to expect and how to watch",
    imageUrl: "/logos/sample-img.png",
    frequency: "Weekly",
    ctaLabel: "Subscribe",
    tagLabel: "Most share this week",
    tagIcon: "",
  },
  {
    title: "Demand Curve",
    description: "Meta Connect 2025: What to expect and how to watch",
    imageUrl: "/logos/sample-img.png",
    frequency: "Weekly",
    ctaLabel: "Subscribe",
    tagLabel: "Because you read something",
    tagIcon: "",
  },
  {
    title: "TLDR",
    description: "Meta Connect 2025: What to expect and how to watch",
    imageUrl: "/logos/sample-img.png",
    frequency: "Daily",
    ctaLabel: "Subscribe",
  },
  {
    title: "Money Stuff",
    description: "Meta Connect 2025: What to expect and how to watch",
    imageUrl: "/logos/sample-img.png",
    frequency: "Weekly",
    ctaLabel: "Subscribe",
    tagLabel: "Most share this week",
    tagIcon: "",
  },
  {
    title: "Demand Curve",
    description: "Meta Connect 2025: What to expect and how to watch",
    imageUrl: "/logos/sample-img.png",
    frequency: "Weekly",
    ctaLabel: "Subscribe",
    tagLabel: "Because you read something",
    tagIcon: "",
  },
  {
    title: "TLDR",
    description: "Meta Connect 2025: What to expect and how to watch",
    imageUrl: "/logos/sample-img.png",
    frequency: "Daily",
    ctaLabel: "Subscribe",
  },
];

const techItems = [
  {
    title: "Money Stuff",
    description: "Meta Connect 2025: What to expect and how to watch",
    imageUrl: "/logos/sample-img.png",
    frequency: "Daily",
    ctaLabel: "Subscribe",
  },
  {
    title: "Demand Curve",
    description: "Meta Connect 2025: What to expect and how to watch",
    imageUrl: "/logos/sample-img.png",
    frequency: "Weekly",
    ctaLabel: "Subscribe",
  },
  {
    title: "The Hustle",
    description: "Meta Connect 2025: What to expect and how to watch",
    imageUrl: "/logos/sample-img.png",
    frequency: "Weekly",
    ctaLabel: "Subscribe",
  },
  {
    title: "Demand Curve",
    description: "Meta Connect 2025: What to expect and how to watch",
    imageUrl: "/logos/sample-img.png",
    frequency: "Weekly",
    ctaLabel: "Subscribe",
  },
];

const cryptoItems = [
  {
    title: "Glassnode",
    description: "Meta Connect 2025: What to expect and how to watch",
    imageUrl: "/logos/sample-img.png",
    frequency: "Daily",
    ctaLabel: "Subscribe",
  },
  {
    title: "Messari",
    description: "Meta Connect 2025: What to expect and how to watch",
    imageUrl: "/logos/sample-img.png",
    frequency: "Weekly",
    ctaLabel: "Subscribe",
  },
  {
    title: "Milk Road",
    description: "Meta Connect 2025: What to expect and how to watch",
    imageUrl: "/logos/sample-img.png",
    frequency: "Weekly",
    ctaLabel: "Subscribe",
  },
  {
    title: "CoinMetrics",
    description: "Meta Connect 2025: What to expect and how to watch",
    imageUrl: "/logos/sample-img.png",
    frequency: "Weekly",
    ctaLabel: "Subscribe",
  },
];

  return (
      <div className="flex flex-col w-full">

        {/* ======================= */}
        {/* MOBILE VERSION (only <768px) */}
        {/* ======================= */}
        <MobileDiscoverSection
          forYouItems={forYouItems}
          techItems={techItems}
          cryptoItems={cryptoItems}
        />

        {/* ======================= */}
        {/* DESKTOP/TABLET VERSION */}
        {/* ======================= */}
        <div className="hidden md:block w-full">
          {/* ========== CONTAINER 1: HEADER ========== */}
          <div className="w-full">
            <div className="w-full h-[78px] bg-white border border-[#E5E7EB] flex items-center justify-between px-6 shadow-sm">
              <h2 className="text-[26px] font-bold text-[#0C1014]">Discover</h2>
            </div>
          </div>

          {/* ========== CONTAINER 2: MAIN CONTENT ========== */}
          <div className="flex flex-col gap-10 w-full px-6 py-10">

            <InterestedIn />

            <NewsletterCarousel title="For you" items={forYouItems} showArrows={false} />

            <PublicationList title="Popular Publications" />

            <NewsletterCarousel title="Technology" items={techItems} />

            <NewsletterCarousel title="Crypto" items={cryptoItems} />

            <PersonalizeDiscover />
          </div>
        </div>
      </div>
    );
}