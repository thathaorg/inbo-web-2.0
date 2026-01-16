"use client";

import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import emailService, { extractFirstImage } from "@/services/email";

// In-memory cache for email thumbnails
const thumbnailCache = new Map<string, string | null>();

interface EmailThumbnailProps {
  emailId: string;
  sender?: string;
  thumbnail?: string | null; // Pre-fetched thumbnail from list API
  title?: string;
  className?: string;
  size?: "small" | "large";
}

export default function EmailThumbnail({ 
  emailId,
  sender,
  thumbnail: thumbnailProp,
  title = "Email thumbnail",
  className = "",
  size = "small"
}: EmailThumbnailProps) {
  const [thumbnail, setThumbnail] = useState<string | null>(thumbnailProp || null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [imageError, setImageError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const dimensions = size === "small" 
    ? { width: 65, height: 65 } 
    : { width: 110, height: 70 };

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect(); // Stop observing once visible
          }
        });
      },
      { rootMargin: "50px" } // Start loading 50px before visible
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Fetch thumbnail when visible (only if not provided from list)
  useEffect(() => {
    // If thumbnail was provided from list API, no need to fetch
    if (thumbnailProp !== undefined) {
      setThumbnail(thumbnailProp);
      return;
    }

    if (!isVisible || thumbnail || isLoading) return;

    const fetchThumbnail = async () => {
      // Check cache first
      if (thumbnailCache.has(emailId)) {
        const cached = thumbnailCache.get(emailId);
        setThumbnail(cached);
        return;
      }

      setIsLoading(true);
      try {
        // Fetch email detail to get body
        const emailDetail = await emailService.getEmailDetail(emailId);
        
        // Extract first image from body
        let imageUrl = extractFirstImage(emailDetail.body);
        
        // If no content image found, try to get provider logo
        if (!imageUrl && sender) {
          // Extract provider logo from the API
          const providerLogoResponse = await fetch(
            `/api/search/providers/search/?q=${encodeURIComponent(sender.split('@')[0])}&page_size=1`
          );
          
          if (providerLogoResponse.ok) {
            const data = await providerLogoResponse.json();
            if (data.results && data.results.length > 0) {
              imageUrl = data.results[0].logo || data.results[0].image || null;
            }
          }
        }
        
        // Cache the result (even if null)
        thumbnailCache.set(emailId, imageUrl);
        setThumbnail(imageUrl);
      } catch (error) {
        console.warn(`Failed to fetch thumbnail for email ${emailId}:`, error);
        thumbnailCache.set(emailId, null);
        setThumbnail(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchThumbnail();
  }, [isVisible, emailId, sender, thumbnail, isLoading, thumbnailProp]);

  return (
    <div ref={containerRef} className={className}>
      {thumbnail && !imageError ? (
        <div className={`overflow-hidden shrink-0 ${
          size === "small" 
            ? "w-[65px] h-[65px] rounded-lg" 
            : "w-[110px] h-[70px] rounded-xl"
        }`}>
          <Image
            src={thumbnail}
            alt={title}
            width={dimensions.width}
            height={dimensions.height}
            className="w-full h-full object-cover"
            unoptimized={true}
            onError={() => {
              console.warn(`Failed to load image for email ${emailId}: ${thumbnail}`);
              setImageError(true);
            }}
          />
        </div>
      ) : (
        <div 
          className={`bg-gray-100 flex items-center justify-center shrink-0 ${
            size === "small" 
              ? "w-[65px] h-[65px] rounded-lg" 
              : "w-[110px] h-[70px] rounded-xl"
          }`}
        >
          {isLoading ? (
            <div className="animate-pulse">
              <svg 
                className={size === "small" ? "w-6 h-6" : "w-8 h-8"} 
                fill="none" 
                viewBox="0 0 24 24"
              >
                <circle 
                  className="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="4"
                />
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          ) : (
            <span className={`text-gray-400 ${size === "small" ? "text-[10px]" : "text-xs"}`}>
              No image
            </span>
          )}
        </div>
      )}
    </div>
  );
}
