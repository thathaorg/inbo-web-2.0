"use client";

import { useRouter } from "next/navigation";

export default function EmptyList() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center text-center mt-16 mb-6 w-full max-w-full">
      <h3 className="text-[22px] text-[#0C1014] font-semibold mb-2">
        Your inbox is all caught up 🎉
      </h3>

      <p className="text-[18px] text-[#6F7680] mb-8">
        Discover something new to read
      </p>

      <button
        onClick={() => router.push("/discover")}
        className="px-8 py-4 bg-[#C46A54] text-white rounded-full font-semibold text-[16px] hover:opacity-90 transition"
      >
        Explore Newsletter
      </button>
    </div>
  );
}
