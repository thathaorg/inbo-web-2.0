"use client";

import Image from "next/image";

export default function LogoSection() {
  return (
    <div className="flex items-center flex-shrink-0 w-[120px] md:w-[180px]">
      <Image
        src="/logos/inbo-logo.png"
        alt="Inbo Logo"
        width={110}
        height={36}
        className="object-contain"
        priority
        loading="eager"
        // Avoid Next/Image warning when global CSS (suggested by Next) affects only one dimension.
        style={{ width: "auto", height: "auto" }}
      />
    </div>
  );
}
