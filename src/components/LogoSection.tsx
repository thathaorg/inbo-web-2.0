"use client";

import Image from "next/image";

export default function LogoSection() {
  return (
    <div className="flex items-center flex-shrink-0 w-[120px] md:w-[252px]">
      <Image
        src="/logos/inbo-logo.png"
        alt="Inbo Logo"
        width={110}
        height={36}
        className="object-contain w-[80px] sm:w-[100px] md:w-[120px] lg:w-[140px] h-auto"
        priority
        loading="eager"
      />
    </div>
  );
}
