"use client";

import MobileHeader from "@/components/layout/MobileHeader";
import InterestedIn from "@/components/InterestedIn";
import NewsletterCarousel from "@/components/NewsletterCarousel";
import PublicationList from "@/components/PublicationList";
import PersonalizeDiscover from "@/components/PersonalizeDiscover";

export default function MobileDiscoverSection({
  forYouItems,
  techItems,
  cryptoItems
}: any) {
  return (
    <div className="md:hidden flex flex-col w-full bg-[#F5F6FA]">

      {/* MOBILE HEADER */}
      <MobileHeader title="Discover" onMenuClick={() => {}} />

      {/* MAIN */}
      <div className="bg-white rounded-t-3xl px-4 pt-4 pb-24 min-h-screen">

        {/* SEARCH BOX */}
        <input
          placeholder="Search newsletters, category"
          className="w-full h-[44px] bg-[#F5F6FA] rounded-xl px-4 text-[15px] outline-none"
        />

        {/* CATEGORY CHIPS */}
        <div className="mt-4">
            <InterestedIn/>
        </div>
        

        {/* FOR YOU */}
        <div className="mt-6">
          <NewsletterCarousel title="For you" items={forYouItems} showArrows={false} />
        </div>

        {/* POPULAR PUBLICATIONS */}
        <div className="mt-8">
          <PublicationList title="Popular Publications" />
        </div>

        {/* TECHNOLOGY */}
        <div className="mt-8">
          <NewsletterCarousel title="Technology" items={techItems} />
        </div>

        {/* CRYPTO */}
        <div className="mt-8">
          <NewsletterCarousel title="Crypto" items={cryptoItems} />
        </div>

        {/* PERSONALIZE DISCOVER */}
        <div className="mt-10 mx-2">
          <PersonalizeDiscover />
        </div>
      </div>
    </div>
  );
}
