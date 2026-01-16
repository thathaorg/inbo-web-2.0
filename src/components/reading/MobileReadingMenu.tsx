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
  Bookmark,
} from "lucide-react";
import ReadModeSettings from "./ReadModeSettings";
import emailService from "@/services/email";
import { useRouter } from "next/navigation";

interface MobileReadingMenuProps {
  onClose: () => void;
  emailId: string;
  isReadLater?: boolean;
  isFavorite?: boolean;
  isRead?: boolean;
}

export default function MobileReadingMenu({
  onClose,
  emailId,
  isReadLater,
  isFavorite,
  isRead,
}: MobileReadingMenuProps) {
  const [showReadSettings, setShowReadSettings] = useState(false);
  const router = useRouter();

  const handleMoveToTrash = async () => {
    if (confirm("Are you sure you want to move this to trash?")) {
      try {
        await emailService.moveToTrash(emailId);
        router.push("/inbox");
      } catch (err) {
        console.error("Failed to move to trash", err);
      }
    }
  };

  const handleToggleReadLater = async () => {
    try {
      await emailService.toggleReadLater(emailId, !isReadLater);
      onClose();
    } catch (err) {
      console.error("Failed to toggle read later", err);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      await emailService.toggleFavorite(emailId, !isFavorite);
      onClose();
    } catch (err) {
      console.error("Failed to toggle favorite", err);
    }
  };

  const handleMarkRead = async () => {
    try {
      await emailService.markEmailAsRead(emailId);
      onClose();
    } catch (err) {
      console.error("Failed to mark read", err);
    }
  };

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
          <ListItem
            label={isRead ? "Mark Unread" : "Mark Read"}
            icon={<Check className={isRead ? "text-green-500" : "text-gray-400"} />}
            onClick={handleMarkRead}
          />
          <ListItem
            label={isReadLater ? "Remove Read Later" : "Read Later"}
            icon={<Bookmark className={isReadLater ? "text-blue-500 fill-current" : "text-gray-400"} />}
            onClick={handleToggleReadLater}
          />
          <ListItem
            label={isFavorite ? "Unfavorite" : "Favourite"}
            icon={<Star className={isFavorite ? "text-yellow-500 fill-current" : "text-gray-400"} />}
            onClick={handleToggleFavorite}
          />
          <ListItem label="Reply" icon={<Reply className="text-gray-400" />} />
          <ListItem label="Save offline" icon={<Download className="text-gray-400" />} />
          <ListItem label="Unsubscribe" icon={<MinusCircle className="text-gray-400" />} />
          <ListItem label="Support and feedback" icon={<Bot className="text-gray-400" />} />
        </div>

        {/* Danger */}
        <button
          onClick={handleMoveToTrash}
          className="w-full mt-4 py-3 rounded-2xl bg-red-100 text-red-600 font-medium active:bg-red-200 transition-colors"
        >
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
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between px-4 py-4 border-b last:border-b-0 ${onClick ? 'cursor-pointer active:bg-gray-50' : ''}`}
    >
      <span>{label}</span>
      {icon}
    </div>
  );
}
