"use client";
import Image from "next/image";
import SubscribeButton from "../SubscribeButton";

export interface NewsletterEntry {
  id?: string;
  title: string;
  description: string;
  imageUrl: string;
  frequency: string;
  ctaLabel: string;
  tagLabel?: string;
  tagIcon?: string;
  websiteUrl?: string; // Newsletter's website URL for subscription
}

export default function NewsletterCarouselItem({
  id,
  title,
  description,
  imageUrl,
  frequency,
  ctaLabel,
  tagLabel,
  tagIcon,
  websiteUrl,
}: NewsletterEntry) {
  return (
    <div className="w-full max-w-[280px] flex-none p-4 bg-white rounded-[20px] shadow-sm flex flex-col gap-3 relative z-10">

      {/* IMAGE WITH TAG OVERLAY */}
      <div className="relative w-full h-[153px] bg-[#F3F4F6] rounded-[16px] overflow-hidden">

        {/* TAG OVERLAY */}
        {tagLabel && (
          <div
            className="
              absolute top-3 left-3
              flex items-center gap-1.5
              bg-white/90 backdrop-blur
              px-3 py-1 rounded-full shadow-sm
              text-[#0C1014] text-[12px] font-medium leading-[16px]
            "
            style={{ pointerEvents: 'none' }}
          >
            {tagIcon && <span className="text-[14px]">{tagIcon}</span>}
            <span>{tagLabel}</span>
          </div>
        )}

        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover pointer-events-none"
        />
      </div>

      {/* CONTENT */}
      <div className="flex flex-col gap-6">

        {/* TITLE + DESCRIPTION */}
        <div className="flex flex-col gap-1">
          <h3 className="text-black text-[20px] font-medium leading-[30px] line-clamp-1">
            {title}
          </h3>

          <p className="text-[#6F7680] text-[14px] font-normal leading-[16px] line-clamp-2">
            {description}
          </p>
        </div>

        {/* CTA + FREQUENCY */}
        <div className="flex justify-between items-center">

          {/* CTA BUTTON */}
          <SubscribeButton newsletterId={id} websiteUrl={websiteUrl} />

          {/* FREQUENCY */}
          <div className="px-1.5 py-1 rounded-b-[12px] flex items-center gap-2">
            <span className="text-[16px]">
              <Image
                src="/icons/frequency-icon.png"
                alt=""
                width={16}
                height={16}
                draggable={false}
                className="pointer-events-none"
              />
            </span>
            <span className="text-[#0C1014] text-[12px] font-normal leading-[16px]">
              {frequency}
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}