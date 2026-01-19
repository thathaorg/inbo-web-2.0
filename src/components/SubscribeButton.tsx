"use client";

import Image from "next/image";
import clsx from "clsx";
import { ButtonHTMLAttributes, useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";
import EmailCopyBox from "./EmailCopyBox";

type SubscribeButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label?: string;
  newsletterId?: string;
  websiteUrl?: string;
  onSubscribeSuccess?: () => void;
};

export default function SubscribeButton({
  label = "Subscribe",
  newsletterId,
  websiteUrl,
  onSubscribeSuccess,
  className,
  ...props
}: SubscribeButtonProps) {
  const [isOpening, setIsOpening] = useState(false);
  const [showEmailBox, setShowEmailBox] = useState(false);
  const popupRef = useRef<Window | null>(null);
  const popupCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up popup check interval
  const clearPopupCheck = useCallback(() => {
    if (popupCheckIntervalRef.current) {
      clearInterval(popupCheckIntervalRef.current);
      popupCheckIntervalRef.current = null;
    }
  }, []);

  // Check if popup is closed and hide EmailCopyBox
  const startPopupCheck = useCallback(() => {
    clearPopupCheck();
    popupCheckIntervalRef.current = setInterval(() => {
      if (popupRef.current && popupRef.current.closed) {
        setShowEmailBox(false);
        clearPopupCheck();
        popupRef.current = null;
      }
    }, 500);
  }, [clearPopupCheck]);

  // Open newsletter website in a centered popup window
  const openSubscribePage = useCallback(() => {
    if (!websiteUrl) {
      toast.error("Newsletter website URL is not available");
      return;
    }

    // Ensure URL has proper protocol
    let url = websiteUrl;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    // Calculate popup window dimensions and position (left side of screen)
    const width = 800;
    const height = 700;
    const left = Math.max(0, (window.screen.width - width) / 2 - 200); // Slightly left of center
    const top = (window.screen.height - height) / 2;

    // Open in popup window
    const popup = window.open(
      url,
      'subscribe_popup',
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=yes,status=no`
    );

    // If popup was blocked, open in new tab instead
    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
      toast.info("Opening newsletter in a new tab");
      // Still show email box for new tab
      setShowEmailBox(true);
    } else {
      // Store popup reference and start monitoring
      popupRef.current = popup;
      popup.focus();
      setShowEmailBox(true);
      startPopupCheck();
    }
  }, [websiteUrl, startPopupCheck]);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!websiteUrl) {
      toast.error("Newsletter subscription page is not available");
      return;
    }

    setIsOpening(true);
    openSubscribePage();
    
    // Reset state after a short delay
    setTimeout(() => {
      setIsOpening(false);
    }, 1000);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearPopupCheck();
    };
  }, [clearPopupCheck]);

  return (
    <>
      <button
        {...props}
        onClick={handleClick}
        disabled={isOpening}
        className={clsx(
          `
          cursor-pointer
          group
          inline-flex items-center justify-center gap-2
          rounded-full
          font-medium
          whitespace-nowrap
          transition-all duration-300
          disabled:opacity-50 disabled:cursor-not-allowed

          /* Responsive sizing */
          h-8 px-3 text-xs
          sm:h-9 sm:px-4 sm:text-sm
          md:h-10 md:px-5 md:text-base
          
          bg-[#0C1014] text-white hover:bg-[#F2F3F5] hover:text-[#0C1014]
        `,
          className
        )}
      >
        <span>{isOpening ? "Opening..." : label}</span>

        <span className="flex items-center relative">
          {/* Light icon */}
          <Image
            src="/icons/subscribe-icon-light.png"
            alt=""
            width={16}
            height={16}
            draggable={false}
            className="
              block group-hover:hidden
              w-3 h-3
              sm:w-4 sm:h-4
              md:w-5 md:h-5
            "
          />

          {/* Dark icon */}
          <Image
            src="/icons/subscribe-icon-dark.png"
            alt=""
            width={16}
            height={16}
            draggable={false}
            className="
              hidden group-hover:block
              w-3 h-3
              sm:w-4 sm:h-4
              md:w-5 md:h-5
            "
          />
        </span>
      </button>

      {/* Email Copy Box - appears when popup opens */}
      <EmailCopyBox 
        isVisible={showEmailBox} 
        onClose={() => setShowEmailBox(false)} 
      />
    </>
  );
}
