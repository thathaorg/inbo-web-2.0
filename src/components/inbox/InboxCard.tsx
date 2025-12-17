"use client";

import Image from "next/image";
import Link from "next/link";

function InboxCardMobile({
  badgeText,
  badgeColor,
  badgeTextColor,
  author,
  title,
  time,
  thumbnail,
  read,
  slug,      // 👈 Add this or use any ID for routing
}: any) {
  return (
    <Link href={`/reading/${slug}`} className="block">
      <div className="md:hidden py-4 border-b border-gray-200">
        <div className="px-4 flex flex-col gap-2">

          {/* TOP ROW — Badge + Author + Time */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="text-[11px] px-2 py-[2px] rounded-full font-medium"
                style={{ backgroundColor: badgeColor, color: badgeTextColor }}
              >
                {badgeText}
              </span>

              <span className="text-[12px] text-gray-600">{author}</span>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-[12px] text-gray-500">{time}</span>
              {!read && (
                <span className="w-[7px] h-[7px] bg-orange-500 rounded-full"></span>
              )}
            </div>
          </div>

          {/* TITLE + THUMBNAIL ROW */}
          <div className="flex items-start gap-3">

            {/* TITLE ONLY */}
            <h3 className="flex-1 text-[15px] font-semibold text-[#0C1014] leading-snug line-clamp-3">
              {title}
            </h3>

            {thumbnail && (
              <Image
                src={thumbnail}
                alt={title}
                width={65}
                height={65}
                className="rounded-lg object-cover shrink-0"
              />
            )}
          </div>

          <span className="text-[12px] text-gray-500">Today</span>
        </div>
      </div>
    </Link>
  );
}



/* --------------------------------------------
   DESKTOP CARD (wrapped in Link)
--------------------------------------------- */
function NewsletterCardDesktop({
  badgeText,
  badgeColor,
  badgeTextColor,
  author,
  title,
  description,
  date,
  time,
  tag,
  thumbnail,
  slug,
  read,
}: any) {
  return (
    <Link href={`/reading/${slug}`} className="block">
      <div
        className="
          hidden md:flex
          bg-white border border-[#E5E7EB] rounded-2xl p-4
          flex-col gap-4 shadow-sm mb-3
        "
      >
        {/* Badge + Author + Time */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <div
              className="w-[28px] h-[28px] rounded-full flex items-center justify-center"
              style={{ backgroundColor: badgeColor }}
            >
              <span className="text-xs font-bold" style={{ color: badgeTextColor }}>
                {badgeText}
              </span>
            </div>

            <span className="text-[13px] text-[#6F7680]">{author}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[13px] text-[#6F7680]">{time}</span>

            {/* 🔥 unread indicator */}
            {!read && (
              <span className="w-[8px] h-[8px] bg-orange-500 rounded-full"></span>
            )}
          </div>
        </div>

        {/* Main Row */}
        <div className="flex justify-between items-start gap-4">
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            <h2 className="text-[18px] font-semibold text-[#0C1014] leading-snug line-clamp-2">
              {title}
            </h2>

            <p className="text-[14px] text-[#6F7680] leading-snug line-clamp-2">
              {description}
            </p>

            <div className="flex items-center gap-4">
              <span className="text-[13px] text-[#6F7680]">{date}</span>
              <span className="px-3 py-1 bg-[#F3F4F6] rounded-full text-[13px]">
                {tag}
              </span>
            </div>
          </div>

          <Image
            src={thumbnail}
            alt="thumbnail"
            width={110}
            height={70}
            className="rounded-xl object-cover shrink-0"
          />
        </div>
      </div>
    </Link>
  );
}




/* --------------------------------------------
   EXPORT BOTH CARDS
--------------------------------------------- */
export default function NewsletterCard(props: any) {
  return (
    <>
      <InboxCardMobile {...props} />
      <NewsletterCardDesktop {...props} />
    </>
  );
}
