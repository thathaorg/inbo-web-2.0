export default function StreakBottomSheet({
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
          <h3 className="font-semibold text-lg">Streak</h3>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="flex-1 bg-orange-400 text-white rounded-xl p-4">
            <p className="text-sm">Current</p>
            <p className="text-2xl font-bold">10 days</p>
          </div>

          <div className="flex-1 bg-gray-100 rounded-xl p-4">
            <p className="text-sm">Best</p>
            <p className="text-2xl font-bold">18 days</p>
          </div>
        </div>

        <p className="text-orange-500 font-medium text-center">
          Keep the momentum going 🔥
        </p>
      </div>
    </div>
  );
}
