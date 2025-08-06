import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { useLanguage } from '../../contexts/LanguageContext';
import { experienceAPI } from '../../utils/api';
import { getDefaultExperienceData } from '../../utils/cmsDefaults';
import { 
  Loader2, 
  Briefcase, 
  MapPin, 
  Calendar, 
  TrendingUp,
  Code,
  Palette,
  Users,
  AlertCircle,
  Star 
} from 'lucide-react';

interface ExperienceData {
  experience: Array<{
    company: string;
    position: string;
    location: string;
    period: string;
    description: string;
    achievements: string[];
    technologies: string[];
  }>;
  skills: Array<{
    category: string;
    items: string[];
  }>;
}

export function ExperienceSection() {
  const { language } = useLanguage();
  const [experienceData, setExperienceData] = useState<ExperienceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    loadExperienceData();
  }, [language]);

  const loadExperienceData = async () => {
    setLoading(true);
    setError(null);
    setUsingFallback(false);

    try {
      const data = await experienceAPI.get(language, false);
      
      if (!data || (!data.experience && !data.skills)) {
        console.log('No CMS experience data available, using default data');
        setExperienceData(getDefaultExperienceData(language));
        setUsingFallback(true);
      } else {
        setExperienceData({ ...getDefaultExperienceData(language), ...data });
      }
    } catch (error) {
      console.log('CMS not available, using default experience data:', error);
      setExperienceData(getDefaultExperienceData(language));
      setUsingFallback(true);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const getSkillIcon = (category: string) => {
    if (category.includes('技术') || category.includes('Technical')) return Code;
    if (category.includes('策展') || category.includes('Curation')) return Palette;
    if (category.includes('管理') || category.includes('Management')) return Users;
    return TrendingUp;
  };

  const texts = {
    zh: {
      loading: '加载中...',
      experienceTitle: '工作经历',
      workExperience: '工作经验',
      professionalSkills: '专业技能',
      keyAchievements: '主要成就',
      technologies: '技术栈',
      yearsExperience: '年工作经验',
      projects: '项目经验',
      demo: '演示模式'
    },
    en: {
      loading: 'Loading...',
      experienceTitle: 'Experience',
      workExperience: 'Work Experience',
      professionalSkills: 'Professional Skills',
      keyAchievements: 'Key Achievements',
      technologies: 'Tech Stack',
      yearsExperience: 'Years Experience',
      projects: 'Projects',
      demo: 'Demo Mode'
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

  if (!experienceData) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">加载工作经历时出现问题</p>
        </div>
      </section>
    );
  }

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
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{t.experienceTitle}</h1>
          <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Experience Timeline */}
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Briefcase className="w-5 h-5" />
                  <span>{t.workExperience}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {(experienceData.experience || []).map((exp, index) => (
                    <div key={index} className="relative">
                      {/* Timeline connector */}
                      {index !== experienceData.experience.length - 1 && (
                        <div className="absolute left-6 top-12 w-0.5 h-full bg-gray-200 -z-10"></div>
                      )}
                      
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                          <Briefcase className="w-6 h-6 text-white" />
                        </div>
                        
                        <div className="flex-1 bg-white rounded-lg p-6 shadow-md">
                          <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 mb-1">{exp.company}</h3>
                              <p className="text-blue-600 font-semibold">{exp.position}</p>
                              {exp.location && (
                                <div className="flex items-center text-gray-600 mt-1">
                                  <MapPin className="w-4 h-4 mr-1" />
                                  <span>{exp.location}</span>
                                </div>
                              )}
                            </div>
                            <Badge variant="outline" className="text-blue-700 border-blue-700 mt-2 md:mt-0">
                              <Calendar className="w-3 h-3 mr-1" />
                              {exp.period}
                            </Badge>
                          </div>

                          <p className="text-gray-700 mb-4 leading-relaxed">{exp.description}</p>

                          {/* Key Achievements */}
                          {exp.achievements && exp.achievements.length > 0 && (
                            <div className="mb-4">
                              <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                                <Star className="w-4 h-4 mr-2 text-yellow-500" />
                                {t.keyAchievements}
                              </h4>
                              <ul className="space-y-1">
                                {exp.achievements.map((achievement, achievementIndex) => (
                                  <li key={achievementIndex} className="text-sm text-gray-600 flex items-start">
                                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                    <span>{achievement}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Technologies */}
                          {exp.technologies && exp.technologies.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                                <Code className="w-4 h-4 mr-2 text-green-500" />
                                {t.technologies}
                              </h4>
                              <div className="flex flex-wrap gap-1">
                                {exp.technologies.map((tech, techIndex) => (
                                  <Badge key={techIndex} variant="secondary" className="text-xs">
                                    {tech}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Skills Sidebar */}
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>{t.professionalSkills}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {(experienceData.skills || []).map((skillCategory, index) => {
                    const IconComponent = getSkillIcon(skillCategory.category);
                    return (
                      <div key={index} className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <IconComponent className="w-5 h-5 text-blue-600" />
                          <h3 className="font-semibold text-gray-900">{skillCategory.category}</h3>
                        </div>
                        
                        <div className="space-y-2">
                          {(skillCategory.items || []).map((skill, skillIndex) => (
                            <div key={skillIndex} className="flex items-center justify-between">
                              <span className="text-sm text-gray-700">{skill}</span>
                              <div className="w-20">
                                <Progress 
                                  value={Math.floor(Math.random() * 30) + 70} 
                                  className="h-2" 
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Experience Stats */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4 text-center">
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-blue-600">
                      {experienceData.experience?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">工作经历</div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-green-600">
                      {experienceData.skills?.reduce((total, category) => total + category.items.length, 0) || 0}
                    </div>
                    <div className="text-sm text-gray-600">专业技能</div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-purple-600">7+</div>
                    <div className="text-sm text-gray-600">{t.yearsExperience}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}