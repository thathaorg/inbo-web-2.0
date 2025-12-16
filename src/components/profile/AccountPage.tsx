"use client";

import { ChevronLeft,ArrowLeft } from "lucide-react";
import { useState } from "react";
import DeactivatePage from "@/components/profile/DeactivatePage";

export default function AccountPage({ onBack }: { onBack: () => void }) {
  const [showDeactivate, setShowDeactivate] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  if (showDeactivate) {
    return <DeactivatePage onBack={() => setShowDeactivate(false)} />;
  }

  return (
    <div
      className="
        w-full h-full 
        rounded-2xl 
        flex flex-col items-center gap-6 p-6
      "
    >
      <div className="w-full flex flex-col items-start gap-3 px-6">
        {/* Back Button */}
        <button 
          className="flex items-center gap-2 text-black text-sm font-semibold capitalize"
          onClick={onBack}
        >
          <ArrowLeft size={18}/> back
        </button>

        {/* Main Card */}
        <div
          className="
            w-full 
            bg-white shadow-[0_4px_24px_rgba(219,219,219,0.25)]
            rounded-xl p-4 flex flex-col gap-6
          "
        >
          <h2 className="text-[#0C1014] text-xl font-semibold">Account</h2>

          <div className="flex flex-col gap-3 w-full">
            {/* Notification Row */}
            <div
              className="
                w-full p-3 bg-white 
                shadow-[0_4px_24px_rgba(219,219,219,0.25)]
                rounded-xl border border-[#EEEFF2]
                flex justify-between items-center
              "
            >
              <span className="text-[#0C1014] text-base font-normal">
                Notification
              </span>

              {/* Updated Toggle */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={notificationsEnabled}
                  onChange={() => setNotificationsEnabled(!notificationsEnabled)}
                />

                {/* Track */}
                <div
                  className="
                    w-11 h-6 rounded-full transition-all
                    bg-[#E3E3E3]
                    peer-checked:bg-[#C46A54]
                    peer-checked:shadow-[0_0_6px_rgba(196,106,84,0.6)]
                  "
                ></div>

                {/* Thumb */}
                <div
                  className="
                    absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-all
                    peer-checked:translate-x-5
                  "
                ></div>
              </label>
            </div>

            {/* Delete Row */}
            <div
              className="
                w-full p-3 
                bg-[#FDE9E9] 
                shadow-[0_4px_24px_rgba(219,219,219,0.25)]
                rounded-xl border border-[#CA1C1C]
                flex items-center gap-3
                cursor-pointer
              "
              onClick={() => setShowDeactivate(true)}
            >
              <span className="text-[#CA1C1C] text-base font-semibold">
                Delete account
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
