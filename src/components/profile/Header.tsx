export default function ProfileHeader({ title }: { title: string}) {
  return (
    <div className="w-full h-[78px] bg-white border border-[#E5E7EB] flex items-center px-6 shadow-sm gap-4">

      <h2 className="text-[26px] font-bold text-[#0C1014]">
        {title}
      </h2>
    </div>
  );
}
