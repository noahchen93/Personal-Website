import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { Alert, AlertDescription } from '../ui/alert';
import { useLanguage } from '../../contexts/LanguageContext';
import { Calendar, MapPin, GraduationCap, BookOpen, AlertCircle } from 'lucide-react';
import { fetchEducationData } from '../../utils/api';

interface EducationItem {
  id: number;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  description?: string;
  gpa?: string;
  honors?: string[];
  coursework?: string[];
  location?: string;
}

export function EducationSection() {
  const { language } = useLanguage();
  const [education, setEducation] = useState<EducationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const texts = {
    zh: {
      title: '教育背景',
      subtitle: '我的学习历程与学术经历',
      degree: '学位',
      field: '专业',
      duration: '时间',
      gpa: 'GPA',
      honors: '荣誉',
      coursework: '主要课程',
      present: '至今',
      loading: '正在加载教育信息...',
      noData: '暂无教育信息',
      error: '加载失败，请稍后重试',
    },
    en: {
      title: 'Education',
      subtitle: 'My academic journey and educational background',
      degree: 'Degree',
      field: 'Field',
      duration: 'Duration',
      gpa: 'GPA',
      honors: 'Honors',
      coursework: 'Key Coursework',
      present: 'Present',
      loading: 'Loading education information...',
      noData: 'No education information available',
      error: 'Failed to load data, please try again later',
    }
  };

  const t = texts[language];

  useEffect(() => {
    loadEducation();
  }, [language]);

  const loadEducation = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await fetchEducationData(language);
      
      if (fetchError) {
        throw new Error(fetchError);
      }
      
      setEducation(data || []);
    } catch (err) {
      console.error('Failed to load education data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (dateStr === 'present') {
      return t.present;
    }
    
    try {
      const date = new Date(dateStr);
      return language === 'zh' 
        ? date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })
        : date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Skeleton className="h-12 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          
          <div className="max-w-4xl mx-auto space-y-8">
            {[1, 2].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-4 w-24" />
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
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
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full mb-6">
              <GraduationCap className="w-8 h-8" />
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
    <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full mb-6">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h2 className="mb-4">{t.title}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* Education Timeline */}
        <div className="max-w-4xl mx-auto">
          {education.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{t.noData}</p>
            </div>
          ) : (
            <div className="space-y-8">
              {education.map((item, index) => (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
                  <CardHeader className="pb-4">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2 text-primary">
                          {item.institution}
                        </CardTitle>
                        <div className="space-y-2">
                          <div className="flex items-center text-muted-foreground">
                            <GraduationCap className="w-4 h-4 mr-2" />
                            <span>{item.degree}</span>
                            {item.field && (
                              <>
                                <span className="mx-2">•</span>
                                <span>{item.field}</span>
                              </>
                            )}
                          </div>
                          {item.location && (
                            <div className="flex items-center text-muted-foreground">
                              <MapPin className="w-4 h-4 mr-2" />
                              <span>{item.location}</span>
                            </div>
                          )}
                          <div className="flex items-center text-muted-foreground">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>
                              {formatDate(item.startDate)} - {formatDate(item.endDate)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {item.gpa && (
                        <div className="text-right">
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            {t.gpa}: {item.gpa}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {item.description && (
                      <p className="text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    )}

                    {item.honors && item.honors.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 text-sm">{t.honors}</h4>
                        <div className="flex flex-wrap gap-2">
                          {item.honors.map((honor, idx) => (
                            <Badge key={idx} variant="outline" className="text-yellow-700 border-yellow-300 bg-yellow-50">
                              {honor}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {item.coursework && item.coursework.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 text-sm">{t.coursework}</h4>
                        <div className="flex flex-wrap gap-2">
                          {item.coursework.map((course, idx) => (
                            <Badge key={idx} variant="outline" className="text-blue-700 border-blue-300 bg-blue-50">
                              {course}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}