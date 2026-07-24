import React from 'react';
import MediaRenderer from './MediaRenderer';

interface ColumnRendererProps {
  content: string;
  className?: string;
}

interface Column {
  width: string;
  content: string;
}

interface ColumnLayout {
  layout: string;
  columns: Column[];
}

export default function ColumnRenderer({ content, className = '' }: ColumnRendererProps) {
  // 解析分栏语法
  const parseColumns = (text: string): string => {
    return text.replace(
      /\[columns layout="([^"]+)"\]([\s\S]*?)\[\/columns\]/g,
      (match, layout, columnContent) => {
        // 解析每个列
        const columnMatches = columnContent.match(/\[column width="([^"]+)"\]([\s\S]*?)\[\/column\]/g);
        if (!columnMatches) return match;

        const columns = columnMatches.map(colMatch => {
          const widthMatch = colMatch.match(/\[column width="([^"]+)"\]/);
          const contentMatch = colMatch.replace(/\[column width="[^"]+"\]([\s\S]*?)\[\/column\]/, '$1').trim();
          
          return {
            width: widthMatch ? widthMatch[1] : '1',
            content: contentMatch
          };
        });

        // 生成响应式网格类
        const gridClass = getGridClass(layout, columns.length);
        
        // 创建列HTML
        const columnsHtml = columns.map((col, index) => {
          const colClass = getColumnClass(col.width, columns.length);
          return `<div class="${colClass} space-y-4">${processColumnContent(col.content)}</div>`;
        }).join('');

        return `<div class="${gridClass} gap-6 my-6">${columnsHtml}</div>`;
      }
    );
  };

  // 获取网格类
  const getGridClass = (layout: string, columnCount: number): string => {
    // 响应式网格类
    const baseClass = 'grid';
    const responsiveClass = columnCount > 2 ? 'grid-cols-1 md:grid-cols-2 lg:' : 'grid-cols-1 md:';
    
    if (layout.includes('grid-cols-')) {
      return `${baseClass} ${responsiveClass}${layout}`;
    }
    
    // 根据列数返回默认网格
    switch (columnCount) {
      case 2: return `${baseClass} ${responsiveClass}grid-cols-2`;
      case 3: return `${baseClass} ${responsiveClass}grid-cols-3`;
      case 4: return `${baseClass} grid-cols-1 md:grid-cols-2 lg:grid-cols-4`;
      default: return `${baseClass} ${responsiveClass}grid-cols-2`;
    }
  };

  // 获取列类
  const getColumnClass = (width: string, totalColumns: number): string => {
    const widthNum = parseInt(width) || 1;
    
    // 响应式列跨度
    if (totalColumns > 2) {
      return `col-span-1 md:col-span-1 lg:col-span-${widthNum}`;
    } else {
      return `col-span-1 md:col-span-${widthNum}`;
    }
  };

  // 处理列内容
  const processColumnContent = (content: string): string => {
    // 处理图片引用
    let processedContent = content.replace(
      /\{\{image:([^}]+)\}\}/g,
      '<div class="my-4"><img src="/api/images/$1" alt="Image" class="w-full rounded-lg shadow-sm" loading="lazy" /></div>'
    );

    // 处理基本markdown
    processedContent = processedContent
      // 标题
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-medium text-gray-800 mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-medium text-gray-800 mt-6 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-medium text-gray-900 mt-6 mb-4">$1</h1>')
      // 粗体
      .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-medium">$1</strong>')
      // 斜体
      .replace(/\*(.*?)\*/gim, '<em class="italic">$1</em>')
      // 代码
      .replace(/`([^`]*)`/gim, '<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono">$1</code>')
      // 链接
      .replace(/\[([^\]]*)\]\(([^)]*)\)/gim, '<a href="$2" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">$1</a>')
      // 无序列表
      .replace(/^- (.*$)/gim, '<li class="ml-4">$1</li>')
      // 包装列表项
      .replace(/(<li class="ml-4">.*<\/li>)/s, '<ul class="list-disc list-inside space-y-1 my-2">$1</ul>')
      // 引用
      .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4">$1</blockquote>')
      // 段落处理 - 将连续的文本行包装成段落
      .replace(/^(?!<[^>]+>|$)(.+)$/gim, '<p class="mb-3 leading-relaxed">$1</p>')
      // 清理多余的换行
      .replace(/\n\s*\n/g, '\n')
      .replace(/\n/g, ' ');

    return processedContent;
  };

  // 渲染内容
  const renderContent = () => {
    const processedContent = parseColumns(content);
    
    return (
      <div 
        className={`prose prose-gray max-w-none ${className}`}
        dangerouslySetInnerHTML={{ __html: processedContent }}
      />
    );
  };

  return renderContent();
}