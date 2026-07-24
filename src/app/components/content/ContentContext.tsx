import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Language } from '../language/LanguageContext';
import recoveredContent from '../../data/supabase-content.json';
import recoveredImages from '../../data/supabase-images.json';

export interface ContentItem {
  id: string;
  type: string;
  category?: string;
  title?: string;
  data: any;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  language: Language;
  sort_order?: number;
  createdAt?: string;
  updatedAt?: string;
  sortOrder?: number;
}

export interface FileItem {
  id: string;
  filename: string;
  file_path: string;
  file_url: string;
  file_type: string;
  file_size: number;
  content_id?: string;
  uploaded_at: string;
  uploaded_by: string | null;
}

export interface ImageItem {
  id: string;
  filename: string;
  file_path: string;
  file_url: string;
  file_type: string;
  file_size: number;
  alt_text?: string;
  caption?: string;
  uploaded_at: string;
  uploaded_by: string | null;
}

interface PortfolioContentContextType {
  getContent: (type: string, category?: string, language?: Language) => Promise<ContentItem[]>;
  createContent: (content: Omit<ContentItem, 'id' | 'created_at' | 'updated_at'>) => Promise<ContentItem>;
  updateContent: (id: string, updates: Partial<ContentItem>) => Promise<ContentItem>;
  deleteContent: (id: string) => Promise<void>;
  uploadFile: (file: File) => Promise<FileItem>;
  uploadImage: (file: File, altText?: string, caption?: string) => Promise<ImageItem>;
  getImages: (forceRefresh?: boolean) => Promise<ImageItem[]>;
  getImageUrl: (imageId: string) => string;
  deleteImage: (id: string) => Promise<void>;
  updateImage: (id: string, updates: Partial<ImageItem>) => Promise<ImageItem>;
  syncStorage: (forceSync?: boolean) => Promise<{ success: boolean; message: string; results?: any }>;
  cleanupImages: () => Promise<{ success: boolean; message: string; results?: any }>;
  cache: Map<string, { data: ContentItem[]; timestamp: number }>;
  clearCache: () => void;
  isOnline: boolean;
  initializeGuestSession: () => Promise<void>;
  guestSession: any;
  forceOnlineStatus: (status: boolean) => void;
  getContentByLanguage: (type: string, language: Language, category?: string) => Promise<ContentItem[]>;
  getAllLanguageVersions: (type: string, category?: string) => Promise<{ zh: ContentItem[]; en: ContentItem[] }>;
  lastUpdateTimestamp: number;
  refreshContent: (type: string, language: Language) => Promise<void>;
  refreshImages: () => Promise<void>;
  triggerImageSync: () => void;
}

const now = '2026-07-24T00:00:00.000Z';

const item = (
  id: string,
  type: string,
  language: Language,
  data: any,
  sortOrder = 1,
): ContentItem => ({
  id,
  type,
  title: data.title,
  data,
  language,
  is_published: true,
  sort_order: sortOrder,
  sortOrder,
  created_at: now,
  updated_at: now,
  createdAt: now,
  updatedAt: now,
});

