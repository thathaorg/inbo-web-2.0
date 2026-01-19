"use client";

import { Search } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";

export default function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();

  const [query, setQuery] = useState("");
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastPushedQueryRef = useRef<string>("");

  /* 1️⃣ Sync input from URL ONLY on /search (NO useSearchParams) */
  useEffect(() => {
    if (pathname === "/search") {
      const params = new URLSearchParams(window.location.search);
      setQuery(params.get("q") ?? "");
    }
  }, [pathname]);

  /* 2️⃣ Clear input when leaving /search */
  useEffect(() => {
    if (pathname !== "/search") {
      setQuery("");
      lastPushedQueryRef.current = "";
    }
  }, [pathname]);

  /* 3️⃣ Debounced navigation ONLY on typing */
  const handleChange = (value: string) => {
    setQuery(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      const trimmed = value.trim();
      if (!trimmed) return;

      // prevent duplicate pushes
      if (lastPushedQueryRef.current === trimmed) return;

      lastPushedQueryRef.current = trimmed;

      router.push(`/search?q=${encodeURIComponent(trimmed)}`, {
        scroll: false,
      });
    }, 300);
  };

  return (
    <div className="flex w-full md:w-auto md:flex-none">
      <div
        className="
          flex items-center bg-white
          w-full sm:w-full md:w-[300px] lg:w-[380px] h-[36px] sm:h-[38px] md:h-[40px]
          rounded-full border border-[#DBDFE4]
          shadow-[0_4px_12px_rgba(0,0,0,0.05)]
          pl-3 sm:pl-4 md:pl-5 pr-1 sm:pr-2
        "
      >
        <input
          type="text"
          placeholder="Search newsletter..."
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          className="flex-1 bg-transparent outline-none text-[13px] sm:text-[14px] text-black"
        />

        <button
          type="button"
          className="w-[30px] h-[30px] sm:w-[32px] sm:h-[32px] md:w-[34px] md:h-[34px] bg-black rounded-full flex items-center justify-center flex-shrink-0"
        >
          <Search size={14} className="text-white sm:w-4 sm:h-4" />
        </button>
      </div>
    </div>
  );
}
