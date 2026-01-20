"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import analyticsService from "@/services/analytics";

export default function FlameBadge({ streak: initialStreak }: { streak?: number }) {
  const [streak, setStreak] = useState(initialStreak ?? 0);
  const [loading, setLoading] = useState(initialStreak === undefined);

  useEffect(() => {
    // Only fetch if no initial streak was provided
    if (initialStreak !== undefined) return;

    const fetchStreak = async () => {
      try {
        const data = await analyticsService.getStreakCount();
        setStreak(data.streak_count);
      } catch (error) {
        console.error("Failed to fetch streak:", error);
        setStreak(0);
      } finally {
        setLoading(false);
      }
    };

    fetchStreak();
  }, [initialStreak]);

  return (
    <div className="relative flex items-center justify-center w-[31px] h-[31px]">
      {/* Flame Icon */}
      <Image
        src="/badges/flame-badge.png"
        alt="Flame Badge"
        width={31}
        height={31}
        className="pointer-events-none select-none z-0"
        style={{ width: 31, height: 31 }}
      />
      {/* Centered streak number inside the flame */}
      <span
        className="absolute z-10 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-black font-semibold text-[14px] leading-none"
        style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', textShadow: '0 1px 2px #fff, 0 0 2px #fff' }}
      >
        {loading ? "—" : streak}
      </span>
    </div>
  );
}
