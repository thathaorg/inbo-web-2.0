export default function MoreLikeYouRead() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <h3 className="font-semibold text-lg mb-4">
        More like what you read
      </h3>

      <div className="flex flex-wrap gap-3">
        {Array.from({ length: 16 }).map((_, i) => (
          <div
            key={i}
            className="w-10 h-10 bg-orange-400 rounded-full flex items-center justify-center"
          >
            <div className="w-4 h-3 bg-white rounded-sm" />
          </div>
        ))}
      </div>
    </div>
  );
}
