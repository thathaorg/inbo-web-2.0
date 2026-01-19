"use client";

import {
  Inbox,
  Compass,
  BarChart3,
  Bell,
  Trash2,
  Highlighter,
} from "lucide-react";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";

// Import the new component
import UserSection from "@/components/UserSection";
import LanguageSelector from "@/components/LanguageSelector";

export default function Sidebar({ openMobile, onClose }: any) {
  const pathname = usePathname();
  const { t } = useTranslation("common");

  const [collapsed, setCollapsed] = useState(false);
  const [showPromo, setShowPromo] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  /* Handle responsive breakpoints */
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setCollapsed(width < 1024); // Auto collapse on tablet
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menu = [
    { label: t("navigation.inbox"), icon: Inbox, href: "/inbox" },
    { label: t("navigation.discover"), icon: Compass, href: "/discover" },
    { label: t("navigation.analytics"), icon: BarChart3, href: "/analytics" },
    { label: t("navigation.subscriptions"), icon: Bell, href: "/subscriptions" },
    { label: "Highlights", icon: Highlighter, href: "/highlights" },
    { label: t("common.delete"), icon: Trash2, href: "/delete" },
  ];

  /* SIDEBAR STYLES */
  const mobileDrawer = `
    fixed top-0 left-0 h-full z-50 w-[260px]
    bg-white/80 backdrop-blur-xl
    border-r border-[#E5E7EB]
    p-6 rounded-r-2xl shadow-xl
    transition-transform duration-300
    ${openMobile ? "translate-x-0" : "-translate-x-full"}
  `;

  const desktopSidebar = `
    hidden md:flex flex-col h-full
    bg-white/80 backdrop-blur-xl
    border border-[#E5E7EB]
    rounded-[20px]
    shadow-sm p-4 transition-all duration-300
    ${collapsed ? "w-[90px]" : "w-[280px]"}
  `;

  return (
    <>
      {/* MOBILE BACKDROP */}
      {openMobile && isMobile && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* SIDEBAR */}
      <aside className={isMobile ? mobileDrawer : desktopSidebar}>
        {/* COLLAPSE BUTTON */}
        {!isMobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="
              absolute top-7 -right-4 w-[32px] h-[32px]
              bg-white border border-[#E5E7EB]
              rounded-full shadow flex items-center justify-center
              transition-transform
            "
          >
            <Image
              src="/icons/sidebar-icon.png"
              width={18}
              height={18}
              alt="Collapse Sidebar"
              className={`transition-transform duration-300 ${collapsed ? "rotate-180" : "rotate-0"
                }`}
            />
          </button>
        )}

        {/* LAYOUT WRAPPER */}
        <div className="flex flex-col justify-between h-full overflow-hidden">

          {/* MENU (ALWAYS AT TOP) */}
          <div className="flex flex-col gap-2 overflow-y-auto pr-1 mt-2">
            {menu.map(({ label, icon: Icon, href }) => {
              const active = pathname === href;
              return (
                <Link
                  key={label}
                  href={href}
                  className={`
                    flex items-center gap-2 py-2 rounded-xl text-[16px]
                    transition-all
                    ${active
                      ? "bg-[#DBDFE6] font-medium"
                      : "hover:bg-[#F3F4F6]"
                    }
                    ${collapsed ? "justify-center px-0" : "px-4"}
                  `}
                >
                  <Icon size={20} strokeWidth={1.7} className="shrink-0" />
                  {!collapsed && <span>{label}</span>}
                </Link>
              );
            })}
          </div>

          {/* BOTTOM SECTION */}
          <div className="flex flex-col">

            {/* PROMO */}
            {!collapsed && showPromo && (
              <div className="mt-4 mb-4">
                <div className="relative bg-gradient-to-br from-[#98FBB2] to-[#A6F5E6] rounded-2xl px-4 py-3 overflow-hidden">

                  {/* Header with title and close button */}
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-[14px] font-semibold text-black">
                      Inbo for ios & Android
                    </p>
                    <button
                      onClick={() => setShowPromo(false)}
                      className="text-[18px] font-bold text-black hover:opacity-70"
                    >
                      ×
                    </button>
                  </div>

                  {/* Content: Phone image and store badges */}
                  <div className="flex b-0 items-end justify-between">
                    <Image
                      src="/badges/promo-badge0.png"
                      alt="Phone"
                      width={120}
                      height={140}
                      className="object-contain -mb-3 -ml-2"
                    />

                    <div className="flex flex-col gap-2 mb-2">
                      <Image
                        src="/badges/play-store.png"
                        alt="Google Play"
                        width={90}
                        height={28}
                        className="object-contain"
                      />
                      <Image
                        src="/badges/apple-store.png"
                        alt="App Store"
                        width={90}
                        height={28}
                        className="object-contain"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* LANGUAGE SELECTOR */}
            {!collapsed && (
              <div className="mb-4">
                <LanguageSelector variant="compact" showLabel={false} />
              </div>
            )}

            {/* USER SECTION (component) */}
            <UserSection collapsed={collapsed} />
          </div>
        </div>
      </aside>
    </>
  );
}
