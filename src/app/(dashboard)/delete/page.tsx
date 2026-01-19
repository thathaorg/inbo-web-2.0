"use client";

import { useState, useCallback } from "react";
import NewsletterCard from "@/components/inbox/InboxCard"; // ✅ adjust path if needed
import MobileDeleteSection from "./MobileDeleteSection";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import emailService, { EmailListItem } from "@/services/email";
import { useEffect } from "react";
type SortType = "latest" | "oldest";


/* -------------------------------------------------
   HELPERS
-------------------------------------------------- */
function transformEmailToCard(email: EmailListItem) {
  const dateReceived = email.dateReceived ? new Date(email.dateReceived) : new Date();

  // Format date like "Oct 3rd"
  const day = dateReceived.getDate();
  const month = dateReceived.toLocaleDateString("en-US", { month: "short" });
  const daySuffix = day === 1 || day === 21 || day === 31 ? 'st' :
    day === 2 || day === 22 ? 'nd' :
      day === 3 || day === 23 ? 'rd' : 'th';
  const dateStr = `${month} ${day}${daySuffix}`;

  return {
    badgeText: email.newsletterName || "Newsletter",
    badgeColor: "#E0F2FE",
    badgeTextColor: "#0369A1",
    author: email.newsletterName || email.sender || "Unknown",
    title: email.subject || "No Subject",
    description: email.contentPreview || "No preview available",
    date: `Deleted on ${dateStr}`,
    time: "2 mins",
    tag: "Email",
    thumbnail: email.newsletterLogo || null,
    read: email.isRead,
    slug: email.id,
    emailId: email.id,
    isReadLater: email.isReadLater,
  };
}

export default function DeletePage() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [sortBy, setSortBy] = useState<SortType>("latest");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [newsletters, setNewsletters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isSelected = selectedIds.length > 0;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Restore selected emails back to inbox
  const handleRestore = useCallback(async () => {
    if (selectedIds.length === 0) return;
    
    setIsRestoring(true);
    try {
      // Restore all selected emails in parallel
      await Promise.all(selectedIds.map(id => emailService.restoreFromTrash(id)));
      
      // Remove restored emails from list
      setNewsletters(prev => prev.filter(n => !selectedIds.includes(n.emailId)));
      setSelectedIds([]);
      showToastMessage(`${selectedIds.length} email${selectedIds.length > 1 ? 's' : ''} restored to inbox!`);
    } catch (err) {
      console.error("Failed to restore emails:", err);
      showToastMessage("Failed to restore emails. Please try again.");
    } finally {
      setIsRestoring(false);
    }
  }, [selectedIds]);

  // Permanently delete selected emails
  const handleConfirmDelete = useCallback(async () => {
    if (selectedIds.length === 0) return;
    
    setIsDeleting(true);
    try {
      // Delete all selected emails in parallel
      await Promise.all(selectedIds.map(id => emailService.deleteEmail(id)));
      
      // Remove deleted emails from list
      setNewsletters(prev => prev.filter(n => !selectedIds.includes(n.emailId)));
      setSelectedIds([]);
      setShowDeleteModal(false);
      showToastMessage(`${selectedIds.length} email${selectedIds.length > 1 ? 's' : ''} permanently deleted!`);
    } catch (err) {
      console.error("Failed to delete emails:", err);
      showToastMessage("Failed to delete emails. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }, [selectedIds]);

  useEffect(() => {
    async function fetchTrash() {
      try {
        setLoading(true);
        const data = await emailService.getTrashEmails(sortBy);
        setNewsletters(data.map(transformEmailToCard));
      } catch (err) {
        console.error("Failed to fetch trash:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTrash();
  }, [sortBy]);

  if (isMobile) {
    return <MobileDeleteSection />
  }

  return (
    <div className="flex flex-col w-full relative">
      {/* ================= HEADER ================= */}
      <div className="w-full h-[78px] bg-white border border-[#E5E7EB] flex items-center justify-between px-6 shadow-sm">
        {/* LEFT */}
        <h2 className="text-[26px] font-bold text-[#0C1014]">
          Delete
        </h2>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          {isSelected && (
            <>
              {/* Restore */}
              <button
                onClick={handleRestore}
                disabled={isRestoring}
                className="
                  h-10 px-5 rounded-xl
                  border border-[#E5E7EB]
                  bg-white
                  text-sm font-medium text-[#111827]
                  hover:bg-gray-100
                  disabled:opacity-50 disabled:cursor-not-allowed
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
                    <span>♻️</span>
                    Restore ({selectedIds.length})
                  </>
                )}
              </button>

              {/* Delete Permanently */}
              <button
                onClick={() => setShowDeleteModal(true)}
                disabled={isDeleting}
                className="
                  h-10 px-5 rounded-xl
                  border border-red-500
                  bg-red-50
                  text-sm font-medium text-red-600
                  hover:bg-red-100
                  disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center gap-2
                "
              >
                Delete Permanently ({selectedIds.length})
                <span className="text-base">🗑️</span>
              </button>
            </>
          )}

          {/* SORT DROPDOWN (styled pill) */}
          <div className="relative">
            {/* Visible pill */}
            <div
              className="
                h-10 px-4 rounded-xl
                border border-[#E5E7EB]
                bg-gray-50
                text-sm font-medium text-[#111827]
                flex items-center gap-2
                cursor-pointer
                hover:bg-gray-100
              "
            >
              <span className="text-[#6B7280]">Sort by:</span>
              <span className="capitalize">{sortBy}</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="text-[#6B7280]"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.94a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            {/* Invisible native select for logic */}
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as SortType)
              }
              className="absolute inset-0 opacity-0 cursor-pointer"
            >
              <option value="latest">Latest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>
      </div>


      {/* ================= CONTENT ================= */}
      <div className="flex flex-col gap-4 px-6 py-6">
        <p className="text-sm text-[#6B7280]">
          Newsletters are automatically deleted after 30 days.
        </p>

        {/* ================= NEWSLETTER LIST ================= */}
        <div className="flex flex-col gap-3">
          {newsletters.map((item, idx) => (
            <div
              key={item.id || idx}
              className={
                selectedIds.includes(item.id)
                  ? "ring-2 ring-black rounded-2xl"
                  : ""
              }
            >
              <NewsletterCard
                {...item}
                showCheckbox
                checked={selectedIds.includes(item.id)}
                onCheckChange={() => toggleSelect(item.id)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ================= DELETE MODAL ================= */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[420px] rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-[#0C1014] mb-2">
              Delete {selectedIds.length} Newsletter{selectedIds.length > 1 ? 's' : ''} – Are you sure?
            </h3>

            <p className="text-sm text-[#6B7280] mb-6">
              Are you sure you want to permanently delete {selectedIds.length > 1 ? 'these items' : 'this item'}?
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="h-10 px-5 rounded-full border border-[#E5E7EB] bg-white text-sm font-medium hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="h-10 px-5 rounded-full bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Deleting...
                  </>
                ) : (
                  'Yes, Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= TOAST ================= */}
      {showToast && (
        <div className="fixed top-6 right-6 bg-white border border-[#E5E7EB] shadow-lg rounded-xl px-4 py-3 text-sm font-medium text-[#0C1014] flex items-center gap-2">
          <span className="text-green-500">✓</span>
          {toastMessage}
        </div>
      )}
    </div>
  );
}
