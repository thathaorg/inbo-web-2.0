"use client";

import { useState } from "react";
import Image from "next/image";

export default function EmailBubble() {
  const email = "example@inbo.club";
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);

      // Reset back to "Copy" after 1.5 sec
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error("Clipboard copy failed:", error);
    }
  };

  return (
    <div className="flex items-center gap-2 px-2 py-1 bg-[#F3F4F6] rounded-full">
      <Image src="/icons/mail-icon.png" width={20} height={20} alt="Mail" />

      <span className="text-[16px] text-[#C46A54] font-medium">
        {email}
      </span>

      <button
        onClick={handleCopy}
        className="
          px-3 py-[2px] bg-black rounded-full text-white text-[14px] 
          cursor-pointer transition-all
        "
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}
