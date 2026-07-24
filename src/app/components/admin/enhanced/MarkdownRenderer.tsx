import React, { useMemo, useCallback, useRef, useEffect } from 'react';
import { useContent } from '../../content/ContentContext';
import { useLanguage } from '../../language/LanguageContext';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  maxLength?: number;
  allowHtml?: boolean;
  enableColumns?: boolean;
  enableMedia?: boolean;
  enableTasks?: boolean;
  enableTables?: boolean;
  enableCodeBlocks?: boolean;
  enableMath?: boolean;
  sanitizeContent?: boolean;
  onError?: (error: Error, content: string) => void;
  fallbackContent?: string;
}

interface ParsedElement {
  type: string;
  content: string;
  attributes?: Record<string, any>;
  children?: ParsedElement[];
  metadata?: Record<string, any>;
}

interface RenderOptions {
  allowHtml: boolean;
  enableColumns: boolean;
  enableMedia: boolean;
  enableTasks: boolean;
  enableTables: boolean;
  enableCodeBlocks: boolean;
  enableMath: boolean;
  sanitizeContent: boolean;
}

// 安全的HTML清理函数
const sanitizeHtml = (html: string): string => {
  if (typeof DOMParser === 'undefined') return html;
  
  try {
    const allowedTags = [
      'p', 'br', 'strong', 'em', 'u', 'del', 'ins', 'mark',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'dl', 'dt', 'dd',
      'blockquote', 'pre', 'code', 'span', 'div',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'a', 'img', 'figure', 'figcaption',
      'hr', 'sup', 'sub', 'small'
    ];
    
    const allowedAttributes = {
      'a': ['href', 'title', 'target', 'rel'],
      'img': ['src', 'alt', 'title', 'width', 'height', 'loading'],
      'code': ['class'],
      'pre': ['class'],
      'table': ['class'],
      'th': ['scope', 'colspan', 'rowspan'],
      'td': ['colspan', 'rowspan'],
      'input': ['type', 'checked', 'disabled'],
      '*': ['class', 'id', 'data-*']
    };

    const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html');
    const container = doc.querySelector('div');
    
    if (!container) return '';

    const cleanElement = (element: Element): void => {
      const tagName = element.tagName.toLowerCase();
      
      // 移除不允许的标签
      if (!allowedTags.includes(tagName)) {
        element.replaceWith(...Array.from(element.childNodes));
        return;
      }
      
      // 清理属性
      const allowedAttrs = allowedAttributes[tagName] || allowedAttributes['*'] || [];
      const attrs = Array.from(element.attributes);
      
      attrs.forEach(attr => {
        const attrName = attr.name.toLowerCase();
        const isDataAttr = attrName.startsWith('data-');
        const isAllowed = allowedAttrs.includes(attrName) || 
                         allowedAttrs.includes('*') || 
                         (allowedAttrs.includes('data-*') && isDataAttr);
        
        if (!isAllowed) {
          element.removeAttribute(attr.name);
        }
      });
      
      // 递归清理子元素
      Array.from(element.children).forEach(cleanElement);
    };
    
    Array.from(container.children).forEach(cleanElement);
    return container.innerHTML;
  } catch (error) {
    console.warn('HTML sanitization failed, returning plain text:', error);
    return html.replace(/<[^>]*>/g, '');
  }
};

// 增强的markdown解析器
class MarkdownParser {
  private options: RenderOptions;
  private getImageUrl: (id: string) => string | null;
  private errorHandler?: (error: Error, content: string) => void;
  
  constructor(
    options: RenderOptions, 
    getImageUrl: (id: string) => string | null,
    errorHandler?: (error: Error, content: string) => void
  ) {
    this.options = options;
    this.getImageUrl = getImageUrl;
    this.errorHandler = errorHandler;
  }

  // 安全的正则表达式匹配
  private safeRegexMatch(pattern: RegExp, text: string, maxMatches = 1000): RegExpMatchArray[] {
    try {
      const matches: RegExpMatchArray[] = [];
      let match;
      let count = 0;
      
      // 重置正则表达式状态
      pattern.lastIndex = 0;
      
      while ((match = pattern.exec(text)) !== null && count < maxMatches) {
        matches.push(match);
        count++;
        
        // 防止无限循环
        if (!pattern.global) break;
        if (match.index === pattern.lastIndex) {
          pattern.lastIndex++;
        }
      }
      
      return matches;
    } catch (error) {
      if (this.errorHandler) {
        this.errorHandler(new Error(`Regex matching failed: ${error}`), text);
      }
      return [];
    }
  }