// A local snapshot assembled from the last repository and the Figma export.
// It deliberately contains no private contact details or remote image URLs.
const STATIC_CONTENT: ContentItem[] = [
  item('home-zh', 'home', 'zh', {
    heroTitle: 'Noah Chen',
    heroSubtitle: '双语创意项目与展览经理',
    summary: '拥有 7 年以上国际项目经验，专注于大型展览、文化活动与跨学科项目的策划、协调和落地。这个版本先以静态作品集呈现，后续可继续补充真实项目图片与内容。',
    workExperienceTitle: '专业经历',
    workExperience: [
      {
        company: '国际文化与展览项目',
        position: '创意项目与展览管理',
        period: '7 年以上',
        description: '连接策展愿景、跨文化沟通与运营执行，协调合作伙伴、创作者和制作团队，推动复杂项目按计划落地。',
      },
      {
        company: 'AI 与数字化实践',
        position: '独立探索与产品原型',
        period: '持续进行',
        description: '使用 AI 辅助研究、内容生产和网站开发，探索新工具在文化项目与个人知识管理中的应用。',
      },
    ],
    skillsTitle: '核心能力',
    skills: ['展览策划', '项目管理', '跨文化沟通', '内容策略', '公共参与', 'AI 辅助创作', '中英双语'],
    ctaTitle: '浏览作品集',
    ctaDescription: '这是从 Figma 代码和旧仓库恢复出的静态预览版。',
    navigationButtons: [
      { id: 'projects', text: '查看项目', target: 'projects', style: 'primary' },
      { id: 'contact', text: '联系合作', target: 'contact', style: 'secondary' },
    ],
  }),
  item('home-en', 'home', 'en', {
    heroTitle: 'Noah Chen',
    heroSubtitle: 'Bilingual Creative Project & Exhibition Manager',
    summary: 'With 7+ years of international experience, I focus on planning, coordinating and delivering large-scale exhibitions, cultural campaigns and interdisciplinary activations. This restored version is presented as a static portfolio and is ready for real project imagery and copy.',
    workExperienceTitle: 'Professional Experience',
    workExperience: [
      {
        company: 'International Culture & Exhibition Projects',
        position: 'Creative Project and Exhibition Management',
        period: '7+ years',
        description: 'Bridging curatorial vision, cross-cultural communication and operational delivery while coordinating partners, creators and production teams.',
      },
      {
        company: 'AI & Digital Practice',
        position: 'Independent Exploration and Prototyping',
        period: 'Ongoing',
        description: 'Using AI-assisted research, content production and web development to explore new workflows for cultural projects and personal knowledge management.',
      },
    ],
    skillsTitle: 'Core Capabilities',
    skills: ['Exhibition Planning', 'Project Management', 'Cross-cultural Communication', 'Content Strategy', 'Public Engagement', 'AI-assisted Creation', 'Chinese & English'],
    ctaTitle: 'Explore the Portfolio',
    ctaDescription: 'A static preview restored from the Figma export and the previous repository.',
    navigationButtons: [
      { id: 'projects', text: 'View Projects', target: 'projects', style: 'primary' },
      { id: 'contact', text: 'Get in Touch', target: 'contact', style: 'secondary' },
    ],
  }),
  item('project-cultural-zh', 'projects', 'zh', {
    title: '国际文化项目与展览管理',
    description: '围绕大型展览、文化活动和跨学科合作，统筹从概念发展、合作方沟通到现场执行的完整流程。',
    role: '创意项目与展览经理',
    period: '代表性经验',
    technologies: ['策展协作', '预算与排期', '供应商管理', '中英双语沟通'],
    highlights: ['连接创意目标与落地执行', '协调多方合作伙伴', '面向公众的文化体验设计'],
    featured: true,
    order: 2,
  }, 2),
  item('project-cultural-en', 'projects', 'en', {
    title: 'International Cultural Projects & Exhibitions',
    description: 'End-to-end coordination for large-scale exhibitions, cultural campaigns and interdisciplinary collaborations—from concept development and partner communication to on-site delivery.',
    role: 'Creative Project & Exhibition Manager',
    period: 'Selected experience',
    technologies: ['Curatorial Collaboration', 'Budget & Scheduling', 'Vendor Management', 'Bilingual Communication'],
    highlights: ['Connecting creative goals with delivery', 'Coordinating multiple stakeholders', 'Designing public-facing cultural experiences'],
    featured: true,
    order: 2,
  }, 2),
  item('project-portfolio-zh', 'projects', 'zh', {
    title: 'Noah Chen 个人作品集',
    description: '从 Figma 导出代码与旧仓库恢复、整理并静态化的双语个人网站。当前版本不依赖数据库，可独立部署与浏览。',
    role: '产品策划 / AI 辅助开发',
    period: '2025–2026',
    technologies: ['React', 'TypeScript', 'Vite', 'Vercel', 'Figma'],
    highlights: ['双语内容', '响应式终端视觉', '静态数据快照', '为后续 Supabase 恢复预留结构'],
    featured: true,
    githubUrl: 'https://github.com/noahchen93/Personal-Website',
    order: 1,
  }),
  item('project-portfolio-en', 'projects', 'en', {
    title: 'Noah Chen Personal Portfolio',
    description: 'A bilingual portfolio restored and reorganized from the Figma code export and previous repository. The current version is database-independent and deploys as a static site.',
    role: 'Product Direction / AI-assisted Development',
    period: '2025–2026',
    technologies: ['React', 'TypeScript', 'Vite', 'Vercel', 'Figma'],
    highlights: ['Bilingual content', 'Responsive terminal aesthetic', 'Static content snapshot', 'Ready for a future Supabase reconnection'],
    featured: true,
    githubUrl: 'https://github.com/noahchen93/Personal-Website',
    order: 1,
  }),
  item('ai-zh', 'ai-explore', 'zh', {
    title: '我的 AI 探索',
    subtitle: '把新工具转化为可用的创意工作流',
    introduction: '这里记录我在 AI 辅助研究、内容生产、产品原型和网站开发方面的实践。',
    projects: [
      {
        id: 'ai-portfolio',
        title: 'AI 辅助作品集重构',
        description: '梳理 Figma 导出代码、诊断失效后端，并把动态站点改造成可独立部署的静态版本。',
        content: '本项目探索如何让 AI 参与代码审查、数据恢复、内容整理与部署验证，同时保留人工对内容真实性和视觉方向的控制。',
        coverImage: '',
        url: 'https://github.com/noahchen93/Personal-Website',
        githubUrl: 'https://github.com/noahchen93/Personal-Website',
        tags: ['AI Coding', 'React', '内容恢复'],
        featured: true,
        createdAt: now,
        type: 'url',
      },
    ],
    lastUpdated: now,
  }),
  item('ai-en', 'ai-explore', 'en', {
    title: 'My AI Exploration',
    subtitle: 'Turning emerging tools into practical creative workflows',
    introduction: 'A record of my experiments with AI-assisted research, content production, product prototyping and web development.',
    projects: [
      {
        id: 'ai-portfolio',
        title: 'AI-assisted Portfolio Restoration',
        description: 'Reviewing a Figma code export, diagnosing an unavailable backend, and converting the dynamic site into a self-contained static deployment.',
        content: 'This project explores how AI can support code review, data recovery, content organization and deployment checks while keeping human judgment in control of accuracy and creative direction.',
        coverImage: '',
        url: 'https://github.com/noahchen93/Personal-Website',
        githubUrl: 'https://github.com/noahchen93/Personal-Website',
        tags: ['AI Coding', 'React', 'Content Recovery'],
        featured: true,
        createdAt: now,
        type: 'url',
      },
    ],
    lastUpdated: now,
  }),
  item('blog-zh', 'blog', 'zh', {
    title: '从失效后端到静态作品集',
    excerpt: '一次关于内容恢复、依赖梳理和渐进式重建的实践记录。',
    content: '原网站依赖 Supabase 保存内容和图片。服务长期暂停后，前端仍然存在，但页面无法取得数据。当前版本先把可确认的内容整理为本地快照，使网站恢复可访问；数据库归档和图片将在取得正确账户访问权限后继续补回。',
    readingTime: '3 分钟',
    tags: ['网站恢复', 'Supabase', 'Vercel', 'AI Coding'],
    featured: true,
    order: 1,
  }),
  item('blog-en', 'blog', 'en', {
    title: 'From an Unavailable Backend to a Static Portfolio',
    excerpt: 'A practical note on content recovery, dependency cleanup and incremental rebuilding.',
    content: 'The original site relied on Supabase for content and images. After the service had remained paused for a long time, the frontend still existed but could no longer retrieve its data. This version first turns confirmed content into a local snapshot so the site is accessible again. Database archives and imagery can be restored once the correct account is available.',
    readingTime: '3 min',
    tags: ['Website Recovery', 'Supabase', 'Vercel', 'AI Coding'],
    featured: true,
    order: 1,
  }),
  item('interest-art-zh', 'interests', 'zh', {
    title: '艺术、展览与公共空间',
    description: '关注艺术如何进入公共生活，以及展览如何成为人与城市之间的连接界面。',
    content: '我持续关注当代艺术、展览叙事与公共参与，也乐于观察不同文化语境如何改变观众与作品之间的关系。',
    type: 'content',
  }, 1),
  item('interest-art-en', 'interests', 'en', {
    title: 'Art, Exhibitions & Public Space',
    description: 'Interested in how art enters public life and how exhibitions connect people with cities.',
    content: 'I keep exploring contemporary art, exhibition narratives and public engagement, with a particular interest in how cultural contexts reshape the relationship between audiences and artworks.',
    type: 'content',
  }, 1),
  item('interest-tech-zh', 'interests', 'zh', {
    title: 'AI 与新工具',
    description: '把新技术当作创意与组织工具，而不仅是效率工具。',
    content: '我会持续测试 AI、自动化和数字产品，思考它们如何帮助研究、表达、协作与知识管理。',
    type: 'content',
  }, 2),
  item('interest-tech-en', 'interests', 'en', {
    title: 'AI & Emerging Tools',
    description: 'Treating technology as a creative and organizational medium—not only an efficiency tool.',
    content: 'I regularly test AI, automation and digital products, looking for thoughtful ways they can support research, expression, collaboration and knowledge management.',
    type: 'content',
  }, 2),
  item('interest-culture-zh', 'interests', 'zh', {
    title: '跨文化观察',
    description: '通过旅行、阅读和项目协作理解不同地方的文化表达。',
    content: '跨文化工作让我更重视语境、倾听与翻译，也让我持续记录城市、社区和日常生活中的文化细节。',
    type: 'content',
  }, 3),
  item('interest-culture-en', 'interests', 'en', {
    title: 'Cross-cultural Observation',
    description: 'Understanding cultural expression through travel, reading and collaborative projects.',
    content: 'Cross-cultural work has made me value context, listening and translation, while encouraging me to notice the cultural details embedded in cities, communities and everyday life.',
    type: 'content',
  }, 3),
  item('settings-zh', 'page-settings', 'zh', {
    interests: {
      title: '兴趣与观察',
      subtitle: '> 技术之外的生活、文化与持续探索',
      description: '这里先放入可确认的内容方向，后续可以继续补充文章、播客和图片。',
    },
  }),
  item('settings-en', 'page-settings', 'en', {
    interests: {
      title: 'Interests & Observations',
      subtitle: '> Culture, life and continuing exploration beyond technology',
      description: 'This restored version starts with confirmed themes and can later be expanded with essays, podcasts and imagery.',
    },
  }),
  item('contact-zh', 'contact', 'zh', {
    pageSettings: {
      title: '联系终端',
      subtitle: '> 建立连接，开启对话',
      description: '如果你有文化项目、展览开发、数字内容或跨学科合作的想法，欢迎通过 GitHub 与我联系。',
    },
    personalInfo: {
      location: '中国',
      socialLinks: [
        { platform: 'GitHub', url: 'https://github.com/noahchen93' },
      ],
    },
  }),
  item('contact-en', 'contact', 'en', {
    pageSettings: {
      title: 'Contact Terminal',
      subtitle: '> Initialize connection, start a conversation',
      description: 'For cultural projects, exhibition development, digital content or interdisciplinary collaborations, you can currently reach me through GitHub.',
    },
    personalInfo: {
      location: 'China',
      socialLinks: [
        { platform: 'GitHub', url: 'https://github.com/noahchen93' },
      ],
    },
  }),
];

