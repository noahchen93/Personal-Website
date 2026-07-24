import { Column } from './types';

export const generateColumnSyntax = (columns: Column[], template: string): string => {
  const columnContent = columns.map(col => 
    `[column width="${col.width}"]\n${col.content}\n[/column]`
  ).join('\n\n');

  return `[columns layout="${template}"]\n${columnContent}\n[/columns]`;
};

// 基础markdown渲染函数 - 不处理图片，图片由MarkdownEditor处理
export const renderBasicMarkdown = (text: string): string => {
  return text
    // 标题
    .replace(/^### (.*$)/gim, '<h3 class="text-medium font-medium text-gray-800 mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-medium font-medium text-gray-800 mt-6 mb-3">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-large font-medium text-gray-900 mt-6 mb-4">$1</h1>')
    // 粗体
    .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-medium">$1</strong>')
    // 斜体
    .replace(/\*(.*?)\*/gim, '<em class="italic">$1</em>')
    // 代码
    .replace(/`([^`]*)`/gim, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>')
    // 链接
    .replace(/\[([^\]]*)\]\(([^)]*)\)/gim, '<a href="$2" class="text-blue-600 underline" target="_blank" rel="noopener noreferrer">$1</a>')
    // 列表
    .replace(/^- (.*$)/gim, '<ul class="list-disc list-inside"><li>$1</li></ul>')
    // 引用
    .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-600">$1</blockquote>')
    // 换行
    .replace(/\n/gim, '<br>');
};