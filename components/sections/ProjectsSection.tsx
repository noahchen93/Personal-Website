import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { Alert, AlertDescription } from '../ui/alert';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  Palette, ExternalLink, Calendar, MapPin, 
  Tag, Filter, Grid, List, AlertCircle, Users, Award,
  Building, Star, TrendingUp
} from 'lucide-react';
import { fetchProjectsData } from '../../utils/api';

interface ExhibitionProject {
  id: number;
  title: string;
  titleEn?: string;
  date: string;
  location: string;
  role: string;
  description: string;
  coreContent: string;
  category: string;
  featured: boolean;
  status: 'completed' | 'in-progress';
  artists?: string[];
  budget?: string;
  visitorCount?: string;
  artworkCount?: string;
  collaborators?: string[];
  achievements?: string[];
}

export function ProjectsSection() {
  const { language } = useLanguage();
  const [projects, setProjects] = useState<ExhibitionProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [expandedProject, setExpandedProject] = useState<number | null>(null);

  const texts = {
    zh: {
      title: '精选展览项目',
      subtitle: '策展实践与创意项目管理经验',
      allCategories: '全部',
      featured: '重点项目',
      viewProject: '查看详情',
      readMore: '了解更多',
      readLess: '收起',
      role: '担任角色',
      duration: '展期',
      location: '地点',
      artists: '参展艺术家',
      artworkCount: '作品数量',
      budget: '项目预算',
      visitorCount: '参观人数',
      collaborators: '合作方',
      achievements: '项目成果',
      coreContent: '核心内容及个人贡献',
      noProjects: '暂无项目',
      loading: '正在加载项目信息...',
      error: '加载失败，请稍后重试',
      
      // Categories
      groupExhibition: '群展',
      soloExhibition: '个展',
      publicArt: '公共艺术',
      digitalExhibition: '线上展览',
      commercialSpace: '商业空间',
      
      // Roles
      curator: '策展人',
      assistantCurator: '助理策展人',
      projectManager: '项目经理',
      projectLead: '项目负责人',
      curatorCollaborator: '联合策展人'
    },
    en: {
      title: 'Selected Exhibition Projects',
      subtitle: 'Curatorial practice and creative project management experience',
      allCategories: 'All',
      featured: 'Featured Projects',
      viewProject: 'View Details',
      readMore: 'Learn More',
      readLess: 'Show Less',
      role: 'Role',
      duration: 'Duration',
      location: 'Location',
      artists: 'Featured Artists',
      artworkCount: 'Artworks',
      budget: 'Budget',
      visitorCount: 'Visitors',
      collaborators: 'Collaborators',
      achievements: 'Achievements',
      coreContent: 'Core Content & Personal Contribution',
      noProjects: 'No projects available',
      loading: 'Loading project information...',
      error: 'Failed to load data, please try again later',
      
      // Categories
      groupExhibition: 'Group Exhibition',
      soloExhibition: 'Solo Exhibition',
      publicArt: 'Public Art',
      digitalExhibition: 'Digital Exhibition',
      commercialSpace: 'Commercial Space',
      
      // Roles
      curator: 'Curator',
      assistantCurator: 'Assistant Curator',
      projectManager: 'Project Manager',
      projectLead: 'Project Lead',
      curatorCollaborator: 'Co-Curator'
    }
  };

  const t = texts[language];

  useEffect(() => {
    loadProjects();
  }, [language]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await fetchProjectsData(language);
      
      if (fetchError) {
        console.error('Failed to load projects data:', fetchError);
      }
      
      // Noah Chen's Exhibition Projects Data
      const noahExhibitions: ExhibitionProject[] = [
        {
          id: 1,
          title: 'Assemble',
          date: '2018.5.27-8.25',
          location: '中国沈阳 K11',
          role: t.assistantCurator,
          description: '东北三省艺术家30年作品回顾展',
          coreContent: language === 'zh' 
            ? '东北三省艺术家 30 年作品回顾展，含 70+ 件作品。负责艺术家联络、档案研究及策展内容开发，奠定大型区域策展（商业艺术语境下）基础。'
            : '30-year retrospective of artists from Northeast China, featuring 70+ works. Responsible for artist liaison, archival research, and curatorial content development, establishing foundation for large-scale regional curation in commercial art contexts.',
          category: t.groupExhibition,
          featured: true,
          status: 'completed',
          artworkCount: '70+',
          achievements: [
            language === 'zh' ? '首次大型区域艺术家回顾展' : 'First major regional artist retrospective',
            language === 'zh' ? '建立完整艺术家档案系统' : 'Established comprehensive artist archive system',
            language === 'zh' ? '商业与艺术平衡的成功案例' : 'Successful case of balancing commerce and art'
          ]
        },
        {
          id: 2,
          title: '"Unnamed Artists" Office - 王欣个展',
          titleEn: '"Unnamed Artists" Office - Wang Xin Solo Exhibition',
          date: '2018.9-12',
          location: '中国沈阳 K11',
          role: t.assistantCurator,
          description: '概念艺术家王欣虚构"艺术家公司"模型探索机构批判',
          coreContent: language === 'zh'
            ? '概念艺术家王欣通过虚构 "艺术家公司" 模型探索机构批判的个展。协调装置搭建、跨部门合作，支持解读性内容设计，挑战零售展览场景下艺术、商业与观众认知的边界。'
            : 'Conceptual artist Wang Xin\'s solo exhibition exploring institutional critique through fictional "artist company" model. Coordinated installation construction, cross-departmental collaboration, and supported interpretive content design, challenging boundaries between art, commerce, and audience perception in retail exhibition contexts.',
          category: t.soloExhibition,
          featured: false,
          status: 'completed',
          artists: ['王欣 Wang Xin'],
          achievements: [
            language === 'zh' ? '成功挑战商业空间艺术边界' : 'Successfully challenged art boundaries in commercial space',
            language === 'zh' ? '创新解读内容设计' : 'Innovative interpretive content design'
          ]
        },
        {
          id: 3,
          title: '3cm Museum（3厘米博物馆）',
          titleEn: '3cm Museum',
          date: '2019.3-4',
          location: '中国沈阳 K11',
          role: t.assistantCurator,
          description: '探索尺度、感知与人类好奇心关系的主题展览',
          coreContent: language === 'zh'
            ? '主题展览，所有作品不超过 3cm，探索尺度、感知与人类好奇心的关系，含多位国际艺术家作品，分设体验区挑战传统空间与艺术观念。支持展览布局规划、艺术家协调及公众参与项目。'
            : 'Thematic exhibition where all works are no larger than 3cm, exploring relationships between scale, perception, and human curiosity. Featured works by multiple international artists with dedicated experience zones challenging traditional concepts of space and art. Supported exhibition layout planning, artist coordination, and public engagement projects.',
          category: t.groupExhibition,
          featured: true,
          status: 'completed',
          artists: ['多位国际艺术家', 'Multiple International Artists'],
          achievements: [
            language === 'zh' ? '突破性的尺度概念展览' : 'Breakthrough scale concept exhibition',
            language === 'zh' ? '国际艺术家合作经验' : 'International artist collaboration experience',
            language === 'zh' ? '创新公众参与模式' : 'Innovative public engagement model'
          ]
        },
        {
          id: 4,
          title: 'LOVE LOVE LOVE',
          date: '2019.5-8',
          location: '中国沈阳 K11',
          role: t.assistantCurator,
          description: '沉浸式影像展探索爱的多维度',
          coreContent: language === 'zh'
            ? '沉浸式影像展，探索爱的多维度，含 Marina Abramović、Yoko Ono、Tracey Emin、杨福东等艺术家作品，从情感、政治、诗意层面构建叙事。支持策展开发、安装物流管理及跨部门执行协调。'
            : 'Immersive video exhibition exploring multidimensional aspects of love, featuring works by Marina Abramović, Yoko Ono, Tracey Emin, Yang Fudong and other artists, constructing narrative from emotional, political, and poetic perspectives. Supported curatorial development, installation logistics management, and cross-departmental execution coordination.',
          category: t.groupExhibition,
          featured: true,
          status: 'completed',
          artists: ['Marina Abramović', 'Yoko Ono', 'Tracey Emin', '杨福东 Yang Fudong'],
          achievements: [
            language === 'zh' ? '与世界级艺术家合作' : 'Collaboration with world-class artists',
            language === 'zh' ? '沉浸式展览设计创新' : 'Innovative immersive exhibition design',
            language === 'zh' ? '跨部门协调管理经验' : 'Cross-departmental coordination management experience'
          ]
        },
        {
          id: 5,
          title: '(re)connect',
          date: '2019.9.21-12.25',
          location: '中国沈阳 K11',
          role: t.curator + ' & ' + t.projectLead,
          description: '与设计集体Numen/For Use合作的沉浸式装置展',
          coreContent: language === 'zh'
            ? '与设计集体 Numen/For Use 合作的沉浸式装置展，通过大型参与式结构探索连接、张力与身体感知。主导策展概念、空间设计及访客流线策略，将展览转化为鼓励观众移动、玩耍与反思的触觉旅程，标志策展实践从静态展示转向体验导向。'
            : 'Immersive installation exhibition in collaboration with design collective Numen/For Use, exploring connection, tension, and bodily perception through large-scale participatory structures. Led curatorial concept, spatial design, and visitor flow strategy, transforming the exhibition into a tactile journey encouraging movement, play, and reflection, marking a shift in curatorial practice from static display to experience-oriented.',
          category: t.publicArt,
          featured: true,
          status: 'completed',
          collaborators: ['Numen/For Use'],
          achievements: [
            language === 'zh' ? '首次独立策展项目' : 'First independent curatorial project',
            language === 'zh' ? '体验导向策展理念突破' : 'Breakthrough in experience-oriented curatorial concept',
            language === 'zh' ? '国际设计团队合作' : 'International design team collaboration'
          ]
        },
        {
          id: 6,
          title: 'Florentijn Hofman 个展 "Celebrating（欢聚！共享喜悦）"',
          titleEn: 'Florentijn Hofman Solo Exhibition "Celebrating"',
          date: '2023.7-10',
          location: '中国上海宝龙美术馆',
          role: t.curator + ' & ' + t.projectManager,
          description: '国际知名艺术家大型个展',
          coreContent: language === 'zh'
            ? '国际知名艺术家 Florentijn Hofman 大型个展，含系列大型沉浸式雕塑，从概念到执行全程主导。与艺术家直接合作主导展览策展愿景（从概念到作品选择及空间设计）；全面管理项目，监督总预算、所有合同及利益相关者沟通；主导巨型雕塑的复杂技术安装与撤展，确保安全与质量标准。'
            : 'Major solo exhibition by internationally renowned artist Florentijn Hofman, featuring a series of large-scale immersive sculptures, leading the entire process from concept to execution. Directly collaborated with the artist to lead exhibition curatorial vision (from concept to artwork selection and spatial design); comprehensively managed the project, overseeing total budget, all contracts, and stakeholder communications; led complex technical installation and de-installation of giant sculptures, ensuring safety and quality standards.',
          category: t.soloExhibition,
          featured: true,
          status: 'completed',
          artists: ['Florentijn Hofman'],
          achievements: [
            language === 'zh' ? '独立主导国际艺术家大展' : 'Independently led major international artist exhibition',
            language === 'zh' ? '复杂大型装置技术管理' : 'Complex large-scale installation technical management',
            language === 'zh' ? '全面项目预算与合同管理' : 'Comprehensive project budget and contract management'
          ]
        },
        {
          id: 7,
          title: 'Craig & Karl 个展 "INSIDE OUT"',
          titleEn: 'Craig & Karl Solo Exhibition "INSIDE OUT"',
          date: '2024.3-5',
          location: '北京时代美术馆',
          role: t.curator + ' & ' + t.projectManager,
          description: '艺术二人组大型个展',
          coreContent: language === 'zh'
            ? '艺术二人组 Craig & Karl 的大型个展，为 2000 平方米空间全新设计，含 100+ 件作品（含多项全球首展）及定制互动迷你高尔夫球场。策划 2000 平方米沉浸式体验，融入可玩迷你高尔夫球场提升观众互动；指导大型展览全制作周期，管理 100+ 件艺术品及多个装置的物流；推动 Craig & Karl 新作品全球首展，撰写所有核心策展文本。'
            : 'Major solo exhibition by artist duo Craig & Karl, featuring brand new design for 2000 square meter space, including 100+ works (featuring multiple world premieres) and custom interactive mini golf course. Planned 2000 square meter immersive experience, integrating playable mini golf course to enhance audience interaction; directed full production cycle of large-scale exhibition, managing logistics of 100+ artworks and multiple installations; promoted global premiere of Craig & Karl\'s new works, authored all core curatorial texts.',
          category: t.soloExhibition,
          featured: true,
          status: 'completed',
          artists: ['Craig & Karl'],
          artworkCount: '100+',
          achievements: [
            language === 'zh' ? '2000平方米大型展览空间设计' : '2000 square meter large-scale exhibition space design',
            language === 'zh' ? '创新互动体验设计（迷你高尔夫）' : 'Innovative interactive experience design (mini golf)',
            language === 'zh' ? '全球首展作品策划' : 'World premiere artwork curation'
          ]
        },
        {
          id: 8,
          title: '线上展览 "Bare Screen（赤屏）"',
          titleEn: 'Online Exhibition "Bare Screen"',
          date: '2020.9-2021.12',
          location: '红星美龙艺术中心',
          role: t.curatorCollaborator + ' & ' + t.projectManager,
          description: '为期一年的线上展览系列',
          coreContent: language === 'zh'
            ? '为期一年的线上展览系列，每月推出数字影像委托作品，探索纯数字形式的当代艺术实践，促进批判性线上discourse。联合主导 12 个月数字委托系列的策展愿景、研究与筛选；管理从概念到最终线上发布的所有合同、预算及制作时间线；撰写数字展览平台的所有核心策展文本及艺术家访谈。'
            : 'Year-long online exhibition series, launching monthly digital video commissioned works, exploring pure digital forms of contemporary art practice, promoting critical online discourse. Co-led curatorial vision, research and selection for 12-month digital commission series; managed all contracts, budgets and production timelines from concept to final online release; authored all core curatorial texts and artist interviews for digital exhibition platform.',
          category: t.digitalExhibition,
          featured: true,
          status: 'completed',
          achievements: [
            language === 'zh' ? '创新数字展览形式' : 'Innovative digital exhibition format',
            language === 'zh' ? '12个月连续项目管理' : '12-month continuous project management',
            language === 'zh' ? '数字艺术策展理论探索' : 'Digital art curatorial theory exploration'
          ]
        }
      ];
      
      setProjects(data || noahExhibitions);
    } catch (err) {
      console.error('Failed to load projects data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...Array.from(new Set(projects.map(p => p.category)))];
  const filteredProjects = selectedCategory === 'all' 
    ? projects 
    : projects.filter(p => p.category === selectedCategory);

  const formatDate = (dateStr: string) => {
    // Handle the special date format like "2018.5.27-8.25"
    if (dateStr.includes('.') && dateStr.includes('-')) {
      return dateStr;
    }
    
    try {
      const date = new Date(dateStr);
      return language === 'zh' 
        ? date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short' })
        : date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    } catch {
      return dateStr;
    }
  };

  const toggleProjectExpansion = (projectId: number) => {
    setExpandedProject(expandedProject === projectId ? null : projectId);
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Skeleton className="h-12 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          
          <div className="mb-8 flex flex-wrap gap-4 justify-center">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10 w-20" />
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full mb-4" />
                  <div className="flex flex-wrap gap-2 mb-4">
                    {[1, 2, 3].map((j) => (
                      <Skeleton key={j} className="h-6 w-16" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 text-purple-600 rounded-full mb-6">
              <Palette className="w-8 h-8" />
            </div>
            <h2 className="mb-4">{t.title}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t.subtitle}
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {t.error}
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-100">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 text-purple-600 rounded-full mb-6">
            <Palette className="w-8 h-8" />
          </div>
          <h2 className="mb-4">{t.title}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* Controls */}
        <div className="mb-12 flex flex-col lg:flex-row gap-4 items-center justify-between max-w-7xl mx-auto">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>
                  {category === 'all' ? t.allCategories : category}
                </span>
              </Button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-2 border rounded-lg p-1 bg-white">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Projects Grid/List */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <Palette className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">{t.noProjects}</p>
          </div>
        ) : (
          <div className={`max-w-7xl mx-auto ${
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' 
              : 'space-y-8'
          }`}>
            {filteredProjects.map((project) => (
              <Card key={project.id} className={`overflow-hidden hover:shadow-lg transition-all duration-300 group border-l-4 border-l-purple-500 ${
                project.featured ? 'ring-2 ring-purple-200 bg-purple-50/30' : ''
              } ${viewMode === 'list' ? 'flex flex-col lg:flex-row' : ''}`}>
                
                <div className={`${viewMode === 'list' ? 'flex-1' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg leading-tight text-primary group-hover:text-purple-600 transition-colors">
                        {project.title}
                        {project.featured && (
                          <Star className="w-4 h-4 inline-block ml-2 text-yellow-500" />
                        )}
                      </CardTitle>
                      <Badge variant="secondary" className="shrink-0">
                        {project.category}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{formatDate(project.date)}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{project.location}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        <span>{project.role}</span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground leading-relaxed">
                      {project.description}
                    </p>

                    {/* Core Content - Expandable */}
                    <div>
                      <h4 className="text-sm font-medium mb-2 text-primary">{t.coreContent}</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {expandedProject === project.id 
                          ? project.coreContent 
                          : project.coreContent.substring(0, 120) + '...'}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleProjectExpansion(project.id)}
                        className="p-0 h-auto text-purple-600 hover:text-purple-700 mt-2"
                      >
                        {expandedProject === project.id ? t.readLess : t.readMore}
                      </Button>
                    </div>

                    {/* Artists */}
                    {project.artists && project.artists.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">{t.artists}</h4>
                        <div className="flex flex-wrap gap-1">
                          {project.artists.map((artist, index) => (
                            <Badge key={index} variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                              {artist}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Project Stats */}
                    <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                      {project.artworkCount && (
                        <div className="flex items-center gap-1">
                          <Award className="w-4 h-4" />
                          <span>{project.artworkCount} {language === 'zh' ? '件作品' : 'artworks'}</span>
                        </div>
                      )}
                      {project.status && (
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          <span>{project.status === 'completed' ? (language === 'zh' ? '已完成' : 'Completed') : (language === 'zh' ? '进行中' : 'In Progress')}</span>
                        </div>
                      )}
                    </div>

                    {/* Achievements */}
                    {project.achievements && project.achievements.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2 flex items-center">
                          <Award className="w-4 h-4 mr-1 text-yellow-600" />
                          {t.achievements}
                        </h4>
                        <div className="space-y-1">
                          {project.achievements.map((achievement, idx) => (
                            <div key={idx} className="flex items-start space-x-2">
                              <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-1.5 flex-shrink-0"></div>
                              <span className="text-muted-foreground text-xs leading-relaxed">
                                {achievement}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Collaborators */}
                    {project.collaborators && project.collaborators.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">{t.collaborators}</h4>
                        <div className="flex flex-wrap gap-1">
                          {project.collaborators.map((collaborator, index) => (
                            <Badge key={index} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                              {collaborator}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {filteredProjects.length > 0 && (
          <div className="mt-16 max-w-7xl mx-auto">
            <Card className="border-0 bg-white/60 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                  <div>
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      {filteredProjects.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {language === 'zh' ? '策展项目' : 'Exhibition Projects'}
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {filteredProjects.filter(p => p.featured).length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {language === 'zh' ? '重点项目' : 'Featured Projects'}
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {new Set(filteredProjects.flatMap(p => p.artists || [])).size}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {language === 'zh' ? '合作艺术家' : 'Collaborated Artists'}
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-600 mb-1">
                      7+
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {language === 'zh' ? '年策展经验' : 'Years Experience'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </section>
  );
}