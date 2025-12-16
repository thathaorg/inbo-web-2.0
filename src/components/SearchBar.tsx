"use client";

import { Search } from "lucide-react";

export default function SearchBar() {
  return (
    <div className="flex w-full md:w-auto md:flex-none">
      <div
        className="
          flex items-center bg-white
          w-full md:w-[380px] h-[40px]
          rounded-full border border-[#DBDFE4]
          shadow-[0_4px_12px_rgba(0,0,0,0.05)]
          pl-5 pr-2
        "
      >
        <input
          type="text"
          placeholder="Search newsletter..."
          className="flex-1 bg-transparent outline-none text-[14px] text-black"
        />
        <button className="w-[34px] h-[34px] bg-black rounded-full flex items-center justify-center">
          <Search size={16} className="text-white" />
        </button>
      </div>
    </div>
  );
}
