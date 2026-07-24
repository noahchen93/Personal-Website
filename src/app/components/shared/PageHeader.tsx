import React, { useState, useEffect } from 'react';
import { Loader2, Terminal, User, Folder, GitBranch } from 'lucide-react';

interface PageHeaderProps {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  loading?: boolean;
}

export default function PageHeader({
  title,
  subtitle,
  icon,
  children,
  loading = false
}: PageHeaderProps) {
  const [typedTitle, setTypedTitle] = useState('');
  const [typedSubtitle, setTypedSubtitle] = useState('');
  const [titleComplete, setTitleComplete] = useState(false);
  const [subtitleComplete, setSubtitleComplete] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  // Typing animation for title
  useEffect(() => {
    if (!title) {
      setTitleComplete(true);
      return;
    }

    let i = 0;
    const timer = setInterval(() => {
      if (i <= title.length) {
        setTypedTitle(title.slice(0, i));
        i++;
      } else {
        clearInterval(timer);
        setTitleComplete(true);
      }
    }, 50);

    return () => clearInterval(timer);
  }, [title]);

  // Typing animation for subtitle
  useEffect(() => {
    if (!subtitle || !titleComplete) {
      return;
    }

    let i = 0;
    const timer = setInterval(() => {
      if (i <= subtitle.length) {
        setTypedSubtitle(subtitle.slice(0, i));
        i++;
      } else {
        clearInterval(timer);
        setSubtitleComplete(true);
      }
    }, 30);

    return () => clearInterval(timer);
  }, [subtitle, titleComplete]);

  // Cursor blinking animation
  useEffect(() => {
    const cursorTimer = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorTimer);
  }, []);

  if (loading) {
    return (
      <div className="relative bg-black border border-gray-700 rounded-lg overflow-hidden font-mono shadow-2xl mb-6">
        {/* Terminal Header */}
        <div className="flex items-center justify-between bg-gray-800 px-4 py-2 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <Terminal className="w-4 h-4 text-gray-400 ml-4" />
            <span className="text-gray-300 text-sm">portfolio-terminal</span>
          </div>
          <div className="flex items-center space-x-3 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <User className="w-3 h-3" />
              <span>guest</span>
            </div>
            <div className="flex items-center space-x-1">
              <Folder className="w-3 h-3" />
              <span>~/portfolio</span>
            </div>
            <div className="flex items-center space-x-1">
              <GitBranch className="w-3 h-3" />
              <span>main</span>
            </div>
          </div>
        </div>

        {/* Loading Content */}
        <div className="p-6 text-green-400 space-y-3 min-h-[90px] flex items-center justify-center">
          <div className="flex items-center space-x-3">
            <Loader2 className="w-6 h-6 animate-spin text-green-400" />
            <span className="text-white text-lg">Loading...</span>
          </div>
        </div>

        {/* CRT Effect Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div 
            className="w-full h-full"
            style={{
              background: `
                repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 2px,
                  rgba(0, 255, 0, 0.03) 2px,
                  rgba(0, 255, 0, 0.03) 4px
                )
              `
            }}
          ></div>
        </div>

        {/* Glow Effect */}
        <div className="absolute inset-0 rounded-lg shadow-2xl pointer-events-none opacity-30">
          <div className="w-full h-full rounded-lg shadow-[0_0_50px_rgba(0,255,0,0.3)]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="relative bg-black border border-gray-700 rounded-lg overflow-hidden font-mono shadow-2xl">
        {/* Terminal Header */}
        <div className="flex items-center justify-between bg-gray-800 px-4 py-2 border-b border-gray-700 m-[0px] px-[16px] py-[0px]">
          <div className="flex items-center space-x-2 m-[0px]">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full hover:bg-red-400 transition-colors cursor-pointer"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full hover:bg-yellow-400 transition-colors cursor-pointer mt-[0px] mr-[8px] mb-[16px] ml-[0px]"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full hover:bg-green-400 transition-colors cursor-pointer"></div>
            </div>
            <Terminal className="w-4 h-4 text-gray-400 ml-4" />
            <span className="text-gray-300 text-sm mx-[0px] my-[16px]">portfolio-terminal</span>
          </div>
          <div className="flex items-center space-x-3 text-xs text-gray-500 m-[0px]">
            <div className="flex items-center space-x-1">
              <User className="w-3 h-3" />
              <span className="mx-[0px] my-[16px]">guest</span>
            </div>
            <div className="flex items-center space-x-1">
              <Folder className="w-3 h-3" />
              <span className="mx-[0px] my-[16px]">~/portfolio</span>
            </div>
            <div className="flex items-center space-x-1">
              <GitBranch className="w-3 h-3" />
              <span className="mx-[0px] my-[16px]">main</span>
            </div>
          </div>
        </div>

        {/* Terminal Content */}
        <div className="p-6 text-green-400 space-y-4 min-h-[90px] px-[12px] py-[0px]">
          {/* Title Display */}
          {title && (
            <div className="space-y-2">
              <h1 className="text-2xl lg:text-3xl xl:text-4xl text-white font-medium tracking-wide mx-[0px] my-[16px] mt-[16px] mr-[0px] mb-[8px] ml-[0px]">
                {typedTitle}
                {!titleComplete && showCursor && <span className="text-green-400">▋</span>}
              </h1>
            </div>
          )}

          {/* Subtitle Display */}
          {subtitle && titleComplete && (
            <div className="space-y-2">
              <div className="text-gray-300 leading-relaxed text-lg lg:text-xl max-w-none">
                {typedSubtitle}
                {!subtitleComplete && showCursor && <span className="text-green-400">▋</span>}
              </div>
            </div>
          )}

          {/* Children Content */}
          {children && subtitleComplete && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="text-gray-300 font-sans text-base lg:text-lg">
                {children}
              </div>
            </div>
          )}
        </div>

        {/* CRT Effect Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div 
            className="w-full h-full"
            style={{
              background: `
                repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 2px,
                  rgba(0, 255, 0, 0.03) 2px,
                  rgba(0, 255, 0, 0.03) 4px
                )
              `
            }}
          ></div>
        </div>

        {/* Glow Effect */}
        <div className="absolute inset-0 rounded-lg shadow-2xl pointer-events-none opacity-30">
          <div className="w-full h-full rounded-lg shadow-[0_0_50px_rgba(0,255,0,0.3)]"></div>
        </div>
      </div>
    </div>
  );
}