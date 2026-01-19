"use client";

import { Search } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";

export default function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation("common");

  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false); // ✅ NEW
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastPushedQueryRef = useRef<string>("");

  const isExpanded = isFocused || query.length > 0; // ✅ KEY LOGIC

  /* Sync input from URL ONLY on /search */
  useEffect(() => {
    if (pathname === "/search") {
      const params = new URLSearchParams(window.location.search);
      setQuery(params.get("q") ?? "");
    }
  }, [pathname]);

  /* Clear input when leaving /search */
  useEffect(() => {
    if (pathname !== "/search") {
      setQuery("");
      lastPushedQueryRef.current = "";
      setIsFocused(false);
    }
  }, [pathname]);

  /* Debounced navigation */
  const handleChange = (value: string) => {
    setQuery(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      const trimmed = value.trim();
      if (!trimmed) return;
      if (lastPushedQueryRef.current === trimmed) return;

      lastPushedQueryRef.current = trimmed;

      router.push(`/search?q=${encodeURIComponent(trimmed)}`, {
        scroll: false,
      });
    }, 300);
  };

  return (
    <div className="flex md:flex-none max-w-full md:max-w-[520px] w-full">
      <div
        className={`
          flex items-center bg-white
          h-[36px] sm:h-[38px] md:h-[40px]
          rounded-full border border-[#DBDFE4]
          shadow-[0_4px_12px_rgba(0,0,0,0.05)]
          pl-3 sm:pl-4 md:pl-5 pr-1 sm:pr-2
          transition-all duration-300 ease-out
          w-full
          ${isExpanded
            ? "md:max-w-[420px] lg:max-w-[520px]"
            : "md:max-w-[300px] lg:max-w-[380px]"
          }
        `}
      >
        <input
          type="text"
          placeholder={t("common.searchPlaceholder")}
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            if (!query) setIsFocused(false);
          }}
          className="flex-1 bg-transparent outline-none text-[13px] sm:text-[14px] text-black"
        />
        <button
          type="button"
          className="w-[30px] h-[30px] sm:w-[32px] sm:h-[32px] bg-black rounded-full flex items-center justify-center flex-shrink-0"
        >
          <Search size={12} className="text-white sm:w-4 sm:h-4" />
        </button>
      </div>
    </div>
  );
}
