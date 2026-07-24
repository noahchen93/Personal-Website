import React from 'react';
import { useLanguage } from '../language/LanguageContext';
import { useSEO } from './SEOContext';

interface SEOHeadProps {
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

const SEOHead: React.FC = () => {
  const { currentLanguage, isZh } = useLanguage();
  const { seoData } = useSEO();
  
  // 获取当前域名 - 在生产环境中这应该是你的实际域名
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://your-portfolio.com';
  const currentUrl = seoData.url || (typeof window !== 'undefined' ? window.location.href : baseUrl);
  
  // 默认SEO数据
  const defaultSEO = {
    zh: {
      siteName: 'Noah Chen - 个人作品集',
      title: 'Noah Chen - 全栈开发者 | AI驱动的个人作品集',
      description: '欢迎来到Noah Chen的个人作品集网站。这是一个完全由AI编程制作的现代化作品集，展示我的项目经验、技术技能和个人兴趣。探索我的开发历程，了解我的编程能力。',
      keywords: [
        'Noah Chen',
        '全栈开发者',
        '个人作品集',
        'AI编程',
        'React开发',
        'TypeScript',
        '前端开发',
        '后端开发',
        '软件工程师',
        '项目展示',
        '技术博客',
        '编程经验',
        'Web开发',
        '移动开发',
        '人工智能',
        '机器学习',
        'UI/UX设计',
        '开源项目',
        '技术分享'
      ],
      author: 'Noah Chen'
    },
    en: {
      siteName: 'Noah Chen - Personal Portfolio',
      title: 'Noah Chen - Full-Stack Developer | AI-Powered Portfolio',
      description: 'Welcome to Noah Chen\'s personal portfolio website. This is a modern portfolio entirely created with AI coding, showcasing my project experience, technical skills, and personal interests. Explore my development journey and understand my programming capabilities.',
      keywords: [
        'Noah Chen',
        'Full Stack Developer',
        'Personal Portfolio',
        'AI Programming',
        'React Development',
        'TypeScript',
        'Frontend Development',
        'Backend Development',
        'Software Engineer',
        'Project Showcase',
        'Tech Blog',
        'Programming Experience',
        'Web Development',
        'Mobile Development',
        'Artificial Intelligence',
        'Machine Learning',
        'UI/UX Design',
        'Open Source',
        'Tech Sharing'
      ],
      author: 'Noah Chen'
    }
  };

  const currentDefaults = defaultSEO[currentLanguage];
  const finalTitle = seoData.title || currentDefaults.title;
  const finalDescription = seoData.description || currentDefaults.description;
  const finalKeywords = seoData.keywords && seoData.keywords.length > 0 ? seoData.keywords : currentDefaults.keywords;
  const finalImage = seoData.image || `${baseUrl}/og-image.jpg`; // 你需要创建一个默认的OG图片
  const finalAuthor = seoData.author || currentDefaults.author;
  const finalType = seoData.type || 'website';
  const finalTwitterCard = seoData.twitterCard || 'summary_large_image';

  // 生成结构化数据
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Noah Chen",
    "jobTitle": isZh ? "全栈开发者" : "Full-Stack Developer",
    "description": finalDescription,
    "url": baseUrl,
    "image": finalImage,
    "sameAs": [
      "https://github.com/noahchen",
      "https://linkedin.com/in/noahchen123",
      "https://twitter.com/noahchen"
    ],
    "worksFor": {
      "@type": "Organization",
      "name": isZh ? "自由职业" : "Freelance"
    },
    "alumniOf": {
      "@type": "EducationalOrganization",
      "name": isZh ? "计算机科学学位" : "Computer Science Degree"
    },
    "knowsAbout": [
      "React",
      "TypeScript",
      "Node.js",
      "Python",
      "Machine Learning",
      "Web Development",
      "Mobile Development",
      "AI Programming"
    ]
  };

