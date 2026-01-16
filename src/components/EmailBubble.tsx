"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";

export default function EmailBubble() {
  const { user, isLoading } = useAuth();
  const [copied, setCopied] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log("🔍 EmailBubble Debug:");
    console.log("  - user:", user);
    console.log("  - username:", user?.username);
    console.log("  - inboxEmail:", user?.inboxEmail);
    console.log("  - isInboxCreated:", user?.isInboxCreated);
    console.log("  - isLoading:", isLoading);
  }, [user, isLoading]);

  // Construct email as username@inbo.me
  // Priority: username > inboxEmail > fallback
  const email = user?.username ? `${user.username}@inbo.me` : (user?.inboxEmail || "Create inbox");

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

  if (isLoading || !user) {
    return (
      <div className="flex items-center gap-2">
        <Image src="/icons/mail-icon.png" width={22} height={22} alt="Mail" />
        <span className="text-[16px] text-[#C46A54] font-semibold min-w-[100px]">Loading...</span>
      </div>
    );
  }

  const isReady = email !== "Create inbox";

  return (
    <div className="flex items-center gap-2">
      <Image src="/icons/mail-icon.png" width={22} height={22} alt="Mail" />

      <span className="text-[17px] text-[#C46A54] font-semibold whitespace-nowrap">
        {email}
      </span>

      {isReady && (
        <button
          onClick={handleCopy}
          className="ml-2 px-4 py-1 bg-[#0C1014] text-white text-[14px] font-medium rounded-full hover:bg-black transition-colors"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      )}
    </div>
  );
}
