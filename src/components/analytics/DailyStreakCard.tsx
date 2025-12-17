export default function DailyStreakCard({
  onOpen,
}: {
  onOpen: () => void;
}) {
  return (
    <div
      onClick={onOpen}
      className="bg-white rounded-2xl p-5 shadow-sm cursor-pointer"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">Daily Streak</h3>
        <span className="text-sm text-orange-500 font-medium">
          See all
        </span>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">🔥</span>
        <span className="text-xl font-bold">
          3 days Streak
        </span>
      </div>

      <div className="flex gap-2">
        {["Sa", "Mo", "Tu", "Th", "Fr", "Su", "Mo"].map((day, i) => (
          <div
            key={day}
            className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium ${
              i < 4
                ? "bg-orange-400 text-white"
                : "border border-gray-300 text-gray-700"
            }`}
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  );
}
