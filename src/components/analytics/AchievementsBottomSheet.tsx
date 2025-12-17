export default function AchievementsBottomSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40">
      <div className="w-full bg-white rounded-t-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Achievements</h3>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-gray-100 rounded-xl p-4 text-center"
            >
              <div className="w-12 h-12 mx-auto bg-gradient-to-tr from-green-400 to-blue-500 rounded-full mb-2" />
              <p className="font-medium">First Reader</p>
              <p className="text-xs text-gray-500">19 Oct 2025</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
