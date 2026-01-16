"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";


import { useState, useRef, useEffect } from "react";
import { MoreHorizontal } from "lucide-react";

/* --------------------------------------------
   CUSTOM CHECKBOX (shared)
--------------------------------------------- */
function CardCheckbox({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onChange(!checked);
      }}
      className={`
        w-5 h-5 rounded-md
        flex items-center justify-center
        border
        transition-colors
        ${checked
          ? "bg-black border-black-500"
          : "bg-white border-gray-300"
        }
      `}
    >
      {checked && (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </button>
  );
}

/* --------------------------------------------
   MOBILE CARD
--------------------------------------------- */
function InboxCardMobile({
  badgeText,
  badgeColor,
  badgeTextColor,
  author,
  title,
  time,
  thumbnail,
  read,
  slug,
  emailId,
  isReadLater,
  onClick,
  showCheckbox = false,
  checked = false,
  onCheckChange,
  newsletterName,
  newsletterLogo,
  onMoveToTrash,
  onToggleReadLater,
}: any) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (slug) {
      router.push(`/reading/${slug}`);
    } else {
      console.warn('Cannot navigate: slug is missing', { slug });
    }
  };
  return (
    <div onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      className="md:hidden py-4 border-b border-gray-300 cursor-pointer hover:bg-gray-50 transition-colors">
      <div className="px-4 flex gap-3 items-start">
        {/* CHECKBOX */}
        {showCheckbox && (
          <CardCheckbox
            checked={checked}
            onChange={(v) => onCheckChange?.(v)}
          />
        )}

        {/* CONTENT */}
        <div className="flex-1 flex flex-col gap-2">
          {/* TOP ROW - Newsletter name + time */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Newsletter Logo */}
              {newsletterLogo ? (
                <Image
                  src={newsletterLogo}
                  alt={newsletterName || badgeText}
                  width={16}
                  height={16}
                  className="rounded object-cover"
                  style={{ width: "auto", height: "auto" }}
                />
              ) : (
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                  style={{ backgroundColor: badgeColor, color: badgeTextColor }}
                >
                  {(newsletterName || badgeText || author || 'N')[0].toUpperCase()}
                </div>
              )}

              <span className="text-[12px] text-gray-600 font-medium">
                {newsletterName || badgeText || author}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-[12px] text-gray-500">
                {time}
              </span>
              {!read && (
                <span className="w-[7px] h-[7px] bg-red-500 rounded-full" />
              )}

              {/* MORE ICON MOBILE */}
              <div className="relative ml-1" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const next = !showMenu;
                    setShowMenu(next);
                  }}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <MoreHorizontal size={16} className="text-gray-400" />
                </button>

                {showMenu && (
                  <div
                    ref={menuRef}
                    className="absolute right-0 top-full mt-1 w-40 bg-white border rounded-lg shadow-xl z-50 p-1 animate-in fade-in zoom-in duration-150"
                  >
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (onToggleReadLater) onToggleReadLater(emailId, !isReadLater);
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-md text-xs font-medium"
                    >
                      {isReadLater ? 'Remove Read Later' : 'Read Later'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (onMoveToTrash) onMoveToTrash(emailId);
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-red-50 rounded-md text-xs font-medium text-red-600"
                    >
                      Move to Trash
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* TITLE + THUMB */}
          <div className="flex items-start gap-3">
            <h3 className="flex-1 text-[15px] font-semibold text-[#0C1014] leading-snug line-clamp-3">
              {title}
            </h3>

            {thumbnail ? (
              <Image
                src={thumbnail}
                alt={title || 'Email thumbnail'}
                width={65}
                height={65}
                className="rounded-lg object-cover shrink-0"
                style={{ width: "auto", height: "auto" }}
              />
            ) : (
              <div className="w-[65px] h-[65px] rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                <span className="text-gray-400 text-[10px]">No image</span>
              </div>
            )}
          </div>

          <span className="text-[12px] text-gray-500">
            Today
          </span>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------
   DESKTOP CARD
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
  emailId,
  read,
  isReadLater,
  onClick,
  showCheckbox = false,
  checked = false,
  onCheckChange,
  newsletterName,
  newsletterLogo,
  onMoveToTrash,
  onToggleReadLater,
}: any) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (slug) {
      router.push(`/reading/${slug}`);
    } else {
      console.warn('Cannot navigate: slug is missing', { slug });
    }
  };

  const handleMoreClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleReadLater = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleReadLater) onToggleReadLater(emailId, !isReadLater);
    setShowMenu(false);
  };

  const handleTrash = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onMoveToTrash) onMoveToTrash(emailId);
    setShowMenu(false);
  };

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      className="
          hidden md:flex
          bg-white border border-[#E5E7EB]
          rounded-2xl p-4
          gap-4 shadow-sm
          cursor-pointer hover:shadow-md transition-all
          relative
        "
    >
      {/* CHECKBOX */}
      {showCheckbox && (
        <CardCheckbox
          checked={checked}
          onChange={(v) => onCheckChange?.(v)}
        />
      )}

      {/* CONTENT */}
      <div className="flex-1 flex flex-col gap-4">
        {/* HEADER - Newsletter name + time (matching Figma) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Newsletter Logo */}
            {newsletterLogo ? (
              <Image
                src={newsletterLogo}
                alt={newsletterName || badgeText}
                width={20}
                height={20}
                className="rounded object-cover"
                style={{ width: "auto", height: "auto" }}
              />
            ) : (
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                style={{ backgroundColor: badgeColor, color: badgeTextColor }}
              >
                {(newsletterName || badgeText || author || 'N')[0].toUpperCase()}
              </div>
            )}

            <span className="text-[13px] text-[#6F7680] font-medium">
              {newsletterName || badgeText || author} Newsletter
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[13px] text-[#6F7680]">
              {time}
            </span>
            {!read && (
              <span className="w-[8px] h-[8px] bg-red-500 rounded-full" />
            )}

            {/* MORE ICON */}
            <div className="relative ml-2" ref={menuRef}>
              <button
                onClick={handleMoreClick}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <MoreHorizontal size={18} className="text-gray-400" />
              </button>

              {showMenu && (
                <div className="absolute right-0 top-full mt-1 w-44 bg-white border rounded-xl shadow-xl z-50 p-1.5 animate-in fade-in zoom-in duration-200">
                  <button
                    onClick={handleReadLater}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg text-sm font-medium flex items-center justify-between"
                  >
                    {isReadLater ? 'Remove from Read Later' : 'Read Later'}
                  </button>
                  <button
                    onClick={handleTrash}
                    className="w-full text-left px-3 py-2 hover:bg-red-50 rounded-lg text-sm font-medium text-red-600 flex items-center justify-between"
                  >
                    Move to Trash
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="flex justify-between items-start gap-4">
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            <h2 className="text-[18px] font-semibold text-[#0C1014] leading-snug line-clamp-2">
              {title}
            </h2>

            <p className="text-[14px] text-[#6F7680] leading-snug line-clamp-2">
              {description}
            </p>

            <div className="flex items-center gap-4">
              <span className="text-[13px] text-[#6F7680]">
                {date}
              </span>
              <span className="px-3 py-1 bg-[#F3F4F6] rounded-full text-[13px]">
                {tag}
              </span>
            </div>
          </div>

          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={title || "Email thumbnail"}
              width={110}
              height={70}
              className="rounded-xl object-cover shrink-0"
              style={{ width: "auto", height: "auto" }}
            />
          ) : (
            <div className="w-[110px] h-[70px] rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
              <span className="text-gray-400 text-xs">No image</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------
   EXPORT
--------------------------------------------- */
export default function NewsletterCard(props: any) {
  return (
    <div className="w-full">
      <InboxCardMobile {...props} />
      <NewsletterCardDesktop {...props} />
    </div>
  );
}
