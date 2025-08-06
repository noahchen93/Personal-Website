// CMS Editor Constants and Text Definitions

export const TEXTS = {
  zh: {
    // Common actions
    save: '保存',
    cancel: '取消',
    edit: '编辑',
    delete: '删除',
    add: '添加',
    saved: '已保存',
    saving: '保存中...',
    loading: '加载中...',
    success: '操作成功',
    error: '操作失败',
    confirmDelete: '确认删除吗？此操作不可恢复。',
    required: '此字段为必填项',
    
    // Form fields
    title: '标题',
    name: '姓名',
    description: '描述',
    content: '内容',
    category: '分类',
    tags: '标签',
    date: '日期',
    location: '地点',
    email: '邮箱',
    phone: '电话',
    website: '网站',
    
    // Specific sections
    homeManagement: '首页管理',
    personalInfo: '个人信息',
    socialLinks: '社交链接',
    skills: '技能',
    highlights: '亮点',
    
    // Curatorial specific terms
    curatorialProfile: '策展人简介',
    curatorialPhilosophy: '策展理念',
    specialties: '专业领域',
    exhibitions: '展览项目',
    role: '担任角色',
    coreContent: '核心内容及个人贡献',
    artworkCount: '作品数量',
    artists: '参展艺术家',
    collaborators: '合作方',
    achievements: '项目成果',
    methodology: '方法论',
    execution: '执行要点',
    
    // Date formats
    startDate: '开始时间',
    endDate: '结束时间',
    current: '至今',
    
    // File management
    upload: '上传文件',
    selectFiles: '选择文件',
    supportedFormats: '支持的格式',
    
    // Links
    addLink: '添加链接',
    removeLink: '移除链接',
    linkType: '链接类型',
    linkUrl: '链接地址',
    linkLabel: '链接标题'
  },
  en: {
    // Common actions
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    add: 'Add',
    saved: 'Saved',
    saving: 'Saving...',
    loading: 'Loading...',
    success: 'Operation successful',
    error: 'Operation failed',
    confirmDelete: 'Are you sure you want to delete? This action cannot be undone.',
    required: 'This field is required',
    
    // Form fields
    title: 'Title',
    name: 'Name',
    description: 'Description',
    content: 'Content',
    category: 'Category',
    tags: 'Tags',
    date: 'Date',
    location: 'Location',
    email: 'Email',
    phone: 'Phone',
    website: 'Website',
    
    // Specific sections
    homeManagement: 'Home Management',
    personalInfo: 'Personal Information',
    socialLinks: 'Social Links',
    skills: 'Skills',
    highlights: 'Highlights',
    
    // Curatorial specific terms
    curatorialProfile: 'Curatorial Profile',
    curatorialPhilosophy: 'Curatorial Philosophy',
    specialties: 'Specialties',
    exhibitions: 'Exhibition Projects',
    role: 'Role',
    coreContent: 'Core Content & Personal Contribution',
    artworkCount: 'Artwork Count',
    artists: 'Featured Artists',
    collaborators: 'Collaborators',
    achievements: 'Achievements',
    methodology: 'Methodology',
    execution: 'Execution Points',
    
    // Date formats
    startDate: 'Start Date',
    endDate: 'End Date',
    current: 'Present',
    
    // File management
    upload: 'Upload File',
    selectFiles: 'Select Files',
    supportedFormats: 'Supported Formats',
    
    // Links
    addLink: 'Add Link',
    removeLink: 'Remove Link',
    linkType: 'Link Type',
    linkUrl: 'URL',
    linkLabel: 'Label'
  }
};

export const LINK_TYPES = {
  website: { zh: '网站', en: 'Website' },
  github: { zh: 'GitHub', en: 'GitHub' },
  linkedin: { zh: 'LinkedIn', en: 'LinkedIn' },
  portfolio: { zh: '作品集', en: 'Portfolio' },
  demo: { zh: '演示', en: 'Demo' },
  documentation: { zh: '文档', en: 'Documentation' },
  blog: { zh: '博客', en: 'Blog' },
  social: { zh: '社交媒体', en: 'Social Media' },
  exhibition: { zh: '展览链接', en: 'Exhibition Link' },
  press: { zh: '媒体报道', en: 'Press Coverage' },
  other: { zh: '其他', en: 'Other' }
};

export const EMPLOYMENT_TYPES = {
  'full-time': { zh: '全职', en: 'Full-time' },
  'part-time': { zh: '兼职', en: 'Part-time' },
  contract: { zh: '合同工', en: 'Contract' },
  internship: { zh: '实习', en: 'Internship' },
  freelance: { zh: '自由职业', en: 'Freelance' }
};

export const PROJECT_STATUS = {
  completed: { zh: '已完成', en: 'Completed' },
  'in-progress': { zh: '进行中', en: 'In Progress' },
  paused: { zh: '暂停', en: 'Paused' },
  cancelled: { zh: '已取消', en: 'Cancelled' }
};

export const CURATORIAL_ROLES = {
  curator: { zh: '策展人', en: 'Curator' },
  'assistant-curator': { zh: '助理策展人', en: 'Assistant Curator' },
  'co-curator': { zh: '联合策展人', en: 'Co-Curator' },
  'project-manager': { zh: '项目经理', en: 'Project Manager' },
  'project-lead': { zh: '项目负责人', en: 'Project Lead' },
  'artistic-director': { zh: '艺术总监', en: 'Artistic Director' },
  'creative-producer': { zh: '创意制作人', en: 'Creative Producer' }
};

export const EXHIBITION_CATEGORIES = {
  'solo-exhibition': { zh: '个展', en: 'Solo Exhibition' },
  'group-exhibition': { zh: '群展', en: 'Group Exhibition' },
  'public-art': { zh: '公共艺术', en: 'Public Art' },
  'digital-exhibition': { zh: '线上展览', en: 'Digital Exhibition' },
  'commercial-space': { zh: '商业空间', en: 'Commercial Space' },
  'institutional': { zh: '机构展览', en: 'Institutional Exhibition' },
  'festival': { zh: '艺术节', en: 'Festival' },
  'biennale': { zh: '双年展', en: 'Biennale' }
};

export const PROFESSIONAL_SPECIALTIES = {
  'public-art-curation': { zh: '公共艺术策展', en: 'Public Art Curation' },
  'interdisciplinary-collaboration': { zh: '跨学科合作', en: 'Interdisciplinary Collaboration' },
  'spatial-design': { zh: '空间设计', en: 'Spatial Design' },
  'project-management': { zh: '项目管理', en: 'Project Management' },
  'international-artist-relations': { zh: '国际艺术家联络', en: 'International Artist Relations' },
  'commercial-art-space-operations': { zh: '商业艺术空间运营', en: 'Commercial Art Space Operations' },
  'digital-exhibition-design': { zh: '数字展览设计', en: 'Digital Exhibition Design' },
  'immersive-experience-design': { zh: '沉浸式体验设计', en: 'Immersive Experience Design' }
};

export const SOCIAL_PLATFORMS = {
  linkedin: 'LinkedIn',
  github: 'GitHub',
  behance: 'Behance',
  dribbble: 'Dribbble',
  twitter: 'Twitter / X',
  instagram: 'Instagram',
  artsy: 'Artsy',
  weibo: '微博'
};