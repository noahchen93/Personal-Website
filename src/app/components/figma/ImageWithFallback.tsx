import React, { useState, useEffect } from 'react';

interface ImageWithFallbackProps {
  src?: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  onLoad?: () => void;
  onError?: (error: any) => void;
  showLoadingSpinner?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
  // Allow other standard img attributes
  style?: React.CSSProperties;
  id?: string;
  title?: string;
  'data-testid'?: string;
  loading?: 'lazy' | 'eager';
  crossOrigin?: 'anonymous' | 'use-credentials';
  decoding?: 'async' | 'auto' | 'sync';
  referrerPolicy?: React.ImgHTMLAttributes<HTMLImageElement>['referrerPolicy'];
  sizes?: string;
  srcSet?: string;
  useMap?: string;
  width?: number | string;
  height?: number | string;
  onClick?: React.MouseEventHandler<HTMLImageElement>;
  onMouseEnter?: React.MouseEventHandler<HTMLImageElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLImageElement>;
}

export function ImageWithFallback({
  src,
  alt,
  fallbackSrc = '/api/placeholder/400/300',
  className = '',
  onLoad,
  onError,
  showLoadingSpinner = true,
  retryAttempts = 1,
  retryDelay = 1000,
  // Extract standard img attributes
  style,
  id,
  title,
  'data-testid': dataTestId,
  loading = 'lazy',
  crossOrigin,
  decoding,
  referrerPolicy,
  sizes,
  srcSet,
  useMap,
  width,
  height,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState<string>(src || fallbackSrc);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Reset state when src changes
  useEffect(() => {
    if (src && typeof src === 'string') {
      setImgSrc(src);
      setHasError(false);
      setIsLoading(true);
    } else {
      // Handle undefined or invalid src
      setImgSrc(fallbackSrc);
      setHasError(true);
      setIsLoading(false);
    }
  }, [src, fallbackSrc]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  const handleError = (error: any) => {
    console.warn(`Image failed to load: ${imgSrc}`, error);
    
    if (!hasError && imgSrc !== fallbackSrc) {
      // Try fallback if we haven't already
      setImgSrc(fallbackSrc);
      setHasError(true);
      setIsLoading(true);
    } else {
      // Even fallback failed, show placeholder
      setIsLoading(false);
      setHasError(true);
    }
    
    onError?.(error);
  };

  // Safe check for URL protocols - handle undefined/null src
  const isSafeUrl = (url: string | undefined | null): boolean => {
    if (!url || typeof url !== 'string') {
      return false;
    }
    
    try {
      return url.startsWith('http') || 
             url.startsWith('data:') || 
             url.startsWith('/') || 
             url.startsWith('./') || 
             url.startsWith('../') ||
             url.startsWith('figma:');
    } catch (error) {
      console.warn('Error checking URL safety:', error);
      return false;
    }
  };

  // Prepare safe div props (no custom props)
  const divProps = {
    style: style || { minHeight: '200px' },
    id,
    title,
    'data-testid': dataTestId,
    onClick,
    onMouseEnter,
    onMouseLeave,
  };

  // Show placeholder if loading failed or src is invalid
  if (hasError && imgSrc === fallbackSrc) {
    return (
      <div 
        className={`bg-gray-800 border border-gray-600 rounded-lg flex items-center justify-center text-gray-400 ${className}`}
        {...divProps}
      >
        <div className="text-center p-4">
          <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-2">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-small text-gray-500">Image not available</p>
        </div>
      </div>
    );
  }

  // Check if the current imgSrc is safe to load
  if (!isSafeUrl(imgSrc)) {
    return (
      <div 
        className={`bg-gray-800 border border-gray-600 rounded-lg flex items-center justify-center text-gray-400 ${className}`}
        {...divProps}
      >
        <div className="text-center p-4">
          <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-2">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-small text-gray-500">Invalid image URL</p>
        </div>
      </div>
    );
  }

  // Prepare safe img props (only valid HTML attributes)
  const imgProps = {
    style,
    id,
    title,
    'data-testid': dataTestId,
    loading,
    crossOrigin,
    decoding,
    referrerPolicy,
    sizes,
    srcSet,
    useMap,
    width,
    height,
    onClick,
    onMouseEnter,
    onMouseLeave,
  };

  return (
    <>
      {isLoading && showLoadingSpinner && (
        <div className={`bg-gray-800 border border-gray-600 rounded-lg flex items-center justify-center animate-pulse ${className}`}>
          <div className="text-center p-4">
            <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-small text-gray-400">Loading image...</p>
          </div>
        </div>
      )}
      <img
        src={imgSrc}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0 absolute' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={handleLoad}
        onError={handleError}
        {...imgProps}
      />
    </>
  );
}

export default ImageWithFallback;