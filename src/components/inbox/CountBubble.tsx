"use client";

export default function CountBubble({ count }: { count: number }) {
  const text = count > 9 ? "9+" : count.toString();

  return (
    <span
      className="inline-flex items-center justify-center px-1 h-[18px] rounded-full text-[12px] font-semibold text-white"
      style={{ backgroundColor: "#0C1014" }}
    >
      {text}
    </span>
  );
}
