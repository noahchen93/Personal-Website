import React, { useState, useRef, useCallback, useMemo } from 'react';
import { Bold, Italic, Link, List, Quote, Code, Eye, Edit3, Columns, Image, Maximize2, Table, CheckSquare, Minus, Hash, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { useLanguage } from '../language/LanguageContext';
import { useContent } from '../content/ContentContext';
import { getColumnLayouts } from './markdown/constants';
import { generateColumnSyntax } from './markdown/helpers';
import { Column, MarkdownEditorProps } from './markdown/types';
import ColumnDialog from './markdown/ColumnDialog';
import ImageSelectorDialog from './markdown/ImageSelectorDialog';
import FullscreenEditor from './markdown/FullscreenEditor';
import MarkdownRenderer from './enhanced/MarkdownRenderer';
import { toast } from 'sonner';

interface EditorError {
  type: 'rendering' | 'syntax' | 'media' | 'unknown';
  message: string;
  timestamp: number;
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder,
  className = '',
  minHeight = 'min-h-[200px]',
  height = '200px'
}: MarkdownEditorProps) {
  const { isZh } = useLanguage();
  const { getImageUrl } = useContent();
  const [isPreview, setIsPreview] = useState(false);
  const [showColumnDialog, setShowColumnDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [lastError, setLastError] = useState<EditorError | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const columnLayouts = getColumnLayouts(isZh);

  // 错误处理
  const handleRenderError = useCallback((error: Error, content: string) => {
    const editorError: EditorError = {
      type: error.message.includes('Media') ? 'media' : 
            error.message.includes('syntax') ? 'syntax' :
            error.message.includes('render') ? 'rendering' : 'unknown',
      message: error.message,
      timestamp: Date.now()
    };
    
    setLastError(editorError);
    
    // 只在开发环境显示详细错误
    if (process.env.NODE_ENV === 'development') {
      console.warn('MarkdownEditor render error:', error, { contentLength: content.length });
    }
  }, []);

  // 清除错误
  const clearError = useCallback(() => {
    setLastError(null);
  }, []);

  // 安全的markdown操作
  const insertMarkdown = useCallback((before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) {
      toast.error(isZh ? '编辑器未就绪' : 'Editor not ready');
      return;
    }

    try {
      setIsProcessing(true);
      
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = value.substring(start, end);
      
      const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
      onChange(newText);

      // 重新设置光标位置
      setTimeout(() => {
        if (textarea) {
          textarea.focus();
          const newCursorPos = start + before.length + selectedText.length;
          textarea.setSelectionRange(newCursorPos, newCursorPos);
        }
        setIsProcessing(false);
      }, 0);
      
      clearError();
    } catch (error) {
      console.error('Error inserting markdown:', error);
      toast.error(isZh ? '插入操作失败' : 'Insert operation failed');
      setIsProcessing(false);
    }
  }, [value, onChange, isZh, clearError]);

  // 插入分栏布局
  const insertColumnLayout = useCallback((columns: Column[], template: string) => {
    try {
      const columnSyntax = generateColumnSyntax(columns, template);
      insertMarkdown('\n' + columnSyntax + '\n');
      toast.success(isZh ? '分栏布局已插入' : 'Column layout inserted');
    } catch (error) {
      console.error('Error inserting column layout:', error);
      toast.error(isZh ? '分栏插入失败' : 'Column insertion failed');
    }
  }, [insertMarkdown, isZh]);

  // 插入图片 - 使用ID引用
  const insertImage = useCallback((imageId: string, caption?: string) => {
    try {
      const imageRef = caption 
        ? `{{image:${imageId}|${caption}}}` 
        : `{{image:${imageId}}}`;
      insertMarkdown(imageRef);
      toast.success(isZh ? '图片插入成功！使用ID引用，永不过期' : 'Image inserted successfully! Using ID reference, never expires');
    } catch (error) {
      console.error('❌ 图片插入失败:', error);
      toast.error(isZh ? '图片插入失败' : 'Image insertion failed');
    }
  }, [insertMarkdown, isZh]);

  // 插入表格
  const insertTable = useCallback(() => {
    try {
      const tableTemplate = isZh 
        ? '\n| 列1 | 列2 | 列3 |\n|-----|-----|-----|\n| 内容1 | 内容2 | 内容3 |\n| 内容4 | 内容5 | 内容6 |\n'
        : '\n| Column 1 | Column 2 | Column 3 |\n|----------|----------|----------|\n| Content 1 | Content 2 | Content 3 |\n| Content 4 | Content 5 | Content 6 |\n';
      insertMarkdown(tableTemplate);
      toast.success(isZh ? '表格已插入' : 'Table inserted');
    } catch (error) {
      console.error('Error inserting table:', error);
      toast.error(isZh ? '表格插入失败' : 'Table insertion failed');
    }
  }, [insertMarkdown, isZh]);

  // 插入任务列表
  const insertTaskList = useCallback(() => {
    try {
      const taskTemplate = isZh 
        ? '\n- [ ] 未完成的任务\n- [x] 已完成的任务\n- [ ] 另一个任务\n'
        : '\n- [ ] Incomplete task\n- [x] Completed task\n- [ ] Another task\n';
      insertMarkdown(taskTemplate);
      toast.success(isZh ? '任务列表已插入' : 'Task list inserted');
    } catch (error) {
      console.error('Error inserting task list:', error);
      toast.error(isZh ? '任务列表插入失败' : 'Task list insertion failed');
    }
  }, [insertMarkdown, isZh]);

  // 处理图片按钮点击
  const handleImageButtonClick = useCallback(() => {
    try {
      setShowImageDialog(true);
    } catch (error) {
      console.error('❌ 打开图片对话框失败:', error);
      toast.error(isZh ? '无法打开图片选择器' : 'Cannot open image selector');
    }
  }, [isZh]);

  // 工具栏按钮配置
  const toolbarButtons = useMemo(() => [
    {
      icon: <Bold className="w-4 h-4" />,
      title: isZh ? '粗体 (**text**)' : 'Bold (**text**)',
      action: () => insertMarkdown('**', '**'),
      disabled: isProcessing
    },
    {
      icon: <Italic className="w-4 h-4" />,
      title: isZh ? '斜体 (*text*)' : 'Italic (*text*)',
      action: () => insertMarkdown('*', '*'),
      disabled: isProcessing
    },
    {
      icon: <Minus className="w-4 h-4" />,
      title: isZh ? '删除线 (~~text~~)' : 'Strikethrough (~~text~~)',
      action: () => insertMarkdown('~~', '~~'),
      disabled: isProcessing
    },
    {
      icon: <Link className="w-4 h-4" />,
      title: isZh ? '链接 ([text](url))' : 'Link ([text](url))',
      action: () => insertMarkdown('[', '](url)'),
      disabled: isProcessing
    },
    {
      icon: <List className="w-4 h-4" />,
      title: isZh ? '列表 (- item)' : 'List (- item)',
      action: () => insertMarkdown('- '),
      disabled: isProcessing
    },
    {
      icon: <CheckSquare className="w-4 h-4" />,
      title: isZh ? '任务列表 (- [ ] task)' : 'Task List (- [ ] task)',
      action: insertTaskList,
      disabled: isProcessing
    },
    {
      icon: <Quote className="w-4 h-4" />,
      title: isZh ? '引用 (> text)' : 'Quote (> text)',
      action: () => insertMarkdown('> '),
      disabled: isProcessing
    },
    {
      icon: <Code className="w-4 h-4" />,
      title: isZh ? '代码 (`code`)' : 'Code (`code`)',
      action: () => insertMarkdown('`', '`'),
      disabled: isProcessing
    },
    {
      icon: <Hash className="w-4 h-4" />,
      title: isZh ? '标题 (## title)' : 'Heading (## title)',
      action: () => insertMarkdown('## '),
      disabled: isProcessing
    },
    {
      icon: <Table className="w-4 h-4" />,
      title: isZh ? '表格' : 'Table',
      action: insertTable,
      disabled: isProcessing
    }
  ], [isZh, insertMarkdown, insertTaskList, insertTable, isProcessing]);

  // 渲染工具栏按钮
  const renderToolbarButtons = useCallback(() => (
    <>
      {toolbarButtons.map((button, index) => (
        <Button
          key={index}
          variant="ghost"
          size="sm"
          onClick={button.action}
          disabled={button.disabled}
          title={button.title}
          className="h-8 w-8 p-0 text-white hover:bg-slate-700/50 disabled:opacity-50"
          type="button"
        >
          {button.icon}
        </Button>
      ))}
      
      {/* 图片按钮 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleImageButtonClick}
        disabled={isProcessing}
        title={isZh ? '插入图片 (使用ID引用)' : 'Insert Image (ID reference)'}
        className="h-8 w-8 p-0 text-white hover:bg-slate-700/50 disabled:opacity-50"
        type="button"
      >
        <Image className="w-4 h-4" />
      </Button>
      
      {/* 分栏按钮 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowColumnDialog(true)}
        disabled={isProcessing}
        title={isZh ? '插入分栏' : 'Insert Columns'}
        className="h-8 w-8 p-0 text-white hover:bg-slate-700/50 disabled:opacity-50"
        type="button"
      >
        <Columns className="w-4 h-4" />
      </Button>
    </>
  ), [toolbarButtons, handleImageButtonClick, isProcessing, isZh]);

  return (
    <div className={`border border-blue-400/30 rounded-lg overflow-hidden bg-slate-800/50 ${className}`}>
      {/* 工具栏 */}
      <div className="bg-slate-900/90 border-b border-blue-400/30 p-2 flex items-center justify-between">
        <div className="flex items-center space-x-1 flex-wrap">
          {renderToolbarButtons()}
          
          {/* 错误指示器 */}
          {lastError && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearError}
              className="h-8 w-8 p-0 text-red-400 hover:bg-red-500/20"
              title={`${lastError.type}: ${lastError.message}`}
            >
              <AlertCircle className="w-4 h-4" />
            </Button>
          )}
          
          {/* 处理指示器 */}
          {isProcessing && (
            <div className="flex items-center text-blue-400 text-xs">
              <RefreshCw className="w-3 h-3 animate-spin mr-1" />
              {isZh ? '处理中...' : 'Processing...'}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {/* 全屏按钮 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFullscreen(true)}
            title={isZh ? '全屏编辑' : 'Fullscreen Edit'}
            className="h-8 w-8 p-0 text-white hover:bg-slate-700/50"
            type="button"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>

          {/* 编辑/预览切换 */}
          <Button
            variant={isPreview ? 'ghost' : 'secondary'}
            size="sm"
            onClick={() => setIsPreview(false)}
            className="text-sm text-white hover:bg-slate-700/50"
            type="button"
          >
            <Edit3 className="w-4 h-4 mr-1" />
            {isZh ? '编辑' : 'Edit'}
          </Button>
          <Button
            variant={isPreview ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setIsPreview(true)}
            className="text-sm text-white hover:bg-slate-700/50"
            type="button"
          >
            <Eye className="w-4 h-4 mr-1" />
            {isZh ? '预览' : 'Preview'}
          </Button>
        </div>
      </div>

      {/* 编辑器内容 */}
      <div className={minHeight} style={{ minHeight: height || '200px' }}>
        {isPreview ? (
          <div className="p-4 terminal-content">
            <MarkdownRenderer
              content={value}
              onError={handleRenderError}
              enableColumns={true}
              enableMedia={true}
              enableTasks={true}
              enableTables={true}
              enableCodeBlocks={true}
              sanitizeContent={true}
              fallbackContent={isZh ? '预览内容为空' : 'No preview content'}
            />
          </div>
        ) : (
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              clearError();
            }}
            placeholder={placeholder || (isZh ? '输入markdown内容...' : 'Enter markdown content...')}
            className={`border-0 resize-none focus:ring-0 text-sm cms-textarea ${minHeight}`}
            style={{ minHeight: height || '200px' }}
          />
        )}
      </div>

      {/* 底部提示和错误显示 */}
      <div className="bg-slate-700/50 border-t border-blue-400/30 px-3 py-2">
        {lastError && (
          <div className="mb-2 p-2 bg-red-900/30 border border-red-500/30 rounded text-red-300 text-xs">
            <div className="flex items-center justify-between">
              <span>
                <strong>{lastError.type}:</strong> {lastError.message}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearError}
                className="h-4 w-4 p-0 text-red-400 hover:text-red-300"
              >
                ×
              </Button>
            </div>
          </div>
        )}
        
        <p className="text-sm terminal-text-cyan">
          {isZh 
            ? '支持增强的GitHub Flavored Markdown：**粗体**、*斜体*、~~删除线~~、[链接](url)、`代码`、表格、任务列表、{{image:id}}等' 
            : 'Enhanced GitHub Flavored Markdown support: **bold**, *italic*, ~~strikethrough~~, [links](url), `code`, tables, task lists, {{image:id}}, etc.'
          }
        </p>
        
        <div className="mt-2 text-xs terminal-text-cyan">
          <p>
            {isZh 
              ? '💡 增强功能：容错渲染、XSS防护、性能优化、自动链接识别、嵌套列表支持'
              : '💡 Enhanced features: Error-tolerant rendering, XSS protection, performance optimization, auto-link detection, nested list support'
            }
          </p>
          <div className="flex items-center justify-between mt-1">
            <span>
              {isZh ? `字符数: ${value.length}` : `Characters: ${value.length}`}
              {value.length > 10000 && (
                <span className="text-yellow-400 ml-2">
                  {isZh ? '(大文档模式)' : '(Large document mode)'}
                </span>
              )}
            </span>
            
            <span className="text-xs">
              {isZh ? `状态: ${lastError ? '错误' : '正常'}` : `Status: ${lastError ? 'Error' : 'OK'}`}
            </span>
          </div>
        </div>
        
        <details className="mt-2">
          <summary className="text-sm text-blue-400 cursor-pointer hover:text-blue-300">
            {isZh ? '查看增强功能和语法示例' : 'View enhanced features and syntax examples'}
          </summary>
          <div className="mt-2 p-3 bg-slate-600/50 rounded text-xs font-mono space-y-2 border border-blue-400/20">
            <div>
              <p className="terminal-text-cyan mb-1">{isZh ? '增强功能：' : 'Enhanced Features:'}</p>
              <ul className="terminal-text-white text-xs space-y-1">
                <li>• {isZh ? '错误容错：语法错误时自动降级渲染' : 'Error tolerance: Auto-fallback on syntax errors'}</li>
                <li>• {isZh ? 'XSS防护：自动清理危险内容' : 'XSS protection: Auto-sanitize dangerous content'}</li>
                <li>• {isZh ? '性能优化：大文档分块处理' : 'Performance: Chunked processing for large documents'}</li>
                <li>• {isZh ? '智能链接：自动识别URL并转换' : 'Smart links: Auto-detect and convert URLs'}</li>
              </ul>
            </div>
            <div>
              <p className="terminal-text-cyan mb-1">{isZh ? '表格语法：' : 'Table syntax:'}</p>
              <code className="block terminal-text-white">
                | {isZh ? '列1' : 'Column 1'} | {isZh ? '列2' : 'Column 2'} |<br/>
                |-----|-----|<br/>
                | {isZh ? '内容1' : 'Content 1'} | {isZh ? '内容2' : 'Content 2'} |
              </code>
            </div>
            <div>
              <p className="terminal-text-cyan mb-1">{isZh ? '任务列表：' : 'Task lists:'}</p>
              <code className="block terminal-text-white">
                - [x] {isZh ? '已完成任务' : 'Completed task'}<br/>
                - [ ] {isZh ? '未完成任务' : 'Incomplete task'}
              </code>
            </div>
            <div>
              <p className="terminal-text-cyan mb-1">{isZh ? '图片插入 (ID引用)：' : 'Image insertion (ID reference):'}</p>
              <code className="block terminal-text-white">
                {'{'}{'{'}.image:图片ID{'}'}{'}'} - {isZh ? '仅图片' : 'Image only'}<br/>
                {'{'}{'{'}.image:图片ID|图片说明{'}'}{'}'} - {isZh ? '带说明' : 'With caption'}<br/>
                <span className="text-green-400">{isZh ? '✅ URL永不过期，支持容错渲染' : '✅ URLs never expire, error-tolerant rendering'}</span>
              </code>
            </div>
          </div>
        </details>
      </div>

      {/* 分栏对话框 */}
      <ColumnDialog
        open={showColumnDialog}
        onOpenChange={setShowColumnDialog}
        columnLayouts={columnLayouts}
        onInsert={insertColumnLayout}
      />

      {/* 图片选择对话框 */}
      <ImageSelectorDialog
        open={showImageDialog}
        onOpenChange={setShowImageDialog}
        onImageSelect={insertImage}
      />

      {/* 全屏编辑器 */}
      <FullscreenEditor
        open={showFullscreen}
        onClose={() => setShowFullscreen(false)}
        value={value}
        onChange={onChange}
        toolbarButtons={renderToolbarButtons()}
        placeholder={placeholder}
      />
    </div>
  );
}