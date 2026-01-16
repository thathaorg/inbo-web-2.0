"use client";

import Image from "next/image";

export default function LogoSection() {
  return (
    <div className="flex items-center flex-shrink-0 w-[150px] md:w-[260px]">
      <Image
        src="/logos/inbo-logo.png"
        alt="Inbo Logo"
        width={140}
        height={45}
        className="object-contain"
        // Avoid Next/Image warning when global CSS (suggested by Next) affects only one dimension.
        style={{ width: "auto", height: "auto" }}
      />
    </div>
  );
}
