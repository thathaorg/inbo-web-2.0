"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { ArrowLeft, Search, Trash2, BookOpen, Highlighter, StickyNote } from "lucide-react";
import Link from "next/link";
import emailService from "@/services/email";

interface Highlight {
  id: string;
  text: string;
  note?: string;
  color?: string;
  emailId: string;
  emailSubject?: string;
  createdAt?: string;
}

export default function HighlightsPage() {
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch all highlights
  useEffect(() => {
    async function fetchHighlights() {
      try {
        setLoading(true);
        const data = await emailService.getAllHighlights();
        setHighlights(data || []);
      } catch (err) {
        console.error("Failed to fetch highlights:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchHighlights();
  }, []);

  // Delete a highlight
  const handleDelete = useCallback(async (emailId: string, highlightId: string) => {
    if (!confirm("Delete this highlight?")) return;
    
    setDeletingId(highlightId);
    try {
      await emailService.deleteHighlight(emailId, highlightId);
      setHighlights(prev => prev.filter(h => h.id !== highlightId));
    } catch (err) {
      console.error("Failed to delete highlight:", err);
      alert("Failed to delete highlight");
    } finally {
      setDeletingId(null);
    }
  }, []);

  // Filter highlights by search (defensive array check)
  const highlightsArray = Array.isArray(highlights) ? highlights : [];
  const filteredHighlights = highlightsArray.filter(h => 
    h.text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.note?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.emailSubject?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group highlights by email
  const groupedHighlights = filteredHighlights.reduce((acc, highlight) => {
    const key = highlight.emailId;
    if (!acc[key]) {
      acc[key] = {
        emailId: highlight.emailId,
        emailSubject: highlight.emailSubject || "Unknown Email",
        highlights: []
      };
    }
    acc[key].highlights.push(highlight);
    return acc;
  }, {} as Record<string, { emailId: string; emailSubject: string; highlights: Highlight[] }>);

  const emailGroups = Object.values(groupedHighlights);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-[#F5F6FA]">
        {/* Header */}
        <div className="h-[56px] px-4 flex items-center justify-between bg-[#F5F6FA] sticky top-0 z-10">
          <Link href="/profile" aria-label="Go back">
            <ArrowLeft size={22} />
          </Link>
          <span className="text-lg font-semibold">Highlights</span>
          <div className="w-6" /> {/* Spacer */}
        </div>

        {/* Search */}
        <div className="px-4 py-3">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search highlights..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
            />
          </div>
        </div>

        {/* Content */}
        <div className="bg-white min-h-[80vh] rounded-t-2xl border border-black/10 shadow-sm">
          {highlights.length === 0 ? (
            <EmptyHighlights />
          ) : filteredHighlights.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <Search size={48} className="text-gray-300 mb-4" />
              <p className="text-gray-500">No highlights match your search</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {emailGroups.map((group) => (
                <div key={group.emailId} className="p-4">
                  <Link 
                    href={`/reading/${group.emailId}`}
                    className="text-sm font-medium text-gray-600 mb-3 block hover:text-black"
                  >
                    📧 {group.emailSubject}
                  </Link>
                  <div className="space-y-3">
                    {group.highlights.map((h) => (
                      <HighlightCard
                        key={h.id}
                        highlight={h}
                        onDelete={() => handleDelete(h.emailId, h.id)}
                        isDeleting={deletingId === h.id}
                        onClick={() => router.push(`/reading/${h.emailId}`)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="min-h-screen w-full bg-[#F5F6FA]">
      {/* Sticky Header with Search Bar */}
      <div className="w-full sticky top-0 z-30 bg-white border-b border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between px-6 h-[78px]">
          <h2 className="text-[26px] font-bold text-[#0C1014]">Highlights</h2>
          <div className="relative w-80">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search highlights..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="min-h-[90%] w-full flex flex-col gap-8">
        {/* Content */}
        <div className="flex flex-col gap-6 px-6 py-6">
          {highlights.length === 0 ? (
            <EmptyHighlights />
          ) : filteredHighlights.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Search size={48} className="text-gray-300 mb-4" />
              <p className="text-gray-500">No highlights match your search</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {emailGroups.map((group, groupIndex) => (
                <div key={`${group.emailId}-${groupIndex}`} className="bg-white rounded-2xl border border-gray-200 p-6">
                  <Link 
                    href={`/reading/${group.emailId}`}
                    className="text-base font-semibold text-gray-800 mb-4 block hover:text-black flex items-center gap-2"
                  >
                    <BookOpen size={18} className="text-gray-400" />
                    {group.emailSubject}
                  </Link>
                  <div className="grid gap-3">
                    {group.highlights.map((h) => (
                      <HighlightCard
                        key={h.id}
                        highlight={h}
                        onDelete={() => handleDelete(h.emailId, h.id)}
                        isDeleting={deletingId === h.id}
                        onClick={() => router.push(`/reading/${h.emailId}`)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Highlight Card Component
function HighlightCard({ 
  highlight, 
  onDelete, 
  isDeleting,
  onClick 
}: { 
  highlight: Highlight; 
  onDelete: () => void; 
  isDeleting: boolean;
  onClick: () => void;
}) {
  const colorClass = {
    yellow: "bg-yellow-100 border-yellow-300",
    green: "bg-green-100 border-green-300",
    blue: "bg-blue-100 border-blue-300",
    pink: "bg-pink-100 border-pink-300",
  }[highlight.color || "yellow"] || "bg-yellow-100 border-yellow-300";

  return (
    <div 
      className={`p-4 rounded-xl border-l-4 ${colorClass} cursor-pointer hover:shadow-md transition-shadow group`}
      onClick={onClick}
    >
      <p className="text-[15px] text-gray-800 leading-relaxed mb-2">
        "{highlight.text}"
      </p>
      
      {highlight.note && (
        <div className="flex items-start gap-2 mt-2 pt-2 border-t border-gray-200">
          <StickyNote size={14} className="text-gray-400 mt-0.5 shrink-0" />
          <p className="text-sm text-gray-600 italic">{highlight.note}</p>
        </div>
      )}

      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-gray-400">
          {highlight.createdAt 
            ? new Date(highlight.createdAt).toLocaleDateString() 
            : ""}
        </span>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          disabled={isDeleting}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all disabled:opacity-50"
        >
          {isDeleting ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-400 border-t-transparent" />
          ) : (
            <Trash2 size={16} />
          )}
        </button>
      </div>
    </div>
  );
}

// Empty State Component
function EmptyHighlights() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center mb-6">
        <Highlighter size={36} className="text-yellow-500" />
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">No Highlights Yet</h3>
      <p className="text-gray-500 text-center max-w-md mb-6">
        Start highlighting important passages while reading newsletters. 
        Your highlights will appear here for easy reference.
      </p>
      <Link
        href="/inbox"
        className="px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition"
      >
        Start Reading
      </Link>
    </div>
  );
}
