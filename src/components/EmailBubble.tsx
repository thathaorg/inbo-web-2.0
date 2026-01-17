"use client";

import { useState } from "react";
import Image from "next/image";
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
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Image src="/icons/mail-icon.png" width={22} height={22} alt="Mail" />
      
      <span className="text-[17px] text-[#C46A54] font-semibold whitespace-nowrap">
        {email}
      </span>

      <button
        onClick={handleCopy}
        className="ml-2 px-4 py-1 bg-[#0C1014] text-white text-[14px] font-medium rounded-full hover:bg-black transition-colors"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}
