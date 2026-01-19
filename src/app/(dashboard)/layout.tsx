"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import HelpWidget from "@/components/HelpWidget";
import { usePathname, useRouter } from "next/navigation";
import useMedia from "use-media"; // <-- detect mobile
import Cookies from "js-cookie";

type Props = {
  children: React.ReactNode;
};

export default function DashboardLayout({ children }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const hideHelpWidget = pathname === "/profile";

  // IMPORTANT: All hooks must be called before any early returns!
  // Detect mobile screen
  const isMobile = useMedia({ maxWidth: 768 });

  // Check authentication on mount
  useEffect(() => {
    const accessToken = Cookies.get("access_token");
    if (!accessToken) {
      // No token found, redirect to login
      router.replace("/auth/login");
    } else {
      setIsAuthChecking(false);
    }
  }, [router]);

  // Show loading while checking auth
  if (isAuthChecking) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-[#ECEEF2]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // 🚀 MOBILE LAYOUT SECTION
  // ---------------------------------------------------------
  if (isMobile) {
    return (
      <div className="flex flex-col h-screen w-full bg-[#ECEEF2] text-[#0C1014] overflow-hidden relative">
        <main className="flex-1 overflow-auto">
          {children}
        </main>
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
      <div className="flex flex-1 overflow-hidden p-2 gap-4 min-h-0">
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

