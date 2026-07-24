import React, { useState, useRef, useEffect } from 'react';
import { X, Eye, Edit3, Bold, Italic, Heading, Link, List, Quote, Code, Image, Columns } from 'lucide-react';
import { Button } from '../../ui/button';
import { useLanguage } from '../../language/LanguageContext';
import { renderBasicMarkdown } from './helpers';
import { toast } from 'sonner';
import ImageSelectorDialog from './ImageSelectorDialog';
import ColumnDialog from './ColumnDialog';
import { getColumnLayouts } from './constants';
import { generateColumnSyntax } from './helpers';
import { Column } from './types';

interface FullscreenEditorProps {
  open: boolean;
  onClose: () => void;
  value: string;
  onChange: (value: string) => void;
  toolbarButtons: React.ReactNode;
  placeholder?: string;
}

export default function FullscreenEditor({
  open,
  onClose,
  value,
  onChange,
  toolbarButtons,
  placeholder
}: FullscreenEditorProps) {
  const { isZh } = useLanguage();
  const [isPreview, setIsPreview] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showColumnDialog, setShowColumnDialog] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const columnLayouts = getColumnLayouts(isZh);

  // 简单的焦点设置
  useEffect(() => {
    if (open && textareaRef.current) {
      // 使用setTimeout确保DOM渲染完成
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(value.length, value.length);
        }
      }, 50);
    }
  }, [open, value.length]);

  // 体滚动控制
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // 简单的markdown插入
  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      const newPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  // 插入图片
  const insertImage = (imageId: string, caption?: string) => {
    const imageRef = caption 
      ? `{{image:${imageId}|${caption}}}` 
      : `{{image:${imageId}}}`;
    insertMarkdown(imageRef);
    toast.success(isZh ? '图片插入成功！' : 'Image inserted successfully!');
    setShowImageDialog(false);
  };

  // 插入分栏
  const insertColumnLayout = (columns: Column[], template: string) => {
    const columnSyntax = generateColumnSyntax(columns, template);
    insertMarkdown('\n' + columnSyntax + '\n');
    setShowColumnDialog(false);
  };

  // Markdown渲染
  const renderMarkdown = (text: string) => {
    let html = text;
    
    // 处理分栏语法
    html = html.replace(
      /\[columns layout="([^"]+)"\]([\s\S]*?)\[\/columns\]/g,
      (match, layout, content) => {
        const columnMatches = content.match(/\[column width="([^"]+)"\]([\s\S]*?)\[\/column\]/g);
        if (!columnMatches) return match;

        const columns = columnMatches.map((colMatch: string) => {
          const colContent = colMatch.replace(/\[column width="[^"]+"\]([\s\S]*?)\[\/column\]/, '$1').trim();
          return renderBasicMarkdown(colContent);
        });

        const gridClass = layout.includes('cols-') ? layout : 'grid-cols-2';
        return `<div class="grid ${gridClass} gap-6 my-6">${columns.map(col => `<div class="space-y-4">${col}</div>`).join('')}</div>`;
      }
    );

    return renderBasicMarkdown(html);
  };

  // 工具栏按钮配置
  const toolbarActions = [
    { icon: Bold, action: () => insertMarkdown('**', '**'), title: isZh ? '粗体' : 'Bold' },
    { icon: Italic, action: () => insertMarkdown('*', '*'), title: isZh ? '斜体' : 'Italic' },
    { icon: Heading, action: () => insertMarkdown('## '), title: isZh ? '标题' : 'Heading' },
    { icon: Link, action: () => insertMarkdown('[', '](url)'), title: isZh ? '链接' : 'Link' },
    { icon: List, action: () => insertMarkdown('- '), title: isZh ? '列表' : 'List' },
    { icon: Quote, action: () => insertMarkdown('> '), title: isZh ? '引用' : 'Quote' },
    { icon: Code, action: () => insertMarkdown('`', '`'), title: isZh ? '代码' : 'Code' },
    { 
      icon: Image, 
      action: () => setShowImageDialog(true), 
      title: isZh ? '图片' : 'Image' 
    },
    { 
      icon: Columns, 
      action: () => setShowColumnDialog(true), 
      title: isZh ? '分栏' : 'Columns' 
    }
  ];

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black z-[99999] flex flex-col">
      {/* 工具栏 */}
      <div className="bg-gray-900 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {toolbarActions.map((action, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                onClick={action.action}
                className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
                title={action.title}
                disabled={isPreview && action.icon !== Image && action.icon !== Columns}
              >
                <action.icon className="w-4 h-4" />
              </Button>
            ))}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={isPreview ? 'ghost' : 'secondary'}
              size="sm"
              onClick={() => setIsPreview(false)}
              className="text-small"
            >
              <Edit3 className="w-4 h-4 mr-1" />
              {isZh ? '编辑' : 'Edit'}
            </Button>
            
            <Button
              variant={isPreview ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setIsPreview(true)}
              className="text-small"
            >
              <Eye className="w-4 h-4 mr-1" />
              {isZh ? '预览' : 'Preview'}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-red-400"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 编辑/预览区域 */}
      <div className="flex-1 overflow-hidden">
        {isPreview ? (
          <div className="h-full overflow-auto bg-white p-8">
            <div 
              className="max-w-4xl mx-auto prose prose-lg"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }}
            />
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || (isZh ? '开始编写内容...' : 'Start writing...')}
            className="w-full h-full p-8 bg-black text-yellow-400 resize-none border-0 outline-none font-mono"
            style={{
              fontSize: '16px',
              lineHeight: '1.6'
            }}
            spellCheck={false}
            autoComplete="off"
          />
        )}
      </div>

      {/* 状态栏 */}
      <div className="bg-gray-900 border-t border-gray-700 px-4 py-2">
        <div className="flex justify-between text-small text-gray-400">
          <span>{isZh ? '字符' : 'Characters'}: {value.length}</span>
          <span>{isZh ? '行' : 'Lines'}: {value.split('\n').length}</span>
        </div>
      </div>

      {/* 对话框 */}
      <ImageSelectorDialog
        open={showImageDialog}
        onOpenChange={setShowImageDialog}
        onImageSelect={insertImage}
      />

      <ColumnDialog
        open={showColumnDialog}
        onOpenChange={setShowColumnDialog}
        columnLayouts={columnLayouts}
        onInsert={insertColumnLayout}
      />
    </div>
  );
}