"use client";

import { useTranslation } from "react-i18next";
import MobileHeader from "@/components/layout/MobileHeader";
import InterestedIn from "@/components/discover/InterestedIn";
import NewsletterCarousel from "@/components/discover/NewsletterCarousel";
import PublicationList from "@/components/discover/PublicationList";
import PersonalizeDiscover from "@/components/discover/PersonalizeDiscover";
import BottomNav from "@/components/layout/BottomNav";

export default function MobileDiscoverSection({
  forYouItems,
  techItems,
  cryptoItems
}: any) {
  const { t } = useTranslation("common");
  
  return (
    <div className="md:hidden flex flex-col w-full bg-[#F5F6FA]">

      {/* MOBILE HEADER */}
      <MobileHeader title={t("nav.discover")} onMenuClick={() => {}} />

      {/* MAIN */}
      <div className="bg-white rounded-t-3xl px-4 pt-4 pb-24 min-h-screen">

        {/* SEARCH BOX */}
        <input
          placeholder={t("mobile.searchNewslettersCategory")}
          className="w-full h-[44px] bg-[#F5F6FA] rounded-xl px-4 text-[15px] outline-none"
        />

        {/* CATEGORY CHIPS */}
        <div className="mt-4">
            <InterestedIn/>
        </div>
        

        {/* FOR YOU */}
        <div className="mt-6">
          <NewsletterCarousel title={t("discover.forYou")} items={forYouItems} showArrows={false} />
        </div>

        {/* POPULAR PUBLICATIONS */}
        <div className="mt-8">
          <PublicationList title={t("mobile.popularPublications")} />
        </div>

        {/* TECHNOLOGY */}
        <div className="mt-8">
          <NewsletterCarousel title={t("mobile.technology")} items={techItems} />
        </div>

        {/* CRYPTO */}
        <div className="mt-8">
          <NewsletterCarousel title={t("mobile.crypto")} items={cryptoItems} />
        </div>

        {/* PERSONALIZE DISCOVER */}
        <div className="mt-10 mx-2">
          <PersonalizeDiscover />
        </div>
      </div>
      {/* 👇 FIXED MOBILE BOTTOM NAV */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center">
        <BottomNav />
      </div>
    </div>
  );
}
