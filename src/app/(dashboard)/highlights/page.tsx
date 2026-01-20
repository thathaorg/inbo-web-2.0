"use client";


import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { ArrowLeft, Search, Trash2, BookOpen, Highlighter } from "lucide-react";
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

  // Listen for custom search event from SearchBar
  useEffect(() => {
    const handler = (e: any) => setSearchQuery(e.detail || "");
    window.addEventListener("highlights-search", handler);
    return () => window.removeEventListener("highlights-search", handler);
  }, []);

  // Fetch all highlights
  useEffect(() => {
    async function fetchHighlights() {
      try {
        setLoading(true);
        const data = await emailService.getAllHighlights();
        // Sort by createdAt descending (latest first)
        const sortedData = (data || []).sort((a: Highlight, b: Highlight) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });
        setHighlights(sortedData);
      } catch (err) {
        console.error("Failed to fetch highlights:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchHighlights();
  }, []);

  // Local search and grouping
  const filteredHighlights = highlights.filter(h =>
    (h.text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.note?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.emailSubject?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const emailGroups = Object.values(
    filteredHighlights.reduce((acc, h) => {
      if (!acc[h.emailId]) {
        acc[h.emailId] = {
          emailId: h.emailId,
          emailSubject: h.emailSubject,
          highlights: [],
        };
      }
      acc[h.emailId].highlights.push(h);
      return acc;
    }, {} as Record<string, { emailId: string; emailSubject?: string; highlights: Highlight[] }>)
  );

  // Helper to highlight search terms in text
  function highlightText(text: string, query: string) {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")})`, "gi");
    return text.split(regex).map((part, i) =>
      regex.test(part)
        ? <mark key={i} style={{ background: '#ffe066', color: '#c46a54', fontWeight: 700 }}>{part}</mark>
        : part
    );
  }

  // Delete highlight
  async function handleDelete(emailId: string, highlightId: string) {
    setDeletingId(highlightId);
    try {
      await emailService.deleteHighlight(emailId, highlightId);
      setHighlights(prev => prev.filter(h => h.id !== highlightId));
    } catch (err) {
      alert("Failed to delete highlight");
    } finally {
      setDeletingId(null);
    }
  }

  // Empty state component
  function EmptyHighlights() {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Highlighter size={48} className="text-yellow-300 mb-4" />
        <p className="text-gray-400">No highlights found</p>
      </div>
    );
  }

  // Main render
  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <div className="sticky top-0 z-10 w-full h-[78px] bg-white border border-[#E5E7EB] flex items-center px-6 shadow-sm">
        <Highlighter size={24} className="text-yellow-500 mr-2" />
        <h2 className="text-[26px] font-bold text-[#0C1014]">Highlights</h2>
        <span className="ml-2 text-sm text-gray-500">({highlights.length} total)</span>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-6 px-6 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Search size={32} className="text-gray-300 mb-4 animate-spin" />
            <p className="text-gray-400">Loading highlights...</p>
          </div>
        ) : highlights.length === 0 ? (
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
                    <div
                      key={h.id}
                      className="relative rounded-xl bg-yellow-100 p-3 text-sm cursor-pointer group"
                      onClick={() => router.push(`/reading/${h.emailId}?highlight=${h.id}`)}
                    >
                      <div>{highlightText(h.text, searchQuery)}</div>
                      {h.note && <div className="mt-1 text-xs text-gray-500">{highlightText(h.note, searchQuery)}</div>}
                      <div className="mt-1 text-xs text-gray-400">{h.createdAt && new Date(h.createdAt).toLocaleDateString()}</div>
                      <button
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        onClick={e => { e.stopPropagation(); handleDelete(h.emailId, h.id); }}
                        disabled={deletingId === h.id}
                        aria-label="Delete highlight"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
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
