"use client";

export default function InboxSkeleton() {
  const rows = Array.from({ length: 4 });

  return (
    <div className="w-full animate-pulse px-4 md:px-6 py-6">
      {/* Header */}
      <div className="hidden md:flex items-center justify-between bg-white border border-[#E5E7E8] rounded-[18px] px-5 py-4 shadow-sm mb-6">
        <div className="flex items-center gap-3">
          <div className="h-7 w-28 bg-gray-200 rounded-full" />
          <div className="h-6 w-6 bg-gray-200 rounded-full" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-24 bg-gray-200 rounded-full" />
          <div className="h-9 w-24 bg-gray-200 rounded-full" />
          <div className="h-9 w-24 bg-gray-200 rounded-full" />
        </div>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-4">
        {rows.map((_, idx) => (
          <div
            key={idx}
            className="bg-white border border-[#E5E7E8] rounded-[18px] shadow-sm p-4 md:p-5"
          >
            <div className="flex items-start gap-3 md:gap-4">
              <div className="h-12 w-12 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-gray-200 rounded" />
                <div className="h-5 w-11/12 bg-gray-200 rounded" />
                <div className="h-4 w-10/12 bg-gray-200 rounded" />
                <div className="flex items-center gap-3 pt-1">
                  <div className="h-4 w-16 bg-gray-200 rounded-full" />
                  <div className="h-4 w-12 bg-gray-200 rounded-full" />
                  <div className="h-4 w-14 bg-gray-200 rounded-full" />
                </div>
              </div>
              <div className="hidden md:block h-16 w-24 bg-gray-200 rounded-xl" />
            </div>
          </div>
        ))}
      </div>

      {/* Mobile tab skeleton */}
      <div className="md:hidden mt-6 flex gap-3">
        <div className="flex-1 h-10 bg-gray-200 rounded-full" />
        <div className="flex-1 h-10 bg-gray-200 rounded-full" />
        <div className="flex-1 h-10 bg-gray-200 rounded-full" />
      </div>
    </div>
  );
}
