import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useLanguage } from '../../contexts/LanguageContext';
import { interestsAPI } from '../../utils/api';
import { getDefaultInterestsData } from '../../utils/cmsDefaults';
import { 
  Loader2, 
  Heart, 
  ExternalLink, 
  Star, 
  TrendingUp,
  Camera,
  Music,
  Palette,
  BookOpen,
  Plane,
  Code,
  Gamepad2,
  AlertCircle,
  Filter
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface Interest {
  id: string;
  title: string;
  category: string;
  description: string;
  level: string;
  achievements: string[];
  resources: string[];
}

export function InterestsSection() {
  const { language } = useLanguage();
  const [interests, setInterests] = useState<Interest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadInterestsData();
  }, [language]);

  const loadInterestsData = async () => {
    setLoading(true);
    setError(null);
    setUsingFallback(false);

    try {
      const data = await interestsAPI.list(language, false);
      
      if (!data || data.length === 0) {
        console.log('No CMS interests data available, using default data');
        setInterests(getDefaultInterestsData(language));
        setUsingFallback(true);
      } else {
        setInterests(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.log('CMS not available, using default interests data:', error);
      setInterests(getDefaultInterestsData(language));
      setUsingFallback(true);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const filteredInterests = interests.filter(interest => 
    selectedCategory === 'all' || interest.category === selectedCategory
  );

  const categories = ['all', ...Array.from(new Set(interests.map(i => i.category).filter(Boolean)))];

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case '摄影':
      case 'photography':
        return <Camera className="w-5 h-5" />;
      case '音乐':
      case 'music':
        return <Music className="w-5 h-5" />;
      case '艺术':
      case 'art':
        return <Palette className="w-5 h-5" />;
      case '阅读':
      case 'reading':
        return <BookOpen className="w-5 h-5" />;
      case '旅行':
      case 'travel':
        return <Plane className="w-5 h-5" />;
      case '技术':
      case 'technology':
        return <Code className="w-5 h-5" />;
      case '游戏':
      case 'gaming':
        return <Gamepad2 className="w-5 h-5" />;
      default:
        return <Heart className="w-5 h-5" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case '初学者':
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case '中级':
      case 'intermediate':
        return 'bg-blue-100 text-blue-800';
      case '高级':
      case 'advanced':
        return 'bg-purple-100 text-purple-800';
      case '专业':
      case 'professional':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const texts = {
    zh: {
      loading: '加载中...',
      interestsTitle: '兴趣爱好',
      allCategories: '全部分类',
      level: '水平程度',
      achievements: '相关成就',
      resources: '相关资源',
      viewResource: '查看资源',
      demo: '演示模式',
      noInterests: '暂无兴趣展示',
      interestsDescription: '除了专业工作，我还有着广泛的兴趣爱好。这些兴趣不仅丰富了我的个人生活，也为我的专业工作带来了更多的创意灵感。'
    },
    en: {
      loading: 'Loading...',
      interestsTitle: 'Interests & Hobbies',
      allCategories: 'All Categories',
      level: 'Skill Level',
      achievements: 'Achievements',
      resources: 'Resources',
      viewResource: 'View Resource',
      demo: 'Demo Mode',
      noInterests: 'No interests to display',
      interestsDescription: 'Beyond professional work, I have a wide range of interests and hobbies. These interests not only enrich my personal life but also bring more creative inspiration to my professional work.'
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

  const InterestCard = ({ interest }: { interest: Interest }) => {
    const IconComponent = getCategoryIcon(interest.category);
    
    return (
      <Card className="h-full hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              {IconComponent}
              <CardTitle className="text-lg">{interest.title}</CardTitle>
            </div>
            {interest.level && (
              <Badge className={getLevelColor(interest.level)}>
                {interest.level}
              </Badge>
            )}
          </div>
          {interest.category && (
            <Badge variant="outline" className="w-fit">
              {interest.category}
            </Badge>
          )}
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            {interest.description}
          </p>

          {interest.achievements && interest.achievements.length > 0 && (
            <div>
              <div className="flex items-center mb-2">
                <Star className="w-4 h-4 mr-2 text-yellow-500" />
                <span className="font-semibold text-gray-800">{t.achievements}</span>
              </div>
              <ul className="space-y-1">
                {interest.achievements.map((achievement, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                    <span>{achievement}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {interest.resources && interest.resources.length > 0 && (
            <div>
              <div className="flex items-center mb-2">
                <ExternalLink className="w-4 h-4 mr-2 text-blue-500" />
                <span className="font-semibold text-gray-800">{t.resources}</span>
              </div>
              <div className="space-y-2">
                {interest.resources.map((resource, index) => (
                  <div key={index}>
                    {resource.startsWith('http') ? (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <a href={resource} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          {t.viewResource}
                        </a>
                      </Button>
                    ) : (
                      <p className="text-sm text-gray-600">{resource}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

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
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{t.interestsTitle}</h1>
          <div className="w-24 h-1 bg-blue-600 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t.interestsDescription}
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex justify-center mb-8">
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
        </div>

        {/* Interests Grid */}
        {filteredInterests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredInterests.map((interest) => (
              <InterestCard key={interest.id} interest={interest} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.noInterests}</h3>
              <p className="text-gray-600">
                {selectedCategory !== 'all' 
                  ? `当前分类 "${selectedCategory}" 下暂无兴趣`
                  : '暂时还没有添加任何兴趣爱好'
                }
              </p>
            </CardContent>
          </Card>
        )}

        {/* Interest Statistics */}
        {filteredInterests.length > 0 && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {filteredInterests.length}
                </div>
                <div className="text-sm text-gray-600">兴趣爱好</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {categories.length - 1}
                </div>
                <div className="text-sm text-gray-600">兴趣分类</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {filteredInterests.reduce((total, interest) => 
                    total + (interest.achievements?.length || 0), 0
                  )}
                </div>
                <div className="text-sm text-gray-600">相关成就</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {filteredInterests.filter(i => 
                    i.level === '高级' || i.level === '专业' || i.level === 'advanced' || i.level === 'professional'
                  ).length}
                </div>
                <div className="text-sm text-gray-600">高水平技能</div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </section>
  );
}