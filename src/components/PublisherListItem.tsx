"use client";

import Image from "next/image";

export interface PublisherListItemProps {
  logo: string;
  name: string;
  description: string;
  frequency: string;
  onClick?: () => void;
}

export default function PublisherListItem({
  logo,
  name,
  description,
  frequency,
  onClick,
}: PublisherListItemProps) {
  return (
    <button
      onClick={onClick}
      className="
        w-full bg-white px-4 py-4 text-left
        active:bg-gray-100 transition
      "
    >
      <div className="flex items-start gap-4">

        {/* LOGO */}
        <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center bg-[#F5F5F5]">
          <Image
            src={logo}
            alt={name}
            width={48}
            height={48}
            className="object-contain"
          />
        </div>

        {/* TEXT COLUMN */}
        <div className="flex-1">

          <h3 className="text-[17px] font-semibold text-black leading-tight">
            {name}
          </h3>

          <p className="text-[14px] text-gray-600 leading-snug mt-1 line-clamp-2">
            {description}
          </p>

          <div className="flex items-center gap-1 mt-2">
            <Image
              src="/icons/mail-icon.png"
              alt="mail"
              width={14}
              height={14}
            />
            <span className="text-[14px] text-gray-600">{frequency}</span>
          </div>

        </div>
      </div>
    </button>
  );
}
