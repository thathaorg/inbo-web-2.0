"use client";

import { useState } from "react";
import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PublisherListItem from "@/components/discover/PublisherListItem";
import PublicationModal, {
  type Publication,
} from "@/components/discover/PublicationModal";

// -------------------
// TYPES
// -------------------
type PageProps = {
  params: Promise<{
    category: string;
  }>;
};

// -------------------
// PAGE
// -------------------
export default function CategoryPage({ params }: PageProps) {
  const { category } = use(params);

  const title = category
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const publishers: Record<string, Publication[]> = {
    technology: [
      {
        id: "benedicts",
        logo: "/logos/forbes-sample.png",
        name: "Benedict's",
        description:
          "Subscribers to the Free newsletter get the core news and analysis, delayed by two days...",
        frequency: "Weekly",
        rank: 1,
        desc: "Top technology publication",
      },
      {
        id: "mit-download",
        logo: "/logos/forbes-sample.png",
        name: "the download (mit technology review)",
        description:
          "The Download. Your daily dose of what's up in emerging technology, delivered to your inbox.",
        frequency: "Weekly",
        rank: 2,
        desc: "MIT Technology Review newsletter",
      },
      {
        id: "techcrunch",
        logo: "/logos/forbes-sample.png",
        name: "TechCrunch",
        description:
          "Daily and Weekly. TechCrunch Daily News. Every weekday and Sunday...",
        frequency: "Weekly & Daily",
        rank: 3,
        desc: "Startup and tech news",
      },
      {
        id: "box-of-amazing",
        logo: "/logos/forbes-sample.png",
        name: "Box of amazing",
        description:
          "A weekly digest covering knowledge & society, AI & emerging technology, trends and more...",
        frequency: "As published",
        rank: 4,
        desc: "Curated insights newsletter",
      },
    ],
  };

  const items = publishers[category] ?? [];

  // -------------------
  // MODAL STATE
  // -------------------
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPublication, setSelectedPublication] =
    useState<Publication | null>(null);

  const openModal = (pub: Publication) => {
    setSelectedPublication(pub);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedPublication(null);
  };

  return (
    <div className="w-full min-h-screen flex bg-white pb-16 flex-col">
      <div className="w-full bg-[#00A88B] text-white px-4 pt-5 pb-8">
        <Link href="/discover">
          <ArrowLeft height={32} width={40} strokeWidth={2} />
        </Link>

        <h1 className="text-[34px] font-semibold mt-6">{title}</h1>
      </div>

      <div className="-mt-4 bg-white w-full rounded-t-3xl">
        <div className="pt-3">
          {items.map((item, i) => (
            <div key={i}>
              <div className="px-4">
                <PublisherListItem
                  {...item}
                  onClick={() => openModal(item)}
                />
              </div>

              {i < items.length - 1 && (
                <div className="border-b bg-gray-500 mx-4" />
              )}
            </div>
          ))}
        </div>
      </div>

      <PublicationModal
        isOpen={modalOpen}
        onClose={closeModal}
        publication={selectedPublication}
      />
    </div>
  );
}
