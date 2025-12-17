export default function InboxSnapshot() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <h3 className="font-semibold text-lg mb-4">
        Inbox Snapshot
      </h3>

      {/* Progress Bar */}
      <div className="h-3 w-full rounded-full overflow-hidden flex">
        <div className="bg-red-500 w-[18%]" />
        <div className="bg-green-500 w-[42%]" />
        <div className="bg-yellow-400 w-[25%]" />
        <div className="bg-blue-500 w-[10%]" />
        <div className="bg-orange-400 w-[5%]" />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm mt-4">
        {[
          ["Received Today", "bg-red-500"],
          ["Read", "bg-green-500"],
          ["Unread", "bg-yellow-400"],
          ["Read later", "bg-blue-500"],
          ["Favourite", "bg-orange-400"],
        ].map(([label, color]) => (
          <span key={label} className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${color}`} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
