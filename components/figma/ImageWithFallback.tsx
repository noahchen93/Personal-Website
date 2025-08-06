import React, { useState, useCallback } from 'react';
import { ImageIcon } from 'lucide-react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  fallbackComponent?: React.ReactNode;
  className?: string;
  loading?: 'lazy' | 'eager';
  onLoadError?: () => void;
}

export function ImageWithFallback({
  src,
  alt,
  fallbackSrc,
  fallbackComponent,
  className = '',
  loading = 'lazy',
  onLoadError,
  ...props
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = useCallback(() => {
    if (fallbackSrc && imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
    } else {
      setIsError(true);
    }
    setIsLoading(false);
    onLoadError?.();
  }, [fallbackSrc, imgSrc, onLoadError]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setIsError(false);
  }, []);

  // If there's an error and no fallback, show fallback component or default
  if (isError) {
    if (fallbackComponent) {
      return <>{fallbackComponent}</>;
    }
    
    return (
      <div 
        className={`flex items-center justify-center bg-gray-200 text-gray-500 ${className}`}
        style={{ minHeight: '200px' }}
      >
        <div className="text-center">
          <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">图片加载失败</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div 
          className={`flex items-center justify-center bg-gray-100 animate-pulse ${className}`}
          style={{ minHeight: '200px' }}
        >
          <div className="text-center">
            <div className="w-12 h-12 bg-gray-300 rounded mx-auto mb-2"></div>
            <div className="w-16 h-4 bg-gray-300 rounded"></div>
          </div>
        </div>
      )}
      
      <img
        src={imgSrc}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        loading={loading}
        onError={handleError}
        onLoad={handleLoad}
        {...props}
      />
    </>
  );
}