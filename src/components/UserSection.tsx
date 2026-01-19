"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";

// Helper function to get initials from name
const getInitials = (name: string): string => {
  if (!name) return "U";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

// Generate a consistent color based on name
const getAvatarColor = (name: string): string => {
  const colors = [
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", 
    "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F",
    "#BB8FCE", "#85C1E9", "#F8B500", "#FF85C0"
  ];
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

export default function UserSection({ collapsed }: { collapsed: boolean }) {
  const { user, isLoading } = useAuth();
  const { t } = useTranslation("common");

  // Use real user data or fallback to defaults
  const userName = user?.name || user?.username || (isLoading ? "Loading..." : "User");
  const userPicture = user?.picture;
  const initials = getInitials(userName);
  const avatarColor = getAvatarColor(userName);

  return (
    <Link
      href="/profile"
      className={`flex items-center py-4 border-t border-[#E5E7EB] cursor-pointer
        ${collapsed ? "justify-center" : "justify-between"}`}
    >
      <div className="flex items-center gap-3">
        {/* User Avatar - Shows profile picture or initials as fallback */}
        {userPicture ? (
          <Image
            src={userPicture}
            width={40}
            height={40}
            alt={userName}
            className="rounded-full object-cover"
            unoptimized
          />
        ) : (
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
            style={{ backgroundColor: avatarColor }}
          >
            {initials}
          </div>
        )}

        {!collapsed && (
          <div>
            <p className="text-[15px] font-medium">{userName}</p>
            <p className="text-[13px] text-[#6A7282]">{t("profile.title")}</p>
          </div>
        )}
      </div>

      {!collapsed && (
        <ChevronRight size={18} className="text-[#A2AAB4]" />
      )}
    </Link>
  );
}
