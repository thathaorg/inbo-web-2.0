export default function AchievementsCard({
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
        <h3 className="font-semibold text-lg">Achievements</h3>
        <span className="text-sm text-orange-500 font-medium">
          See all
        </span>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-gray-100 rounded-xl p-3 flex flex-col items-center gap-2"
          >
            <div className="w-12 h-12 bg-gradient-to-tr from-green-400 to-blue-500 rounded-full" />
            <p className="text-sm font-medium text-center">
              First Reader
            </p>
            <p className="text-xs text-gray-500">
              19 Oct 2025
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
