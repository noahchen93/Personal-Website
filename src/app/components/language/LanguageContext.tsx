import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'zh' | 'en';

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
  isZh: boolean;
  isEn: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('zh');


  useEffect(() => {
    const savedLanguage = localStorage.getItem('portfolio-language') as Language;
    if (savedLanguage && (savedLanguage === 'zh' || savedLanguage === 'en')) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  const setLanguage = (language: Language) => {
    setCurrentLanguage(language);
    localStorage.setItem('portfolio-language', language);
  };

  const contextValue: LanguageContextType = {
    currentLanguage,
    setLanguage,
    isZh: currentLanguage === 'zh',
    isEn: currentLanguage === 'en'
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// 默认文本配置
export const defaultTexts = {
  zh: {
    // 导航
    nav: {
      home: '首页',
      projects: '项目', 
      aiExplore: 'AI探索',
      blog: '博客',
      interests: '兴趣',
      contact: '联系'
    },
    // 通用
    common: {
      loading: '加载中...',
      save: '保存',
      cancel: '取消',
      edit: '编辑',
      delete: '删除',
      add: '添加',
      back: '返回',
      close: '关闭',
      confirm: '确认',
      search: '搜索',
      filter: '筛选',
      more: '更多',
      less: '收起',
      viewMore: '查看更多',
      readMore: '阅读更多'
    },
    // 页面标题
    pages: {
      home: {
        title: '欢迎来到我的作品集',
        subtitle: '展示我的项目经历、个人兴趣和创作成果'
      },
      projects: {
        title: '项目经历',
        subtitle: '记录我的项目经验、技术成长和创作历程'
      },
      aiExplore: {
        title: 'AI探索之旅',
        subtitle: '探索人工智能的无限可能，展示我的AI应用作品、技术技能和深度思考'
      },
      interests: {
        title: '个人兴趣', 
        subtitle: '分享我在技术之外的兴趣爱好和思考，记录生活中的点点滴滴'
      },
      blog: {
        title: '博客文章',
        subtitle: '分享技术见解、学习心得和生活感悟'
      },
      contact: {
        title: '联系我',
        subtitle: '欢迎交流合作，期待与您建立联系'
      }
    },
    // 管理面板
    admin: {
      title: '管理面板',
      welcome: '欢迎',
      language: '语言',
      chinese: '中文版',
      english: '英文版',
      onlineStatus: '云端同步',
      offlineStatus: '离线模式'
    }
  },
  en: {
    // 导航
    nav: {
      home: 'Home',
      projects: 'Projects',
      aiExplore: 'AI Exploration',
      blog: 'Blog',
      interests: 'Interests', 
      contact: 'Contact'
    },
    // 通用
    common: {
      loading: 'Loading...',
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete',
      add: 'Add',
      back: 'Back',
      close: 'Close',
      confirm: 'Confirm',
      search: 'Search',
      filter: 'Filter',
      more: 'More',
      less: 'Less',
      viewMore: 'View More',
      readMore: 'Read More'
    },
    // 页面标题
    pages: {
      home: {
        title: 'Welcome to My Portfolio',
        subtitle: 'Showcasing my project experience, personal interests, and creative works'
      },
      projects: {
        title: 'Projects',
        subtitle: 'Recording my project experience, technical growth, and creative journey'
      },
      aiExplore: {
        title: 'AI Exploration Journey',
        subtitle: 'Exploring the infinite possibilities of artificial intelligence, showcasing my AI application works, technical skills, and deep thinking'
      },
      interests: {
        title: 'Personal Interests',
        subtitle: 'Sharing my hobbies and thoughts beyond technology, recording life\'s moments'
      },
      blog: {
        title: 'Blog Posts',
        subtitle: 'Sharing technical insights, learning experiences, and life reflections'
      },
      contact: {
        title: 'Contact Me',
        subtitle: 'Welcome to connect and collaborate, looking forward to hearing from you'
      }
    },
    // 管理面板
    admin: {
      title: 'Admin Panel',
      welcome: 'Welcome',
      language: 'Language',
      chinese: 'Chinese',
      english: 'English',
      onlineStatus: 'Cloud Sync',
      offlineStatus: 'Offline Mode'
    }
  }
};

// 获取当前语言的文本
export function useTexts() {
  const { currentLanguage } = useLanguage();
  return defaultTexts[currentLanguage];
}