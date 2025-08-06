// CMS Editor Utility Functions

import { TEXTS } from './constants';

// Get translated text
export const getTexts = (language: string) => {
  return TEXTS[language as keyof typeof TEXTS] || TEXTS.en;
};

// Format date for display
export const formatDate = (dateString: string, language: string = 'en') => {
  if (!dateString) return '';
  
  const texts = getTexts(language);
  if (dateString === 'present') return texts.current;
  
  // Try to format date if it's a valid date
  try {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', {
        year: 'numeric',
        month: 'short'
      });
    }
  } catch (error) {
    // If date parsing fails, return original string
  }
  
  return dateString;
};

// Validate required fields
export const validateRequired = (fields: Record<string, any>, requiredFields: string[], language: string = 'en') => {
  const texts = getTexts(language);
  const missing = requiredFields.filter(field => !fields[field] || (typeof fields[field] === 'string' && !fields[field].trim()));
  
  if (missing.length > 0) {
    alert(texts.required);
    return false;
  }
  return true;
};

// Generate unique ID for new items
export const generateId = () => {
  return Date.now() + Math.random();
};

// Parse comma/newline separated strings to arrays
export const parseStringToArray = (str: string, delimiter: string = '\n') => {
  if (!str) return [];
  return str.split(delimiter).map(item => item.trim()).filter(Boolean);
};

// Convert array to string for form display
export const arrayToString = (arr: string[] | undefined, delimiter: string = '\n') => {
  if (!arr || !Array.isArray(arr)) return '';
  return arr.join(delimiter);
};

// Show confirmation dialog
export const confirmAction = (message: string, language: string = 'en') => {
  const texts = getTexts(language);
  return confirm(message || texts.confirmDelete);
};

// Debounce function for auto-save
export const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Safe JSON parse
export const safeJsonParse = (str: string, fallback: any = null) => {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
};

// Format file size
export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Get file extension
export const getFileExtension = (filename: string) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

// Check if file is image
export const isImageFile = (filename: string) => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  const ext = getFileExtension(filename).toLowerCase();
  return imageExtensions.includes(ext);
};

// Truncate text
export const truncateText = (text: string, maxLength: number = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Sort items by order or date
export const sortItems = (items: any[], sortBy: string = 'order') => {
  return [...items].sort((a, b) => {
    if (sortBy === 'order') {
      return (a.order_index || 0) - (b.order_index || 0);
    }
    if (sortBy === 'date') {
      const dateA = new Date(a.created_at || a.startDate || 0);
      const dateB = new Date(b.created_at || b.startDate || 0);
      return dateB.getTime() - dateA.getTime();
    }
    return 0;
  });
};