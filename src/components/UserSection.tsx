"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import userService, { type UserProfileResponse } from "@/services/user";

export default function UserSection({ collapsed }: { collapsed: boolean }) {
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await userService.getProfile();
        setProfile(data);
      } catch (err) {
        console.error("Failed to load profile", err);
      }
    };
    loadProfile();
  }, []);

  // Use real user data or fallback to defaults
  const userName = profile?.name || profile?.username || "User";
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
