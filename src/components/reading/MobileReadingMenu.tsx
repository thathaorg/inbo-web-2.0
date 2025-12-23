"use client";

import { useState } from "react";
import {
  Type,
  ArrowRight,
  Share2,
  Check,
  Star,
  Reply,
  Download,
  MinusCircle,
  Bot,
} from "lucide-react";
import ReadModeSettings from "./ReadModeSettings";

interface MobileReadingMenuProps {
  onClose: () => void;
}

export default function MobileReadingMenu({
  onClose,
}: MobileReadingMenuProps) {
  const [showReadSettings, setShowReadSettings] = useState(false);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div className="fixed bottom-0 inset-x-0 z-50 bg-[#F5F5F5] rounded-t-3xl px-4 pb-6 animate-in slide-in-from-bottom">
        {/* Handle */}
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto my-3" />

        {/* Top Actions */}
        <div className="flex bg-white rounded-2xl overflow-hidden mb-4">
          <SheetAction
            icon={<Type size={20} />}
            label="Appearance"
            onClick={() => setShowReadSettings(true)}
          />
          <SheetAction icon={<ArrowRight size={20} />} label="Open" />
          <SheetAction icon={<Share2 size={20} />} label="Share" />
        </div>

        {/* List */}
        <div className="bg-white rounded-2xl overflow-hidden">
          <ListItem label="Mark Read" icon={<Check />} />
          <ListItem label="Favourite" icon={<Star />} />
          <ListItem label="Reply" icon={<Reply />} />
          <ListItem label="Save offline" icon={<Download />} />
          <ListItem label="Unsubscribe" icon={<MinusCircle />} />
          <ListItem label="Support and feedback" icon={<Bot />} />
        </div>

        {/* Danger */}
        <button className="w-full mt-4 py-3 rounded-2xl bg-red-100 text-red-600 font-medium">
          Move to Trash
        </button>
      </div>

      <ReadModeSettings
        isOpen={showReadSettings}
        onClose={() => setShowReadSettings(false)}
      />
    </>
  );
}

/* ---------- Sub Components ---------- */

function SheetAction({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 py-4 flex flex-col items-center gap-1 border-r last:border-r-0"
    >
      {icon}
      <span className="text-xs">{label}</span>
    </button>
  );
}

function ListItem({
  label,
  icon,
}: {
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-4 border-b last:border-b-0">
      <span>{label}</span>
      {icon}
    </div>
  );
}
