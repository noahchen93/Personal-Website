import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Loader2, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { imageService, ImageStatus, PlaceholderGenerator, URLValidator } from '../../utils/ImageService';

interface UnifiedImageProps {
  imageId?: string;
  src?: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  width?: number | string;
  height?: number | string;
  aspectRatio?: string;
  lazy?: boolean;
  preload?: boolean;
  fallbackSrc?: string;
  placeholder?: string;
  showLoadingSpinner?: boolean;
  onLoad?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  onError?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  onLoadStart?: () => void;
  allImages?: any[];
  getImageUrl?: (id: string) => string;
  placeholderWidth?: number;
  placeholderHeight?: number;
  placeholderText?: string;
  centerImage?: boolean;
  enableFadeIn?: boolean;
  retryAttempts?: number;
  lowQualityPlaceholder?: boolean;
  suppressErrorLogs?: boolean;
}

const UnifiedImage: React.FC<UnifiedImageProps> = ({
  imageId,
  src,
  alt = '',
  className = '',
  style = {},
  width,
  height,
  aspectRatio,
  lazy = true,
  preload = false,
  fallbackSrc,
  placeholder,
  showLoadingSpinner = false,
  onLoad,
  onError,
  onLoadStart,
  allImages = [],
  getImageUrl,
  placeholderWidth = 300,
  placeholderHeight = 200,
  placeholderText,
  centerImage = true,
  suppressErrorLogs = true,
  retryAttempts = 2,
  enableFadeIn = true,
  lowQualityPlaceholder = false
}) => {
  const [status, setStatus] = useState<ImageStatus>(ImageStatus.LOADING);
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [isIntersecting, setIsIntersecting] = useState(!lazy);
  const [errorCount, setErrorCount] = useState(0);
  
  const imgRef = useRef<HTMLImageElement>(null);
  const intersectionObserverRef = useRef<IntersectionObserver | null>(null);
  
  // 稳定化allImages和getImageUrl的引用，防止无限重新渲染
  const stableAllImages = useMemo(() => allImages, [allImages?.length]);
  const stableGetImageUrl = useMemo(() => getImageUrl, []);

  // 确定最终的图片源 - 稳定化依赖项
  const finalSrc = useMemo((): string => {
    if (imageId) {
      return stableGetImageUrl ? stableGetImageUrl(imageId) : imageService.getImageUrl(imageId, stableAllImages);
    }
    
    if (src && URLValidator.isValidImageUrl(src)) {
      return src;
    }
    
    if (fallbackSrc && URLValidator.isValidImageUrl(fallbackSrc)) {
      return fallbackSrc;
    }
    
    return placeholder || PlaceholderGenerator.generatePlaceholder(
      placeholderWidth, 
      placeholderHeight, 
      placeholderText || 'Image not available'
    );
  }, [imageId, src, fallbackSrc, placeholder, stableGetImageUrl, stableAllImages, placeholderWidth, placeholderHeight, placeholderText]);

  // 设置图片源 - 防止重复调用
  const setupImageSrc = useCallback(() => {
    // 如果源地址没有变化且不是加载状态，则跳过
    if (currentSrc === finalSrc && status !== ImageStatus.LOADING) {
      return;
    }
    
    // 如果是SVG占位符，直接设置
    if (finalSrc.startsWith('data:image/svg+xml')) {
      if (currentSrc !== finalSrc) {
        setCurrentSrc(finalSrc);
        setStatus(ImageStatus.PLACEHOLDER);
      }
      return;
    }
    
    // 只有当源地址真正改变时才重新加载
    if (currentSrc !== finalSrc) {
      setCurrentSrc(finalSrc);
      setStatus(ImageStatus.LOADING);
      setErrorCount(0); // 🔥 重置错误计数
      
      if (onLoadStart) {
        onLoadStart();
      }
    }
  }, [finalSrc, currentSrc, status, onLoadStart]);

  // 设置交叉观察器
  useEffect(() => {
    if (lazy && imgRef.current) {
      intersectionObserverRef.current = new IntersectionObserver(
        (entries) => {
          const [entry] = entries;
          if (entry.isIntersecting) {
            setIsIntersecting(true);
            intersectionObserverRef.current?.disconnect();
          }
        },
        { threshold: 0.1, rootMargin: '50px' }
      );
      
      intersectionObserverRef.current.observe(imgRef.current);
    }
    
    return () => {
      intersectionObserverRef.current?.disconnect();
    };
  }, [lazy]);

  // 当可见时设置图片源 - 使用稳定的依赖
  useEffect(() => {
    if (isIntersecting) {
      setupImageSrc();
    }
  }, [isIntersecting, setupImageSrc]);

  // 预加载处理 - 减少依赖项
  useEffect(() => {
    if (preload && !lazy && finalSrc) {
      if (URLValidator.isValidImageUrl(finalSrc) && !finalSrc.startsWith('data:')) {
        imageService.preloadImage(finalSrc);
      }
    }
  }, [preload, lazy, finalSrc]);

  const handleLoad = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    setStatus(ImageStatus.LOADED);
    if (onLoad) onLoad(event);
  }, [onLoad]);

  const handleError = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    // 🔥 智能重试机制
    if (errorCount < retryAttempts && currentSrc && !currentSrc.startsWith('data:')) {
      setErrorCount(prev => prev + 1);
      
      // 延迟重试，避免立即重新触发错误
      setTimeout(() => {
        if (!suppressErrorLogs) {
          console.debug(`[UnifiedImage] Retrying image load (${errorCount + 1}/${retryAttempts}):`, currentSrc);
        }
        
        // 强制重新加载图片
        const img = event.target as HTMLImageElement;
        const originalSrc = img.src;
        img.src = '';
        setTimeout(() => {
          img.src = originalSrc + (originalSrc.includes('?') ? '&' : '?') + `retry=${errorCount + 1}`;
        }, 100);
      }, 1000 * (errorCount + 1)); // 递增延迟
      
      return;
    }
    
    // 🔥 可配置的错误日志级别
    if (!suppressErrorLogs) {
      console.debug('[UnifiedImage] Image failed to load after retries:', currentSrc);
    }
    
    setStatus(ImageStatus.ERROR);
    
    // Create a more informative error placeholder
    const errorPlaceholder = PlaceholderGenerator.generatePlaceholder(
      placeholderWidth,
      placeholderHeight,
      `Image unavailable${imageId ? `\n(ID: ${imageId.substring(0, 8)}...)` : ''}`
    );
    setCurrentSrc(errorPlaceholder);
    
    // Call the provided onError handler only once
    if (onError) {
      try {
        onError(event);
      } catch (error) {
        // 静默处理onError回调中的错误，避免错误传播
        if (!suppressErrorLogs) {
          console.debug('[UnifiedImage] onError callback failed:', error);
        }
      }
    }
  }, [onError, placeholderWidth, placeholderHeight, currentSrc, imageId, suppressErrorLogs, errorCount, retryAttempts]);

  const imageStyle: React.CSSProperties = {
    ...style,
    ...(width && { width }),
    ...(height && { height }),
    ...(aspectRatio && { aspectRatio }),
    ...(status === ImageStatus.LOADING && { opacity: 0.7 }),
    ...(status === ImageStatus.ERROR && { opacity: 0.5 }),
    transition: 'opacity 0.3s ease-in-out',
    // 确保图片居中显示
    display: 'block',
    margin: centerImage ? '0 auto' : undefined,
    objectFit: 'contain',
    objectPosition: 'center',
  };

  const imageClassName = [
    className,
    'unified-image',
    `unified-image--${status}`,
    showLoadingSpinner && status === ImageStatus.LOADING ? 'unified-image--loading-spinner' : '',
  ].filter(Boolean).join(' ');

  // 容器样式 - 支持居中显示和动态布局
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    display: centerImage ? 'flex' : 'inline-block',
    justifyContent: centerImage ? 'center' : undefined,
    alignItems: centerImage ? 'center' : undefined,
    width: '100%',
    textAlign: centerImage ? 'center' : undefined,
    flexDirection: 'column',
    transition: 'all 0.3s ease-in-out',
    overflow: 'hidden',
  };

  return (
    <div className="unified-image-container" style={containerStyle}>
      <img
        ref={imgRef}
        src={currentSrc || undefined}
        alt={alt}
        className={imageClassName}
        style={{
          ...imageStyle,
          position: 'relative',
          zIndex: 10,
          maxHeight: '90vh',
          minHeight: 'auto',
          transition: 'all 0.3s ease-in-out'
        }}
        onLoad={(e) => {
          const img = e.target as HTMLImageElement;
          const aspectRatio = img.naturalWidth / img.naturalHeight;
          
          // 获取相关容器元素
          const imageContainer = img.closest('.unified-image-container');
          const coverContainer = img.closest('[class*="cover-image"]');
          const glassContainer = img.closest('[class*="glass-"]');
          const cardContainer = img.closest('.card, [class*="card-"]');
          
          // 清除之前的类名
          const containers = [imageContainer, coverContainer, glassContainer, cardContainer].filter(Boolean);
          containers.forEach(container => {
            container?.classList.remove('contains-portrait', 'contains-landscape', 'contains-square');
          });
          
          // 动态添加CSS类来标识图片类型
          if (aspectRatio < 0.75) {
            // 竖屏图片
            img.classList.add('portrait-image');
            img.classList.remove('landscape-image', 'square-image');
            
            // 通知所有相关容器
            containers.forEach(container => {
              container?.classList.add('contains-portrait');
            });
            
            // 为竖屏图片优化样式
            if (imageContainer) {
              (imageContainer as HTMLElement).style.minHeight = '400px';
              (imageContainer as HTMLElement).style.flexDirection = 'column';
              (imageContainer as HTMLElement).style.justifyContent = 'flex-start';
              (imageContainer as HTMLElement).style.alignItems = 'center';
              (imageContainer as HTMLElement).style.padding = '1rem 0';
            }
            
          } else if (aspectRatio > 1.33) {
            // 横屏图片
            img.classList.add('landscape-image');
            img.classList.remove('portrait-image', 'square-image');
            
            containers.forEach(container => {
              container?.classList.add('contains-landscape');
            });
            
            // 为横屏图片优化样式
            if (imageContainer) {
              (imageContainer as HTMLElement).style.minHeight = '200px';
              (imageContainer as HTMLElement).style.flexDirection = 'column';
              (imageContainer as HTMLElement).style.justifyContent = 'center';
              (imageContainer as HTMLElement).style.alignItems = 'center';
              (imageContainer as HTMLElement).style.padding = '0.5rem 0';
            }
            
          } else {
            // 正方形图片
            img.classList.add('square-image');
            img.classList.remove('portrait-image', 'landscape-image');
            
            containers.forEach(container => {
              container?.classList.add('contains-square');
            });
            
            // 为正方形图片优化样式
            if (imageContainer) {
              (imageContainer as HTMLElement).style.minHeight = '250px';
              (imageContainer as HTMLElement).style.flexDirection = 'column';
              (imageContainer as HTMLElement).style.justifyContent = 'center';
              (imageContainer as HTMLElement).style.alignItems = 'center';
              (imageContainer as HTMLElement).style.padding = '0.75rem 0';
            }
          }
          
          // 设置自定义属性供CSS使用
          img.style.setProperty('--aspect-ratio', aspectRatio.toString());
          img.style.setProperty('--image-width', img.naturalWidth.toString());
          img.style.setProperty('--image-height', img.naturalHeight.toString());
          
          // 动态调整文字、按钮和标签元素的位置
          setTimeout(() => {
            containers.forEach(container => {
              if (!container) return;
              
              // 调整文字元素
              const textElements = container.querySelectorAll('.terminal-text, .terminal-text-white, .terminal-text-cyan, .terminal-text-yellow, h1, h2, h3, h4, h5, h6, p, span:not(.unified-image *), div:not(.unified-image-container):not(.unified-image *)');
              textElements.forEach(el => {
                if (aspectRatio < 0.75) { // 竖屏
                  (el as HTMLElement).style.marginTop = '1.5rem';
                  (el as HTMLElement).style.marginBottom = '1rem';
                  (el as HTMLElement).style.position = 'relative';
                  (el as HTMLElement).style.zIndex = '5';
                } else if (aspectRatio > 1.33) { // 横屏
                  (el as HTMLElement).style.marginTop = '0.5rem';
                  (el as HTMLElement).style.marginBottom = '0.5rem';
                }
              });
              
              // 调整按钮元素
              const buttonElements = container.querySelectorAll('button, .btn, [role="button"]');
              buttonElements.forEach(el => {
                if (aspectRatio < 0.75) { // 竖屏
                  (el as HTMLElement).style.marginTop = '2rem';
                  (el as HTMLElement).style.marginBottom = '1rem';
                  (el as HTMLElement).style.position = 'relative';
                  (el as HTMLElement).style.zIndex = '5';
                } else if (aspectRatio > 1.33) { // 横屏
                  (el as HTMLElement).style.marginTop = '0.5rem';
                  (el as HTMLElement).style.marginBottom = '0.5rem';
                }
              });
              
              // 调整绝对定位的标签元素
              const labelElements = container.querySelectorAll('.absolute');
              labelElements.forEach(el => {
                const element = el as HTMLElement;
                const computedStyle = window.getComputedStyle(element);
                
                if (aspectRatio < 0.75) { // 竖屏图片
                  // 检查是否为顶部标签
                  if (computedStyle.top !== 'auto' && (
                    element.classList.contains('top-2') || 
                    element.classList.contains('top-3') || 
                    element.classList.contains('top-4') ||
                    computedStyle.top.includes('0.5rem') ||
                    computedStyle.top.includes('0.75rem') ||
                    computedStyle.top.includes('1rem')
                  )) {
                    element.style.top = '-0.5rem';
                    element.style.zIndex = '35';
                    element.style.transform = 'scale(1.05)';
                  }
                  
                  // 检查是否为左侧标签
                  if (computedStyle.left !== 'auto' && (
                    element.classList.contains('left-2') || 
                    element.classList.contains('left-3') || 
                    element.classList.contains('left-4') ||
                    computedStyle.left.includes('0.5rem') ||
                    computedStyle.left.includes('0.75rem') ||
                    computedStyle.left.includes('1rem')
                  )) {
                    element.style.left = '-0.5rem';
                    element.style.zIndex = '35';
                  }
                  
                  // 检查是否为右侧标签
                  if (computedStyle.right !== 'auto' && (
                    element.classList.contains('right-2') || 
                    element.classList.contains('right-3') || 
                    element.classList.contains('right-4') ||
                    computedStyle.right.includes('0.5rem') ||
                    computedStyle.right.includes('0.75rem') ||
                    computedStyle.right.includes('1rem')
                  )) {
                    element.style.right = '-0.5rem';
                    element.style.zIndex = '35';
                  }
                  
                  // 增强标签样式以确保可见性
                  element.style.backdropFilter = 'blur(15px)';
                  element.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
                  element.style.border = '1px solid rgba(255, 255, 255, 0.2)';
                  
                } else if (aspectRatio > 1.33) { // 横屏图片
                  // 横屏图片时保持标签在边缘但不遮挡
                  if (computedStyle.top !== 'auto') {
                    element.style.top = '0.25rem';
                    element.style.zIndex = '25';
                  }
                  if (computedStyle.left !== 'auto') {
                    element.style.left = '0.25rem';
                    element.style.zIndex = '25';
                  }
                  if (computedStyle.right !== 'auto') {
                    element.style.right = '0.25rem';
                    element.style.zIndex = '25';
                  }
                  
                } else { // 正方形图片
                  // 正方形图片时平衡定位
                  if (computedStyle.top !== 'auto') {
                    element.style.top = '0.5rem';
                    element.style.zIndex = '28';
                  }
                  if (computedStyle.left !== 'auto') {
                    element.style.left = '0.5rem';
                    element.style.zIndex = '28';
                  }
                  if (computedStyle.right !== 'auto') {
                    element.style.right = '0.5rem';
                    element.style.zIndex = '28';
                  }
                }
                
                // 为所有标签添加过渡动画
                element.style.transition = 'all 0.3s ease-in-out';
              });
            });
          }, 100);
          
          handleLoad(e);
        }}
        onError={handleError}
        loading={lazy ? 'lazy' : 'eager'}
        decoding="async"
      />
      
      {showLoadingSpinner && status === ImageStatus.LOADING && (
        <div 
          className="unified-image-spinner"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1,
          }}
        >
          <div 
            style={{
              width: '20px',
              height: '20px',
              border: '2px solid #3b82f6',
              borderTop: '2px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default UnifiedImage;

// 添加CSS动画样式 - 增强的动态布局支持
if (!document.head.querySelector('style[data-unified-image]')) {
  const style = document.createElement('style');
  style.setAttribute('data-unified-image', 'true');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .unified-image-container {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      text-align: center;
      transition: all 0.3s ease-in-out;
      overflow: hidden;
    }
    
    .unified-image {
      display: block;
      margin: 0 auto;
      max-width: 100%;
      height: auto;
      object-fit: contain;
      object-position: center;
      transition: all 0.3s ease-in-out;
      position: relative;
      z-index: 10;
    }
    
    .unified-image.portrait-image {
      max-height: 85vh;
      max-width: 90%;
      z-index: 20;
    }
    
    .unified-image.landscape-image {
      max-width: 95%;
      max-height: 50vh;
      z-index: 15;
    }
    
    .unified-image.square-image {
      max-width: 90%;
      max-height: 60vh;
      z-index: 18;
    }
    
    .unified-image--loading {
      opacity: 0.7;
    }
    
    .unified-image--error {
      opacity: 0.5;
    }
    
    .unified-image--placeholder {
      opacity: 1;
    }
    
    .unified-image--loading-spinner {
      position: relative;
    }
    
    /* 动态容器调整 */
    .unified-image-container.contains-portrait {
      min-height: 400px;
      max-height: 90vh;
      flex-direction: column;
      padding: 1rem 0;
    }
    
    .unified-image-container.contains-landscape {
      min-height: 200px;
      max-height: 60vh;
      flex-direction: row;
      padding: 0.5rem 0;
    }
    
    .unified-image-container.contains-square {
      min-height: 250px;
      max-height: 70vh;
      flex-direction: column;
      padding: 0.75rem 0;
    }
    
    /* 在移动设备上的优化 */
    @media (max-width: 768px) {
      .unified-image-container.contains-portrait {
        min-height: 300px;
        max-height: 70vh;
        padding: 0.75rem 0;
      }
      
      .unified-image.portrait-image {
        max-height: 60vh;
        max-width: 95%;
      }
    }
  `;
  document.head.appendChild(style);
}
