import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { Alert, AlertDescription } from '../ui/alert';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  User, Award, Heart, BookOpen, AlertCircle,
  Palette, Camera, Lightbulb, Globe, Users
} from 'lucide-react';
import { fetchProfileData } from '../../utils/api';

interface AboutData {
  bio?: string;
  curatorialPhilosophy?: string;
  specialties?: string[];
  achievements?: string[];
  personalInfo?: {
    age?: number;
    location?: string;
    languages?: string[];
    experience?: string;
  };
  profileImage?: string;
}

export function AboutSection() {
  const { language } = useLanguage();
  const [aboutData, setAboutData] = useState<AboutData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const texts = {
    zh: {
      title: '策展人简介',
      subtitle: '认识双语策展人及创意制作人 Noah Chen',
      biography: '核心背景',
      curatorialPhilosophy: '策展理念',
      specialties: '专业领域',
      achievements: '核心成就',
      personalInfo: '个人信息',
      experience: '从业经验',
      location: '工作地点',
      languages: '语言能力',
      loading: '正在加载个人信息...',
      error: '加载失败，请稍后重试',
      noData: '暂无个人信息',
      defaultBio: '双语策展人及创意制作人，拥有 7 年以上亚洲地区展览及公共艺术领域经验。',
      defaultPhilosophy: '认为策展不仅是艺术品的选择，更是塑造连接人、场所与目的的共享体验。',
      defaultSpecialties: [
        '公共艺术策展',
        '跨学科合作',
        '空间设计',
        '项目管理',
        '国际艺术家联络',
        '商业艺术空间运营'
      ],
      defaultAchievements: [
        '策划超过20个大型展览项目',
        '管理总预算超过千万人民币的国际展览',
        '与Marina Abramović、Yoko Ono等世界级艺术家合作',
        '成功打造多个沉浸式艺术体验空间'
      ]
    },
    en: {
      title: 'Curatorial Profile',
      subtitle: 'Meet Noah Chen - Bilingual Curator & Creative Producer',
      biography: 'Core Background',
      curatorialPhilosophy: 'Curatorial Philosophy',
      specialties: 'Professional Expertise',
      achievements: 'Key Achievements',
      personalInfo: 'Personal Information',
      experience: 'Professional Experience',
      location: 'Location',
      languages: 'Languages',
      loading: 'Loading personal information...',
      error: 'Failed to load, please try again later',
      noData: 'No personal information available',
      defaultBio: 'Bilingual curator and creative producer with over 7 years of experience in exhibition and public art fields across Asia.',
      defaultPhilosophy: 'Believes that curation is not merely the selection of artworks, but the creation of shared experiences that connect people, places, and purposes.',
      defaultSpecialties: [
        'Public Art Curation',
        'Interdisciplinary Collaboration',
        'Spatial Design',
        'Project Management',
        'International Artist Relations',
        'Commercial Art Space Operations'
      ],
      defaultAchievements: [
        'Curated over 20 major exhibition projects',
        'Managed international exhibitions with budgets exceeding 10 million RMB',
        'Collaborated with world-class artists including Marina Abramović and Yoko Ono',
        'Successfully created multiple immersive art experience spaces'
      ]
    }
  };

  const t = texts[language];

  useEffect(() => {
    loadAboutData();
  }, [language]);

  const loadAboutData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await fetchProfileData(language);
      
      if (fetchError) {
        console.error('Failed to load about data:', fetchError);
        setAboutData({
          bio: t.defaultBio,
          curatorialPhilosophy: t.defaultPhilosophy,
          specialties: t.defaultSpecialties,
          achievements: t.defaultAchievements,
          personalInfo: {
            experience: language === 'zh' ? '7年以上' : '7+ years',
            location: language === 'zh' ? '亚洲地区' : 'Asia Region',
            languages: ['中文', 'English']
          }
        });
      } else {
        setAboutData(data || {
          bio: t.defaultBio,
          curatorialPhilosophy: t.defaultPhilosophy,
          specialties: t.defaultSpecialties,
          achievements: t.defaultAchievements,
          personalInfo: {
            experience: language === 'zh' ? '7年以上' : '7+ years',
            location: language === 'zh' ? '亚洲地区' : 'Asia Region',
            languages: ['中文', 'English']
          }
        });
      }
    } catch (err) {
      console.error('Failed to load about data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const specialtyIcons = {
    'Public Art Curation': Palette,
    'Interdisciplinary Collaboration': Users,
    'Spatial Design': Lightbulb,
    'Project Management': BookOpen,
    'International Artist Relations': Globe,
    'Commercial Art Space Operations': Award,
    '公共艺术策展': Palette,
    '跨学科合作': Users,
    '空间设计': Lightbulb,
    '项目管理': BookOpen,
    '国际艺术家联络': Globe,
    '商业艺术空间运营': Award
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-green-50 to-blue-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Skeleton className="h-12 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          
          <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-24 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="space-y-8">
              <Skeleton className="h-80 w-full" />
              <Card>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-24 mb-4" />
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-4 w-full" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-gradient-to-br from-green-50 to-blue-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mb-6">
              <User className="w-8 h-8" />
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
    <section className="py-20 bg-gradient-to-br from-green-50 to-blue-100">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mb-6">
            <Palette className="w-8 h-8" />
          </div>
          <h2 className="mb-4">{t.title}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Biography */}
            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="flex items-center text-primary">
                  <BookOpen className="w-5 h-5 mr-2" />
                  {t.biography}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {aboutData.bio || t.defaultBio}
                </p>
              </CardContent>
            </Card>

            {/* Curatorial Philosophy */}
            <Card className="border-l-4 border-l-purple-500">
              <CardHeader>
                <CardTitle className="flex items-center text-primary">
                  <Lightbulb className="w-5 h-5 mr-2" />
                  {t.curatorialPhilosophy}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed italic">
                    "{aboutData.curatorialPhilosophy || t.defaultPhilosophy}"
                  </p>
                  {language === 'zh' && (
                    <div className="space-y-3 text-muted-foreground text-sm">
                      <p>• 实践植根于公共艺术，主张艺术超越画廊边界，融入日常生活对话</p>
                      <p>• 关注当代艺术与社会环境、公共空间、集体记忆的交集</p>
                      <p>• 通过特定场地装置、跨学科合作及易懂叙事，打造开放、参与性强且具有情境意义的展览</p>
                      <p>• 将每个项目视为"活的有机体"，通过创作者、社区与空间的互动不断演化</p>
                    </div>
                  )}
                  {language === 'en' && (
                    <div className="space-y-3 text-muted-foreground text-sm">
                      <p>• Practice rooted in public art, advocating for art beyond gallery boundaries, integrating into daily life conversations</p>
                      <p>• Focus on the intersection of contemporary art with social environment, public space, and collective memory</p>
                      <p>• Create open, participatory, and contextually meaningful exhibitions through site-specific installations, interdisciplinary collaboration, and accessible narratives</p>
                      <p>• View each project as a "living organism" that continuously evolves through interactions between creators, communities, and spaces</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Professional Specialties */}
            {aboutData.specialties && aboutData.specialties.length > 0 && (
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <CardTitle className="flex items-center text-primary">
                    <Palette className="w-5 h-5 mr-2" />
                    {t.specialties}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {aboutData.specialties.map((specialty, index) => {
                      const IconComponent = specialtyIcons[specialty as keyof typeof specialtyIcons] || Lightbulb;
                      return (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                            <IconComponent className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-medium text-blue-900">{specialty}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Achievements */}
            {aboutData.achievements && aboutData.achievements.length > 0 && (
              <Card className="border-l-4 border-l-yellow-500">
                <CardHeader>
                  <CardTitle className="flex items-center text-primary">
                    <Award className="w-5 h-5 mr-2" />
                    {t.achievements}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {aboutData.achievements.map((achievement, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-muted-foreground">{achievement}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Profile Image */}
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                {aboutData.profileImage ? (
                  <ImageWithFallback
                    src={aboutData.profileImage}
                    alt="Noah Chen Profile"
                    className="w-full h-80 object-cover"
                  />
                ) : (
                  <div className="w-full h-80 bg-gradient-to-br from-green-100 to-blue-200 flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto">
                        <Palette className="w-12 h-12 text-white" />
                      </div>
                      <p className="text-muted-foreground">Noah Chen</p>
                      <p className="text-sm text-muted-foreground">
                        {language === 'zh' ? '策展人 & 创意制作人' : 'Curator & Creative Producer'}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Personal Information */}
            {aboutData.personalInfo && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-primary">
                    <Heart className="w-5 h-5 mr-2" />
                    {t.personalInfo}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {aboutData.personalInfo.experience && (
                    <div>
                      <h4 className="font-medium mb-2">{t.experience}</h4>
                      <p className="text-muted-foreground">{aboutData.personalInfo.experience}</p>
                    </div>
                  )}
                  
                  {aboutData.personalInfo.location && (
                    <div>
                      <h4 className="font-medium mb-2">{t.location}</h4>
                      <p className="text-muted-foreground">{aboutData.personalInfo.location}</p>
                    </div>
                  )}

                  {aboutData.personalInfo.languages && aboutData.personalInfo.languages.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">{t.languages}</h4>
                      <div className="flex flex-wrap gap-2">
                        {aboutData.personalInfo.languages.map((lang, index) => (
                          <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}