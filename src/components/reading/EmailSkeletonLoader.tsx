'use client';

interface EmailSkeletonLoaderProps {
  pageColor?: 'white' | 'paper' | 'calm';
}

export default function EmailSkeletonLoader({ pageColor = 'white' }: EmailSkeletonLoaderProps) {
  const bgClass = 
    pageColor === 'paper' ? 'bg-[#F7F3E9]' :
    pageColor === 'calm' ? 'bg-[#E8F4F8]' :
    'bg-white';

  const skeletonClass = 
    pageColor === 'paper' ? 'bg-[#E8E4D9]' :
    pageColor === 'calm' ? 'bg-[#D8E8ED]' :
    'bg-gray-200';

  return (
    <div className={`w-full h-screen ${bgClass} transition-colors duration-300`}>
      {/* Header Skeleton */}
      <div className="h-[64px] flex items-center justify-end px-6 border-b border-gray-200 gap-2">
        <div className={`w-10 h-10 rounded-full ${skeletonClass} animate-pulse`}></div>
        <div className={`w-10 h-10 rounded-full ${skeletonClass} animate-pulse`}></div>
        <div className={`w-10 h-10 rounded-full ${skeletonClass} animate-pulse`}></div>
        <div className={`w-10 h-10 rounded-full ${skeletonClass} animate-pulse`}></div>
      </div>

      {/* Content Skeleton */}
      <div className="flex-1 overflow-y-auto py-10">
        <div className="mx-auto max-w-[760px] px-10">
          {/* Title area */}
          <div className="mb-10 pb-8 border-b border-gray-200">
            <div className={`h-10 w-3/4 ${skeletonClass} rounded-lg mb-4 animate-pulse`}></div>
            <div className={`h-10 w-1/2 ${skeletonClass} rounded-lg mb-6 animate-pulse`}></div>
            <div className={`h-4 w-48 ${skeletonClass} rounded animate-pulse`}></div>
          </div>

          {/* Hero Image Skeleton */}
          <div className={`h-80 w-full ${skeletonClass} rounded-xl mb-10 animate-pulse`}></div>

          {/* Content Paragraphs */}
          <div className="space-y-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-3">
                <div className={`h-4 w-full ${skeletonClass} rounded animate-pulse`} style={{ animationDelay: `${i * 0.1}s` }}></div>
                <div className={`h-4 w-full ${skeletonClass} rounded animate-pulse`} style={{ animationDelay: `${i * 0.1}s` }}></div>
                <div className={`h-4 w-11/12 ${skeletonClass} rounded animate-pulse`} style={{ animationDelay: `${i * 0.1}s` }}></div>
                <div className={`h-4 w-4/5 ${skeletonClass} rounded animate-pulse`} style={{ animationDelay: `${i * 0.1}s` }}></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
