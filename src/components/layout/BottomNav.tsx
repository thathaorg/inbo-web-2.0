"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Inbox, Compass } from "lucide-react";

const items = [
  {
    id: "inbox",
    label: "Inbox",
    href: "/inbox",
    icon: Inbox,
  },
  {
    id: "discover",
    label: "Discover",
    href: "/discover",
    icon: Compass,
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">

      {/* Glass container (Exact Figma size & blur) */}
      <div
        className="
            relative w-[180px] h-[58px]
            bg-white/25
            backdrop-blur-[20px]
            rounded-[296px]
            ring-1 ring-white/40
            shadow-[0_8px_24px_rgba(0,0,0,0.18)]
            flex items-center justify-between
        "
       >
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
            key={item.id}
            href={item.href}
            className={clsx(
                "flex flex-col items-center justify-center w-full h-full rounded-[296px] transition-all",
                isActive
                ? "bg-[#EDEDED] text-[#C46A54] font-[590]"
                : "text-[#404040] font-[510]"
            )}
            >
            <Icon
                size={22}
                className={clsx(
                "transition-all",
                isActive ? "text-[#C46A54]" : "text-[#0C1014]"
                )}
                strokeWidth={1.8}
            />

            <span
                className={clsx(
                "text-[10px] mt-1 leading-[12px]",
                isActive ? "text-[#C46A54]" : "text-[#404040]"
                )}
                style={{ fontFamily: "SF Pro" }}
            >
                {item.label}
            </span>
            </Link>

          );
        })}
      </div>
    </nav>
  );
}
