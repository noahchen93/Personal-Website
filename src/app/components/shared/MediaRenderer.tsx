import React, { useMemo, useEffect, useState, useCallback } from 'react';
import UnifiedImage from './UnifiedImage';
import { useContent } from '../content/ContentContext';
import { imageService } from '../../utils/ImageService';

interface MediaRendererProps {
  content: string;
  className?: string;
  imageClassName?: string;
  lazy?: boolean;
  showImageSpinner?: boolean;
  maxImageWidth?: number;
  maxImageHeight?: number;
}

const MediaRenderer: React.FC<MediaRendererProps> = ({
  content,
  className = '',
  imageClassName = '',
  lazy = true,
  showImageSpinner = false,
  maxImageWidth,
  maxImageHeight
}) => {
  const { getImageUrl, getImages } = useContent();
  const [allImages, setAllImages] = useState<any[]>([]);
  const [imageLoadKey, setImageLoadKey] = useState(0);

  // 优化图片数据加载 - 减少频繁更新
  useEffect(() => {
    let isMounted = true;
    
    const loadImages = async () => {
      try {
        const images = await getImages();
        if (isMounted && images.length > 0) {
          setAllImages(prevImages => {
            // 只有在图片数据真正不同时才更新
            const prevIds = prevImages.map(img => img.id).sort().join(',');
            const newIds = images.map(img => img.id).sort().join(',');
            
            if (prevIds !== newIds) {
              console.log('[MediaRenderer] Images updated, triggering re-render');
              setImageLoadKey(prev => prev + 1);
              return images;
            }
            return prevImages;
          });
        }
      } catch (error) {
        console.error('[MediaRenderer] Failed to load images:', error);
      }
    };
    
    // 只在组件首次挂载时加载图片
    if (allImages.length === 0) {
      loadImages();
    }

    return () => {
      isMounted = false;
    };
  }, [getImages]); // 移除lastUpdateTimestamp依赖

  // 稳定的图片URL获取函数
  const getStableImageUrl = useCallback((imageId: string): string => {
    if (!imageId) return '';
    
    // 1. 首先在allImages中查找
    const imageData = allImages.find(img => img.id === imageId);
    if (imageData && imageData.file_url) {
      if (
        imageData.file_url.startsWith('http://') ||
        imageData.file_url.startsWith('https://') ||
        imageData.file_url.startsWith('data:') ||
        imageData.file_url.startsWith('blob:')
      ) {
        return imageData.file_url;
      }

      // 本地静态资源必须保留相对路径。旧逻辑会把
      // /assets/... 错误地转换成 https://assets/...。
      return imageData.file_url.startsWith('/')
        ? imageData.file_url
        : `/${imageData.file_url}`;
    }
    
    // 2. 使用getImageUrl作为备选
    return getImageUrl(imageId);
  }, [allImages, getImageUrl]);

  // 新增：Markdown表格解析函数
  const parseMarkdownTables = useCallback((text: string): string => {
    // 匹配Markdown表格的正则表达式
    const tableRegex = /^\|(.+)\|\s*\n\|([:\-\s|]+)\|\s*\n((?:\|.*\|\s*\n?)*)/gm;
    
    return text.replace(tableRegex, (match, headerRow, separatorRow, bodyRows) => {
      try {
        // 解析表头
        const headers = headerRow.split('|').map(h => h.trim()).filter(h => h !== '');
        
        // 检查分隔符行（确保是有效的表格）
        const separators = separatorRow.split('|').map(s => s.trim()).filter(s => s !== '');
        if (separators.length !== headers.length || !separators.every(s => /^:?-+:?$/.test(s))) {
          return match; // 不是有效的表格，返回原文
        }
        
        // 解析对齐方式
        const alignments = separators.map(sep => {
          if (sep.startsWith(':') && sep.endsWith(':')) return 'center';
          if (sep.endsWith(':')) return 'right';
          return 'left';
        });
        
        // 解析表格行
        const rows = bodyRows.trim().split('\n').map(row => {
          if (!row.trim()) return null;
          return row.split('|').map(cell => cell.trim()).filter((cell, index, arr) => {
            // 过滤掉首尾的空单元格（由于分割|产生的）
            return !(index === 0 && cell === '') && !(index === arr.length - 1 && cell === '');
          });
        }).filter(row => row !== null);
        
        // 生成HTML表格
        let tableHtml = `
          <div class="table-container" style="
            overflow-x: auto !important;
            margin: 1.5rem 0 !important;
            border-radius: 0.75rem !important;
            border: 1px solid #374151 !important;
            background: rgba(0, 0, 0, 0.3) !important;
            backdrop-filter: blur(8px) !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
          ">
            <table style="
              width: 100% !important;
              border-collapse: collapse !important;
              margin: 0 !important;
              font-family: var(--font-terminal) !important;
              font-size: var(--font-size-small) !important;
            ">
              <thead style="
                background: rgba(59, 130, 246, 0.2) !important;
                border-bottom: 2px solid #374151 !important;
              ">
                <tr style="border-bottom: 1px solid #374151 !important;">
        `;
        
        // 生成表头
        headers.forEach((header, index) => {
          const alignment = alignments[index] || 'left';
          tableHtml += `
            <th style="
              color: #ffffff !important;
              font-weight: var(--font-weight-medium) !important;
              padding: 0.75rem !important;
              text-align: ${alignment} !important;
              background: rgba(59, 130, 246, 0.15) !important;
              border-right: 1px solid #374151 !important;
              font-family: var(--font-terminal) !important;
              font-size: var(--font-size-small) !important;
            ">${header}</th>
          `;
        });
        
        tableHtml += '</tr></thead><tbody>';
        
        // 生成表格行
        rows.forEach(row => {
          if (row && row.length > 0) {
            tableHtml += '<tr style="border-bottom: 1px solid #374151 !important;">';
            row.forEach((cell, index) => {
              const alignment = alignments[index] || 'left';
              tableHtml += `
                <td style="
                  color: #fbbf24 !important;
                  padding: 0.75rem !important;
                  border-right: 1px solid #374151 !important;
                  vertical-align: top !important;
                  text-align: ${alignment} !important;
                  font-family: var(--font-terminal) !important;
                  font-size: var(--font-size-small) !important;
                  line-height: var(--line-height-normal) !important;
                ">${cell || ''}</td>
              `;
            });
            tableHtml += '</tr>';
          }
        });
        
        tableHtml += '</tbody></table></div>';
        
        return tableHtml;
      } catch (error) {
        console.error('[MediaRenderer] Table parsing error:', error);
        return match; // 解析失败时返回原文
      }
    });
  }, []);

  // 优化内容处理 - 增加表格解析，保持其他功能不变
  const processedContent = useMemo(() => {
    if (!content || typeof content !== 'string') return content;

    let processedText = content;

    // 新增：首先处理Markdown表格
    processedText = parseMarkdownTables(processedText);

    // 保持原有的{{image:id}}格式处理 - 修复caption默认值问题
    processedText = processedText.replace(/\{\{image:([^}|]+)(\|[^}]*)?\}\}/g, (match, imageId, captionPart) => {
      // 提取图片说明（如果有）
      const caption = captionPart ? captionPart.substring(1).trim() : '';
      
      // 获取图片URL
      const imageUrl = getStableImageUrl(imageId);
      
      if (imageUrl && !imageUrl.includes('data:image/svg+xml')) {
        // 构建完整的img标签，包含必要的样式
        const imgStyle = `
          display: block !important;
          margin: 1.5rem auto !important;
          max-width: 100% !important;
          height: auto !important;
          object-fit: contain !important;
          object-position: center !important;
          border-radius: 0.5rem !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
        `;
        
        // 修复：只有在用户提供了caption时才设置alt，否则使用空字符串
        let imgTag = `<img src="${imageUrl}" alt="${caption}" class="rendered-image ${imageClassName}" loading="${lazy ? 'lazy' : 'eager'}" style="${imgStyle}" />`;
        
        // 如果有说明文字，包装在figure中
        if (caption) {
          imgTag = `
            <figure style="display: block !important; margin: 1.5rem auto !important; text-align: center !important;">
              ${imgTag}
              <figcaption style="color: #60a5fa !important; font-size: var(--font-size-small) !important; font-style: italic !important; text-align: center !important; margin-top: 0.5rem !important;">
                ${caption}
              </figcaption>
            </figure>
          `;
        }
        
        return imgTag;
      } else {
        // 图片加载失败时的占位符
        return `
          <div class="image-placeholder ${imageClassName}" style="
            background: linear-gradient(135deg, rgba(249, 115, 22, 0.2) 0%, rgba(251, 146, 60, 0.15) 100%);
            border: 1px solid rgba(249, 115, 22, 0.4);
            border-radius: 0.5rem;
            padding: 2rem;
            text-align: center;
            color: #fed7aa;
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 1.5rem auto;
            min-height: 120px;
            backdrop-filter: blur(8px);
          ">
            <div>
              <div style="margin-bottom: 0.5rem;">📷</div>
              <div style="font-size: var(--font-size-small);">图片ID: ${imageId}</div>
              ${caption ? `<div style="font-size: var(--font-size-small); margin-top: 0.25rem; opacity: 0.8;">${caption}</div>` : ''}
              <div style="font-size: var(--font-size-small); opacity: 0.6; margin-top: 0.25rem;">加载中...</div>
            </div>
          </div>
        `;
      }
    });

    // 保持原有的标准Markdown图片格式处理 - 修复alt默认值问题
    processedText = processedText.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, url) => {
      let finalUrl = url;
      
      // 检查URL是否是{{image:id}}格式
      const imageIdMatch = url.match(/^\{\{image:([^}]+)\}\}$/);
      if (imageIdMatch) {
        finalUrl = getStableImageUrl(imageIdMatch[1]);
      }
      
      if (finalUrl && !finalUrl.includes('data:image/svg+xml')) {
        const imgStyle = `
          display: block !important;
          margin: 1.5rem auto !important;
          max-width: 100% !important;
          height: auto !important;
          object-fit: contain !important;
          object-position: center !important;
          border-radius: 0.5rem !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
        `;
        
        // 修复：只使用用户提供的alt文本，不添加默认值
        const altText = alt.trim();
        return `<img src="${finalUrl}" alt="${altText}" class="rendered-image ${imageClassName}" loading="${lazy ? 'lazy' : 'eager'}" style="${imgStyle}" />`;
      } else {
        return `
          <div class="image-placeholder ${imageClassName}" style="
            background: linear-gradient(135deg, rgba(249, 115, 22, 0.2) 0%, rgba(251, 146, 60, 0.15) 100%);
            border: 1px solid rgba(249, 115, 22, 0.4);
            border-radius: 0.5rem;
            padding: 2rem;
            text-align: center;
            color: #fed7aa;
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 1.5rem auto;
            min-height: 120px;
            backdrop-filter: blur(8px);
          ">
            <div>
              <div style="margin-bottom: 0.5rem;">📷</div>
              <div style="font-size: var(--font-size-small);">${alt.trim() || '图片'}</div>
              <div style="font-size: var(--font-size-small); opacity: 0.6; margin-top: 0.25rem;">加载中...</div>
            </div>
          </div>
        `;
      }
    });

    // 保持原有的HTML img标签处理 - 修复alt默认值问题
    processedText = processedText.replace(/<img([^>]*)>/g, (match, attributes) => {
      const srcMatch = attributes.match(/src=["']([^"']+)["']/);
      const altMatch = attributes.match(/alt=["']([^"']*)["']/);
      const classMatch = attributes.match(/class=["']([^"']*)["']/);
      
      if (srcMatch) {
        let src = srcMatch[1];
        const alt = altMatch ? altMatch[1] : ''; // 修复：不添加默认的'Image'文本
        const existingClasses = classMatch ? classMatch[1] : '';
        
        // 检查src是否是{{image:id}}格式
        const imageIdMatch = src.match(/^\{\{image:([^}]+)\}\}$/);
        if (imageIdMatch) {
          src = getStableImageUrl(imageIdMatch[1]);
        }
        
        if (src && !src.includes('data:image/svg+xml')) {
          const finalClasses = [existingClasses, 'rendered-image', imageClassName].filter(Boolean).join(' ');
          const imgStyle = `
            display: block !important;
            margin: 1.5rem auto !important;
            max-width: 100% !important;
            height: auto !important;
            object-fit: contain !important;
            object-position: center !important;
            border-radius: 0.5rem !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
          `;
          
          return `<img src="${src}" alt="${alt}" class="${finalClasses}" loading="${lazy ? 'lazy' : 'eager'}" style="${imgStyle}" />`;
        } else {
          return `
            <div class="image-placeholder ${existingClasses} ${imageClassName}" style="
              background: linear-gradient(135deg, rgba(249, 115, 22, 0.2) 0%, rgba(251, 146, 60, 0.15) 100%);
              border: 1px solid rgba(249, 115, 22, 0.4);
              border-radius: 0.5rem;
              padding: 2rem;
              text-align: center;
              color: #fed7aa;
              display: flex;
              justify-content: center;
              align-items: center;
              margin: 1.5rem auto;
              min-height: 120px;
              backdrop-filter: blur(8px);
            ">
              <div>
                <div style="margin-bottom: 0.5rem;">📷</div>
                <div style="font-size: var(--font-size-small);">${alt || '图片'}</div>
                <div style="font-size: var(--font-size-small); opacity: 0.6; margin-top: 0.25rem;">加载中...</div>
              </div>
            </div>
          `;
        }
      }
      
      return match;
    });

    return processedText;
  }, [content, getStableImageUrl, imageClassName, lazy, imageLoadKey, parseMarkdownTables]); // 添加parseMarkdownTables到依赖项

  // 检查是否包含HTML标签
  const containsHTML = /<[^>]+>/.test(processedContent);

  if (containsHTML) {
    return (
      <div 
        className={`media-renderer terminal-content ${className}`}
        dangerouslySetInnerHTML={{ __html: processedContent }}
      />
    );
  }

  // 纯文本处理
  const lines = processedContent.split('\n').map((line, index) => (
    <React.Fragment key={index}>
      {line}
      {index < processedContent.split('\n').length - 1 && <br />}
    </React.Fragment>
  ));

  return (
    <div className={`media-renderer terminal-content ${className}`}>
      {lines}
    </div>
  );
};

export default MediaRenderer;
