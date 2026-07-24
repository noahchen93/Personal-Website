import React, { useState, useEffect } from 'react';
import { useContent, ImageItem } from '../content/ContentContext';
import UnifiedImage from '../shared/UnifiedImage';
import { imageService, URLValidator } from '../../utils/ImageService';

interface ImageRendererProps {
  content: string | undefined | null;
  className?: string;
}

interface ParsedContent {
  type: 'text' | 'image';
  content: string;
  imageData?: ImageItem;
  caption?: string; // 新增图说字段
}

export default function ImageRenderer({ content, className = '' }: ImageRendererProps) {
  const { getImages, getImageUrl } = useContent();
  const [parsedContent, setParsedContent] = useState<ParsedContent[]>([]);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [allImages, setAllImages] = useState<any[]>([]);

  useEffect(() => {
    loadImages();
  }, []);

  useEffect(() => {
    if (images.length > 0 && content) {
      parseContent();
    }
  }, [content, images]);

  const loadImages = async () => {
    try {
      const imageList = await getImages();
      setImages(imageList);
      setAllImages(imageList);
    } catch (error) {
      console.error('Error loading images for renderer:', error);
    }
  };

  const parseContent = () => {
    // Check if content exists and is a string
    if (!content || typeof content !== 'string') {
      setParsedContent([]);
      return;
    }

    // 匹配图片引用格式: {{image:id}} 或 {{image:id|caption}}
    const imageRegex = /\{\{image:([^|}]+)(?:\|([^}]*))?\}\}/g;
    const parts: ParsedContent[] = [];
    let lastIndex = 0;
    let match;

    while ((match = imageRegex.exec(content)) !== null) {
      // 添加匹配前的文本
      if (match.index > lastIndex) {
        const textContent = content.slice(lastIndex, match.index);
        if (textContent) {
          parts.push({
            type: 'text',
            content: textContent
          });
        }
      }

      // 添加图片
      const imageId = match[1];
      const caption = match[2]; // 可选的图说
      // 使用imageService来统一获取图片数据
      const imageData = images.find(img => img.id === imageId) || 
                       allImages.find(img => img.id === imageId);
      
      parts.push({
        type: 'image',
        content: imageId,
        imageData,
        caption: caption || undefined
      });

      lastIndex = match.index + match[0].length;
    }

    // 添加剩余的文本
    if (lastIndex < content.length) {
      const remainingContent = content.slice(lastIndex);
      if (remainingContent) {
        parts.push({
          type: 'text',
          content: remainingContent
        });
      }
    }

    setParsedContent(parts);
  };

  const renderTextWithFormatting = (text: string | undefined | null) => {
    // Add safety check for text parameter
    if (!text || typeof text !== 'string') {
      return null;
    }

    // 处理换行
    return text.split('\\n').map((line, index, array) => (
      <React.Fragment key={index}>
        {line}
        {index < array.length - 1 && <br />}
      </React.Fragment>
    ));
  };

  // Add safety check for content
  if (!content || typeof content !== 'string') {
    return <div className={className}></div>;
  }

  if (parsedContent.length === 0) {
    return <div className={className}>{renderTextWithFormatting(content)}</div>;
  }

  return (
    <div className={className}>
      {parsedContent.map((part, index) => (
        <React.Fragment key={index}>
          {part.type === 'text' ? (
            renderTextWithFormatting(part.content)
          ) : part.imageData ? (
            <div className="my-4">
              <UnifiedImage
                imageId={part.content}
                src={part.imageData.file_url}
                alt={part.imageData.alt_text || part.imageData.filename}
                className="max-w-full h-auto rounded-lg shadow-sm"
                lazy={false}
                showLoadingSpinner={true}
                allImages={allImages}
                getImageUrl={getImageUrl}
              />
              {/* 显示自定义图说或原有caption */}
              {(part.caption || part.imageData.caption) && (
                <p className="text-sm text-gray-500 mt-2 italic text-center leading-relaxed">
                  {part.caption || part.imageData.caption}
                </p>
              )}
            </div>
          ) : (
            <div className="my-4">
              {/* 即使没有找到imageData，也尝试使用UnifiedImage渲染 */}
              <UnifiedImage
                imageId={part.content}
                alt={part.caption || '图片'}
                className="max-w-full h-auto rounded-lg shadow-sm"
                lazy={false}
                showLoadingSpinner={true}
                allImages={allImages}
                getImageUrl={getImageUrl}
                placeholderText={part.caption || '图片加载中...'}
              />
              {part.caption && (
                <p className="text-sm text-gray-500 mt-2 italic text-center leading-relaxed">
                  {part.caption}
                </p>
              )}
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// 工具函数：从内容中提取所有图片引用
export const extractImageReferences = (content: string | undefined | null): string[] => {
  if (!content || typeof content !== 'string') {
    return [];
  }
  
  const imageRegex = /\{\{image:([^|}]+)(?:\|[^}]*)?\}\}/g;
  const references: string[] = [];
  let match;

  while ((match = imageRegex.exec(content)) !== null) {
    references.push(match[1]);
  }

  return references;
};

// 工具函数：检查内容是否包含图片引用
export const hasImageReferences = (content: string | undefined | null): boolean => {
  if (!content || typeof content !== 'string') {
    return false;
  }
  return /\{\{image:[^}]+\}\}/.test(content);
};

// 工具函数：替换图片引用为简单的占位符文本（用于纯文本导出）
export const stripImageReferences = (content: string | undefined | null): string => {
  if (!content || typeof content !== 'string') {
    return '';
  }
  return content.replace(/\{\{image:([^|}]+)(?:\|([^}]*))?\}\}/g, (match, id, caption) => {
    return caption ? `[图片: ${id} - ${caption}]` : `[图片: ${id}]`;
  });
};

// 新增工具函数：创建带图说的图片引用
export const createImageReference = (imageId: string, caption?: string): string => {
  return caption ? `{{image:${imageId}|${caption}}}` : `{{image:${imageId}}}`;
};