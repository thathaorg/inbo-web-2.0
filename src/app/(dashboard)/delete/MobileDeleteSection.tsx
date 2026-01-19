"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import InboxCardMobile from "@/components/inbox/InboxCard";
import SortButton, { SortValue } from "@/components/SortButton";
import emailService, { EmailListItem } from "@/services/email";
import {
  ArrowLeft,
  Search,
  HelpCircle,
  Trash2,
  RotateCcw,
} from "lucide-react";

/* ---------------- HELPERS ---------------- */
function transformEmailToCard(email: EmailListItem) {
  const dateReceived = email.dateReceived ? new Date(email.dateReceived) : new Date();
  const day = dateReceived.getDate();
  const month = dateReceived.toLocaleDateString("en-US", { month: "short" });
  const daySuffix = day === 1 || day === 21 || day === 31 ? 'st' :
    day === 2 || day === 22 ? 'nd' :
      day === 3 || day === 23 ? 'rd' : 'th';
  const dateStr = `${month} ${day}${daySuffix}`;

  return {
    id: email.id,
    badgeText: email.newsletterName || "Newsletter",
    badgeColor: "#E0F2FE",
    badgeTextColor: "#0369A1",
    author: email.newsletterName || email.sender || "Unknown",
    title: email.subject || "No Subject",
    description: email.contentPreview || "No preview available",
    date: `Deleted on ${dateStr}`,
    time: "2m",
    tag: "Email",
    thumbnail: email.newsletterLogo || null,
    slug: email.id,
    read: email.isRead,
    emailId: email.id,
  };
}

