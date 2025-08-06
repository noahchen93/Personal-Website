import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { Alert, AlertDescription } from '../ui/alert';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  Heart, ExternalLink, Image, Video, FileText, 
  Camera, Music, Palette, Code, Book, Plane,
  AlertCircle, Filter, Grid, List, Globe
} from 'lucide-react';
import { fetchInterestsData } from '../../utils/api';

interface InterestLink {
  type: 'website' | 'social' | 'portfolio' | 'video';
  url: string;
  label: string;
}

interface InterestItem {
  id: number;
  category: string;
  title: string;
  description: string;
  images: string[];
  videos?: string[];
  documents?: string[];
  links: InterestLink[];
  tags?: string[];
  featured?: boolean;
}

export function InterestsSection() {
  const { language } = useLanguage();
  const [interests, setInterests] = useState<InterestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const texts = {
    zh: {
      title: '兴趣爱好',
      subtitle: '探索我的多元化兴趣和个人项目',
      allCategories: '全部',
      viewProject: '查看详情',
      media: '媒体文件',
      links: '相关链接',
      featured: '精选',
      noInterests: '暂无兴趣爱好',
      loading: '正在加载兴趣信息...',
      error: '加载失败，请稍后重试',
      categories: {
        '设计': '设计',
        '摄影': '摄影',
        '音乐': '音乐',
        '编程': '编程',
        '阅读': '阅读',
        '旅行': '旅行',
        '艺术': '艺术',
        '技术': '技术'
      }
    },
    en: {
      title: 'Interests & Hobbies',
      subtitle: 'Explore my diverse interests and personal projects',
      allCategories: 'All',
      viewProject: 'View Details',
      media: 'Media Files',
      links: 'Related Links',
      featured: 'Featured',
      noInterests: 'No interests available',
      loading: 'Loading interests information...',
      error: 'Failed to load data, please try again later',
      categories: {
        'Design': 'Design',
        'Photography': 'Photography', 
        'Music': 'Music',
        'Programming': 'Programming',
        'Reading': 'Reading',
        'Travel': 'Travel',
        'Art': 'Art',
        'Technology': 'Technology'
      }
    }
  };

  const t = texts[language];

  useEffect(() => {
    loadInterests();
  }, [language]);

  const loadInterests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await fetchInterestsData(language);
      
      if (fetchError) {
        throw new Error(fetchError);
      }
      
      setInterests(data || []);
    } catch (err) {
      console.error('Failed to load interests data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      // Set fallback data
      setInterests([]);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...Array.from(new Set(interests.map(i => i.category)))];
  const filteredInterests = selectedCategory === 'all' 
    ? interests 
    : interests.filter(i => i.category === selectedCategory);

  const getCategoryIcon = (category: string) => {
    const icons = {
      '设计': Palette,
      'Design': Palette,
      '摄影': Camera,
      'Photography': Camera,
      '音乐': Music,
      'Music': Music,
      '编程': Code,
      'Programming': Code,
      '阅读': Book,
      'Reading': Book,
      '旅行': Plane,
      'Travel': Plane,
      '艺术': Palette,
      'Art': Palette,
      '技术': Code,
      'Technology': Code
    };
    return icons[category] || Heart;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      '设计': 'bg-purple-100 text-purple-800 border-purple-200',
      'Design': 'bg-purple-100 text-purple-800 border-purple-200',
      '摄影': 'bg-blue-100 text-blue-800 border-blue-200',
      'Photography': 'bg-blue-100 text-blue-800 border-blue-200',
      '音乐': 'bg-pink-100 text-pink-800 border-pink-200',
      'Music': 'bg-pink-100 text-pink-800 border-pink-200',
      '编程': 'bg-green-100 text-green-800 border-green-200',
      'Programming': 'bg-green-100 text-green-800 border-green-200',
      '阅读': 'bg-amber-100 text-amber-800 border-amber-200',
      'Reading': 'bg-amber-100 text-amber-800 border-amber-200',
      '旅行': 'bg-cyan-100 text-cyan-800 border-cyan-200',
      'Travel': 'bg-cyan-100 text-cyan-800 border-cyan-200',
      '艺术': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Art': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      '技术': 'bg-gray-100 text-gray-800 border-gray-200',
      'Technology': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-rose-50 to-pink-100">
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
                <Skeleton className="h-48 w-full" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full mb-4" />
                  <div className="flex gap-2">
                    {[1, 2].map((j) => (
                      <Skeleton key={j} className="h-8 w-16" />
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
      <section className="py-20 bg-gradient-to-br from-rose-50 to-pink-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-rose-100 text-rose-600 rounded-full mb-6">
              <Heart className="w-8 h-8" />
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
    <section className="py-20 bg-gradient-to-br from-rose-50 to-pink-100">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-rose-100 text-rose-600 rounded-full mb-6">
            <Heart className="w-8 h-8" />
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
            {categories.map((category) => {
              const IconComponent = getCategoryIcon(category);
              return (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="flex items-center space-x-2"
                >
                  <IconComponent className="w-4 h-4" />
                  <span>
                    {category === 'all' ? t.allCategories : 
                     (t.categories[category] || category)}
                  </span>
                </Button>
              );
            })}
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

        {/* Interests Grid/List */}
        {filteredInterests.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">{t.noInterests}</p>
          </div>
        ) : (
          <div className={`max-w-7xl mx-auto ${
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' 
              : 'space-y-8'
          }`}>
            {filteredInterests.map((interest) => {
              const IconComponent = getCategoryIcon(interest.category);
              return (
                <Card 
                  key={interest.id} 
                  className={`overflow-hidden hover:shadow-lg transition-all duration-300 group ${
                    interest.featured ? 'ring-2 ring-rose-200' : ''
                  } ${viewMode === 'list' ? 'flex flex-col lg:flex-row' : ''}`}
                >
                  {/* Interest Image */}
                  {interest.images.length > 0 && (
                    <div className={`relative overflow-hidden ${
                      viewMode === 'list' ? 'lg:w-80 lg:flex-shrink-0' : 'h-48'
                    }`}>
                      <ImageWithFallback
                        src={interest.images[0]}
                        alt={interest.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {interest.featured && (
                        <Badge className="absolute top-2 left-2 bg-rose-600 text-white">
                          {t.featured}
                        </Badge>
                      )}
                      <div className={`absolute top-2 right-2 w-8 h-8 ${getCategoryColor(interest.category).replace('text-', 'text-white bg-').split(' ')[0]} rounded-lg flex items-center justify-center`}>
                        <IconComponent className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}

                  <div className={`${viewMode === 'list' ? 'flex-1' : ''}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg leading-tight text-primary group-hover:text-rose-600 transition-colors">
                          {interest.title}
                        </CardTitle>
                        <Badge variant="outline" className={getCategoryColor(interest.category)}>
                          {interest.category}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground leading-relaxed">
                        {interest.description}
                      </p>

                      {/* Tags */}
                      {interest.tags && interest.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {interest.tags.slice(0, 4).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {interest.tags.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{interest.tags.length - 4}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Media indicators */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {interest.images.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Image className="w-4 h-4" />
                            <span>{interest.images.length}</span>
                          </div>
                        )}
                        {interest.videos && interest.videos.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Video className="w-4 h-4" />
                            <span>{interest.videos.length}</span>
                          </div>
                        )}
                        {interest.documents && interest.documents.length > 0 && (
                          <div className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            <span>{interest.documents.length}</span>
                          </div>
                        )}
                      </div>

                      {/* Links */}
                      {interest.links.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {interest.links.map((link, index) => (
                            <Button key={index} variant="outline" size="sm" asChild>
                              <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1">
                                {link.type === 'video' ? (
                                  <Video className="w-4 h-4" />
                                ) : (
                                  <ExternalLink className="w-4 h-4" />
                                )}
                                <span>{link.label || t.viewProject}</span>
                              </a>
                            </Button>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Summary */}
        {filteredInterests.length > 0 && (
          <div className="mt-16 text-center">
            <Card className="border-0 bg-white/60 backdrop-blur-sm max-w-2xl mx-auto">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-rose-600 mb-1">
                      {filteredInterests.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {language === 'zh' ? '兴趣领域' : 'Interest Areas'}
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      {categories.length - 1}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {language === 'zh' ? '分类' : 'Categories'}
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {filteredInterests.reduce((total, interest) => 
                        total + interest.images.length + (interest.videos?.length || 0), 0
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {language === 'zh' ? '媒体文件' : 'Media Files'}
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