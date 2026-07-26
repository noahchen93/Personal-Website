import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { imageService, PlaceholderGenerator } from '../../utils/ImageService';
import responsiveImageCatalog from '../../data/responsive-images.json';

interface ResponsiveImageVariant {
  file_url: string;
  width: number;
  height: number;
  file_size: number;
  file_type: string;
}

interface ResponsiveImageMetadata {
  width: number;
  height: number;
  placeholder_color: string;
  variants: ResponsiveImageVariant[];
}

const responsiveImages = responsiveImageCatalog as Record<string, ResponsiveImageMetadata>;

const getLocalImageKey = (source: string) => {
  if (!source || source.startsWith('data:')) return source;

  try {
    const url = new URL(source, window.location.origin);
    return url.origin === window.location.origin ? url.pathname : source;
  } catch {
    return source.split(/[?#]/, 1)[0];
  }
};

const getResponsiveMetadata = (source: string) => responsiveImages[getLocalImageKey(source)];

const getResponsiveSrcSet = (metadata?: ResponsiveImageMetadata) => metadata?.variants
  .map((variant) => `${variant.file_url} ${variant.width}w`)
  .join(', ');

const prepareImage = (
  source: string,
  metadata: ResponsiveImageMetadata | undefined,
  sizes: string,
) => {
  const image = new Image();
  const srcSet = getResponsiveSrcSet(metadata);

  if (srcSet) {
    image.srcset = srcSet;
    image.sizes = sizes;
  }

  image.src = source;
  return image;
};

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
  sizes?: string;
  fetchPriority?: 'high' | 'low' | 'auto';
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
  sizes = '(max-width: 767px) 100vw, 50vw',
  fetchPriority = 'auto',
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
  const requestedSourceRef = useRef(resolvedSource || errorPlaceholder);
  const onLoadStartRef = useRef(onLoadStart);

  useEffect(() => {
    onLoadStartRef.current = onLoadStart;
  }, [onLoadStart]);

  useEffect(() => {
    const nextSource = resolvedSource || errorPlaceholder;
    if (nextSource === requestedSourceRef.current) return;

    requestedSourceRef.current = nextSource;
    setFailed(false);
    onLoadStartRef.current?.();

    let cancelled = false;
    const metadata = getResponsiveMetadata(nextSource);
    const image = prepareImage(nextSource, metadata, sizes);

    const revealPreparedImage = async () => {
      try {
        await image.decode();
      } catch {
        // A completed onload is still safe to reveal when decode() is unavailable.
      }

      if (!cancelled) {
        setCurrentSource(nextSource);
        setLoaded(true);
      }
    };

    image.onload = revealPreparedImage;
    image.onerror = () => {
      if (!cancelled) {
        setCurrentSource(nextSource);
        setLoaded(false);
      }
    };

    if (image.complete && image.naturalWidth > 0) {
      revealPreparedImage();
    }

    return () => {
      cancelled = true;
      image.onload = null;
      image.onerror = null;
    };
  }, [errorPlaceholder, resolvedSource, sizes]);

  useEffect(() => {
    if (!preload || !resolvedSource) return;
    prepareImage(resolvedSource, getResponsiveMetadata(resolvedSource), sizes);
  }, [preload, resolvedSource, sizes]);

  const responsiveMetadata = useMemo(
    () => getResponsiveMetadata(currentSource),
    [currentSource],
  );
  const responsiveSrcSet = getResponsiveSrcSet(responsiveMetadata);

  const imageStyle: React.CSSProperties = {
    width,
    height,
    aspectRatio,
    ...style,
    marginInline: centerImage ? 'auto' : style?.marginInline,
  };
  const containerStyle = {
    '--image-placeholder-color': responsiveMetadata?.placeholder_color,
  } as React.CSSProperties;

  return (
    <div
      className={[
        'unified-image-container',
        loaded ? 'is-loaded' : '',
        failed ? 'has-error' : '',
      ].filter(Boolean).join(' ')}
      style={containerStyle}
    >
      <picture className="unified-image-picture">
        {responsiveSrcSet && (
          <source
            type="image/avif"
            srcSet={responsiveSrcSet}
            sizes={sizes}
          />
        )}
        <img
          src={currentSource}
          alt={alt}
          width={responsiveMetadata?.width}
          height={responsiveMetadata?.height}
          className={['unified-image', enableFadeIn ? 'unified-image--fade' : '', className].filter(Boolean).join(' ')}
          style={imageStyle}
          loading={lazy ? 'lazy' : 'eager'}
          fetchPriority={fetchPriority}
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
              requestedSourceRef.current = errorPlaceholder;
              setCurrentSource(errorPlaceholder);
              setFailed(true);
            }
            onError?.(event);
          }}
        />
      </picture>

      {showLoadingSpinner && !loaded && !failed && (
        <span className="unified-image__loader" aria-hidden="true">
          <Loader2 />
        </span>
      )}
    </div>
  );
}
