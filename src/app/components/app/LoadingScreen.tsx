import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  loadingText: string;
}

export default function LoadingScreen({ loadingText }: LoadingScreenProps) {
  return (
    <div className="min-h-screen bg-black text-green-400 font-terminal flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <Loader2 className="w-8 h-8 animate-spin text-green-400" />
          <span className="text-large text-white">{loadingText}</span>
        </div>
      </div>
    </div>
  );
}