"use client";
import { useState, useEffect } from "react";
import PublicationItem from "@/components/PublicationItem";
import PublicationModal from "@/components/PublicationModal";
import { ChevronDown } from "lucide-react";

export default function PublicationList({ title }: { title: string }) {
  const list = [
    { rank: 1, logo: "/logos/forbes-sample.png", name: "Forbes", desc: "Meta Connect 2025: What to expect and how to watch." },
    { rank: 2, logo: "/logos/forbes-sample.png", name: "Lenny’s Newsletter", desc: "A weekly advice column about product, growth, and acceleration." },
    { rank: 3, logo: "/logos/forbes-sample.png", name: "Forbes", desc: "Meta Connect 2025: What to expect and how to watch." },
    { rank: 4, logo: "/logos/forbes-sample.png", name: "Forbes", desc: "Meta Connect 2025: What to expect and how to watch." },
    { rank: 5, logo: "/logos/forbes-sample.png", name: "Lenny’s Newsletter", desc: "A weekly advice column about product, growth, and acceleration." },
    { rank: 6, logo: "/logos/forbes-sample.png", name: "Forbes", desc: "Meta Connect 2025: What to expect and how to watch." },
    { rank: 7, logo: "/logos/forbes-sample.png", name: "Forbes", desc: "Meta Connect 2025: What to expect and how to watch." },
    { rank: 8, logo: "/logos/forbes-sample.png", name: "Forbes", desc: "Meta Connect 2025: What to expect and how to watch." },
    { rank: 9, logo: "/logos/forbes-sample.png", name: "Lenny’s Newsletter", desc: "A weekly advice column about product, growth, and acceleration." },
    { rank: 10, logo: "/logos/forbes-sample.png", name: "Forbes", desc: "Meta Connect 2025: What to expect and how to watch." },
    { rank: 11, logo: "/logos/forbes-sample.png", name: "Forbes", desc: "Meta Connect 2025: What to expect and how to watch." }
  ];

  const [visibleCount, setVisibleCount] = useState(3);
  const [isDesktop, setIsDesktop] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPublication, setSelectedPublication] = useState<any>(null);

  const openModal = (pub: any) => {
    setSelectedPublication(pub);
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
