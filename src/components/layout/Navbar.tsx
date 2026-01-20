"use client";

import LogoSection from "@/components/LogoSection";
import SearchBar from "@/components/SearchBar";
import EmailBubble from "@/components/EmailBubble";
import FlameBadge from "@/components/FlameBadge";
import ThemeToggle from "@/components/ThemeToggle";

export default function Navbar() {
  return (
    <header className="w-full px-4 md:px-10">
      <div className="flex items-center justify-between mt-2 w-full gap-4">

        <LogoSection />

        <div className="flex-1 flex justify-center px-4">
          <SearchBar />
        </div>

        {/* Right Items */}
        <div
          className="
            flex items-center gap-4 flex-shrink-0
            bg-white border border-[#DBDFE4]
            rounded-full py-2 px-3 shadow-sm
          "
        >
          <EmailBubble />
          <div className="flex items-center gap-3">
            <FlameBadge />
            <ThemeToggle />
          </div>
        </div>

      </div>
    </header>
  );
}
