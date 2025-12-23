"use client";

import React, { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";
import HelpWidget from "@/components/HelpWidget";
import { usePathname } from "next/navigation";
import useMedia from "use-media"; // <-- detect mobile

type Props = {
  children: React.ReactNode;
};

export default function DashboardLayout({ children }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const hideHelpWidget = pathname === "/profile";

  // Detect mobile screen
  const isMobile = useMedia({ maxWidth: 768 });

  // ---------------------------------------------------------
  // 🚀 MOBILE LAYOUT SECTION
  // ---------------------------------------------------------
  if (isMobile) {
    return (
      <div className="flex flex-col h-screen w-full bg-[#ECEEF2] text-[#0C1014] overflow-hidden relative">
        <main className="flex-1 overflow-auto">
          {children}
        </main>

        {/* 👇 FIXED MOBILE BOTTOM NAV */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
          <BottomNav />
        </div>
      </div>
    );
  }



  // ---------------------------------------------------------
  // 🖥️ WEB (DESKTOP) LAYOUT SECTION — NOT CHANGED AT ALL
  // ---------------------------------------------------------
  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-[#ECEEF2] text-[#0C1014]">
      {/* Desktop Navbar (unchanged) */}
      <div className="hidden md:block">
        <Navbar />
      </div>

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden p-4 gap-4 min-h-0">
        {/* Sidebar (drawer for mobile, fixed for desktop) */}
        <Sidebar openMobile={menuOpen} onClose={() => setMenuOpen(false)} />

        {/* Desktop Content Area (unchanged) */}
        <main
          className="
            flex-1 min-h-0 overflow-auto
            [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]
            bg-[#FFFFFF]/60 backdrop-blur-xl border border-[#E5E7EB]
            rounded-2xl shadow-sm
            p-0 pb-6
          "
        >
          {children}
        </main>
      </div>

      {!hideHelpWidget && <HelpWidget />}
    </div>
  );
}
