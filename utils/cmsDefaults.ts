export const getDefaultHomeData = (language: 'zh' | 'en') => ({
  heroTitle: language === 'zh' ? 'Noah Chen' : 'Noah Chen',
  heroSubtitle: language === 'zh' ? '双语创意项目与展览经理' : 'Bilingual Creative Project & Exhibition Manager',
  heroDescription: language === 'zh' 
    ? '7年+国际经验 · 策展实践专家 · 跨文化合作者' 
    : '7+ Years International Experience · Curatorial Practice Expert · Cross-cultural Collaborator',
  backgroundImage: '',
  stats: { experience: '7+', projects: '50+', countries: '10+', languages: '2' },
  callToActions: [
    { text: language === 'zh' ? '了解更多' : 'Learn More', link: 'about', style: 'primary' },
    { text: language === 'zh' ? '查看作品' : 'View Work', link: 'projects', style: 'outline' }
  ]
});

export const getDefaultProfileData = (language: 'zh' | 'en') => ({
  bio: language === 'zh' 
    ? '拥有7年国际经验的双语创意项目与展览经理，专注于跨文化艺术项目的策划与实施。具备丰富的项目管理经验，善于在多元文化环境中协调各方资源，推动创新项目的成功落地。' 
    : 'Bilingual creative project and exhibition manager with 7+ years of international experience, specializing in cross-cultural art project planning and implementation.',
  education: [
    {
      institution: language === 'zh' ? '清华大学' : 'Tsinghua University',
      degree: language === 'zh' ? '艺术管理硕士' : 'Master of Arts Management',
      period: '2016-2018',
      description: language === 'zh' ? '专注于当代艺术策展与文化项目管理' : 'Focused on contemporary art curation and cultural project management'
    }
  ],
  experience: [
    {
      company: language === 'zh' ? '国际文化机构' : 'International Cultural Institution',
      position: language === 'zh' ? '项目经理' : 'Project Manager',
      period: '2018-2024',
      description: language === 'zh' ? '负责大型国际艺术展览的策划与执行' : 'Responsible for planning and executing major international art exhibitions'
    }
  ],
  contact: {
    email: 'contact@example.com',
    phone: '+86 138 0000 0000',
    location: language === 'zh' ? '北京, 中国' : 'Beijing, China',
    website: 'https://portfolio.example.com'
  }
});

export const getDefaultEducationData = (language: 'zh' | 'en') => ({
  education: [
    {
      institution: language === 'zh' ? '清华大学' : 'Tsinghua University',
      degree: language === 'zh' ? '艺术管理硕士' : 'Master of Arts Management',
      major: language === 'zh' ? '文化创意产业管理' : 'Cultural Creative Industry Management',
      period: '2016-2018',
      gpa: '3.8/4.0',
      achievements: language === 'zh' 
        ? ['优秀毕业生', '学术奖学金获得者', '学生会主席']
        : ['Outstanding Graduate', 'Academic Scholarship Recipient', 'Student Union President'],
      courses: language === 'zh'
        ? ['策展理论与实践', '文化项目管理', '国际艺术市场', '数字媒体艺术']
        : ['Curatorial Theory and Practice', 'Cultural Project Management', 'International Art Market', 'Digital Media Arts']
    }
  ],
  certifications: [
    {
      name: language === 'zh' ? 'PMP项目管理专业人士' : 'PMP (Project Management Professional)',
      issuer: 'PMI',
      date: '2019',
      credential: 'PMI-2019-001234'
    }
  ]
});

