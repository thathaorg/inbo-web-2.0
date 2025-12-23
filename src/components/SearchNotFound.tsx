import Image from "next/image";

type EmptyStateProps = {
  title?: string;
  description?: string;
  imageSrc?: string;
};

export default function EmptyState({
  title = "Search not found",
  description = "Try adjusting your search or filter to find what you’re looking for.",
  imageSrc = "/icons/search-not-found.png",
}: EmptyStateProps) {
  return (
    <div className="inline-flex h-full w-full flex-col items-center justify-center gap-3 text-center">
      <Image
        src={imageSrc}
        alt="Empty state"
        width={100}
        height={100}
        priority
      />

      <h2 className="text-2xl font-semibold text-black">
        {title}
      </h2>

      <p className="w-[263px] text-base font-normal text-black">
        {description}
      </p>
    </div>
  );
}