  // 解析内联元素
  private parseInlineElements(text: string): string {
    if (!text || typeof text !== 'string') return '';
    
    try {
      let result = text;
      
      // 转义HTML特殊字符
      if (!this.options.allowHtml) {
        result = result
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
      }
      
      // GFM删除线 - 最高优先级，避免与其他语法冲突
      result = result.replace(/~~((?:(?!~~).)+?)~~/g, '<del class="line-through text-gray-400">$1</del>');
      
      // 粗体 - 支持** 和 __
      result = result.replace(/\*\*(?!\s)((?:(?!\*\*).)+?)(?<!\s)\*\*/g, '<strong class="font-medium text-yellow-300">$1</strong>');
      result = result.replace(/__(?!\s)((?:(?!__).)+?)(?<!\s)__/g, '<strong class="font-medium text-yellow-300">$1</strong>');
      
      // 斜体 - 支持* 和 _，但避免与粗体冲突
      result = result.replace(/\*(?!\*)(?!\s)((?:(?!\*).)+?)(?<!\s)\*(?!\*)/g, '<em class="italic text-yellow-200">$1</em>');
      result = result.replace(/_(?!_)(?!\s)((?:(?!_).)+?)(?<!\s)_(?!_)/g, '<em class="italic text-yellow-200">$1</em>');
      
      // 行内代码
      result = result.replace(/`([^`]+?)`/g, '<code class="bg-black/50 px-2 py-1 rounded text-sm font-mono text-green-400 border border-gray-600">$1</code>');
      
      // 链接 - 支持标准markdown和GFM自动链接
      result = result.replace(/\[([^\]]*?)\]\(([^)]+?)\)/g, '<a href="$2" class="text-blue-400 hover:text-blue-300 underline break-words" target="_blank" rel="noopener noreferrer">$1</a>');
      
      // GFM自动链接 - 更精确的URL匹配
      if (this.options.allowHtml) {
        result = result.replace(
          /(?<!href=["'])(https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&=\/]*))/g,
          '<a href="$1" class="text-blue-400 hover:text-blue-300 underline break-words" target="_blank" rel="noopener noreferrer">$1</a>'
        );
      }
      
      // 上标和下标
      result = result.replace(/\^([^\s^]+)\^/g, '<sup class="text-xs">$1</sup>');
      result = result.replace(/~([^\s~]+)~/g, '<sub class="text-xs">$1</sub>');
      
      // 高亮标记
      result = result.replace(/==([^=]+)==/g, '<mark class="bg-yellow-300 text-black px-1 rounded">$1</mark>');
      
      return result;
    } catch (error) {
      if (this.errorHandler) {
        this.errorHandler(new Error(`Inline parsing failed: ${error}`), text);
      }
      return text;
    }
  }

  // 解析块级元素
  private parseBlockElements(text: string): string {
    if (!text || typeof text !== 'string') return '';
    
    try {
      let result = text;
      
      // 预处理 - 标准化换行符
      result = result.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      
      // 代码块 - 最高优先级处理
      if (this.options.enableCodeBlocks) {
        const codeBlockMatches = this.safeRegexMatch(/```(\w*)\n?([\s\S]*?)```/g, result);
        codeBlockMatches.reverse().forEach(match => {
          const [fullMatch, language, code] = match;
          const index = match.index || 0;
          const langClass = language ? `language-${language}` : '';
          const codeHtml = `<pre class="bg-black/80 p-4 rounded-lg overflow-x-auto my-4 border border-gray-700 ${langClass}"><code class="text-sm font-mono text-green-400">${this.escapeHtml(code.trim())}</code></pre>`;
          result = result.substring(0, index) + codeHtml + result.substring(index + fullMatch.length);
        });
      }
      
      // 表格处理
      if (this.options.enableTables) {
        result = this.parseTables(result);
      }
      
      // 任务列表
      if (this.options.enableTasks) {
        result = this.parseTaskLists(result);
      }
      
      // 分栏处理
      if (this.options.enableColumns) {
        result = this.parseColumns(result);
      }
      
      // 媒体处理
      if (this.options.enableMedia) {
        result = this.parseMedia(result);
      }
      
      // 标题处理 - 支持ATX和Setext样式
      result = result.replace(/^#{6}\s+(.+)$/gm, '<h6 class="text-medium font-medium mb-2 text-white">$1</h6>');
      result = result.replace(/^#{5}\s+(.+)$/gm, '<h5 class="text-medium font-medium mb-2 text-white">$1</h5>');
      result = result.replace(/^#{4}\s+(.+)$/gm, '<h4 class="text-medium font-medium mb-3 text-white">$1</h4>');
      result = result.replace(/^#{3}\s+(.+)$/gm, '<h3 class="text-lg font-medium mb-3 text-white">$1</h3>');
      result = result.replace(/^#{2}\s+(.+)$/gm, '<h2 class="text-xl font-medium mb-4 text-white">$1</h2>');
      result = result.replace(/^#{1}\s+(.+)$/gm, '<h1 class="text-2xl font-medium mb-4 text-white">$1</h1>');
      
      // Setext样式标题
      result = result.replace(/^(.+)\n=+$/gm, '<h1 class="text-2xl font-medium mb-4 text-white">$1</h1>');
      result = result.replace(/^(.+)\n-+$/gm, '<h2 class="text-xl font-medium mb-4 text-white">$2</h2>');
      
      // 水平分割线
      result = result.replace(/^\s*(-{3,}|\*{3,}|_{3,})\s*$/gm, '<hr class="border-t border-gray-600 my-6" />');
      
      // 引用块 - 支持嵌套
      result = this.parseBlockquotes(result);
      
      // 列表处理 - 支持嵌套和混合
      result = this.parseLists(result);
      
      // 段落处理
      result = this.parseParagraphs(result);
      
      return result;
    } catch (error) {
      if (this.errorHandler) {
        this.errorHandler(new Error(`Block parsing failed: ${error}`), text);
      }
      return text;
    }
  }

  // 解析表格
  private parseTables(text: string): string {
    try {
      const tableRegex = /^\|(.+)\|\s*\n\|[\s\-:|]+\|\s*\n((?:\|.+\|\s*\n?)*)/gm;
      const matches = this.safeRegexMatch(tableRegex, text);
      
      matches.reverse().forEach(match => {
        const [fullMatch, header, rows] = match;
        const index = match.index || 0;
        
        try {
          const headerCells = header.split('|')
            .filter(cell => cell.trim())
            .map(cell => `<th class="border border-gray-600 px-4 py-2 bg-gray-800 font-medium text-left text-white">${this.parseInlineElements(cell.trim())}</th>`)
            .join('');
          
          const bodyRows = rows.split('\n')
            .filter(row => row.trim() && row.includes('|'))
            .map(row => {
              const cells = row.replace(/^\||\|$/g, '').split('|')
                .map(cell => `<td class="border border-gray-600 px-4 py-2 text-yellow-200">${this.parseInlineElements(cell.trim())}</td>`)
                .join('');
              return `<tr>${cells}</tr>`;
            }).join('');

          const tableHtml = `<div class="overflow-x-auto my-4">
            <table class="min-w-full border-collapse border border-gray-600 text-sm bg-gray-900/50 rounded-lg overflow-hidden">
              <thead><tr>${headerCells}</tr></thead>
              <tbody>${bodyRows}</tbody>
            </table>
          </div>`;
          
          text = text.substring(0, index) + tableHtml + text.substring(index + fullMatch.length);
        } catch (tableError) {
          console.warn('Table parsing error:', tableError);
          // 保留原始文本
        }
      });
      
      return text;
    } catch (error) {
      if (this.errorHandler) {
        this.errorHandler(new Error(`Table parsing failed: ${error}`), text);
      }
      return text;
    }
  }

  // 解析任务列表
  private parseTaskLists(text: string): string {
    try {
      // 已完成任务
      text = text.replace(/^(\s*)-\s+\[x\]\s+(.+)$/gm, 
        '$1<div class="flex items-center mb-2"><input type="checkbox" checked disabled class="mr-2 text-green-500 rounded" /><span class="line-through text-gray-400">$2</span></div>');
      
      // 未完成任务
      text = text.replace(/^(\s*)-\s+\[\s\]\s+(.+)$/gm, 
        '$1<div class="flex items-center mb-2"><input type="checkbox" disabled class="mr-2 text-blue-500 rounded" /><span class="text-yellow-200">$2</span></div>');
      
      return text;
    } catch (error) {
      if (this.errorHandler) {
        this.errorHandler(new Error(`Task list parsing failed: ${error}`), text);
      }
      return text;
    }
  }

  // 解析引用块
  private parseBlockquotes(text: string): string {
    try {
      const lines = text.split('\n');
      const result: string[] = [];
      let inBlockquote = false;
      let blockquoteContent: string[] = [];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const isQuoteLine = /^\s*>\s?/.test(line);
        
        if (isQuoteLine) {
          if (!inBlockquote) {
            inBlockquote = true;
            blockquoteContent = [];
          }
          blockquoteContent.push(line.replace(/^\s*>\s?/, ''));
        } else {
          if (inBlockquote) {
            const quotedText = this.parseInlineElements(blockquoteContent.join('\n'));
            result.push(`<blockquote class="border-l-4 border-green-400 pl-4 italic text-yellow-300 my-3 bg-gray-900/50 py-2 rounded-r">${quotedText}</blockquote>`);
            inBlockquote = false;
          }
          result.push(line);
        }
      }
      
      // 处理结尾的引用
      if (inBlockquote) {
        const quotedText = this.parseInlineElements(blockquoteContent.join('\n'));
        result.push(`<blockquote class="border-l-4 border-green-400 pl-4 italic text-yellow-300 my-3 bg-gray-900/50 py-2 rounded-r">${quotedText}</blockquote>`);
      }
      
      return result.join('\n');
    } catch (error) {
      if (this.errorHandler) {
        this.errorHandler(new Error(`Blockquote parsing failed: ${error}`), text);
      }
      return text;
    }
  }

  // 解析列表
  private parseLists(text: string): string {
    try {
      const lines = text.split('\n');
      const result: string[] = [];
      let inList = false;
      let listItems: string[] = [];
      let listType: 'ul' | 'ol' | null = null;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const unorderedMatch = line.match(/^(\s*)([-*+])\s+(.+)$/);
        const orderedMatch = line.match(/^(\s*)(\d+\.)\s+(.+)$/);
        
        if (unorderedMatch || orderedMatch) {
          const match = unorderedMatch || orderedMatch;
          const [, indent, marker, content] = match!;
          const currentType = orderedMatch ? 'ol' : 'ul';
          
          if (!inList || listType !== currentType) {
            if (inList) {
              result.push(this.buildList(listItems, listType!));
            }
            inList = true;
            listType = currentType;
            listItems = [];
          }
          
          listItems.push(`<li class="ml-4 mb-1 text-yellow-200 marker:text-green-400">${this.parseInlineElements(content)}</li>`);
        } else {
          if (inList) {
            result.push(this.buildList(listItems, listType!));
            inList = false;
            listType = null;
            listItems = [];
          }
          result.push(line);
        }
      }
      
      // 处理结尾的列表
      if (inList) {
        result.push(this.buildList(listItems, listType!));
      }
      
      return result.join('\n');
    } catch (error) {
      if (this.errorHandler) {
        this.errorHandler(new Error(`List parsing failed: ${error}`), text);
      }
      return text;
    }
  }

  // 构建列表HTML
  private buildList(items: string[], type: 'ul' | 'ol'): string {
    const listClass = type === 'ol' 
      ? 'list-decimal list-inside space-y-1 my-4 text-yellow-200 marker:text-green-400'
      : 'list-disc list-inside space-y-1 my-4 text-yellow-200 marker:text-green-400';
    
    return `<${type} class="${listClass}">${items.join('')}</${type}>`;
  }

  // 解析分栏
  private parseColumns(text: string): string {
    try {
      const columnRegex = /\[columns\s+layout="([^"]+)"\]([\s\S]*?)\[\/columns\]/g;
      const matches = this.safeRegexMatch(columnRegex, text);
      
      matches.reverse().forEach(match => {
        const [fullMatch, layout, content] = match;
        const index = match.index || 0;
        
        try {
          const columnMatches = this.safeRegexMatch(/\[column\s+width="([^"]+)"\]([\s\S]*?)\[\/column\]/g, content);
          
          if (columnMatches.length > 0) {
            const columns = columnMatches.map(colMatch => {
              const [, width, colContent] = colMatch;
              return `<div class="col-span-${Math.min(parseInt(width) || 1, 12)} space-y-4">${this.parseBlockElements(colContent.trim())}</div>`;
            });
            
            const gridClass = layout.includes('grid-cols-') ? layout : 'grid-cols-2';
            const columnsHtml = `<div class="grid ${gridClass} gap-6 my-8" data-column-layout="true">${columns.join('')}</div>`;
            
            text = text.substring(0, index) + columnsHtml + text.substring(index + fullMatch.length);
          }
        } catch (columnError) {
          console.warn('Column parsing error:', columnError);
        }
      });
      
      return text;
    } catch (error) {
      if (this.errorHandler) {
        this.errorHandler(new Error(`Column parsing failed: ${error}`), text);
      }
      return text;
    }
  }

  // 解析媒体
  private parseMedia(text: string): string {
    try {
      // 图片ID引用
      const imageRegex = /\{\{image:([^|}]+)(?:\|([^}]*))?\}\}/g;
      const matches = this.safeRegexMatch(imageRegex, text);
      
      matches.reverse().forEach(match => {
        const [fullMatch, imageId, caption] = match;
        const index = match.index || 0;
        
        try {
          const imageUrl = this.getImageUrl(imageId);
          if (imageUrl) {
            const imageCaption = caption ? caption.trim() : '';
            let imageHtml;
            
            if (imageCaption) {
              imageHtml = `<figure class="my-6 text-center">
                <img src="${imageUrl}" alt="${this.escapeHtml(imageCaption)}" class="w-full max-w-2xl mx-auto rounded-lg shadow-sm" loading="lazy" />
                <figcaption class="mt-2 text-sm text-gray-500 italic">${this.escapeHtml(imageCaption)}</figcaption>
              </figure>`;
            } else {
              imageHtml = `<div class="my-6 text-center"><img src="${imageUrl}" alt="Image" class="w-full max-w-2xl mx-auto rounded-lg shadow-sm" loading="lazy" /></div>`;
            }
            
            text = text.substring(0, index) + imageHtml + text.substring(index + fullMatch.length);
          } else {
            // 图片未找到，显示占位符
            const placeholder = `<div class="my-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">⚠️ Image not found: ${this.escapeHtml(imageId)}</div>`;
            text = text.substring(0, index) + placeholder + text.substring(index + fullMatch.length);
          }
        } catch (mediaError) {
          console.warn('Media parsing error:', mediaError);
        }
      });
      
      return text;
    } catch (error) {
      if (this.errorHandler) {
        this.errorHandler(new Error(`Media parsing failed: ${error}`), text);
      }
      return text;
    }
  }

  // 解析段落
  private parseParagraphs(text: string): string {
    try {
      const lines = text.split('\n');
      const result: string[] = [];
      let inParagraph = false;
      let paragraphContent: string[] = [];
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        // 跳过已经处理的HTML标签行
        if (trimmedLine.startsWith('<') && trimmedLine.endsWith('>')) {
          if (inParagraph) {
            result.push(`<p class="text-yellow-100 mb-4">${this.parseInlineElements(paragraphContent.join(' '))}</p>`);
            inParagraph = false;
            paragraphContent = [];
          }
          result.push(line);
          continue;
        }
        
        if (trimmedLine === '') {
          if (inParagraph) {
            result.push(`<p class="text-yellow-100 mb-4">${this.parseInlineElements(paragraphContent.join(' '))}</p>`);
            inParagraph = false;
            paragraphContent = [];
          }
          result.push('');
        } else {
          if (!inParagraph) {
            inParagraph = true;
            paragraphContent = [];
          }
          paragraphContent.push(trimmedLine);
        }
      }
      
      // 处理结尾的段落
      if (inParagraph) {
        result.push(`<p class="text-yellow-100 mb-4">${this.parseInlineElements(paragraphContent.join(' '))}</p>`);
      }
      
      return result.join('\n');
    } catch (error) {
      if (this.errorHandler) {
        this.errorHandler(new Error(`Paragraph parsing failed: ${error}`), text);
      }
      return text;
    }
  }

  // HTML转义
  private escapeHtml(text: string): string {
    if (typeof text !== 'string') return '';
    
    const escapeMap: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    
    return text.replace(/[&<>"']/g, (match) => escapeMap[match] || match);
  }

  // 主解析方法
  public parse(content: string): string {
    if (!content || typeof content !== 'string') {
      return this.options.allowHtml ? '<p class="text-gray-500">No content available</p>' : 'No content available';
    }
    
    try {
      // 截断过长内容
      const processedContent = content.length > 50000 ? content.substring(0, 50000) + '\n\n*[Content truncated for performance]*' : content;
      
      // 解析块级元素
      let result = this.parseBlockElements(processedContent);
      
      // 清理多余的换行
      result = result.replace(/\n{3,}/g, '\n\n');
      
      // 转换剩余的换行为<br>
      result = result.replace(/\n/g, '<br>');
      
      // 清理多余的<br>
      result = result.replace(/(<br>\s*){3,}/g, '<br><br>');
      
      // 安全清理
      if (this.options.sanitizeContent) {
        result = sanitizeHtml(result);
      }
      
      return result;
    } catch (error) {
      if (this.errorHandler) {
        this.errorHandler(new Error(`Markdown parsing failed: ${error}`), content);
      }
      
      // 返回安全的错误内容
      return `<div class="p-4 bg-red-50 border border-red-200 rounded text-red-800">
        <p><strong>Markdown parsing error:</strong> ${this.escapeHtml(error instanceof Error ? error.message : 'Unknown error')}</p>
        <details class="mt-2">
          <summary class="cursor-pointer">Show raw content</summary>
          <pre class="mt-2 text-sm bg-gray-100 p-2 rounded overflow-auto">${this.escapeHtml(content.substring(0, 500))}${content.length > 500 ? '...' : ''}</pre>
        </details>
      </div>`;
    }
  }
}

export default function MarkdownRenderer({
  content,
  className = '',
  maxLength,
  allowHtml = false,
  enableColumns = true,
  enableMedia = true,
  enableTasks = true,
  enableTables = true,
  enableCodeBlocks = true,
  enableMath = false,
  sanitizeContent = true,
  onError,
  fallbackContent = '内容加载中...'
}: MarkdownRendererProps) {
  const { getImageUrl } = useContent();
  const { isZh } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);

  // 处理错误的回调
  const handleError = useCallback((error: Error, errorContent: string) => {
    console.warn('MarkdownRenderer error:', error, { contentLength: errorContent.length });
    onError?.(error, errorContent);
  }, [onError]);

  // 创建解析器实例
  const parser = useMemo(() => {
    const options: RenderOptions = {
      allowHtml,
      enableColumns,
      enableMedia,
      enableTasks,
      enableTables,
      enableCodeBlocks,
      enableMath,
      sanitizeContent
    };
    
    return new MarkdownParser(options, getImageUrl, handleError);
  }, [
    allowHtml, enableColumns, enableMedia, enableTasks, 
    enableTables, enableCodeBlocks, enableMath, sanitizeContent,
    getImageUrl, handleError
  ]);

  // 渲染内容
  const renderedContent = useMemo(() => {
    if (!content) return fallbackContent;
    
    try {
      // 长度限制
      const processedContent = maxLength && content.length > maxLength 
        ? content.substring(0, maxLength) + '...'
        : content;
      
      return parser.parse(processedContent);
    } catch (error) {
      handleError(error instanceof Error ? error : new Error('Unknown rendering error'), content);
      return `<div class="text-red-400">${isZh ? '内容渲染失败' : 'Content rendering failed'}</div>`;
    }
  }, [content, maxLength, parser, fallbackContent, handleError, isZh]);

  // 监听内容变化，进行性能优化
  useEffect(() => {
    if (containerRef.current) {
      // 为图片添加懒加载
      const images = containerRef.current.querySelectorAll('img:not([loading])');
      images.forEach(img => {
        img.setAttribute('loading', 'lazy');
      });
      
      // 为外部链接添加安全属性
      const links = containerRef.current.querySelectorAll('a[href^="http"]');
      links.forEach(link => {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      });
    }
  }, [renderedContent]);

  // 渲染组件
  return (
    <div 
      ref={containerRef}
      className={`markdown-renderer prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedContent }}
      style={{
        wordWrap: 'break-word',
        overflowWrap: 'break-word',
        hyphens: 'auto'
      }}
    />
  );
}