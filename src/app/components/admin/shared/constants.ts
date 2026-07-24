export const EDITOR_SECTIONS = [
  { id: 'home' as const, name: '首页内容', icon: 'Home', color: 'bg-blue-500' },
  { id: 'projects' as const, name: '项目经历', icon: 'Briefcase', color: 'bg-green-500' },
  { id: 'interests' as const, name: '个人兴趣', icon: 'Heart', color: 'bg-purple-500' },
  { id: 'blog' as const, name: '博客文章', icon: 'FileText', color: 'bg-orange-500' },
];

export const INTEREST_CATEGORIES = {
  gaming: { name: '游戏', icon: 'Gamepad2', color: 'purple' },
  ai: { name: 'AI', icon: 'Brain', color: 'blue' },
  '3d-printing': { name: '3D打印', icon: 'Box', color: 'green' },
  inspiration: { name: '灵感', icon: 'Lightbulb', color: 'yellow' },
  writing: { name: '写作', icon: 'PenTool', color: 'pink' }
} as const;

export const DEFAULT_HOME_DATA = {
  education: [],
  workExperience: [],
  skills: [],
  summary: ''
};

export const DEFAULT_PROJECT_DATA = {
  title: '新项目',
  description: '',
  role: '',
  period: '',
  technologies: [],
  highlights: [],
  link: '',
  repository: '',
  files: []
};

export const DEFAULT_BLOG_DATA = {
  title: '新文章',
  content: '',
  excerpt: '',
  tags: [],
  files: []
};