const SINGLETON_TYPES = new Set(['home', 'contact', 'ai-explore', 'page-settings']);

const RECOVERED_CONTENT = (recoveredContent as ContentItem[])
  .filter((entry) => entry.is_published && (entry.language === 'zh' || entry.language === 'en'))
  .map((entry) => ({
    ...entry,
    createdAt: entry.created_at,
    updatedAt: entry.updated_at,
    sortOrder: entry.sort_order ?? entry.data?.order,
  }));

const DEDUPED_RECOVERED_CONTENT = RECOVERED_CONTENT.filter((entry, index, entries) => {
      if (!SINGLETON_TYPES.has(entry.type)) return true;
      const newest = entries
        .filter((candidate) => candidate.type === entry.type && candidate.language === entry.language)
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0];
      return newest?.id === entry.id;
    });

const INITIAL_CONTENT = RECOVERED_CONTENT.length > 0
  ? [
      ...DEDUPED_RECOVERED_CONTENT,
      ...STATIC_CONTENT.filter((fallback) => !DEDUPED_RECOVERED_CONTENT.some(
        (recovered) => recovered.type === fallback.type && recovered.language === fallback.language,
      )),
    ]
  : STATIC_CONTENT;

const RECOVERED_IMAGES = recoveredImages as ImageItem[];

