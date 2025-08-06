import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { useLanguage } from '../../contexts/LanguageContext';
import { homeAPI } from '../../utils/api';
import { getDefaultHomeData } from '../../utils/cmsDefaults';
import { 
  ArrowRight, 
  Users, 
  Globe, 
  Award, 
  Code,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface HomeSectionProps {
  onSectionChange: (section: string) => void;
}

interface HomeData {
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  backgroundImage: string;
  stats: {
    experience: string;
    projects: string;
    countries: string;
    languages: string;
  };
  callToActions: Array<{
    text: string;
    link: string;
    style: 'primary' | 'secondary' | 'outline';
  }>;
}

export function HomeSection({ onSectionChange }: HomeSectionProps) {
  const { language } = useLanguage();
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    loadHomeData();
  }, [language]);

  const loadHomeData = async () => {
    setLoading(true);
    setError(null);
    setUsingFallback(false);

    try {
      const data = await homeAPI.get(language, false);
      
      if (!data || !data.heroTitle) {
        console.log('No CMS home data available, using default data');
        setHomeData(getDefaultHomeData(language));
        setUsingFallback(true);
      } else {
        setHomeData({ ...getDefaultHomeData(language), ...data });
      }
    } catch (error) {
      console.log('CMS not available, using default home data:', error);
      setHomeData(getDefaultHomeData(language));
      setUsingFallback(true);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCTAClick = (cta: { text: string; link: string; style: string }) => {
    if (cta.link.startsWith('http')) {
      window.open(cta.link, '_blank');
    } else {
      onSectionChange(cta.link);
    }
  };

  const texts = {
    zh: {
      loading: '加载中...',
      demo: '演示模式',
      yearsExperience: '年经验',
      projects: '项目',
      countries: '个国家',
      languages: '种语言'
    },
    en: {
      loading: 'Loading...',
      demo: 'Demo Mode',
      yearsExperience: 'Years Experience',
      projects: 'Projects',
      countries: 'Countries',
      languages: 'Languages'
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

  if (!homeData) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">加载首页内容时出现问题</p>
        </div>
      </section>
    );
  }

  return (
    <section 
      className="min-h-screen relative flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: homeData.backgroundImage ? `url(${homeData.backgroundImage})` : 'linear-gradient(135deg, rgb(248, 250, 252), rgb(239, 246, 255))',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black/20"></div>

      {/* Demo Mode Indicator */}
      {usingFallback && (
        <div className="absolute top-4 left-4 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg flex items-center space-x-2 z-10">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{t.demo}</span>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <div className="space-y-8">
          {/* Hero Title */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold text-white drop-shadow-2xl">
              {homeData.heroTitle}
            </h1>
            <h2 className="text-xl md:text-3xl text-white/90 font-light">
              {homeData.heroSubtitle}
            </h2>
            <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              {homeData.heroDescription}
            </p>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-white mb-2">
                  {homeData.stats?.experience || '7+'}
                </div>
                <div className="text-white/80 text-sm">
                  {t.yearsExperience}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-white mb-2">
                  {homeData.stats?.projects || '50+'}
                </div>
                <div className="text-white/80 text-sm">
                  {t.projects}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-white mb-2">
                  {homeData.stats?.countries || '10+'}
                </div>
                <div className="text-white/80 text-sm">
                  {t.countries}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-white mb-2">
                  {homeData.stats?.languages || '2'}
                </div>
                <div className="text-white/80 text-sm">
                  {t.languages}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            {(homeData.callToActions || []).map((cta, index) => (
              <Button
                key={index}
                onClick={() => handleCTAClick(cta)}
                size="lg"
                variant={cta.style === 'primary' ? 'default' : cta.style === 'secondary' ? 'secondary' : 'outline'}
                className={`
                  ${cta.style === 'primary' ? 'bg-white text-gray-900 hover:bg-gray-100' : ''}
                  ${cta.style === 'outline' ? 'border-white text-white hover:bg-white hover:text-gray-900' : ''}
                  shadow-lg transition-all duration-300 transform hover:scale-105
                `}
              >
                {cta.text}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Elements for Visual Interest */}
      <div className="absolute top-1/4 left-10 animate-bounce">
        <Code className="w-8 h-8 text-white/30" />
      </div>
      
      <div className="absolute top-1/3 right-20 animate-pulse">
        <Globe className="w-10 h-10 text-white/30" />
      </div>
      
      <div className="absolute bottom-1/4 left-1/4 animate-bounce delay-1000">
        <Users className="w-6 h-6 text-white/30" />
      </div>
      
      <div className="absolute bottom-1/3 right-1/3 animate-pulse delay-2000">
        <Award className="w-8 h-8 text-white/30" />
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="flex flex-col items-center space-y-2 text-white/60">
          <div className="w-1 h-8 bg-white/30 rounded-full">
            <div className="w-1 h-3 bg-white rounded-full animate-ping"></div>
          </div>
          <span className="text-xs uppercase tracking-wider">向下滚动</span>
        </div>
      </div>
    </section>
  );
}