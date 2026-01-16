"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import userService from "@/services/user";

export default function EmailBubble() {
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchInboxEmail = async () => {
      try {
        setLoading(true);
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 5000)
        );
        
        const userDataPromise = userService.getCompleteData();
        const userData = await Promise.race([userDataPromise, timeoutPromise]) as any;
        
        if (userData?.inboxEmail) {
          setEmail(userData.inboxEmail);
        } else {
          // Fallback if inbox not created yet
          setEmail("Create inbox");
        }
      } catch (error: any) {
        console.warn("Failed to fetch inbox email:", error);
        // Try to get from cookies or use placeholder
        setEmail("Loading...");
        // Don't show error state, just use placeholder
      } finally {
        setLoading(false);
      }
    };

    fetchInboxEmail();
  }, []);

  const handleCopy = async () => {
    if (!email || email === "Create inbox") return;
    
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);

      // Reset back to "Copy" after 1.5 sec
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error("Clipboard copy failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-2 py-1 bg-[#F3F4F6] rounded-full">
        <Image src="/icons/mail-icon.png" width={20} height={20} alt="Mail" />
        <span className="text-[16px] text-[#C46A54] font-medium">
          Loading...
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-2 py-1 bg-[#F3F4F6] rounded-full">
      <Image src="/icons/mail-icon.png" width={20} height={20} alt="Mail" />

      <span className="text-[16px] text-[#C46A54] font-medium">
        {email}
      </span>

      {email && email !== "Create inbox" && (
        <button
          onClick={handleCopy}
          className="
            px-3 py-[2px] bg-black rounded-full text-white text-[14px] 
            cursor-pointer transition-all hover:bg-gray-800
          "
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      )}
    </div>
  );
}
