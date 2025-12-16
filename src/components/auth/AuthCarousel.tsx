// components/auth/AuthCarousel.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import clsx from "clsx";

interface Slide {
  title: string;
  description: string;
  desktopImage: string;
  mobileImage: string;
}

const slides: Slide[] = [
  {
    title: "A Dedicated Space for Your Newsletters",
    description:
      "No clutter, no chaos — just a peaceful inbox made for intentional reading. Your newsletters deserve better than your work email.",
    desktopImage: "/AuthCarousel/weblayoutauth1.png",
    mobileImage: "/AuthCarousel/mobilelayoutauth2.png",
  },
  {
    title: "Explore, Read & Grow",
    description:
      "Find curated newsletters from the world's best writers and creators. Subscribe with one click — stay curious, your way.",
    desktopImage: "/AuthCarousel/weblayoutauth2.png",
    mobileImage: "/AuthCarousel/mobilelayoutauth2.png",
  },
  {
    title: "Manage Subscriptions Effortlessly",
    description:
      "See all your subscriptions in one place. Easily unsubscribe, organize, and keep only what truly matters to you.",
    desktopImage: "/AuthCarousel/weblayoutauth3.png",
    mobileImage: "/AuthCarousel/mobilelayoutauth3.png",
  },
];

export default function AuthCarousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#C46A54] text-white">

      {/* Slides Wrapper */}
      <div
        className="absolute inset-0 flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${active * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div
            key={index}
            style={{ flex: "0 0 100%" }}
            className="
              flex flex-col items-center relative 
              pt-20 px-10 w-full h-full
              [mask-image:linear-gradient(to_top,transparent_0%,black_35%)]
            "
          >
            {/* Title */}
            <h2 className="text-[28px] font-semibold text-center leading-[42px] max-w-[480px]">
              {slide.title}
            </h2>

            {/* Description */}
            <p
              className="
                mt-4 max-w-[400px] text-center text-white
                text-[21px] leading-[18px] font-[400]
                font-['Helvetica_Neue'] break-words
              "
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
              }}
            >
              {slide.description}
            </p>

            {/* Desktop Preview */}
            <div className="absolute bottom-0 right-0 w-[75%] h-[60%] overflow-hidden">
              <div className="relative w-full h-full">
                <Image
                  src={slide.desktopImage}
                  alt="desktop preview"
                  fill
                  className="object-cover object-left-top"
                  priority
                />
              </div>
            </div>

            {/* Mobile Preview */}
            <div className="absolute bottom-0 left-[10%] w-auto max-w-[40%] h-auto max-h-[50%]">
              <div className="relative w-full h-full">
                <Image
                  src={slide.mobileImage}
                  alt="mobile preview"
                  width={300}
                  height={520}
                  className="object-contain object-bottom drop-shadow-xl"
                  priority
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Dots */}
      <div className="absolute top-[32vh] left-1/2 -translate-x-1/2 flex gap-2 z-50">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={clsx(
              "rounded-full transition-all",
              i === active ? "w-6 h-2 bg-white" : "w-3 h-3 bg-white/50"
            )}
          />
        ))}
      </div>

      {/* App Badges */}
      <div className="absolute bottom-[60px] right-10 z-50">
        <p className="font-bold mb-2 text-center">Available on</p>

        <div className="flex gap-3">
          <Image
            src="/badges/play-store.png"
            alt="Google Play"
            width={120}
            height={40}
            className="rounded-lg border border-black transition-transform duration-300 hover:scale-110 hover:shadow-lg"
          />

          <Image
            src="/badges/apple-store.png"
            alt="App Store"
            width={120}
            height={40}
            className="rounded-lg border border-black transition-transform duration-300 hover:scale-110 hover:shadow-lg"
          />
        </div>
      </div>

    </div>
  );
}
