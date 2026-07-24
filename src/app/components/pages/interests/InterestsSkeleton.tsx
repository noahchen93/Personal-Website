import React from 'react';

export default function InterestsSkeleton() {
  return (
    <div className="space-y-8 font-mono">
      <div className="text-center animate-pulse">
        <div className="h-10 bg-gray-700 rounded-xl w-1/2 mx-auto mb-4"></div>
        <div className="h-6 bg-gray-800 rounded-xl w-2/3 mx-auto"></div>
      </div>
      
      <div className="flex flex-wrap gap-2 justify-center animate-pulse">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div key={n} className="h-10 bg-gray-700 rounded-xl w-20"></div>
        ))}
      </div>
      
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div key={n} className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden animate-pulse">
            <div className="aspect-video bg-gray-800"></div>
            <div className="p-6 space-y-3">
              <div className="h-6 bg-gray-700 rounded-xl w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-800 rounded-xl"></div>
                <div className="h-4 bg-gray-800 rounded-xl w-5/6"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-800 rounded-xl"></div>
                <div className="h-4 bg-gray-800 rounded-xl w-4/5"></div>
                <div className="h-4 bg-gray-800 rounded-xl w-3/5"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}