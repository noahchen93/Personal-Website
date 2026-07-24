import React, { useEffect, useCallback } from 'react';
import { useContent } from '../content/ContentContext';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface SmartImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: (error: any) => void;
  showLoadingSpinner?: boolean;
  [key: string]: any; // 允许其他props传递
}

// 智能图片组件，自动处理 {{image:id}} 格式的引用
export function SmartImage({ 
  src, 
  alt, 
  className, 
  style,
  onLoad,
  onError,
  showLoadingSpinner = true,
  ...restProps 
}: SmartImageProps) {
  const { getImageUrl, getImages } = useContent();

  // 处理图片引用解析
  const resolvedSrc = React.useMemo(() => {
    if (!src) {
      console.warn('SmartImage: No src provided');
      return '';
    }

    // 如果是 {{image:id}} 格式，解析为实际URL
    const imageRefMatch = src.match(/\{\{image:([^|}]+)(?:\|([^}]*))?\}\}/);
    if (imageRefMatch) {
      const imageId = imageRefMatch[1];
      
      // Check for problematic image ID patterns
      if (imageId.includes('/') || imageId.startsWith('uploads/') || imageId.startsWith('images/')) {
        console.warn(`SmartImage: Image ID appears to be a filename path: ${imageId}`);
        return '';
      }
      
      const resolvedUrl = getImageUrl(imageId);
      
      if (!resolvedUrl) {
        console.warn(`SmartImage: Failed to resolve image ID: ${imageId}`);
        return '';
      }
      
      // Check if resolved URL is actually HTML (error response)
      if (resolvedUrl.trim().startsWith('<') || resolvedUrl.includes('<!DOCTYPE') || resolvedUrl.includes('<html>')) {
        console.warn(`SmartImage: Resolved URL is HTML response for ID: ${imageId}`);
        return '';
      }
      
      // Check if it's a placeholder SVG (which is valid)
      if (resolvedUrl.startsWith('data:image/svg+xml')) {
        return resolvedUrl;
      }
      
      console.log(`SmartImage: Resolved {{image:${imageId}}} to ${resolvedUrl.substring(0, 100)}...`);
      return resolvedUrl;
    }

    // 如果已经是完整的URL，直接返回
    if (src.startsWith('http') || src.startsWith('data:') || src.startsWith('/')) {
      // Additional check for HTML responses in direct URLs
      if (src.trim().startsWith('<') || src.includes('<!DOCTYPE') || src.includes('<html>')) {
        console.warn(`SmartImage: Direct URL is HTML response: ${src.substring(0, 100)}...`);
        return '';
      }
      return src;
    }

    console.warn(`SmartImage: Unrecognized src format: ${src}`);
    return src;
  }, [src, getImageUrl]);

  // Enhanced error handling with better user feedback and automatic refresh
  const handleImageError = useCallback((error: any) => {
    console.warn(`SmartImage: Image failed to load: ${resolvedSrc}`, error);
    
    // 如果是图片引用格式，尝试刷新图片数据
    const imageRefMatch = src.match(/\{\{image:([^|}]+)(?:\|([^}]*))?\}\}/);
    if (imageRefMatch) {
      const imageId = imageRefMatch[1];
      console.log(`SmartImage: Attempting to refresh images due to load error for ID: ${imageId}`);
      
      // 异步刷新图片数据，但不阻塞当前操作
      setTimeout(() => {
        getImages(true).catch((refreshError) => {
          console.warn(`SmartImage: Failed to refresh images: ${refreshError.message}`);
        });
      }, 1000); // 延迟1秒执行，避免过于频繁的刷新
    }
    
    if (onError) {
      onError(error);
    }
  }, [resolvedSrc, src, getImages, onError]);

  // 当组件挂载时，如果是图片引用格式且URL无效，尝试刷新图片数据
  useEffect(() => {
    const imageRefMatch = src.match(/\{\{image:([^|}]+)(?:\|([^}]*))?\}\}/);
    if (imageRefMatch && (!resolvedSrc || resolvedSrc.startsWith('data:image/svg+xml'))) {
      const imageId = imageRefMatch[1];
      
      // 只有当resolvedSrc是占位符时才刷新
      if (resolvedSrc.includes('Image not available') || 
          resolvedSrc.includes('HTML Response Error') ||
          resolvedSrc.includes('Refreshing...')) {
        console.log(`SmartImage: Attempting to refresh images for placeholder ID: ${imageId}`);
        
        // 异步刷新，给用户更好的体验
        setTimeout(() => {
          getImages(true).catch((refreshError) => {
            console.warn(`SmartImage: Failed to refresh images: ${refreshError.message}`);
          });
        }, 500);
      }
    }
  }, [src, resolvedSrc, getImages]);

  return (
    <ImageWithFallback
      src={resolvedSrc}
      alt={alt}
      className={className}
      style={style}
      onLoad={onLoad}
      onError={handleImageError}
      showLoadingSpinner={showLoadingSpinner}
      {...restProps}
    />
  );
}

export default SmartImage;