import React from 'react';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', style }) => {
  return (
    <div 
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-md ${className}`} 
      style={style}
    />
  );
};

export const ArticleSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col space-y-4">
      <Skeleton className="w-full h-48 md:h-64 object-cover" />
      <div className="space-y-2 px-2">
        <Skeleton className="w-24 h-4 rounded-full" />
        <Skeleton className="w-full h-6" />
        <Skeleton className="w-3/4 h-6 mb-2" />
        <Skeleton className="w-1/2 h-3" />
      </div>
    </div>
  );
};

export const FeaturedSkeleton: React.FC = () => {
  return (
    <div className="relative h-[80vh] w-full bg-black">
      <Skeleton className="absolute inset-0 w-full h-full bg-gray-800 rounded-none mix-blend-overlay" />
      <div className="absolute inset-0 z-30 flex items-end pb-24">
         <div className="w-full mx-auto px-6 md:px-12 relative z-30 flex flex-col gap-4">
             <Skeleton className="w-24 h-6 bg-gray-700/50" />
             <Skeleton className="w-3/4 md:w-1/2 h-12 bg-gray-700/50" />
             <Skeleton className="w-full md:w-2/3 h-16 bg-gray-700/50" />
             <div className="flex gap-4 mt-2">
                <Skeleton className="w-32 h-6 bg-gray-700/50" />
                <Skeleton className="w-24 h-6 bg-gray-700/50" />
             </div>
         </div>
      </div>
    </div>
  );
};

export const PrintMediaSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col space-y-4 border border-gray-100 dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-gray-800 overflow-hidden p-4 transition-colors duration-200">
      <Skeleton className="w-full h-64 object-cover rounded-md" />
      <div className="flex flex-col space-y-3 mt-4">
        <Skeleton className="w-3/4 h-6 mb-2" />
        <Skeleton className="w-full h-4 mb-1" />
        <Skeleton className="w-full h-4 mb-4" />
        <div className="flex justify-between items-center mt-auto border-t border-gray-100 dark:border-gray-700 pt-3">
            <Skeleton className="w-24 h-4" />
            <Skeleton className="w-24 h-4" />
        </div>
      </div>
    </div>
  );
};

export const UserProfileSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12 transition-colors duration-200">
      <div className="container mx-auto px-4 pt-10">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8 flex flex-col md:flex-row items-center md:items-end gap-6">
          <Skeleton className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-700 shadow-md flex-shrink-0" />
          <div className="flex-grow flex flex-col items-center md:items-start space-y-2 mb-2 w-full">
            <Skeleton className="w-48 h-8" />
            <Skeleton className="w-64 h-5" />
            <div className="flex gap-2 mt-2">
               <Skeleton className="w-24 h-6 rounded-full" />
               <Skeleton className="w-24 h-6 rounded-full" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm min-h-[500px] p-6 transition-colors duration-200">
                <Skeleton className="w-full h-12 mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ArticleSkeleton />
                    <ArticleSkeleton />
                </div>
            </div>
            <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm min-h-[300px] p-6 transition-colors duration-200">
                 <Skeleton className="w-full h-8 mb-6" />
                 <div className="grid grid-cols-2 gap-4">
                     <Skeleton className="w-full h-48 rounded-md" />
                     <Skeleton className="w-full h-48 rounded-md" />
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export const AboutSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 transition-colors duration-200">
      <Skeleton className="w-full h-[50vh] md:h-[65vh] min-h-[400px] rounded-none bg-gray-800 dark:bg-gray-950" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-30">
        <div className="mb-16 md:mb-24 pt-16 md:pt-20">
            <Skeleton className="w-48 h-8 mb-10" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-10">
                <Skeleton className="w-full h-[22rem] md:h-[24rem] rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800" />
                <Skeleton className="w-full h-[22rem] md:h-[24rem] rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800" />
                <Skeleton className="w-full h-[22rem] md:h-[24rem] rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800" />
                <Skeleton className="w-full h-[22rem] md:h-[24rem] rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800" />
            </div>
        </div>
      </div>
    </div>
  );
};
