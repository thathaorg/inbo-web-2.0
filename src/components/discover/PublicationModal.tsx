"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { X, Bookmark } from "lucide-react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import SubscribeButton from "../SubscribeButton";

export interface Publication {
  id: string;
  rank: number;
  logo: string;
  name: string;
  desc: string;
  description: string;
  frequency: string;
  url?: string; // Newsletter website URL
}

export default function PublicationModal({
  isOpen,
  onClose,
  publication,
}: {
  isOpen: boolean;
  onClose: () => void;
  publication: Publication | null;
}) {
  const [filled, setFilled] = useState(false);

  // 🔥 Detect mobile (full screen)
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !publication) return null;

  const handlecollectionClick = () => {
    setFilled(!filled);
    toast.success("Added to Collections");
  };

  const modal = (
    <div
      className={`
        fixed inset-0 
        bg-black/20
        flex z-[999999]

        ${isMobile
          ? "justify-center items-center p-0"       /* FULLSCREEN MOBILE */
          : "justify-end items-end p-4"}            /* BOTTOM SHEET DESKTOP */
      `}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`
          bg-white
          flex flex-col
          overflow-hidden
          animate-[slideUp_0.25s_ease-out_forwards]
          w-full

          ${isMobile
            ? "h-full rounded-none p-4 pt-6"        /* MOBILE FULLSCREEN */
            : "h-auto max-h-[70vh] md:max-w-sm p-4 pt-6 rounded-2xl"} /* DESKTOP SHEET */
        `}
      >
        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          
          {/* HEADER */}
          <div className="flex items-center justify-between w-full mb-4">
            <button onClick={onClose}>
              <X className="w-6 h-6 text-black" />
            </button>

            <div className="flex items-center gap-5">
              <img src="/icons/campus-icon.png" alt="navigation" className="w-7 h-7" />
              <img src="/icons/share-icon.png" alt="share" className="w-7 h-7" />
            </div>
          </div>

          {/* LOGO + NAME */}
          <div className="flex items-center gap-3 mb-4">
            <img
              src={publication.logo}
              alt={publication.name}
              className="w-11 h-11 rounded-full object-cover"
            />

            <div>
              <h2 className="text-[20px] font-medium text-black">
                {publication.name}
              </h2>
              <p className="text-[16px] text-gray-500">
                {publication.name.toLowerCase()}.com
              </p>
            </div>
          </div>

          {/* DESCRIPTION */}
          <p className="text-[16px] text-[#6F7680] leading-5 mb-6">
            {publication.desc || publication.description}
          </p>

          {/* SUBSCRIBE + BOOKMARK */}
          <div className="flex items-center justify-between gap-3 w-full mb-6">
            <SubscribeButton newsletterId={publication.id} websiteUrl={publication.url} />

            <button
              onClick={handlecollectionClick}
              className="
                cursor-pointer
                px-4 py-2
                bg-[#F3F4F6]
                rounded-full
                flex items-center justify-center
                transition-all duration-200
                hover:bg-[#E5E7EB]
              "
            >
              <Bookmark
                strokeWidth={2}
                className="w-6 h-6 text-[#0C1014]"
                fill={filled ? "#0C1014" : "transparent"}
              />
            </button>
          </div>

          {/* LATEST */}
          <h3 className="text-[16px] font-medium text-[#6F7680] mb-3">
            Latest
          </h3>

          <div className="space-y-3">
            {[
              {
                title: "BFM #87: Personalised UX Doesn’t Work",
                date: "Oct 3rd",
                time: "2 mins",
                desc: "Why most personalized UX fails and how Nike’s simple tricks deliver real customer engagement.",
                img: "/logos/forbes-sample.png",
              },
              {
                title: "How Apple builds addictive product loops",
                date: "Oct 3rd",
                time: "4 mins",
                desc: "A deep dive into Apple’s approach to predictable engagement models.",
                img: "/logos/forbes-sample.png",
              },
              {
                title: "How Apple builds addictive product loops",
                date: "Oct 3rd",
                time: "4 mins",
                desc: "A deep dive into Apple’s approach to predictable engagement models.",
                img: "/logos/forbes-sample.png",
              },
              {
                title: "The psychology behind user friction",
                date: "Oct 3rd",
                time: "3 mins",
                desc: "Small UX changes drastically affect user behavior.",
                img: "/logos/forbes-sample.png",
              },
            ].map((article, i) => (
              <div
                key={i}
                className="
                  border border-[#DBDFE4]
                  rounded-[18px]
                  p-4
                  flex flex-col gap-2
                  bg-white
                "
              >
                <div className="flex items-center gap-2 text-[#6A7282] text-[14px]">
                  {article.date}
                  <div className="w-1.5 h-1.5 bg-[#6A7282] rounded-full" />
                  {article.time}
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1 text-[16px] font-medium text-[#1C1C1C]">
                    {article.title}
                  </div>

                  <img
                    src={article.img}
                    className="w-[84px] h-[54px] rounded-[12px] object-cover"
                    alt="Article image"
                  />
                </div>

                <p className="text-[14px] text-[#6F7680] leading-4">
                  {article.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* GLOBAL STYLES */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );

  return createPortal(modal, document.body);
}
