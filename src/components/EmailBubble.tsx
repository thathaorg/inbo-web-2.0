"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import userService, { type UserProfileResponse } from "@/services/user";
import { useAuth } from "@/contexts/AuthContext";

export default function EmailBubble() {
  const { user, isLoading } = useAuth();
  const [copied, setCopied] = useState(false);

  // Use inboxEmail from API, fallback to constructing from username
  const email = user?.inboxEmail || (user?.username ? `${user.username}@inbo.me` : "");

  // Show loading placeholder while fetching user or if no email yet
  if (isLoading || !email) {
    return (
      <div className="flex items-center gap-2 animate-pulse">
        <div className="w-[22px] h-[22px] bg-gray-200 rounded-full" />
        <div className="w-32 h-4 bg-gray-200 rounded" />
        <div className="w-14 h-6 bg-gray-200 rounded-full" />
      </div>
    );
  }

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
