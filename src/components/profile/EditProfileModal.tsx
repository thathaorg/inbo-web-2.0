"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import type { UserProfileResponse } from "@/services/user";

type SavePayload = { name?: string; birthYear?: string; gender?: string };

type EditProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfileResponse | null;
  onSave: (data: SavePayload) => Promise<void>;
};

export default function EditProfileModal({
  isOpen,
  onClose,
  profile,
  onSave,
}: EditProfileModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("Male");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [preferences, setPreferences] = useState(
    () => [
      { emoji: "💻", label: "Tech", active: false },
      { emoji: "📰", label: "News", active: false },
      { emoji: "📊", label: "Business", active: false },
      { emoji: "✅", label: "Productivity", active: false },
      { emoji: "🚀", label: "Startups", active: false },
      { emoji: "🎬", label: "Entertainment", active: false },
      { emoji: "📈", label: "Finance", active: false },
      { emoji: "🌱", label: "Personal Growth", active: false },
      { emoji: "🎭", label: "Culture", active: false },
    ]
  );

  const initialName = profile?.name || "";
  const splitName = useMemo(() => {
    const parts = initialName.trim().split(" ");
    return {
      first: parts[0] || "",
      last: parts.slice(1).join(" ") || "",
    };
  }, [initialName]);

  useEffect(() => {
    setFirstName(splitName.first);
    setLastName(splitName.last);
    setGender(profile?.gender || "Male");
    setDob(profile?.birthYear ? `${profile.birthYear}-01-01` : "");
  }, [splitName, profile?.gender, profile?.birthYear]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const togglePreference = (index: number) => {
    setPreferences((prev) =>
      prev.map((item, i) => (i === index ? { ...item, active: !item.active } : item))
    );
  };

  const handleSave = async () => {
    setError(null);
    const name = `${firstName} ${lastName}`.trim();
    const birthYear = dob ? dob.slice(0, 4) : undefined;
    const payload: SavePayload = {
      name: name || undefined,
      birthYear,
      gender: gender || undefined,
    };

    try {
      setSaving(true);
      await onSave(payload);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-[999999] bg-black/30" onClick={onClose}>
        <div
          onClick={(e) => e.stopPropagation()}
          className="
            fixed bg-white text-black flex flex-col overflow-y-auto shadow-xl
            transition-transform duration-300 ease-out
            inset-0 w-full h-full rounded-none
            animate-[slideUp_0.3s_ease-out_forwards]
            md:inset-auto md:right-5 md:bottom-4
            md:w-[420px] md:max-h-[85vh]
            md:rounded-l-2xl
            md:animate-[slideRight_0.3s_ease-out_forwards]
            [scrollbar-width:none]
            [-ms-overflow-style:none]
            [&::-webkit-scrollbar]:hidden
          "
        >
          <div className="flex items-center gap-4 px-6 py-4 border-b md:border-none">
            <button onClick={onClose}>
              <X className="w-6 h-6 text-black" />
            </button>
            <h2 className="text-[18px] font-medium">Edit Profile Details</h2>
          </div>

          <div className="flex flex-col gap-6 p-6">
            <div>
              <p className="text-sm mb-2">Photo</p>
              <div className="flex items-center gap-3">
                <div className="w-[62px] h-[62px] bg-[#FF85C0] rounded-full flex items-center justify-center text-[14px] font-bold text-white">
                  {initialName ? initialName.slice(0, 2).toUpperCase() : ""}
                </div>
                <button className="px-4 py-2 rounded-full border border-[#DBDFE4] text-sm hover:bg-gray-50">
                  Change
                </button>
              </div>
            </div>

            <div>
              <p className="text-sm mb-1">First name</p>
              <input
                className="w-full p-3 border border-[#DBDFE4] rounded-lg text-sm"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>

            <div>
              <p className="text-sm mb-1">Last name</p>
              <input
                className="w-full p-3 border border-[#DBDFE4] rounded-lg text-sm"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            <div>
              <p className="text-sm mb-1">Email</p>
              <input
                disabled
                className="w-full p-3 bg-[#E5E7EB] border border-[#D1D5DC] rounded-lg text-gray-600 text-sm"
                value={profile?.email || ""}
              />
            </div>

            <div>
              <p className="text-sm mb-1">Date of Birth</p>
              <input
                type="date"
                className="w-full p-3 border border-[#E4E4E4] rounded-lg text-sm"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
            </div>

            <div>
              <p className="text-sm mb-1">Gender</p>
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

            <div>
              <p className="text-lg font-medium mb-3">Preferences</p>
              <div className="flex flex-wrap gap-3">
                {preferences.map((item, i) => (
                  <div
                    key={i}
                    onClick={() => togglePreference(i)}
                    className={[
                      "px-4 py-2 rounded-full flex items-center gap-2 text-sm cursor-pointer transition select-none",
                      item.active
                        ? "bg-[#F5E1DE] border border-[#C46A54] text-[#C46A54]"
                        : "bg-[#F3F4F6] border border-transparent",
                    ].join(" ")}
                  >
                    <span>{item.emoji}</span>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <button
              onClick={handleSave}
              disabled={saving}
              className="mt-6 w-full py-3 text-sm font-semibold rounded-full transition bg-[#C46A54] text-white disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </>,
    document.body
  );
}
