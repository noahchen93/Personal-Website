import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface SEOData {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
}

interface SEOContextType {
  seoData: SEOData;
  updateSEO: (data: Partial<SEOData>) => void;
  resetSEO: () => void;
  setPageSEO: (pageName: string, data?: Partial<SEOData>) => void;
}

const SEOContext = createContext<SEOContextType | undefined>(undefined);

interface SEOProviderProps {
  children: ReactNode;
}

export const SEOProvider: React.FC<SEOProviderProps> = ({ children }) => {
  const [seoData, setSeoData] = useState<SEOData>({});

  const updateSEO = useCallback((data: Partial<SEOData>) => {
    setSeoData(prev => ({ ...prev, ...data }));
  }, []);

  const resetSEO = useCallback(() => {
    setSeoData({});
  }, []);

  const setPageSEO = useCallback((pageName: string, customData: Partial<SEOData> = {}) => {
    // 根据页面名称设置默认SEO数据
    const pageSEOData: Record<string, SEOData> = {
      home: {
        type: 'website',
        section: 'homepage',
        twitterCard: 'summary_large_image',
        ...customData
      },
      projects: {
        type: 'website',
        section: 'projects',
        twitterCard: 'summary_large_image',
        ...customData
      },
      interests: {
        type: 'website',
        section: 'interests',
        twitterCard: 'summary',
        ...customData
      },
      blog: {
        type: 'article',
        section: 'blog',
        twitterCard: 'summary_large_image',
        ...customData
      },
      contact: {
        type: 'profile',
        section: 'contact',
        twitterCard: 'summary',
        ...customData
      },
      'ai-explore': {
        type: 'website',
        section: 'ai-explore',
        twitterCard: 'summary_large_image',
        ...customData
      }
    };

    const pageData = pageSEOData[pageName] || customData;
    setSeoData(pageData);
  }, []);

  const value: SEOContextType = {
    seoData,
    updateSEO,
    resetSEO,
    setPageSEO
  };

  return (
    <SEOContext.Provider value={value}>
      {children}
    </SEOContext.Provider>
  );
};

export const useSEO = (): SEOContextType => {
  const context = useContext(SEOContext);
  if (context === undefined) {
    throw new Error('useSEO must be used within a SEOProvider');
  }
  return context;
};

// Hook for easy page SEO setup
export const usePageSEO = (pageName: string, seoData?: Partial<SEOData>) => {
  const { setPageSEO } = useSEO();
  
  React.useEffect(() => {
    setPageSEO(pageName, seoData);
  }, [pageName, seoData, setPageSEO]);
};