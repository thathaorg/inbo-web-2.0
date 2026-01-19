"use client";

import LogoSection from "@/components/LogoSection";
import SearchBar from "@/components/SearchBar";
import EmailBubble from "@/components/EmailBubble";
import FlameBadge from "@/components/FlameBadge";
import ThemeToggle from "@/components/ThemeToggle";

export default function Navbar() {
  return (
    <header className="w-full px-3 sm:px-4 md:px-6 lg:px-10">
      <div className="flex items-center justify-between mt-2 w-full sm:gap-3 md:gap-4">
        <LogoSection />
        <div className="flex-1 flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-2.5 min-w-0">
          {/* Search */}
          <SearchBar />
          {/* Right Items */}
          <div
            className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-shrink-0 max-w-full overflow-x-auto bg-white border border-[#DBDFE4] rounded-full py-1.5 sm:py-2 px-2 sm:px-3 shadow-sm self-end md:self-auto"
            style={{ minWidth: 0 }}
          >
            <EmailBubble />
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="scale-100 sm:scale-110 md:scale-125">
                <FlameBadge />
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
