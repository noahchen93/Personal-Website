import React, { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { imageService, PlaceholderGenerator } from '../../utils/ImageService';

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

export default function UnifiedImage({
  imageId,
  src,
  alt = '',
  className = '',
  style,
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
  placeholderWidth = 800,
  placeholderHeight = 500,
  placeholderText = 'Image unavailable',
  centerImage = true,
  enableFadeIn = true,
  suppressErrorLogs = true,
}: UnifiedImageProps) {
  const resolvedSource = useMemo(() => {
    if (imageId) {
      return getImageUrl?.(imageId) || imageService.getImageUrl(imageId, allImages);
    }
    return src || fallbackSrc || placeholder || '';
  }, [allImages, fallbackSrc, getImageUrl, imageId, placeholder, src]);

  const errorPlaceholder = useMemo(
    () => placeholder || PlaceholderGenerator.generatePlaceholder(
      placeholderWidth,
      placeholderHeight,
      placeholderText,
    ),
    [placeholder, placeholderHeight, placeholderText, placeholderWidth],
  );

  const [currentSource, setCurrentSource] = useState(resolvedSource || errorPlaceholder);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setCurrentSource(resolvedSource || errorPlaceholder);
    setLoaded(false);
    setFailed(false);
    onLoadStart?.();
  }, [errorPlaceholder, onLoadStart, resolvedSource]);

  useEffect(() => {
    if (!preload || !resolvedSource) return;
    const image = new Image();
    image.src = resolvedSource;
  }, [preload, resolvedSource]);

  const imageStyle: React.CSSProperties = {
    width,
    height,
    aspectRatio,
    ...style,
    marginInline: centerImage ? 'auto' : style?.marginInline,
  };

  return (
    <div
      className={[
        'unified-image-container',
        loaded ? 'is-loaded' : '',
        failed ? 'has-error' : '',
      ].filter(Boolean).join(' ')}
    >
      <img
        src={currentSource}
        alt={alt}
        className={['unified-image', enableFadeIn ? 'unified-image--fade' : '', className].filter(Boolean).join(' ')}
        style={imageStyle}
        loading={lazy ? 'lazy' : 'eager'}
        decoding="async"
        onLoad={(event) => {
          setLoaded(true);
          onLoad?.(event);
        }}
        onError={(event) => {
          if (currentSource !== errorPlaceholder) {
            if (!suppressErrorLogs) {
              console.info('[UnifiedImage] Replaced unavailable image:', currentSource);
            }
            setCurrentSource(errorPlaceholder);
            setFailed(true);
          }
          onError?.(event);
        }}
      />

      {showLoadingSpinner && !loaded && !failed && (
        <span className="unified-image__loader" aria-hidden="true">
          <Loader2 />
        </span>
      )}
    </div>
  );
}
