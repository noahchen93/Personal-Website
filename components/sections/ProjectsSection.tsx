import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useLanguage } from '../../contexts/LanguageContext';
import { projectsAPI } from '../../utils/api';
import { getDefaultProjectsData } from '../../utils/cmsDefaults';
import { 
  Loader2, 
  FolderOpen, 
  ExternalLink, 
  Calendar, 
  MapPin, 
  User,
  Target,
  Award,
  AlertCircle,
  Filter,
  Grid,
  List
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface Project {
  id: string;
  title: string;
  category: string;
  period: string;
  location: string;
  description: string;
  role: string;
  technologies: string[];
  achievements: string[];
  links: string[];
  images: string[];
}

export function ProjectsSection() {
  const { language } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadProjectsData();
  }, [language]);

  const loadProjectsData = async () => {
    setLoading(true);
    setError(null);
    setUsingFallback(false);

    try {
      const data = await projectsAPI.list(language, false);
      
      if (!data || data.length === 0) {
        console.log('No CMS projects data available, using default data');
        setProjects(getDefaultProjectsData(language));
        setUsingFallback(true);
      } else {
        setProjects(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.log('CMS not available, using default projects data:', error);
      setProjects(getDefaultProjectsData(language));
      setUsingFallback(true);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project => 
    selectedCategory === 'all' || project.category === selectedCategory
  );

  const categories = ['all', ...Array.from(new Set(projects.map(p => p.category).filter(Boolean)))];

  const texts = {
    zh: {
      loading: '加载中...',
      projectsTitle: '项目案例',
      allCategories: '全部分类',
      viewMode: '视图模式',
      gridView: '网格视图',
      listView: '列表视图',
      role: '担任角色',
      technologies: '技术栈',
      achievements: '项目成果',
      viewDetails: '查看详情',
      demo: '演示模式',
      noProjects: '暂无项目展示',
      projectsDescription: '以下是我参与的主要项目案例，涵盖了设计、策展、管理等多个领域的实践经验。'
    },
    en: {
      loading: 'Loading...',
      projectsTitle: 'Projects',
      allCategories: 'All Categories',
      viewMode: 'View Mode',
      gridView: 'Grid View',
      listView: 'List View',
      role: 'Role',
      technologies: 'Technologies',
      achievements: 'Achievements',
      viewDetails: 'View Details',
      demo: 'Demo Mode',
      noProjects: 'No projects to display',
      projectsDescription: 'Here are the main projects I have participated in, covering practical experience in design, curation, management and other fields.'
    }
  };

  const t = texts[language];

  if (loading) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-lg">{t.loading}</span>
        </div>
      </section>
    );
  }

  const ProjectCard = ({ project, isListView = false }: { project: Project; isListView?: boolean }) => (
    <Card className={`h-full hover:shadow-lg transition-shadow ${isListView ? 'flex-row' : ''}`}>
      <CardContent className={`p-6 ${isListView ? 'flex items-center space-x-6' : ''}`}>
        <div className={isListView ? 'flex-1' : ''}>
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{project.title}</h3>
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-3">
                {project.category && (
                  <Badge variant="secondary">{project.category}</Badge>
                )}
                {project.period && (
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{project.period}</span>
                  </div>
                )}
                {project.location && (
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{project.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <p className="text-gray-700 mb-4 leading-relaxed">
            {project.description}
          </p>

          {project.role && (
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <User className="w-4 h-4 mr-2 text-blue-600" />
                <span className="font-semibold text-gray-800">{t.role}</span>
              </div>
              <p className="text-sm text-gray-600 ml-6">{project.role}</p>
            </div>
          )}

          {project.technologies && project.technologies.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <Target className="w-4 h-4 mr-2 text-green-600" />
                <span className="font-semibold text-gray-800">{t.technologies}</span>
              </div>
              <div className="flex flex-wrap gap-1 ml-6">
                {project.technologies.map((tech, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {project.achievements && project.achievements.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <Award className="w-4 h-4 mr-2 text-yellow-600" />
                <span className="font-semibold text-gray-800">{t.achievements}</span>
              </div>
              <ul className="space-y-1 ml-6">
                {project.achievements.map((achievement, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start">
                    <span className="w-2 h-2 bg-yellow-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                    <span>{achievement}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {project.links && project.links.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {project.links.map((link, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  asChild
                  className="text-blue-600 hover:text-blue-800"
                >
                  <a href={link} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    {t.viewDetails}
                  </a>
                </Button>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-20">
      <div className="max-w-6xl mx-auto px-6">
        {/* Demo Mode Indicator */}
        {usingFallback && (
          <div className="mb-6 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{t.demo}</span>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{t.projectsTitle}</h1>
          <div className="w-24 h-1 bg-blue-600 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t.projectsDescription}
          </p>
        </div>

        {/* Filters and View Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <Filter className="w-4 h-4 text-gray-500" />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.allCategories}</SelectItem>
                {categories.filter(cat => cat !== 'all').map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">{t.viewMode}:</span>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Projects Grid/List */}
        {filteredProjects.length > 0 ? (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 gap-8" 
            : "space-y-6"
          }>
            {filteredProjects.map((project) => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                isListView={viewMode === 'list'}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.noProjects}</h3>
              <p className="text-gray-600">
                {selectedCategory !== 'all' 
                  ? `当前分类 "${selectedCategory}" 下暂无项目`
                  : '暂时还没有添加任何项目'
                }
              </p>
            </CardContent>
          </Card>
        )}

        {/* Project Statistics */}
        {filteredProjects.length > 0 && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {filteredProjects.length}
                </div>
                <div className="text-sm text-gray-600">
                  {selectedCategory === 'all' ? '总项目数' : `${selectedCategory} 项目数`}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {categories.length - 1}
                </div>
                <div className="text-sm text-gray-600">项目分类</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {filteredProjects.reduce((total, project) => 
                    total + (project.achievements?.length || 0), 0
                  )}
                </div>
                <div className="text-sm text-gray-600">项目成果</div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </section>
  );
}