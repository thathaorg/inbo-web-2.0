// ---------- Config ----------
const READING_INSIGHTS = {
  stats: [
    { id: "newsletter", label: "newsletter read", value: 35 },
    { id: "favourite", label: "Favourite mark", value: 21 },
    { id: "highlights", label: "Highlights made", value: 35 },
  ],
  ctaText: "Share with Friends",
  socials: [
    { id: "linkedin", src: "/icons/linkedin-icon.png", alt: "LinkedIn" },
    { id: "instagram", src: "/icons/instagram-icon.png", alt: "Instagram" },
    { id: "facebook", src: "/icons/facebook-icon.png", alt: "Facebook" },
    { id: "twitter", src: "/icons/twitter-icon.png", alt: "Twitter" },
  ],
};

// ---------- Component ----------
export default function ReadingInsightsCard() {
  const firstLineStats = READING_INSIGHTS.stats.slice(0, 2);
  const secondLineStats = READING_INSIGHTS.stats.slice(2);

  return (
    <div
      className="
        relative w-full
        h-[260px]
        md:h-[200px]
        rounded-2xl
        overflow-hidden
      "
    >
      {/* Gradient background */}
      <div
        className="
          absolute inset-0
          bg-[url('/background/insights-gradient.png')]
          bg-cover
          bg-center
          bg-no-repeat
        "
      />

      {/* Glass bar */}
      <div
        className="
          absolute bottom-0 left-0 right-0
          bg-white/20
          backdrop-blur-[8.3px]
          border border-white/10
          rounded-2xl

          px-4 py-3
          flex flex-col gap-3

          md:h-[56px]
          md:flex-row
          md:items-center
          md:px-6
          md:gap-6
        "
      >
        {/* ================= STATS ================= */}

        {/* Mobile (2 lines) */}
        <div className="md:hidden text-white text-md leading-snug space-y-1 text-center">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {firstLineStats.map((stat, i) => (
              <span key={stat.id} className="flex items-center gap-2">
                <span>
                  {stat.value} {stat.label}
                </span>
                {i < firstLineStats.length - 1 && (
                  <span className="opacity-70">•</span>
                )}
              </span>
            ))}
          </div>

          {secondLineStats.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              {secondLineStats.map((stat, i) => (
                <span key={stat.id} className="flex items-center gap-2">
                  <span>
                    {stat.value} {stat.label}
                  </span>
                  {i < secondLineStats.length - 1 && (
                    <span className="opacity-70">•</span>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>


        {/* Desktop (single line) */}
        <div className="hidden md:flex items-center gap-2 text-white text-sm truncate flex-1">
          {READING_INSIGHTS.stats.map((stat, i) => (
            <span key={stat.id} className="flex items-center gap-2">
              <span>
                {stat.value} {stat.label}
              </span>
              {i < READING_INSIGHTS.stats.length - 1 && (
                <span className="opacity-70">•</span>
              )}
            </span>
          ))}
        </div>

        {/* ================= ICONS + CTA ================= */}
        <div className="flex items-center justify-between gap-4 md:gap-6">
          {/* Social icons */}
          <div className="flex items-center gap-3 shrink-0">
            {READING_INSIGHTS.socials.map(({ id, src, alt }) => (
              <button
                key={id}
                className="
                  h-8 w-8
                  rounded-full
                  flex items-center justify-center
                  hover:scale-105
                  transition
                "
              >
                <img
                  src={src}
                  alt={alt}
                  className="h-6 w-6 object-contain"
                  draggable={false}
                />
              </button>
            ))}
          </div>

          {/* CTA */}
          <button
            className="
              h-9
              px-5
              rounded-xl
              md:rounded-full
              bg-[#0C1014]
              md:bg-[#C46A54]
              text-sm font-medium text-white
              hover:opacity-90
              transition
              shrink-0
            "
          >
            {READING_INSIGHTS.ctaText}
          </button>
        </div>
      </div>
    </div>
  );
}
