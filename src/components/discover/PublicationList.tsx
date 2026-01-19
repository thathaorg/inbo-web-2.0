"use client";
import { useState, useEffect } from "react";
import PublicationItem from "@/components/discover/PublicationItem";
import PublicationModal from "@/components/discover/PublicationModal";
import { ChevronDown } from "lucide-react";
import discoverService, { type Newsletter } from "@/services/discover";

interface PublicationData {
  rank: number;
  logo: string;
  name: string;
  desc: string;
  id?: string;
  frequency?: string;
  url?: string; // Newsletter website URL
}

export default function PublicationList({ title }: { title: string }) {
  const [list, setList] = useState<PublicationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(3);
  const [isDesktop, setIsDesktop] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPublication, setSelectedPublication] = useState<any>(null);

  // Fetch popular newsletters
  useEffect(() => {
    const fetchPopular = async () => {
      try {
        setLoading(true);
        const newsletters = await discoverService.getPopularNewsletters(11);
        const transformed = newsletters.map((n, index) => ({
          rank: index + 1,
          logo: "/logos/forbes-sample.png", // Default logo
          name: n.name,
          desc: n.description || "Discover curated content delivered to your inbox.",
          id: n.id,
          frequency: n.contentFrequency || "Weekly",
          url: n.url, // Include website URL
        }));
        setList(transformed);
      } catch (error) {
        console.error("Failed to fetch popular publications:", error);
        // Fallback data
        setList([
          { rank: 1, logo: "/logos/forbes-sample.png", name: "Unable to load", desc: "Please try again later." },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPopular();
  }, []);

  const openModal = async (pub: PublicationData) => {
    // Fetch full details if we have an ID
    if (pub.id) {
      try {
        const details = await discoverService.getNewsletterDetails(pub.id);
        setSelectedPublication({
          ...pub,
          description: details.description,
          frequency: details.contentFrequency || "Weekly",
          categories: details.categories,
          author: details.author,
          url: details.url || pub.url, // Include website URL
        });
      } catch {
        setSelectedPublication(pub);
      }
    } else {
      setSelectedPublication(pub);
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedPublication(null);
  };

  useEffect(() => {
    const updateLayout = () => {
      const desktop = window.innerWidth >= 768;
      setIsDesktop(desktop);

      setVisibleCount(prev => {
        if (prev === 3 || prev === 6) {
          return desktop ? 6 : 3;
        }
        return prev;
      });
    };

    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, []);

  const handleViewMore = () => {
    if (visibleCount < 10) {
      setVisibleCount(10);
    } else {
      setVisibleCount(list.length);
    }
  };

  const visibleItems = list.slice(0, visibleCount);
  const hasMore = visibleCount < list.length;

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <h3 className="text-[24px] ml-2 font-semibold leading-[28px] text-[#0F0F0F]">
          {title}
        </h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-[24px] ml-2 font-semibold leading-[28px] text-[#0F0F0F]">
        {title}
      </h3>

      {/* Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {visibleItems.map((item) => (
          <PublicationItem
            key={item.rank}
            {...item}
            onClick={() => openModal(item)}
          />
        ))}
      </div>

      {/* View More (Desktop) / Show More (Mobile) */}
      {hasMore && (
        isDesktop ? (
          // ------- DESKTOP BUTTON -------
          <button
            onClick={handleViewMore}
            className="self-center px-5 py-2 text-sm bg-white border border-[#E5E7EB] rounded-full hover:bg-gray-100 transition"
          >
            View more
          </button>
        ) : (
          // ------- MOBILE BUTTON -------
          <button
            onClick={() => setVisibleCount(prev => prev + 3)}
            className="w-full flex items-center justify-center py-3 mt-2 text-[#D95A33] font-medium text-[15px]"
          >
            Show more <span className="ml-1"><ChevronDown /></span>
          </button>
        )
      )}

      {/* Modal */}
      <PublicationModal
        isOpen={modalOpen}
        onClose={closeModal}
        publication={selectedPublication}
      />
    </div>
  );
}
