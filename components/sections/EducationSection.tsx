import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { useLanguage } from '../../contexts/LanguageContext';
import { educationAPI } from '../../utils/api';
import { 
  Loader2, 
  GraduationCap, 
  Award, 
  Calendar, 
  MapPin, 
  ExternalLink, 
  AlertCircle 
} from 'lucide-react';

interface EducationData {
  education: Array<{
    institution: string;
    degree: string;
    major: string;
    period: string;
    gpa: string;
    achievements: string[];
    courses: string[];
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
    credential: string;
  }>;
}

const getDefaultEducationData = (language: 'zh' | 'en'): EducationData => ({
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
    },
    {
      institution: language === 'zh' ? '北京大学' : 'Peking University',
      degree: language === 'zh' ? '艺术学学士' : 'Bachelor of Arts',
      major: language === 'zh' ? '艺术史' : 'Art History',
      period: '2012-2016',
      gpa: '3.9/4.0',
      achievements: language === 'zh'
        ? ['院长奖学金', '优秀学生干部', '全国大学生艺术展览二等奖']
        : ['Dean\'s Scholarship', 'Outstanding Student Leader', 'National College Art Exhibition 2nd Prize'],
      courses: language === 'zh'
        ? ['中国艺术史', '西方艺术史', '博物馆学', '艺术批评']
        : ['Chinese Art History', 'Western Art History', 'Museology', 'Art Criticism']
    }
  ],
  certifications: [
    {
      name: language === 'zh' ? 'PMP项目管理专业人士' : 'PMP (Project Management Professional)',
      issuer: 'PMI',
      date: '2019',
      credential: 'PMI-2019-001234'
    },
    {
      name: language === 'zh' ? 'ICOM博物馆专业认证' : 'ICOM Museum Professional Certification',
      issuer: 'ICOM',
      date: '2020',
      credential: 'ICOM-2020-5678'
    }
  ]
});

export function EducationSection() {
  const { language } = useLanguage();
  const [educationData, setEducationData] = useState<EducationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    loadEducationData();
  }, [language]);

  const loadEducationData = async () => {
    setLoading(true);
    setError(null);
    setUsingFallback(false);

    try {
      const data = await educationAPI.get(language, false);
      
      if (!data || (!data.education && !data.certifications)) {
        console.log('No CMS education data available, using default data');
        setEducationData(getDefaultEducationData(language));
        setUsingFallback(true);
      } else {
        setEducationData({ ...getDefaultEducationData(language), ...data });
      }
    } catch (error) {
      console.log('CMS not available, using default education data:', error);
      setEducationData(getDefaultEducationData(language));
      setUsingFallback(true);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const texts = {
    zh: {
      loading: '加载中...',
      educationTitle: '教育背景',
      education: '教育经历',
      certifications: '专业认证',
      gpa: 'GPA',
      achievements: '主要成就',
      coursework: '主要课程',
      issuedBy: '颁发机构',
      credential: '认证编号',
      viewCredential: '查看认证',
      demo: '演示模式'
    },
    en: {
      loading: 'Loading...',
      educationTitle: 'Education',
      education: 'Education',
      certifications: 'Certifications',
      gpa: 'GPA',
      achievements: 'Key Achievements',
      coursework: 'Key Coursework',
      issuedBy: 'Issued by',
      credential: 'Credential ID',
      viewCredential: 'View Credential',
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

  if (!educationData) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">加载教育信息时出现问题</p>
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
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{t.educationTitle}</h1>
          <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Education Timeline */}
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <GraduationCap className="w-5 h-5" />
                  <span>{t.education}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {(educationData.education || []).map((edu, index) => (
                    <div key={index} className="relative">
                      {/* Timeline connector */}
                      {index !== educationData.education.length - 1 && (
                        <div className="absolute left-6 top-12 w-0.5 h-full bg-gray-200 -z-10"></div>
                      )}
                      
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                          <GraduationCap className="w-6 h-6 text-white" />
                        </div>
                        
                        <div className="flex-1 bg-white rounded-lg p-6 shadow-md">
                          <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 mb-1">{edu.institution}</h3>
                              <p className="text-blue-600 font-semibold">{edu.degree}</p>
                              {edu.major && (
                                <p className="text-gray-600">{edu.major}</p>
                              )}
                            </div>
                            <div className="flex flex-col items-end space-y-2 mt-2 md:mt-0">
                              <Badge variant="outline" className="text-blue-700 border-blue-700">
                                {edu.period}
                              </Badge>
                              {edu.gpa && (
                                <div className="text-sm text-gray-600">
                                  {t.gpa}: <span className="font-semibold">{edu.gpa}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Achievements */}
                          {edu.achievements && edu.achievements.length > 0 && (
                            <div className="mb-4">
                              <h4 className="font-semibold text-gray-800 mb-2">{t.achievements}</h4>
                              <div className="flex flex-wrap gap-2">
                                {edu.achievements.map((achievement, achievementIndex) => (
                                  <Badge key={achievementIndex} variant="secondary" className="text-xs">
                                    <Award className="w-3 h-3 mr-1" />
                                    {achievement}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Courses */}
                          {edu.courses && edu.courses.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-gray-800 mb-2">{t.coursework}</h4>
                              <div className="flex flex-wrap gap-1">
                                {edu.courses.map((course, courseIndex) => (
                                  <Badge key={courseIndex} variant="outline" className="text-xs text-gray-600">
                                    {course}
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

          {/* Certifications Sidebar */}
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="w-5 h-5" />
                  <span>{t.certifications}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {(educationData.certifications || []).map((cert, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-gradient-to-br from-white to-gray-50">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Award className="w-5 h-5 text-green-600" />
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-2">{cert.name}</h3>
                          
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span>{cert.date}</span>
                            </div>
                            
                            <div className="text-sm">
                              <span className="text-gray-600">{t.issuedBy}: </span>
                              <span className="font-medium text-gray-900">{cert.issuer}</span>
                            </div>
                            
                            {cert.credential && (
                              <div className="text-xs text-gray-500">
                                {t.credential}: {cert.credential}
                              </div>
                            )}

                            {cert.credential && (
                              <button 
                                onClick={() => {
                                  // This would typically open a verification link
                                  window.open(`#verify-${cert.credential}`, '_blank');
                                }}
                                className="text-blue-600 hover:text-blue-800 text-xs flex items-center space-x-1 mt-2"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>{t.viewCredential}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Education Stats */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-blue-600">
                      {educationData.education?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">{t.education}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-green-600">
                      {educationData.certifications?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">{t.certifications}</div>
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