import { ColumnLayout } from './types';

export const getColumnLayouts = (isZh: boolean): ColumnLayout[] => [
  {
    id: '2-column',
    name: isZh ? '两栏等宽' : 'Two Equal Columns',
    template: 'grid-cols-2',
    columns: [
      { id: '1', content: '', width: 6 },
      { id: '2', content: '', width: 6 }
    ]
  },
  {
    id: '3-column',
    name: isZh ? '三栏等宽' : 'Three Equal Columns',
    template: 'grid-cols-3',
    columns: [
      { id: '1', content: '', width: 4 },
      { id: '2', content: '', width: 4 },
      { id: '3', content: '', width: 4 }
    ]
  },
  {
    id: '1-2-column',
    name: isZh ? '左窄右宽' : 'Left Narrow, Right Wide',
    template: 'grid-cols-3',
    columns: [
      { id: '1', content: '', width: 1 },
      { id: '2', content: '', width: 2 }
    ]
  },
  {
    id: '2-1-column',
    name: isZh ? '左宽右窄' : 'Left Wide, Right Narrow',
    template: 'grid-cols-3',
    columns: [
      { id: '1', content: '', width: 2 },
      { id: '2', content: '', width: 1 }
    ]
  },
  {
    id: '4-column',
    name: isZh ? '四栏等宽' : 'Four Equal Columns',
    template: 'grid-cols-4',
    columns: [
      { id: '1', content: '', width: 3 },
      { id: '2', content: '', width: 3 },
      { id: '3', content: '', width: 3 },
      { id: '4', content: '', width: 3 }
    ]
  }
];

export const getToolbarButtons = (isZh: boolean, insertMarkdown: (before: string, after?: string) => void) => [
  {
    icon: 'Bold',
    title: isZh ? '粗体' : 'Bold',
    action: () => insertMarkdown('**', '**')
  },
  {
    icon: 'Italic',
    title: isZh ? '斜体' : 'Italic',
    action: () => insertMarkdown('*', '*')
  },
  {
    icon: 'Link',
    title: isZh ? '链接' : 'Link',
    action: () => insertMarkdown('[', '](url)')
  },
  {
    icon: 'List',
    title: isZh ? '列表' : 'List',
    action: () => insertMarkdown('- ')
  },
  {
    icon: 'Quote',
    title: isZh ? '引用' : 'Quote',
    action: () => insertMarkdown('> ')
  },
  {
    icon: 'Code',
    title: isZh ? '代码' : 'Code',
    action: () => insertMarkdown('`', '`')
  },
  {
    icon: 'Image',
    title: isZh ? '图片引用' : 'Image Reference',
    action: () => insertMarkdown('{{image:', '}}')
  }
];