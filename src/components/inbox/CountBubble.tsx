"use client";

export default function CountBubble({ count }: { count: number }) {
  const text = count.toString();

  return (
    <span
      className="inline-flex items-center justify-center px-1.5 min-w-[18px] h-[18px] rounded-full text-[12px] font-semibold text-white"
      style={{ backgroundColor: "#0C1014" }}
    >
      {text}
    </span>
  );
}
