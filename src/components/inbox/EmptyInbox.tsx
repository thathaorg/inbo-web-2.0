"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "react-i18next";

export default function EmptyInbox() {
  const { t } = useTranslation("common");
  
  return (
    <div className="w-full  flex justify-center overflow-hidden">
      {/* ================= CONTAINER ================= */}
      <div
        className="
          w-full max-w-[1200px]
          rounded-none md:rounded-2xl
          px-6 md:py-10
          h-full
          flex flex-col items-center
          overflow-hidden
        "
      >
        {/* Spacer to center content without forcing height */}
        <div className="flex-1 md:hidden" />

        {/* ================= EMPTY STATE ================= */}
        <div className="flex flex-col items-center text-center gap-6 max-w-[320px] md:max-w-[640px]">
          {/* Illustration */}
          <Image
            src="/icons/emptyinbox-icon.png"
            alt="Empty inbox"
            width={160}
            height={160}
            className="md:w-180 md:h-160"
          />

          {/* Title (desktop only) */}
          <h2 className="hidden md:block text-[28px] font-semibold text-[#0C1014]">
            {t("inbox.empty")}
          </h2>

          {/* Description */}
          <p className="text-[#9CA3AF] md:text-[#6F7680] text-[15px] md:text-[16px] leading-relaxed">
            {t("inbox.emptyDescription")}
          </p>

          {/* Email copy row (mobile only) */}
          <div className="flex md:hidden items-center gap-3 mt-2">
            <span className="text-[#6B7280] text-sm border-b border-dashed border-[#374151] pb-1">
              abhishek@inbo.me
            </span>
            <button
              aria-label="Copy email"
              className="w-9 h-9 rounded-lg bg-[#F3D2C8] flex items-center justify-center text-[#C46A54]"
            >
              ⧉
            </button>
          </div>

          {/* CTA */}
          <Link
            href="/discover"
            className="
              mt-8 md:mt-2
              inline-flex items-center justify-center
              h-12 px-10 md:px-8
              rounded-full
              bg-[#C46A54] text-white
              text-[16px] md:text-[15px]
              font-medium
              hover:opacity-90 transition
            "
          >
            <span>{t("navigation.discover")}</span>
          </Link>
        </div>

        {/* Spacer to center content without forcing height */}
        <div className="flex-1 md:hidden" />

        {/* ================= DESKTOP ONLY ================= */}
        <span className="hidden md:block mt-20 mb-8 text-md tracking-widest text-[#9CA3AF] font-medium">
          GOOD TO STARTED
        </span>

        <div className="hidden md:grid w-full max-w-[900px] grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SuggestedNewsletterCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================= CARD ================= */

function SuggestedNewsletterCard() {
  return (
    <div
      className="
        bg-white
        border border-[#E5E7EB]
        rounded-2xl
        px-4 py-6
        max-w-[300px]
        flex flex-col
        shadow-[0_1px_2px_rgba(0,0,0,0.04)]
      "
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center text-white text-xs font-semibold">
          HUSTLE
        </div>
        <span className="text-[17px] font-semibold text-[#0C1014]">
          The Hustle
        </span>
      </div>

      <span className="text-sm text-[#6F7680] mb-2">Design</span>

      <p className="text-[#6F7680] text-[14px] leading-relaxed mb-6">
        Curated stories on UX, visual design, and research
      </p>

      <Link
        href="/discover"
        className="
          cursor-pointer
          inline-flex items-center justify-center gap-2
          rounded-full
          font-medium
          whitespace-nowrap
          transition-all duration-300
          h-10 px-5 text-base
          bg-[#0C1014] text-white hover:bg-[#F2F3F5] hover:text-[#0C1014]
        "
      >
        <span>Discover</span>
        <Image
          src="/icons/subscribe-icon-light.png"
          alt=""
          width={16}
          height={16}
          draggable={false}
          className="w-5 h-5"
        />
      </Link>
    </div>
  );
}
