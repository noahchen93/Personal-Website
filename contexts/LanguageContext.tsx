import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'zh' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// 翻译文本对象
const translations = {
  zh: {
    // Navigation
    'nav.home': '首页',
    'nav.about': '个人简介', 
    'nav.education': '教育背景',
    'nav.experience': '工作经历',
    'nav.projects': '项目案例',
    'nav.interests': '兴趣爱好',
    'nav.contact': '联系我',
    'nav.admin': '管理模式',
    'nav.exit-admin': '退出管理',
    'nav.title': '我的作品集',
    'nav.subtitle': '设计师 · 策展人 · 创作者',

    // About Section
    'about.title': '关于我',
    'about.subtitle': '双语创意项目与展览经理，拥有超过7年的大型展览、文化活动和跨学科项目执行经验',
    'about.professional-background': '专业背景',
    'about.core-competencies': '核心能力',
    'about.professional-skills': '专业技能',
    'about.tools-and-tech': '工具与技术',
    'about.work-philosophy': '工作理念',
    'about.cultural-bridge': '文化桥梁',
    'about.cultural-bridge-desc': '在不同文化间建立连接，促进跨文化理解与交流。',
    'about.innovation-fusion': '创新融合',
    'about.innovation-fusion-desc': '将传统艺术与现代技术相结合，探索新的表达方式。',
    'about.public-engagement': '公共参与',
    'about.public-engagement-desc': '致力于创造有意义的公共空间体验，提升社区文化生活。',
    'about.continuous-learning': '持续学习',
    'about.continuous-learning-desc': '保持对新兴技术和艺术形式的敏感度，不断拓展专业边界。',
    'about.years-experience': '年工作经验',
    'about.cultural-projects': '文化项目',
    'about.countries': '国家地区',
    'about.working-languages': '工作语言',
    'about.language-ability': '语言能力',
    'about.chinese': '中文（普通话）',
    'about.english': '英语',
    'about.native': '母语',
    'about.professional': '专业水平',

    // Education Section
    'education.title': '教育背景',
    'education.subtitle': '扎实的学术基础与国际化视野为我的策展实践提供了深厚的理论支撑',
    'education.academic-experience': '学历经历',
    'education.additional-education': '其他教育经历',
    'education.professional-certification': '专业认证',
    'education.core-courses': '核心课程',
    'education.related-courses': '相关专业课程',
    'education.main-achievements': '主要成就',
    'education.major': '专业方向',

    // Experience Section
    'experience.title': '专业经历',
    'experience.subtitle': '超过7年的大型展览、文化活动和跨学科激活项目执行经验，擅长在策展愿景与运营执行之间建立桥梁',
    'experience.main-responsibilities': '主要职责与成就',
    'experience.core-projects': '核心项目',
    'experience.related-skills': '相关技能',
    'experience.core-competencies-summary': '核心能力总结',
    'experience.core-competencies-desc': '通过多年的国际化工作经验，我在文化项目策划与执行领域积累了全面的专业技能',
    'experience.collaboration-opportunities': '合作机会',
    'experience.collaboration-desc': '如果您有文化项目策划、展览开发或跨学科艺术合作的需求，我很乐意与您深入交流',
    'experience.download-resume': '下载完整简历',
    'experience.full-time': '全职',
    'experience.part-time': '兼职',
    'experience.internship': '实习',
    'experience.freelance': '自由职业',

    // Contact Section  
    'contact.title': '联系我',
    'contact.subtitle': '如果您有文化项目策划、展览开发或跨学科艺术合作的想法，我很乐意与您深入交流讨论',
    'contact.send-message': '发送消息',
    'contact.name': '姓名',
    'contact.email': '邮箱',
    'contact.subject': '主题',
    'contact.message': '消息内容',
    'contact.name-placeholder': '您的姓名',
    'contact.email-placeholder': 'your@email.com',
    'contact.subject-placeholder': '展览策划 / 项目合作 / 咨询服务',
    'contact.message-placeholder': '请详细描述您的项目需求、合作想法或想要讨论的内容...',
    'contact.sending': '发送中...',
    'contact.sent': '已发送',
    'contact.send': '发送消息',
    'contact.contact-info': '联系方式',
    'contact.working-languages': '工作语言',
    'contact.social-media': '社交媒体',
    'contact.collaboration-areas': '合作领域',
    'contact.contact-now': '立即联系',
    'contact.view-portfolio': '查看项目作品',
    'contact.create-together': '让我们一起创造文化价值',
    'contact.create-together-desc': '每一个优秀的文化项目都始于一次深入的对话。无论您是需要展览策划服务、文化活动管理，还是想要探讨跨学科艺术合作的可能性，我都期待与您的交流。',

    // Common
    'common.loading': '加载中...',
    'common.error': '出错了',
    'common.success': '成功',
    'common.cancel': '取消',
    'common.confirm': '确认',
    'common.save': '保存',
    'common.edit': '编辑',
    'common.delete': '删除',
    'common.view-more': '查看更多',
    'common.required': '必填',

    // Projects Section
    'projects.title': '项目案例',
    'projects.subtitle': '精选作品展示我在策展、项目管理和跨学科合作方面的专业能力',
    'projects.view-details': '查看详情',
    'projects.location': '地点',
    'projects.period': '时间',
    'projects.role': '角色',
    'projects.description': '项目描述',
    'projects.achievements': '主要成果',
    'projects.technologies': '技术工具',
    'projects.all': '全部',
    'projects.exhibition': '展览策划',
    'projects.management': '项目管理',
    'projects.design': '设计创作',

    // Interests Section
    'interests.title': '兴趣爱好',
    'interests.subtitle': '多元化的兴趣爱好丰富了我的创作视野，为专业工作带来更多灵感',
    'interests.ai-experiments': 'AI实验',
    'interests.ai-experiments-desc': '探索人工智能在创意领域的应用可能性',
    'interests.3d-printing': '3D打印',
    'interests.3d-printing-desc': '通过数字制造技术实现创意想法',
    'interests.photography': '摄影创作',
    'interests.photography-desc': '用镜头捕捉生活中的美好瞬间',
    'interests.writing': '写作思考',
    'interests.writing-desc': '记录思考过程，分享见解与感悟',
    'interests.view-more': '查看更多',
    'interests.recent-work': '最新作品',

    // Home Section
    'home.welcome': '欢迎来到我的作品集',
    'home.name': 'Noah Chen',
    'home.title': '双语创意项目与展览经理',
    'home.subtitle': '7年+国际经验 · 策展实践专家 · 跨文化合作者',
    'home.cta.about': '了解更多',
    'home.cta.projects': '查看作品',
    'home.cta.contact': '联系合作',
    'home.stats.experience': '工作经验',
    'home.stats.projects': '项目经验',
    'home.stats.countries': '工作国家',
    'home.stats.languages': '工作语言',
    'home.explore': '探索我的专业经历'
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.education': 'Education', 
    'nav.experience': 'Experience',
    'nav.projects': 'Projects',
    'nav.interests': 'Interests',
    'nav.contact': 'Contact',
    'nav.admin': 'Admin Mode',
    'nav.exit-admin': 'Exit Admin',
    'nav.title': 'My Portfolio',
    'nav.subtitle': 'Designer · Curator · Creator',

    // About Section
    'about.title': 'About Me',
    'about.subtitle': 'Bilingual Creative Project & Exhibition Manager with over 7 years of experience delivering large-scale exhibitions, cultural campaigns, and interdisciplinary activations',
    'about.professional-background': 'Professional Background',
    'about.core-competencies': 'Core Competencies',
    'about.professional-skills': 'Professional Skills',
    'about.tools-and-tech': 'Tools & Technology',
    'about.work-philosophy': 'Work Philosophy',
    'about.cultural-bridge': 'Cultural Bridge',
    'about.cultural-bridge-desc': 'Building connections between different cultures and promoting cross-cultural understanding and exchange.',
    'about.innovation-fusion': 'Innovation Fusion',
    'about.innovation-fusion-desc': 'Combining traditional art with modern technology to explore new forms of expression.',
    'about.public-engagement': 'Public Engagement',
    'about.public-engagement-desc': 'Committed to creating meaningful public space experiences and enhancing community cultural life.',
    'about.continuous-learning': 'Continuous Learning',
    'about.continuous-learning-desc': 'Maintaining sensitivity to emerging technologies and art forms, constantly expanding professional boundaries.',
    'about.years-experience': 'Years Experience',
    'about.cultural-projects': 'Cultural Projects',
    'about.countries': 'Countries/Regions',
    'about.working-languages': 'Working Languages',
    'about.language-ability': 'Language Proficiency',
    'about.chinese': 'Chinese (Mandarin)',
    'about.english': 'English',
    'about.native': 'Native',
    'about.professional': 'Professional',

    // Education Section
    'education.title': 'Education',
    'education.subtitle': 'Solid academic foundation and international perspective provide profound theoretical support for my curatorial practice',
    'education.academic-experience': 'Academic Experience',
    'education.additional-education': 'Additional Education',
    'education.professional-certification': 'Professional Certifications',
    'education.core-courses': 'Core Courses',
    'education.related-courses': 'Related Professional Courses',
    'education.main-achievements': 'Main Achievements',
    'education.major': 'Major',

    // Experience Section
    'experience.title': 'Professional Experience',
    'experience.subtitle': 'Over 7 years of experience in large-scale exhibitions, cultural events, and interdisciplinary project execution, skilled in bridging curatorial vision with operational delivery',
    'experience.main-responsibilities': 'Main Responsibilities & Achievements',
    'experience.core-projects': 'Core Projects',
    'experience.related-skills': 'Related Skills',
    'experience.core-competencies-summary': 'Core Competencies Summary',
    'experience.core-competencies-desc': 'Through years of international work experience, I have accumulated comprehensive professional skills in cultural project planning and execution',
    'experience.collaboration-opportunities': 'Collaboration Opportunities',
    'experience.collaboration-desc': 'If you have cultural project planning, exhibition development, or interdisciplinary art collaboration needs, I would be delighted to discuss in depth',
    'experience.download-resume': 'Download Full Resume',
    'experience.full-time': 'Full-time',
    'experience.part-time': 'Part-time',
    'experience.internship': 'Internship',
    'experience.freelance': 'Freelance',

    // Contact Section
    'contact.title': 'Contact Me',
    'contact.subtitle': 'If you have ideas for cultural project planning, exhibition development, or interdisciplinary art collaboration, I would be delighted to discuss them with you',
    'contact.send-message': 'Send Message',
    'contact.name': 'Name',
    'contact.email': 'Email',
    'contact.subject': 'Subject',
    'contact.message': 'Message',
    'contact.name-placeholder': 'Your Name',
    'contact.email-placeholder': 'your@email.com',
    'contact.subject-placeholder': 'Exhibition Planning / Project Collaboration / Consulting',
    'contact.message-placeholder': 'Please describe your project requirements, collaboration ideas, or topics you would like to discuss...',
    'contact.sending': 'Sending...',
    'contact.sent': 'Sent',
    'contact.send': 'Send Message',
    'contact.contact-info': 'Contact Information',
    'contact.working-languages': 'Working Languages',
    'contact.social-media': 'Social Media',
    'contact.collaboration-areas': 'Collaboration Areas',
    'contact.contact-now': 'Contact Now',
    'contact.view-portfolio': 'View Portfolio',
    'contact.create-together': 'Let\'s Create Cultural Value Together',
    'contact.create-together-desc': 'Every excellent cultural project begins with a sincere dialogue. Whether you need exhibition planning services, cultural event management, or want to explore possibilities for interdisciplinary art collaboration, I look forward to our exchange.',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.view-more': 'View More',
    'common.required': 'Required'
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>('zh');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}