"use client";

import FlameBadge from "../FlameBadge";
import UserSection from "../UserSection";

export default function MobileHeader({
  title,
  onMenuClick,
}: {
  title: string;
  onMenuClick: () => void;
}) {
  return (
    <header className="flex md:hidden w-full px-4 py-3 items-center justify-between">
      {/* LEFT — Dynamic Title */}
      <h1 className="text-[26px] font-bold text-[#0C1014]">{title}</h1>

      {/* RIGHT — Flame + User Icon */}
      <div className="flex items-center gap-2">
        
        {/* FlameBadge box */}
        <div className="w-8 h-8 flex items-center justify-center">
          <FlameBadge />
        </div>

        {/* User icon box */}
        <div className="w-8 h-8 flex items-center justify-center">
          <UserSection collapsed={true} />
        </div>

      </div>
    </header>
  );
}
