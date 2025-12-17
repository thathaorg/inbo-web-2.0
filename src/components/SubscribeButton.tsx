"use client";

import Image from "next/image";
import clsx from "clsx";
import { ButtonHTMLAttributes } from "react";

type SubscribeButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label?: string;
};

export default function SubscribeButton({
  label = "Subscribe",
  className,
  ...props
}: SubscribeButtonProps) {
  return (
    <button
      {...props}
      className={clsx(
        `
        cursor-pointer
        group
        inline-flex items-center justify-center gap-2
        rounded-full
        bg-[#0C1014]
        text-white
        font-medium
        whitespace-nowrap

        /* Responsive sizing */
        h-8 px-3 text-xs
        sm:h-9 sm:px-4 sm:text-sm
        md:h-10 md:px-5 md:text-base

        transition-all duration-300
        hover:bg-[#F2F3F5]
        hover:text-[#0C1014]
      `,
        className
      )}
    >
      <span>{label}</span>

      <span className="flex items-center relative">
        {/* Light icon */}
        <Image
          src="/icons/subscribe-icon-light.png"
          alt=""
          width={16}
          height={16}
          draggable={false}
          className="
            block group-hover:hidden
            w-3 h-3
            sm:w-4 sm:h-4
            md:w-5 md:h-5
          "
        />

        {/* Dark icon */}
        <Image
          src="/icons/subscribe-icon-dark.png"
          alt=""
          width={16}
          height={16}
          draggable={false}
          className="
            hidden group-hover:block
            w-3 h-3
            sm:w-4 sm:h-4
            md:w-5 md:h-5
          "
        />
      </span>
    </button>
  );
}