export const getDefaultExperienceData = (language: 'zh' | 'en') => ({
  experience: [
    {
      company: language === 'zh' ? '国际艺术基金会' : 'International Arts Foundation',
      position: language === 'zh' ? '高级项目经理' : 'Senior Project Manager',
      location: language === 'zh' ? '北京，中国' : 'Beijing, China',
      period: '2021-2024',
      description: language === 'zh' 
        ? '负责策划和执行大型国际艺术展览项目，管理跨国团队，协调艺术家、策展人、赞助商等多方资源。'
        : 'Responsible for planning and executing major international art exhibition projects, managing multinational teams.',
      achievements: language === 'zh'
        ? ['成功策划"东西方对话"大型国际艺术展', '获得年度最佳项目经理奖', '为基金会节省项目成本30%']
        : ['Successfully curated "East-West Dialogue" major international art exhibition', 'Received Annual Best Project Manager Award'],
      technologies: language === 'zh'
        ? ['项目管理', '跨文化沟通', '预算控制', '团队领导']
        : ['Project Management', 'Cross-cultural Communication', 'Budget Control', 'Team Leadership']
    }
  ],
  skills: [
    {
      category: language === 'zh' ? '项目管理' : 'Project Management',
      items: language === 'zh' 
        ? ['项目策划', 'PMP认证', '敏捷管理', '风险控制', '预算管理']
        : ['Project Planning', 'PMP Certified', 'Agile Management', 'Risk Control', 'Budget Management']
    },
    {
      category: language === 'zh' ? '艺术策展' : 'Art Curation',
      items: language === 'zh'
        ? ['展览策划', '艺术史研究', '作品选择', '空间设计', '艺术家沟通']
        : ['Exhibition Planning', 'Art History Research', 'Artwork Selection', 'Space Design', 'Artist Communication']
    }
  ]
});

export const getDefaultContactData = (language: 'zh' | 'en') => ({
  contactInfo: {
    email: 'contact@example.com',
    phone: '+86 138 0000 0000',
    location: language === 'zh' ? '北京, 中国' : 'Beijing, China',
    website: 'https://portfolio.example.com',
    wechat: 'example_wechat',
    linkedin: 'https://linkedin.com/in/example'
  },
  socialMedia: [
    {
      platform: language === 'zh' ? '微信' : 'WeChat',
      username: 'example_wechat',
      url: '#'
    }
  ],
  collaborationAreas: language === 'zh'
    ? ['艺术策展', '项目管理', '文化交流', '创意咨询']
    : ['Art Curation', 'Project Management', 'Cultural Exchange', 'Creative Consulting']
});

export const getDefaultProjectsData = (language: 'zh' | 'en') => [
  {
    id: '1',
    title: language === 'zh' ? '东西方对话艺术展' : 'East-West Dialogue Art Exhibition',
    category: language === 'zh' ? '策展项目' : 'Curation Project',
    period: '2023.06 - 2023.09',
    location: language === 'zh' ? '北京' : 'Beijing',
    description: language === 'zh' 
      ? '策划了一场汇集中西方当代艺术家作品的大型国际展览，展示了跨文化对话的可能性。' 
      : 'Curated a major international exhibition featuring contemporary artists from East and West, showcasing possibilities of cross-cultural dialogue.',
    role: language === 'zh' ? '主策展人' : 'Lead Curator',
    technologies: ['Adobe Creative Suite', 'AutoCAD', 'Project Management'],
    achievements: language === 'zh'
      ? ['吸引观众超过50,000人次', '获得多家媒体报道', '促成艺术家之间的长期合作']
      : ['Attracted over 50,000 visitors', 'Featured in multiple media outlets', 'Facilitated long-term collaborations between artists'],
    links: ['https://example.com/exhibition'],
    images: []
  }
];

export const getDefaultInterestsData = (language: 'zh' | 'en') => [
  {
    id: '1',
    title: language === 'zh' ? '摄影' : 'Photography',
    category: language === 'zh' ? '艺术' : 'Art',
    description: language === 'zh' 
      ? '专注于街头摄影和人文纪实，用镜头记录城市变迁和人物故事。' 
      : 'Focusing on street photography and documentary, capturing urban changes and human stories through the lens.',
    level: language === 'zh' ? '中级' : 'Intermediate',
    achievements: language === 'zh'
      ? ['参加本地摄影展3次', '获得社区摄影比赛二等奖']
      : ['Participated in 3 local photography exhibitions', 'Won 2nd place in community photography contest'],
    resources: ['Instagram: @example_photo', 'Flickr portfolio']
  }
];

export const getDefaultThemeData = () => ({
  colors: {
    primary: '#1A202C',
    secondary: '#2D3748',
    accent: '#ECC94B',
    background: '#ffffff',
    foreground: '#000000'
  },
  fonts: { heading: 'Inter', body: 'Inter' },
  spacing: { containerMaxWidth: '1200px', sectionPadding: '4rem' }
});

export const getDefaultSiteSettings = () => ({
  siteName: '个人作品集',
  siteDescription: '',
  seo: { title: '', description: '', keywords: '' },
  analytics: { googleAnalyticsId: '' }
});