"use client";

import { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";

export default function EmailBubble() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  // Simple: Just construct email from username
  const username = user?.username || "arup.dev"; // Fallback for safety
  const email = `${username}@inbo.me`;

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
