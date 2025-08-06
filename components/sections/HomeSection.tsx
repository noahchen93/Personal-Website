import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { useLanguage } from '../../contexts/LanguageContext';
import { fetchHomeData } from '../../utils/api';
import { 
  MapPin, Mail, Phone, Github, Linkedin, ExternalLink,
  ChevronDown, Star, Code, Palette, Users, Zap
} from 'lucide-react';

interface HomeData {
  name: string;
  title: string;
  description: string;
  skills: string[];
  highlights: string[];
  socialLinks: {
    email: string;
    github: string;
    linkedin: string;
    website?: string;
  };
  contactInfo: {
    location: string;
    email: string;
    phone: string;
  };
}

interface HomeSectionProps {
  onSectionChange: (section: string) => void;
}

export function HomeSection({ onSectionChange }: HomeSectionProps) {
  const { language } = useLanguage();
  const [data, setData] = useState<HomeData>({
    name: '',
    title: '',
    description: '',
    skills: [],
    highlights: [],
    socialLinks: {
      email: '',
      github: '',
      linkedin: '',
      website: ''
    },
    contactInfo: {
      location: '',
      email: '',
      phone: ''
    }
  });
  const [loading, setLoading] = useState(true);

  const texts = {
    zh: {
      viewProjects: '查看项目',
      contactMe: '联系我',
      scrollDown: '向下滚动了解更多',
      coreSkills: '核心技能',
      highlights: '亮点特色',
      getInTouch: '联系方式',
      location: '位置',
      email: '邮箱',
      phone: '电话',
      socialLinks: '社交链接',
      loading: '加载中...'
    },
    en: {
      viewProjects: 'View Projects',
      contactMe: 'Contact Me',
      scrollDown: 'Scroll down to learn more',
      coreSkills: 'Core Skills',
      highlights: 'Key Highlights',
      getInTouch: 'Get in Touch',
      location: 'Location',
      email: 'Email',
      phone: 'Phone',
      socialLinks: 'Social Links',
      loading: 'Loading...'
    }
  };

  const t = texts[language];

  useEffect(() => {
    loadHomeData();
  }, [language]);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      console.log('Loading home data for language:', language);
      
      const response = await fetchHomeData(language);
      console.log('Home data response:', response);
      
      if (response.success && response.data) {
        setData(response.data);
      }
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t.loading}</p>
        </div>
      </section>
    );
  }

  const highlightIcons = [Star, Zap, Users, Code];

  return (
    <section className="min-h-screen relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/30 to-background"></div>
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>

      {/* Main Content */}
      <div className="relative z-10 portfolio-container flex items-center min-h-screen py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center w-full">
          
          {/* Left Column - Hero Content */}
          <div className="space-y-8 text-center lg:text-left order-2 lg:order-1">
            <div className="space-y-6">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium text-foreground leading-tight">
                  {data.name || (language === 'zh' ? '设计师姓名' : 'Designer Name')}
                </h1>
                <h2 className="text-xl md:text-2xl text-primary font-medium">
                  {data.title || (language === 'zh' ? '创意设计师' : 'Creative Designer')}
                </h2>
              </div>

              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
                {data.description || (language === 'zh' 
                  ? '专注于用户体验设计和创意项目开发，致力于将创新理念转化为实际的解决方案。'
                  : 'Focused on user experience design and creative project development, committed to transforming innovative ideas into practical solutions.'
                )}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  onClick={() => onSectionChange('projects')}
                  className="portfolio-button-primary px-8 py-3 text-lg"
                  size="lg"
                >
                  <Palette className="w-5 h-5 mr-2" />
                  {t.viewProjects}
                </Button>
                <Button
                  onClick={() => onSectionChange('contact')}
                  variant="outline"
                  className="px-8 py-3 text-lg border-2 hover:bg-primary hover:text-primary-foreground"
                  size="lg"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  {t.contactMe}
                </Button>
              </div>

              {/* Social Links */}
              {(data.socialLinks.github || data.socialLinks.linkedin || data.socialLinks.website) && (
                <div className="flex gap-4 justify-center lg:justify-start">
                  {data.socialLinks.github && (
                    <a
                      href={data.socialLinks.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-full bg-muted/50 hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110"
                    >
                      <Github className="w-5 h-5" />
                    </a>
                  )}
                  {data.socialLinks.linkedin && (
                    <a
                      href={data.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-full bg-muted/50 hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                  )}
                  {data.socialLinks.website && (
                    <a
                      href={data.socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-full bg-muted/50 hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Skills & Highlights */}
          <div className="space-y-6 order-1 lg:order-2">
            {/* Skills Card */}
            {data.skills && data.skills.length > 0 && (
              <Card className="portfolio-card p-6 backdrop-blur-sm bg-card/80 border-0 shadow-lg">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-foreground flex items-center">
                    <Code className="w-5 h-5 mr-2 text-primary" />
                    {t.coreSkills}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {data.skills.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="px-3 py-1 bg-muted/70 text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* Highlights Card */}
            {data.highlights && data.highlights.length > 0 && (
              <Card className="portfolio-card p-6 backdrop-blur-sm bg-card/80 border-0 shadow-lg">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-foreground flex items-center">
                    <Star className="w-5 h-5 mr-2 text-accent" />
                    {t.highlights}
                  </h3>
                  <div className="space-y-3">
                    {data.highlights.map((highlight, index) => {
                      const IconComponent = highlightIcons[index % highlightIcons.length];
                      return (
                        <div key={index} className="flex items-center space-x-3">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                            <IconComponent className="w-4 h-4 text-accent" />
                          </div>
                          <span className="text-muted-foreground">{highlight}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            )}

            {/* Contact Info Card */}
            <Card className="portfolio-card p-6 backdrop-blur-sm bg-card/80 border-0 shadow-lg">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-foreground flex items-center">
                  <Mail className="w-5 h-5 mr-2 text-primary" />
                  {t.getInTouch}
                </h3>
                <div className="space-y-3">
                  {data.contactInfo.location && (
                    <div className="flex items-center space-x-3 text-muted-foreground">
                      <MapPin className="w-4 h-4 text-accent" />
                      <span>{data.contactInfo.location}</span>
                    </div>
                  )}
                  {data.contactInfo.email && (
                    <div className="flex items-center space-x-3 text-muted-foreground">
                      <Mail className="w-4 h-4 text-accent" />
                      <a
                        href={`mailto:${data.contactInfo.email}`}
                        className="hover:text-primary transition-colors"
                      >
                        {data.contactInfo.email}
                      </a>
                    </div>
                  )}
                  {data.contactInfo.phone && (
                    <div className="flex items-center space-x-3 text-muted-foreground">
                      <Phone className="w-4 h-4 text-accent" />
                      <a
                        href={`tel:${data.contactInfo.phone}`}
                        className="hover:text-primary transition-colors"
                      >
                        {data.contactInfo.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
        <p className="text-sm text-muted-foreground mb-2">{t.scrollDown}</p>
        <ChevronDown className="w-6 h-6 text-muted-foreground mx-auto animate-bounce" />
      </div>
    </section>
  );
}