const PortfolioContentContext = createContext<PortfolioContentContextType | undefined>(undefined);

const unavailable = async (): Promise<never> => {
  throw new Error('Editing is disabled in the static preview.');
};

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<ContentItem[]>(INITIAL_CONTENT);
  const [lastUpdateTimestamp, setLastUpdateTimestamp] = useState(Date.now());
  const cache = useMemo(() => new Map<string, { data: ContentItem[]; timestamp: number }>(), []);
  const guestSession = useMemo(() => ({ id: 'static-guest', type: 'local' }), []);

  const getContentByLanguage = useCallback(async (
    type: string,
    language: Language,
    category?: string,
  ) => content
    .filter((entry) => entry.type === type
      && entry.language === language
      && entry.is_published
      && (!category || entry.category === category))
    .sort((a, b) => (a.sortOrder ?? a.sort_order ?? 0) - (b.sortOrder ?? b.sort_order ?? 0)), [content]);

  const getContent = useCallback(async (
    type: string,
    category?: string,
    language: Language = 'zh',
  ) => getContentByLanguage(type, language, category), [getContentByLanguage]);

  const createContent = useCallback(async (
    entry: Omit<ContentItem, 'id' | 'created_at' | 'updated_at'>,
  ) => {
    const created: ContentItem = {
      ...entry,
      id: `local-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setContent((current) => [...current, created]);
    setLastUpdateTimestamp(Date.now());
    return created;
  }, []);

  const updateContent = useCallback(async (id: string, updates: Partial<ContentItem>) => {
    let updated: ContentItem | undefined;
    setContent((current) => current.map((entry) => {
      if (entry.id !== id) return entry;
      updated = { ...entry, ...updates, updated_at: new Date().toISOString() };
      return updated;
    }));
    if (!updated) throw new Error(`Content not found: ${id}`);
    setLastUpdateTimestamp(Date.now());
    return updated;
  }, []);

  const deleteContent = useCallback(async (id: string) => {
    setContent((current) => current.filter((entry) => entry.id !== id));
    setLastUpdateTimestamp(Date.now());
  }, []);

  const getImages = useCallback(async () => RECOVERED_IMAGES, []);
  const getImageUrl = useCallback((imageId: string) => (
    RECOVERED_IMAGES.find((image) => image.id === imageId)?.file_url ?? ''
  ), []);
  const clearCache = useCallback(() => cache.clear(), [cache]);
  const noop = useCallback(async () => {}, []);

  const value = useMemo<PortfolioContentContextType>(() => ({
    getContent,
    createContent,
    updateContent,
    deleteContent,
    uploadFile: unavailable,
    uploadImage: unavailable,
    getImages,
    getImageUrl,
    deleteImage: unavailable,
    updateImage: unavailable,
    syncStorage: async () => ({ success: false, message: 'Static preview: storage sync is disabled.' }),
    cleanupImages: async () => ({ success: true, message: 'Static preview contains no remote images.' }),
    cache,
    clearCache,
    isOnline: false,
    initializeGuestSession: noop,
    guestSession,
    forceOnlineStatus: () => {},
    getContentByLanguage,
    getAllLanguageVersions: async (type, category) => ({
      zh: await getContentByLanguage(type, 'zh', category),
      en: await getContentByLanguage(type, 'en', category),
    }),
    lastUpdateTimestamp,
    refreshContent: noop,
    refreshImages: noop,
    triggerImageSync: () => {},
  }), [
    cache,
    clearCache,
    createContent,
    deleteContent,
    getContent,
    getContentByLanguage,
    getImageUrl,
    getImages,
    guestSession,
    lastUpdateTimestamp,
    noop,
    updateContent,
  ]);

  return (
    <PortfolioContentContext.Provider value={value}>
      {children}
    </PortfolioContentContext.Provider>
  );
}

export function useContent(): PortfolioContentContextType {
  const context = useContext(PortfolioContentContext);
  if (!context) throw new Error('useContent must be used within a ContentProvider');
  return context;
}
