import React from 'react';

const ClistingLoader = () => {

  const loaderCards = Array.from({ length: 6 });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {loaderCards.map((_, index) => (
        <div 
          key={index} 
          className="border rounded-xl overflow-hidden shadow-sm bg-white animate-pulse"
        >
          {/* Image Placeholder */}
          <div className="w-full h-48 bg-gray-300"></div>

          {/* Content Area */}
          <div className="p-4 space-y-4">
            {/* Title & Price Row */}
            <div className="flex justify-between items-center">
              <div className="h-5 w-2/3 bg-gray-300 rounded-md"></div>
              <div className="h-5 w-1/4 bg-gray-300 rounded-md"></div>
            </div>

            {/* Description Lines */}
            <div className="space-y-2">
              <div className="h-3 w-full bg-gray-200 rounded-md"></div>
              <div className="h-3 w-5/6 bg-gray-200 rounded-md"></div>
            </div>

            {/* Footer / Buttons Placeholder */}
            <div className="flex gap-2 pt-2">
              <div className="h-10 w-full bg-gray-300 rounded-lg"></div>
              <div className="h-10 w-full bg-gray-300 rounded-lg"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ClistingLoader;