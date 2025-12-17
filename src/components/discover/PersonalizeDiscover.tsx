"use client";

import { useState } from "react";

export default function PersonalizeDiscover() {
  const allInterests = [
    { label: "Technology", active: false },
    { label: "Finance", active: false },
    { label: "Productivity", active: false },
    { label: "Positivity", active: false },
    { label: "Health", active: false },
    { label: "Startups", active: false },
    { label: "AI", active: false },
    { label: "Mindfulness", active: false },
    { label: "Creativity", active: false },
    { label: "Design", active: false },
  ];

  const initialCount = 7;
  const [interests, setInterests] = useState(allInterests);
  const [showMore, setShowMore] = useState(false);

  const toggleInterest = (index: number) => {
    setInterests(prev =>
      prev.map((item, i) =>
        i === index ? { ...item, active: !item.active } : item
      )
    );
  };

  const hasSelected = interests.some(i => i.active);

  const visibleItems = showMore
    ? interests
    : interests.slice(0, initialCount);

  return (
    <div
      className="
        /* MOBILE – remove borders, bg, padding, shadow */
        bg-transparent border-none shadow-none p-0 rounded-none

        /* DESKTOP – restore original card styles */
        md:bg-white md:border md:border-[#E5E7EB] 
        md:rounded-xl md:p-6 md:shadow-sm

        flex flex-col gap-4
        items-center text-center 
        md:items-start md:text-left
      "
    >

      {/* Title */}
      <h3
        className="
          flex items-center gap-2 
          text-[26px] leading-[28px] font-medium text-black font-['Helvetica_Neue']
          justify-center md:justify-start
        "
      >
        <img src="/icons/personalizedDiscover-icon.png" className="w-6 h-6" />
        Personalize your discover
      </h3>

      {/* Subtitle */}
      <p
        className="
          text-[14px] leading-[16px] font-normal font-['Helvetica_Neue'] text-[#A2AAB4]
          text-center md:text-left
        "
      >
        Select your interests to customize your Discover experience
      </p>

      {/* Pills container */}
      <div
        className="
          flex flex-wrap items-center gap-2
          justify-center 
          md:justify-start
        "
      >
        {/* Visible items */}
        {visibleItems.map((item, i) => (
          <span
            key={i}
            onClick={() => toggleInterest(i)}
            className={[
              "px-4 py-2 rounded-full border transition cursor-pointer select-none font-['Helvetica_Neue']",
              "text-[14px] leading-[16px] font-medium whitespace-nowrap",
              item.active
                ? "bg-[#FFF4EC] border-[#E8C7B9] text-[#C46A54]"
                : "bg-white border-[#D1D5DB] text-[#A2AAB4]"
            ].join(" ")}
          >
            {item.label}
          </span>
        ))}

        {/* Show More / Less */}
        {interests.length > initialCount && (
          <span
            onClick={() => setShowMore(!showMore)}
            className="
              flex items-center
              text-[#A2AAB4]
              text-[14px] leading-[16px]
              font-medium font-['Helvetica_Neue']
              cursor-pointer ml-1
            "
          >
            {showMore ? "show less" : "show more"}
          </span>
        )}
      </div>

      {/* Centered Save Interests Button */}
      <div className="w-full flex justify-center mt-4">
        <button
          disabled={!hasSelected}
          className={[
            "px-6 py-3 rounded-full w-[240px] text-[16px] leading-[30px] font-medium font-['Helvetica_Neue'] transition",
            hasSelected
              ? "bg-[#C46A54] text-white cursor-pointer"
              : "bg-[#E5E7EB] text-[#A2AAB4] cursor-not-allowed"
          ].join(" ")}
        >
          Save Interests
        </button>
      </div>
    </div>
  );
}
