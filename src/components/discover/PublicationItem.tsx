"use client";

import { ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

export interface PublicationItemProps {
  rank: number;
  logo: string;
  name: string;
  desc: string;
  onClick?: () => void;
}

export default function PublicationItem({
  rank,
  logo,
  name,
  desc,
  onClick
}: PublicationItemProps) {
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);
  const [imgError, setImgError] = useState(false);
  const fallbackLogo = "/logos/forbes-sample.png";

  useEffect(() => {
    const checkSize = () => setIsMobileOrTablet(window.innerWidth <= 1024); // <1024 = mobile + tablet
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  return (
    <div
      className={`
        flex items-center justify-between bg-white p-4 border border-[#E5E7EB]
        rounded-2xl shadow-sm w-full relative z-10
        ${isMobileOrTablet ? "cursor-pointer" : ""}
      `}
      onClick={isMobileOrTablet ? onClick : undefined}
    >
      {/* Left Section */}
      <div className="flex items-center gap-4">

        <span className="
          w-6 flex-shrink-0 text-[22px] leading-[30px]
          font-semibold text-[#0C1014] font-['Helvetica_Neue']
        ">
          {rank}
        </span>

        <img
          src={imgError ? fallbackLogo : logo}
          alt={name}
          className="w-12 h-12 rounded-full object-cover pointer-events-none"
          onError={() => setImgError(true)}
        />

        <div className="flex flex-col">
          <p className="
            text-[20px] leading-[30px] font-medium text-black
            font-['Helvetica_Neue']
          ">
            {name}
          </p>

          <p className="
            text-[16px] leading-[20px] text-[#A2AAB4]
            font-['Helvetica_Neue']
          ">
            {desc}
          </p>
        </div>
      </div>

      {/* Right Section */}
      {isMobileOrTablet ? (
        <div className="pointer-events-none">
          {/* This shows Chevron icon but does NOT override card click */}
          <div
            className="
              max-w-8 max-h-8 rounded-2xl border border-[#E5E7EB]
              flex items-center justify-center
            "
          >
            <ChevronRight />
          </div>
        </div>
      ) : (
        <button
          onClick={(e) => {
            e.stopPropagation(); // prevent clicking entire card on desktop
            onClick?.();
          }}
          className="
            max-w-24 max-h-8 flex items-center justify-center rounded-2xl p-2
            border border-[#E5E7EB] text-[14px] leading-[16px] font-medium
            text-[#0C1014] font-['Helvetica_Neue']
            hover:bg-gray-100 transition whitespace-nowrap
          "
        >
          see details
        </button>
      )}
    </div>
  );
}
