import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { useLanguage } from '../../contexts/LanguageContext';
import { profileAPI } from '../../utils/api';
import { Loader2, User, MapPin, Calendar, Mail, Phone, Globe, AlertCircle } from 'lucide-react';

interface ProfileData {
  bio: string;
  education: Array<{
    institution: string;
    degree: string;
    period: string;
    description: string;
  }>;
  experience: Array<{
    company: string;
    position: string;
    period: string;
    description: string;
  }>;
  contact: {
    email: string;
    phone: string;
    location: string;
    website: string;
  };
}

const getDefaultProfileData = (language: 'zh' | 'en'): ProfileData => ({
  bio: language === 'zh' 
    ? '拥有7年国际经验的双语创意项目与展览经理，专注于跨文化艺术项目的策划与实施。具备丰富的项目管理经验，善于在多元文化环境中协调各方资源，推动创新项目的成功落地。' 
    : 'Bilingual creative project and exhibition manager with 7+ years of international experience, specializing in cross-cultural art project planning and implementation. Extensive project management experience with expertise in coordinating resources across multicultural environments to drive innovative project success.',
  education: [
    {
      institution: language === 'zh' ? '某知名大学' : 'Prestigious University',
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

export function AboutSection() {
  const { language } = useLanguage();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    loadProfileData();
  }, [language]);

  const loadProfileData = async () => {
    setLoading(true);
    setError(null);
    setUsingFallback(false);

    try {
      const data = await profileAPI.get(language, false);
      
      if (!data || !data.bio) {
        console.log('No CMS profile data available, using default data');
        setProfileData(getDefaultProfileData(language));
        setUsingFallback(true);
      } else {
        setProfileData({ ...getDefaultProfileData(language), ...data });
      }
    } catch (error) {
      console.log('CMS not available, using default profile data:', error);
      setProfileData(getDefaultProfileData(language));
      setUsingFallback(true);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const texts = {
    zh: {
      loading: '加载中...',
      aboutTitle: '关于我',
      personalInfo: '个人信息',
      education: '教育背景',
      experience: '工作经历',
      contact: '联系方式',
      demo: '演示模式'
    },
    en: {
      loading: 'Loading...',
      aboutTitle: 'About Me',
      personalInfo: 'Personal Information',
      education: 'Education',
      experience: 'Experience',
      contact: 'Contact Information',
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

  if (!profileData) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">加载个人信息时出现问题</p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-20">
      <div className="max-w-4xl mx-auto px-6">
        {/* Demo Mode Indicator */}
        {usingFallback && (
          <div className="mb-6 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{t.demo}</span>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{t.aboutTitle}</h1>
          <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>{t.personalInfo}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{profileData.bio}</p>
              </CardContent>
            </Card>

            {/* Education */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>{t.education}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {(profileData.education || []).map((edu, index) => (
                    <div key={index} className="border-l-4 border-blue-600 pl-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg text-gray-900">{edu.institution}</h3>
                        <Badge variant="secondary">{edu.period}</Badge>
                      </div>
                      <p className="text-blue-600 font-medium mb-2">{edu.degree}</p>
                      <p className="text-gray-600">{edu.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Experience */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>{t.experience}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {(profileData.experience || []).map((exp, index) => (
                    <div key={index} className="border-l-4 border-green-600 pl-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg text-gray-900">{exp.company}</h3>
                        <Badge variant="secondary">{exp.period}</Badge>
                      </div>
                      <p className="text-green-600 font-medium mb-2">{exp.position}</p>
                      <p className="text-gray-600">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="w-5 h-5" />
                  <span>{t.contact}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profileData.contact.email && (
                    <div className="flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <a 
                        href={`mailto:${profileData.contact.email}`}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        {profileData.contact.email}
                      </a>
                    </div>
                  )}

                  {profileData.contact.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <a 
                        href={`tel:${profileData.contact.phone}`}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        {profileData.contact.phone}
                      </a>
                    </div>
                  )}

                  {profileData.contact.location && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700 text-sm">{profileData.contact.location}</span>
                    </div>
                  )}

                  {profileData.contact.website && (
                    <div className="flex items-center space-x-3">
                      <Globe className="w-4 h-4 text-gray-500" />
                      <a 
                        href={profileData.contact.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        {profileData.contact.website}
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}