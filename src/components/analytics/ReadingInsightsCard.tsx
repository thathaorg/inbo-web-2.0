export default function ReadingInsightsCard() {
  return (
    <div className="relative w-full h-[180px] rounded-2xl overflow-hidden">
      {/* Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-pink-500 to-indigo-400" />

      {/* Bottom stats bar */}
      <div className="absolute bottom-4 left-4 right-4 bg-black/35 backdrop-blur-md rounded-xl px-5 py-3 flex items-center justify-between">
        <p className="text-white text-sm font-medium">
          35 newsletter read &nbsp;•&nbsp; 21 Favourite mark &nbsp;•&nbsp; 35 Highlights made
        </p>

        <button className="bg-white text-sm font-medium px-4 py-1.5 rounded-full text-black shrink-0">
          Share with Friends
        </button>
      </div>
    </div>
  );
}
