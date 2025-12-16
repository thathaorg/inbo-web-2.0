"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export default function EditProfileModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [firstName, setFirstName] = useState("Sarah");
  const [lastName, setLastName] = useState("Mitchell");
  const [dob, setDob] = useState("2025-11-24");
  const [gender, setGender] = useState("Male");

  const [preferences, setPreferences] = useState([
    { emoji: "💻", label: "Tech", active: false },
    { emoji: "📰", label: "News", active: false },
    { emoji: "📊", label: "Business", active: false },
    { emoji: "✅", label: "Productivity", active: false },
    { emoji: "🚀", label: "Startups", active: false },
    { emoji: "🎬", label: "Entertainment", active: false },
    { emoji: "📈", label: "Finance", active: false },
    { emoji: "🌱", label: "Personal Growth", active: false },
    { emoji: "🎭", label: "Culture", active: false },
  ]);

  const togglePreference = (index: number) => {
    setPreferences((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, active: !item.active } : item
      )
    );
  };

  const hasSelected = preferences.some((p) => p.active);

  // LOCK SCROLL
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const modal = (
    <div
      className="
        fixed inset-0 
        bg-black/30
        flex justify-end 
        z-[999999]
      "
      onClick={onClose}
    >
      {/* RIGHT PANEL */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="
          w-[420px]
          max-h-[85vh]
          mt-[15vh]
          mr-5
          mb-5
          bg-white
          text-black
          p-6
          flex flex-col
          overflow-y-auto
          shadow-xl
          rounded-l-2xl
          animate-[slideRight_0.3s_ease-out_forwards]
          [scrollbar-width:none]
          [-ms-overflow-style:none]
          [&::-webkit-scrollbar]:hidden
        "
      >
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={onClose}>
            <X className="w-6 h-6 text-black" />
          </button>
          <h2 className="text-[18px] font-medium text-black">Edit Profile Details</h2>
        </div>

        {/* FORM */}
        <div className="flex flex-col gap-6">

          {/* PHOTO */}
          <div>
            <p className="text-sm mb-2 text-black">Photo</p>
            <div className="flex items-center gap-3">
              <div className="w-[62px] h-[62px] bg-[#FF85C0] rounded-full flex items-center justify-center text-[14px] font-bold text-white">
                AS
              </div>
              <button className="px-4 py-2 rounded-full border border-[#DBDFE4] text-sm hover:bg-gray-50">
                Change
              </button>
            </div>
          </div>

          {/* FIRST NAME */}
          <div>
            <p className="text-sm mb-1 text-black">First name</p>
            <input
              className="w-full p-3 border border-[#DBDFE4] rounded-lg text-sm"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>

          {/* LAST NAME */}
          <div>
            <p className="text-sm mb-1 text-black">Last name</p>
            <input
              className="w-full p-3 border border-[#DBDFE4] rounded-lg text-sm"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          {/* EMAIL */}
          <div>
            <p className="text-sm mb-1 text-black">Email</p>
            <input
              disabled
              className="w-full p-3 bg-[#E5E7EB] border border-[#D1D5DC] rounded-lg text-gray-600 text-sm"
              value="example@gmail.com"
            />
          </div>

          {/* DOB */}
          <div>
            <p className="text-sm mb-1 text-black">Date of Birth</p>
            <input
              type="date"
              className="w-full p-3 border border-[#E4E4E4] rounded-lg text-sm"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
          </div>

          {/* GENDER */}
          <div>
            <p className="text-sm mb-1 text-black">Gender</p>
            <select
              className="w-full p-3 border border-[#E4E4E4] rounded-lg text-sm"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>

          {/* PREFERENCES */}
          <div>
            <p className="text-lg font-medium mb-3 text-black">Preferences</p>

            <div className="flex flex-wrap gap-3">
              {preferences.map((item, i) => (
                <div
                  key={i}
                  onClick={() => togglePreference(i)}
                  className={[
                    "px-4 py-2 rounded-full flex items-center gap-2 text-sm cursor-pointer transition select-none",
                    item.active
                      ? "bg-[#F5E1DE] border border-[#C46A54] text-[#C46A54]"
                      : "bg-[#F3F4F6] border border-transparent text-black",
                  ].join(" ")}
                >
                  <span>{item.emoji}</span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* SAVE */}
          <button
            disabled={!hasSelected}
            className={[
              "mt-6 w-full py-3 text-sm font-semibold rounded-full transition",
              hasSelected
                ? "bg-[#C46A54] text-white"
                : "bg-[#F3F4F6] text-[#99A1AF] cursor-not-allowed",
            ].join(" ")}
          >
            Save
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );

  return createPortal(modal, document.body);
}
