import React from 'react';
import { Terminal } from 'lucide-react';

interface TerminalHeaderProps {
  isZh: boolean;
  isOnline: boolean;
}

export default function TerminalHeader({ isZh, isOnline }: TerminalHeaderProps) {
  return (
    <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
      <div className="flex items-center space-x-3">

        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        

        <div className="flex items-center space-x-2 text-gray-300 text-small">
          <Terminal className="w-4 h-4" />
          <span>{isZh ? '个人作品集' : 'Portfolio'}</span>
        </div>
      </div>
      

      <div className="flex items-center space-x-1 text-small">
        {isOnline ? (
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
        ) : (
          <div className="w-2 h-2 bg-red-400 rounded-full"></div>
        )}
      </div>
    </div>
  );
}