export default function MobileDeleteSection() {
  const [sortBy, setSortBy] = useState<SortValue>("recent");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showInfoSheet, setShowInfoSheet] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newsletters, setNewsletters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isSelectionMode = selectedIds.length > 0;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedIds(newsletters.map((n) => n.id));
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  // Fetch trash emails
  useEffect(() => {
    async function fetchTrash() {
      try {
        setLoading(true);
        const filter = sortBy === "oldest" ? "oldest" : "latest";
        const data = await emailService.getTrashEmails(filter);
        setNewsletters(data.map(transformEmailToCard));
      } catch (err) {
        console.error("Failed to fetch trash:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTrash();
  }, [sortBy]);

  // Restore selected emails
  const handleRestore = useCallback(async () => {
    if (selectedIds.length === 0) return;
    
    setIsRestoring(true);
    try {
      await Promise.all(selectedIds.map(id => emailService.restoreFromTrash(id)));
      setNewsletters(prev => prev.filter(n => !selectedIds.includes(n.id)));
      toast.success(`${selectedIds.length} email${selectedIds.length > 1 ? 's' : ''} restored!`);
      clearSelection();
    } catch (err) {
      console.error("Failed to restore emails:", err);
      toast.error("Failed to restore. Please try again.");
    } finally {
      setIsRestoring(false);
    }
  }, [selectedIds]);

  // Permanently delete selected emails
  const handleConfirmDelete = useCallback(async () => {
    if (selectedIds.length === 0) return;
    
    setIsDeleting(true);
    try {
      await Promise.all(selectedIds.map(id => emailService.deleteEmail(id)));
      setNewsletters(prev => prev.filter(n => !selectedIds.includes(n.id)));
      toast.success(`${selectedIds.length} email${selectedIds.length > 1 ? 's' : ''} deleted!`);
      clearSelection();
      setShowDeleteModal(false);
    } catch (err) {
      console.error("Failed to delete emails:", err);
      toast.error("Failed to delete. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }, [selectedIds]);

  /* ---------------- SORT LOGIC ---------------- */
  const sortedNewsletters = useMemo(() => {
    return newsletters; // Already sorted from API
  }, [newsletters]);

  return (
    <div className="w-full min-h-screen bg-[#F5F6FA]">
      {/* ================= HEADER ================= */}
      <div className="h-[56px] px-4 flex items-center justify-between bg-[#F5F6FA]">
        {isSelectionMode ? (
          <>
            <button
              onClick={selectAll}
              className="text-[#C25C3A] font-medium"
            >
              Select All
            </button>

            <span className="font-semibold">
              {selectedIds.length} selected
            </span>

            <button
              onClick={clearSelection}
              className="text-[#C25C3A] font-medium"
            >
              Done
            </button>
          </>
        ) : (
          <>
            <Link href="/profile" aria-label="Go back to profile">
              <ArrowLeft size={22} className="mr-3" />
            </Link>

            <span className="text-lg font-semibold">Trash</span>

            <div className="flex items-center gap-4">
              <Search size={20} />
              <button onClick={() => setShowInfoSheet(true)}>
                <HelpCircle size={20} />
              </button>
            </div>
          </>
        )}
      </div>

      {/* ================= PRIMARY SURFACE ================= */}
      <div
        className="
          mt-2
          bg-white
          min-h-[92vh]
          rounded-2xl
          border border-black/10
          shadow-[0_1px_3px_rgba(0,0,0,0.08)]
          overflow-hidden
        "
      >
        {/* ================= ACTION BUTTONS ================= */}
        {isSelectionMode && (
          <div className="px-4 py-3 border-b border-[#E5E7EB] bg-white">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowDeleteModal(true)}
                disabled={isDeleting}
                className="
                  h-[44px]
                  px-5
                  rounded-full
                  border border-[#EF4444]
                  bg-[#FEF2F2]
                  text-[#DC2626]
                  font-semibold
                  text-[15px]
                  flex items-center gap-2
                  active:scale-[0.97]
                  disabled:opacity-50
                "
              >
                Delete ({selectedIds.length})
                <Trash2 size={18} />
              </button>

              <button
                onClick={handleRestore}
                disabled={isRestoring}
                className="
                  h-[44px]
                  px-6
                  rounded-full
                  bg-[#F1F2F4]
                  text-[#111827]
                  font-semibold
                  text-[15px]
                  active:scale-[0.97]
                  disabled:opacity-50
                  flex items-center gap-2
                "
              >
                {isRestoring ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent"></div>
                    Restoring...
                  </>
                ) : (
                  <>
                    <RotateCcw size={16} />
                    Restore
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ================= SORT (YOUR COMPONENT) ================= */}
        {!isSelectionMode && (
          <div className="px-4 py-3">
            <SortButton value={sortBy} onChange={setSortBy} />
          </div>
        )}

        {/* ================= LIST ================= */}
        <div>
          {sortedNewsletters.map((item) => (
            <div
              key={item.id}
              className={selectedIds.includes(item.id) ? "bg-[#F1F7FF]" : ""}
            >
              <InboxCardMobile
                {...item}
                showCheckbox
                checked={selectedIds.includes(item.id)}
                onCheckChange={() => toggleSelect(item.id)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ================= INFO SHEET ================= */}
      {showInfoSheet && (
        <BottomSheet onClose={() => setShowInfoSheet(false)}>
          <div className="flex items-center gap-2">
            <HelpCircle size={32} />
            <p className="text-base text-left font-xl font-semibold">
              Newsletters are automatically deleted after 30 days.
            </p>
          </div>
        </BottomSheet>
      )}

      {/* ================= DELETE MODAL ================= */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div
            className="
              w-[92%]
              max-w-[380px]
              rounded-[28px]
              bg-[#F7F7F8]
              px-6 pt-6 pb-5
              shadow-[0_20px_60px_rgba(0,0,0,0.25)]
            "
          >
            <h3 className="text-[18px] font-semibold text-[#0C0D0E] mb-2">
              Delete {selectedIds.length} item{selectedIds.length > 1 ? 's' : ''}?
            </h3>

            <p className="text-[15px] text-[#6B7280] leading-[22px] mb-6">
              {selectedIds.length > 1 
                ? "These newsletters will be deleted immediately. You can't undo this action."
                : "This newsletter will be deleted immediately. You can't undo this action."
              }
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="
                  flex-1
                  h-[44px]
                  rounded-full
                  bg-[#E5E7EB]
                  text-[#111827]
                  text-[16px]
                  font-semibold
                  disabled:opacity-50
                "
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="
                  flex-1
                  h-[44px]
                  rounded-full
                  bg-[#E5E7EB]
                  text-[#EF4444]
                  text-[16px]
                  font-semibold
                  disabled:opacity-50
                  flex items-center justify-center gap-2
                "
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-400 border-t-transparent"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- BOTTOM SHEET ---------------- */
function BottomSheet({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose}>
      <div
        className="
          absolute bottom-0 left-0 right-0
          bg-white rounded-t-2xl
          p-6 min-h-[30vh]
        "
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-6" />
        {children}
      </div>
    </div>
  );
}