  React.useEffect(() => {
    // 更新页面title
    document.title = finalTitle;

    // 创建或更新meta标签
    const updateMetaTag = (name: string, content: string, property = false) => {
      const attribute = property ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    };

    // 基础SEO标签
    updateMetaTag('description', finalDescription);
    updateMetaTag('keywords', finalKeywords.join(', '));
    updateMetaTag('author', finalAuthor);
    updateMetaTag('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    updateMetaTag('language', currentLanguage);
    updateMetaTag('viewport', 'width=device-width, initial-scale=1.0');

    // Open Graph标签 (Facebook, LinkedIn等)
    updateMetaTag('og:type', finalType, true);
    updateMetaTag('og:title', finalTitle, true);
    updateMetaTag('og:description', finalDescription, true);
    updateMetaTag('og:image', finalImage, true);
    updateMetaTag('og:url', currentUrl, true);
    updateMetaTag('og:site_name', currentDefaults.siteName, true);
    updateMetaTag('og:locale', currentLanguage === 'zh' ? 'zh_CN' : 'en_US', true);

    // 如果是文章类型，添加额外的OG标签
    if (finalType === 'article') {
      if (seoData.publishedTime) updateMetaTag('article:published_time', seoData.publishedTime, true);
      if (seoData.modifiedTime) updateMetaTag('article:modified_time', seoData.modifiedTime, true);
      if (finalAuthor) updateMetaTag('article:author', finalAuthor, true);
      if (seoData.section) updateMetaTag('article:section', seoData.section, true);
      finalKeywords.forEach(keyword => {
        const meta = document.createElement('meta');
        meta.setAttribute('property', 'article:tag');
        meta.setAttribute('content', keyword);
        document.head.appendChild(meta);
      });
    }

    // Twitter Card标签
    updateMetaTag('twitter:card', finalTwitterCard);
    updateMetaTag('twitter:title', finalTitle);
    updateMetaTag('twitter:description', finalDescription);
    updateMetaTag('twitter:image', finalImage);
    updateMetaTag('twitter:site', '@noahchen'); // 替换为你的Twitter用户名
    updateMetaTag('twitter:creator', '@noahchen'); // 替换为你的Twitter用户名

    // LinkedIn特定优化
    updateMetaTag('linkedin:owner', 'noah-chen-linkedin-id'); // 替换为你的LinkedIn ID

    // Instagram特定优化 (主要通过OG标签)
    updateMetaTag('instagram:app:name', currentDefaults.siteName);

    // Google特定标签
    updateMetaTag('google-site-verification', 'your-google-verification-code'); // 替换为你的Google验证码
    updateMetaTag('theme-color', '#3b82f6'); // 终端主题色

    // 移动设备优化
    updateMetaTag('apple-mobile-web-app-capable', 'yes');
    updateMetaTag('apple-mobile-web-app-status-bar-style', 'black-translucent');
    updateMetaTag('apple-mobile-web-app-title', currentDefaults.siteName);

    // 微软应用程序瓦片
    updateMetaTag('msapplication-TileColor', '#3b82f6');
    updateMetaTag('msapplication-TileImage', `${baseUrl}/ms-icon-144x144.png`);

    // 更新或创建结构化数据
    let scriptTag = document.querySelector('#structured-data') as HTMLScriptElement;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'structured-data';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(structuredData);

    // 创建或更新canonical链接
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = currentUrl;

    // 添加hreflang标签用于多语言SEO
    const addHreflang = (lang: string, url: string) => {
      let hreflangLink = document.querySelector(`link[hreflang="${lang}"]`) as HTMLLinkElement;
      if (!hreflangLink) {
        hreflangLink = document.createElement('link');
        hreflangLink.rel = 'alternate';
        hreflangLink.hreflang = lang;
        document.head.appendChild(hreflangLink);
      }
      hreflangLink.href = url;
    };

    addHreflang('zh', currentUrl.replace(/[?&]lang=en/, '').includes('?') ? `${currentUrl}&lang=zh` : `${currentUrl}?lang=zh`);
    addHreflang('en', currentUrl.replace(/[?&]lang=zh/, '').includes('?') ? `${currentUrl}&lang=en` : `${currentUrl}?lang=en`);
    addHreflang('x-default', currentUrl.replace(/[?&]lang=(zh|en)/, ''));

  }, [finalTitle, finalDescription, finalKeywords, finalImage, currentUrl, finalType, seoData.publishedTime, seoData.modifiedTime, finalAuthor, seoData.section, finalTwitterCard, currentLanguage, seoData.siteName, structuredData]);

  return null; // 这个组件不渲染任何可见内容
};

export default SEOHead;