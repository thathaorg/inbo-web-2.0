"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import userService, { type UserProfileResponse } from "@/services/user";

export default function EmailBubble() {
  const [copied, setCopied] = useState(false);
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

  // Use inboxEmail if available, otherwise construct from username (same as profile page)
  const email = profile?.inboxEmail || (profile?.username ? `${profile.username}@inbo.club` : "");

  const handleCopy = async () => {
    if (!email) return;
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <Image 
        src="/icons/mail-icon.png" 
        width={22} 
        height={22} 
        alt="Mail" 
        className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] md:w-[22px] md:h-[22px]"
      />
      
      <span className="text-[13px] sm:text-[15px] md:text-[17px] text-[#C46A54] font-semibold whitespace-nowrap max-w-[100px] sm:max-w-[140px] md:max-w-none truncate">
        {email || "Loading..."}
      </span>

      <button
        onClick={handleCopy}
        disabled={!email}
        className="ml-1 sm:ml-2 px-2 sm:px-3 md:px-4 py-0.5 sm:py-1 bg-[#0C1014] text-white text-[12px] sm:text-[13px] md:text-[14px] font-medium rounded-full hover:bg-black transition-colors disabled:opacity-50"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}
