"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function UserSection({ collapsed }: { collapsed: boolean }) {
  const { user } = useAuth();

  // Use real user data or fallback to defaults
  const userName = user?.name || user?.username || "User";
  const userImage = "/icons/account-icon.png";

  return (
    <Link
      href="/profile"
      className={`flex items-center py-4 border-t border-[#E5E7EB] cursor-pointer
        ${collapsed ? "justify-center" : "justify-between"}`}
    >
      <div className="flex items-center gap-3">
        <Image
          src={userImage}
          width={40}
          height={40}
          alt="User"
          className="rounded-full"
        />

        {!collapsed && (
          <div>
            <p className="text-[15px] font-medium">{userName}</p>
            <p className="text-[13px] text-[#6A7282]">View Profile</p>
          </div>
        )}
      </div>

      {!collapsed && (
        <ChevronRight size={18} className="text-[#A2AAB4]" />
      )}
    </Link>
  );
}
