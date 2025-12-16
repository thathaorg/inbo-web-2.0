"use client";

import { useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  return (
    <button
      onClick={() => setDark(!dark)}
      className="relative w-[40px] h-[20px] bg-[#CBD5E1] rounded-full"
    >
      <div
        className={`
          absolute top-[1px] w-[18px] h-[18px]
          rounded-full bg-white shadow transition-all
          ${dark ? "left-[21px]" : "left-[1px]"}
        `}
      />

      <Sun
        size={14}
        className={`absolute left-[3px] top-[4px] transition-opacity ${
          dark ? "opacity-0" : "opacity-100"
        }`}
      />

      <Moon
        size={14}
        className={`absolute right-[3px] top-[4px] transition-opacity ${
          dark ? "opacity-100" : "opacity-0"}
        `}
      />
    </button>
  );
}
