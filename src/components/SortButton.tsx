"use client";

import { useState, useEffect } from "react";
import { ArrowUpDown } from "lucide-react";

/* ------------------ TYPES & CONSTANTS ------------------ */

export type SortValue = "recent" | "oldest";

export const SORT_LABELS: Record<SortValue, string> = {
  recent: "Recently Added",
  oldest: "Oldest First",
};

/* ------------------ COMPONENT ------------------ */

type SortButtonProps = {
  value: SortValue;
  onChange: (value: SortValue) => void;
};

export default function SortButton({
  value,
  onChange,
}: SortButtonProps) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div className="relative">
      {/* BUTTON */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm font-medium hover:bg-gray-200 transition"
      >
        <ArrowUpDown className="w-4 h-4" />
        Sort
      </button>

      {/* MOBILE BOTTOM SHEET */}
      {open && isMobile && (
        <div className="fixed inset-0 z-50 sm:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          {/* Sheet */}
          <div className="absolute bottom-0 w-full rounded-t-2xl bg-white p-6">
            <div className="mx-auto mb-6 h-1.5 w-10 rounded-full bg-gray-300" />
            {(Object.keys(SORT_LABELS) as SortValue[]).map((key) => (
              <button
                key={key}
                onClick={() => {
                  onChange(key);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between py-4 text-lg"
              >
                <span>{SORT_LABELS[key]}</span>
                <span
                  className={`h-6 w-6 rounded-full border flex items-center justify-center
                    ${value === key ? "border-[#C95C3A]" : "border-gray-300"}
                  `}
                >
                  {value === key && (
                    <span className="h-3.5 w-3.5 rounded-full bg-[#C95C3A]" />
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* DESKTOP POPOVER */}
      {open && !isMobile && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          {/* Popover (FIXED, NOT CLIPPED) */}
          <div className="fixed z-50 top-[90px] right-6 w-56 rounded-xl border bg-white p-4 shadow-lg">
            {(Object.keys(SORT_LABELS) as SortValue[]).map((key) => (
              <button
                key={key}
                onClick={() => {
                  onChange(key);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between py-2 text-sm"
              >
                <span>{SORT_LABELS[key]}</span>
                <span
                  className={`h-4 w-4 rounded-full border flex items-center justify-center
                    ${value === key ? "border-[#C95C3A]" : "border-gray-300"}
                  `}
                >
                  {value === key && (
                    <span className="h-2.5 w-2.5 rounded-full bg-[#C95C3A]" />
                  )}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
