"use client";

import Image from "next/image";

export default function LogoSection() {
  return (
    <div className="flex items-center flex-shrink-0 w-[100px] sm:w-[120px] md:w-[150px] lg:w-[260px]">
      <Image
        src="/logos/inbo-logo.png"
        alt="Inbo Logo"
        width={140}
        height={45}
        className="object-contain w-[80px] sm:w-[100px] md:w-[120px] lg:w-[140px] h-auto"
        priority
        loading="eager"
      />
    </div>
  );
}
