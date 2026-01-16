"use client";

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
import emailService from "@/services/email";
import { useRouter } from "next/navigation";

interface MobileReadingMenuProps {
  onClose: () => void;
  emailId: string;
  title?: string;
  isReadLater?: boolean;
  isFavorite?: boolean;
  isRead?: boolean;
  onReadLaterChange?: (value: boolean) => void;
  onFavoriteChange?: (value: boolean) => void;
  onReadChange?: (value: boolean) => void;
  onOpenAppearance?: () => void;
}

export default function MobileReadingMenu({
  onClose,
  emailId,
  title,
  isReadLater,
  isFavorite,
  isRead,
  onReadLaterChange,
  onFavoriteChange,
  onReadChange,
  onOpenAppearance,
}: MobileReadingMenuProps) {
  const router = useRouter();

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/reading/${emailId}`;
    const shareData = {
      title: title || 'Check out this article',
      text: title || 'Check out this article on Inbo',
      url: shareUrl,
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
      }
      onClose();
    } catch (err) {
      // User cancelled or error
      if ((err as Error).name !== 'AbortError') {
        console.error('Failed to share:', err);
        // Fallback: copy to clipboard
        try {
          await navigator.clipboard.writeText(shareUrl);
          alert('Link copied to clipboard!');
          onClose();
        } catch {
          alert('Failed to share');
        }
      }
    }
  };

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
    const nextStatus = !isReadLater;
    try {
      await emailService.toggleReadLater(emailId, nextStatus);
      onReadLaterChange?.(nextStatus);
      onClose();
    } catch (err) {
      console.error("Failed to toggle read later", err);
    }
  };

  const handleToggleFavorite = async () => {
    const nextStatus = !isFavorite;
    try {
      await emailService.toggleFavorite(emailId, nextStatus);
      onFavoriteChange?.(nextStatus);
      onClose();
    } catch (err) {
      console.error("Failed to toggle favorite", err);
    }
  };

  const handleToggleRead = async () => {
    const nextStatus = !isRead;
    try {
      await emailService.toggleReadStatus(emailId, nextStatus);
      onReadChange?.(nextStatus);
      onClose();
    } catch (err) {
      console.error("Failed to toggle read status", err);
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
            onClick={() => {
              onClose();
              onOpenAppearance?.();
            }}
          />
          <SheetAction icon={<ArrowRight size={20} />} label="Open" />
          <SheetAction 
            icon={<Share2 size={20} />} 
            label="Share" 
            onClick={handleShare}
          />
        </div>

        {/* List */}
        <div className="bg-white rounded-2xl overflow-hidden">
          <ListItem
            label={isRead ? "Mark Unread" : "Mark Read"}
            icon={<Check className={isRead ? "text-green-500" : "text-gray-400"} />}
            onClick={handleToggleRead}
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
