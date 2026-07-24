import { Tag } from 'lucide-react';

// 兴趣页面数据接口
export interface InterestData {
  title: string;
  description: string;
  content: string;
  imageUrl?: string;
}

// 基础分类接口 - 保留用于类型定义
export interface Category {
  id: string;
  name: { zh: string; en: string };
  color: string;
  icon?: any;
  isDefault?: boolean;
}

// 自定义分类接口 - 保留用于向后兼容
export interface CustomCategory {
  id: string;
  name: string | { zh: string; en: string };
  color: string;
  icon?: string;
  isDefault?: boolean;
}

// 保留用于向后兼容 - 用于管理后台的分类选择
export const DEFAULT_INTEREST_CATEGORIES = [
  { 
    id: 'general', 
    name: { zh: '通用', en: 'General' }, 
    icon: Tag, 
    color: 'bg-blue-500',
    isDefault: true 
  }
];

// 辅助函数：获取分类名称（支持双语）- 保留用于向后兼容
export function getCategoryName(category: Category | CustomCategory, language: 'zh' | 'en'): string {
  if (typeof category.name === 'string') {
    return category.name;
  }
  return category.name[language] || category.name.zh || category.name.en || 'Unknown';
}