import { ImageItem } from '../components/content/ContentContext';

export interface ImageInfo {
  id: string;
  url: string;
  filename?: string;
  alt_text?: string;
  caption?: string;
  file_size?: number;
  file_type?: string;
}

export enum ImageStatus {
  LOADING = 'loading',
  LOADED = 'loaded',
  ERROR = 'error',
  PLACEHOLDER = 'placeholder'
}

export class URLValidator {
  private static readonly IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'];
  private static readonly VALID_PROTOCOLS = ['http:', 'https:', 'data:'];

  static isValidImageUrl(url: string): boolean {
    if (!url || typeof url !== 'string') return false;

    if (url.startsWith('/assets/')) {
      const pathname = url.split(/[?#]/, 1)[0].toLowerCase();
      return this.IMAGE_EXTENSIONS.some(ext => pathname.endsWith(`.${ext}`));
    }

    try {
      const urlObj = new URL(url);
      
      if (!this.VALID_PROTOCOLS.includes(urlObj.protocol)) return false;
      if (urlObj.protocol === 'data:') return url.startsWith('data:image/');
      
      // Allow common image hosting domains
      const trustedDomains = [
        'unsplash.com',
        'xyzcdn.net',
        'githubusercontent.com',
        'imgur.com',
        'cloudinary.com',
      ];
      
      if (trustedDomains.some(domain => urlObj.hostname.includes(domain))) {
        return true;
      }

      const pathname = urlObj.pathname.toLowerCase();
      
      return this.IMAGE_EXTENSIONS.some(ext => pathname.endsWith(`.${ext}`)) || 
             pathname.includes('/image') || 
             pathname.includes('/photo') ||
             pathname.includes('/media') ||
             pathname.includes('/assets');
    } catch {
      return false;
    }
  }

  static normalizeUrl(url: string): string {
    if (!url) return '';
    return url;
  }
}

export class PlaceholderGenerator {
  private static readonly COLORS = [
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#ec4899', '#f43f5e', '#ef4444', '#f97316', '#f59e0b'
  ];

  static generatePlaceholder(width = 400, height = 300, text = 'Image'): string {
    const color = this.COLORS[Math.floor(Math.random() * this.COLORS.length)];
    
    // Split text into multiple lines if it contains \n
    const lines = text.split('\n').filter(line => line.trim());
    const fontSize = Math.max(12, Math.min(16, width / 20));
    const lineHeight = fontSize * 1.2;
    const totalTextHeight = lines.length * lineHeight;
    const startY = (height - totalTextHeight) / 2 + fontSize;
    
    const textElements = lines.map((line, index) => 
      `<text x="50%" y="${startY + (index * lineHeight)}" text-anchor="middle" fill="white" font-family="monospace" font-size="${fontSize}">${line}</text>`
    ).join('');
    
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dots" patternUnits="userSpaceOnUse" width="20" height="20">
            <circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.1)"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="${color}"/>
        <rect width="100%" height="100%" fill="url(#dots)" opacity="0.3"/>
        <rect x="20" y="20" width="${width-40}" height="${height-40}" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2" stroke-dasharray="5,5" rx="8"/>
        ${textElements}
        <circle cx="${width/2}" cy="${height/2 - totalTextHeight/2 - 20}" r="8" fill="rgba(255,255,255,0.6)">
          <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite"/>
        </circle>
      </svg>
    `;
    
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  static generateErrorPlaceholder(width = 400, height = 300, errorType = 'loading_failed'): string {
    const errorColor = '#ef4444';
    const fontSize = Math.max(12, Math.min(16, width / 20));
    
    const errorMessages = {
      loading_failed: ['Image failed to load', 'Please try again later'],
      not_found: ['Image not found', 'The requested image is unavailable'],
      network_error: ['Network error', 'Please check your connection'],
      expired: ['Link expired', 'Please refresh the page'],
      unauthorized: ['Access denied', 'Image is not accessible']
    };
    
    const messages = errorMessages[errorType as keyof typeof errorMessages] || errorMessages.loading_failed;
    const lineHeight = fontSize * 1.2;
    const totalTextHeight = messages.length * lineHeight;
    const startY = (height - totalTextHeight) / 2 + fontSize;
    
    const textElements = messages.map((line, index) => 
      `<text x="50%" y="${startY + (index * lineHeight)}" text-anchor="middle" fill="white" font-family="monospace" font-size="${fontSize}">${line}</text>`
    ).join('');
    
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${errorColor}" opacity="0.8"/>
        <rect x="10" y="10" width="${width-20}" height="${height-20}" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1" rx="8"/>
        ${textElements}
        <g transform="translate(${width/2 - 12}, ${height/2 - totalTextHeight/2 - 30})">
          <path d="M12 9v2m0 4h.01M12 1L1 12l11 11 11-11L12 1z" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
      </svg>
    `;
    
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }
}

class ImageService {
  private cache = new Map<string, { url: string; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5分钟

  clearCache(): void {
    this.cache.clear();
  }

  private clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.CACHE_DURATION) {
        this.cache.delete(key);
      }
    }
  }

  getImageUrl(imageId: string, allImages: ImageItem[] = []): string {
    if (!imageId || typeof imageId !== 'string') return '';

    // 检查缓存 - 但对已知失败的图片减少缓存时间
    const cached = this.cache.get(imageId);
    if (cached) {
      const isPlaceholder = cached.url.startsWith('data:image/svg+xml');
      const cacheExpiry = isPlaceholder ? 60000 : this.CACHE_DURATION; // 占位符只缓存1分钟
      
      if ((Date.now() - cached.timestamp) < cacheExpiry) {
        return cached.url;
      }
    }

    this.clearExpiredCache();

    // 在图片列表中查找
    const image = allImages.find(img => img.id === imageId);
    if (image?.file_url) {
      const imageUrl = this.normalizeImageUrl(image.file_url, image.file_path);
      if (URLValidator.isValidImageUrl(imageUrl)) {
        console.log(`[ImageService] Found image in allImages for ID: ${imageId} -> ${imageUrl}`);
        this.cache.set(imageId, { url: imageUrl, timestamp: Date.now() });
        return imageUrl;
      }
    }

    // 静态站点仅接受本地资源路径或完整的图片 URL。
    if (URLValidator.isValidImageUrl(imageId)) {
      this.cache.set(imageId, { url: imageId, timestamp: Date.now() });
      return imageId;
    }

    // 返回占位符
    console.warn(`[ImageService] Could not resolve image URL for ID: ${imageId}, generating placeholder`);
    const placeholder = PlaceholderGenerator.generatePlaceholder(400, 300, `Image not found\nID: ${imageId.substring(0, 8)}...`);
    this.cache.set(imageId, { url: placeholder, timestamp: Date.now() });
    return placeholder;
  }

  private normalizeImageUrl(fileUrl: string, filePath?: string): string {
    if (!fileUrl) return '';

    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      return fileUrl;
    }

    if (fileUrl.startsWith('/')) return fileUrl;
    if (filePath?.startsWith('/')) return filePath;
    return `/${fileUrl.replace(/^\/+/, '')}`;
  }

  getUnifiedImageUrl(data: any, getImageUrlFn: (id: string) => string): string | null {
    if (!data) return null;

    // 检查各种可能的图片字段 - 扩展字段列表
    const imageFields = ['cover_image_id', 'image_id', 'coverImage', 'imageUrl', 'image', 'imageId', 'manualCoverImageId'];
    
    for (const field of imageFields) {
      if (!data[field]) continue;

      // 检查是否是直接的HTTP URL
      if (typeof data[field] === 'string' && data[field].startsWith('http') && URLValidator.isValidImageUrl(data[field])) {
        return data[field];
      }

      // 检查{{image:id}}格式
      const match = data[field].match(/^\{\{image:([^|}]+)\}\}$/);
      if (match) {
        const url = getImageUrlFn(match[1]);
        if (url && !url.startsWith('data:image/svg+xml')) {
          return url;
        }
      }

      // 尝试作为图片ID使用
      const url = getImageUrlFn(data[field]);
      if (url && !url.startsWith('data:image/svg+xml')) {
        return url;
      }
    }

    // 从内容中提取图片 - 增强提取逻辑
    if (data.content) {
      // 处理{{image:id}}格式
      const imagePattern = /\{\{image:([^|}]+)(\|[^}]*)?\}\}/g;
      const matches = data.content.matchAll(imagePattern);

      for (const match of matches) {
        const url = getImageUrlFn(match[1]);
        if (url && !url.startsWith('data:image/svg+xml')) {
          return url;
        }
      }

      // 处理标准markdown图片格式
      const markdownImagePattern = /!\[([^\]]*)\]\(([^)]+)\)/g;
      const markdownMatches = data.content.matchAll(markdownImagePattern);

      for (const match of markdownMatches) {
        const imageUrl = match[2];
        
        // 检查是否是{{image:id}}格式
        const imageIdMatch = imageUrl.match(/^\{\{image:([^}]+)\}\}$/);
        if (imageIdMatch) {
          const url = getImageUrlFn(imageIdMatch[1]);
          if (url && !url.startsWith('data:image/svg+xml')) {
            return url;
          }
        } else if (URLValidator.isValidImageUrl(imageUrl)) {
          return imageUrl;
        }
      }
    }

    return null;
  }

  async preloadImage(url: string): Promise<boolean> {
    if (!url || !URLValidator.isValidImageUrl(url)) return false;

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
      setTimeout(() => resolve(false), 5000);
    });
  }

  async refreshSignedUrl(imageId: string, getImageUrl?: (id: string) => string): Promise<string | null> {
    console.log(`[ImageService] Refreshing signed URL for image ID: ${imageId}`);
    
    // Clear the cached entry
    this.cache.delete(imageId);
    
    // Try to get a fresh URL
    if (getImageUrl) {
      try {
        const freshUrl = getImageUrl(imageId);
        if (freshUrl && !freshUrl.startsWith('data:image/svg+xml')) {
          console.log(`[ImageService] Got fresh URL for ${imageId}:`, freshUrl);
          this.cache.set(imageId, { url: freshUrl, timestamp: Date.now() });
          return freshUrl;
        }
      } catch (error) {
        console.warn(`[ImageService] Failed to refresh signed URL for ${imageId}:`, error);
      }
    }
    
    return null;
  }

  isUrlExpired(url: string): boolean {
    if (!url.includes('token=') && !url.includes('expires=')) {
      return false; // Not a signed URL
    }
    
    try {
      const urlObj = new URL(url);
      const tokenParam = urlObj.searchParams.get('token');
      
      if (tokenParam) {
        // Try to decode JWT token to check expiration
        try {
          const payload = JSON.parse(atob(tokenParam.split('.')[1]));
          const exp = payload.exp * 1000; // Convert to milliseconds
          return Date.now() > exp;
        } catch {
          // If we can't decode the token, assume it might be expired after 1 hour
          return false;
        }
      }
      
      const expiresParam = urlObj.searchParams.get('expires');
      if (expiresParam) {
        const expirationTime = parseInt(expiresParam) * 1000;
        return Date.now() > expirationTime;
      }
    } catch (error) {
      console.warn('[ImageService] Error checking URL expiration:', error);
    }
    
    return false;
  }

  getCacheInfo(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }
}

export const imageService = new ImageService();
export { ImageService };
