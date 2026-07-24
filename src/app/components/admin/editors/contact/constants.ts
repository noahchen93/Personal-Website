export const BUTTON_STYLES = {
  primary: 'bg-blue-100 text-blue-700',
  secondary: 'bg-gray-200 text-gray-700'
} as const;

export const BUTTON_STYLE_OPTIONS = [
  { value: 'primary', labelZh: '主要按钮', labelEn: 'Primary Button' },
  { value: 'secondary', labelZh: '次要按钮', labelEn: 'Secondary Button' }
] as const;

export const FORM_PLACEHOLDERS = {
  title: {
    zh: '输入页面标题，如"联系终端"',
    en: 'Enter page title, e.g. "Contact Terminal"'
  },
  subtitle: {
    zh: '输入页面副标题，如"> 建立连接，开启对话"',
    en: 'Enter page subtitle, e.g. "> Initialize connection, start dialogue"'
  },
  description: {
    zh: '输入页面的详细描述信息',
    en: 'Enter detailed page description'
  },
  buttonText: {
    zh: '输入按钮显示的文字',
    en: 'Enter button display text'
  },
  buttonTarget: {
    zh: '输入链接地址或页面ID',
    en: 'Enter link URL or page ID'
  }
} as const;

export const DEFAULT_BUTTON = {
  id: '',
  text: '',
  target: '',
  style: 'primary' as const,
  external: false
};