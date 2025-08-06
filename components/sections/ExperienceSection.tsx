import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { Alert, AlertDescription } from '../ui/alert';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  Briefcase, Target, TrendingUp, Users, Settings,
  Building, Award, AlertCircle, ArrowRight, Lightbulb,
  Zap, Shield, Database, BookOpen
} from 'lucide-react';
import { fetchExperienceData } from '../../utils/api';

interface ExperienceSection {
  id: number;
  title: string;
  description: string;
  keyPoints: string[];
  icon: string;
  category: 'methodology' | 'execution' | 'collaboration';
}

export function ExperienceSection() {
  const { language } = useLanguage();
  const [experience, setExperience] = useState<ExperienceSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const texts = {
    zh: {
      title: '项目管理与执行经验',
      subtitle: '专业的项目管理方法论与实践经验',
      methodology: '项目管理方法论',
      execution: '执行要点',
      collaboration: '团队协作',
      loading: '正在加载工作经历...',
      noData: '暂无工作经历',
      error: '加载失败，请稍后重试',
      
      // Context Engineering Methodology
      contextEngineering: 'Context Engineering 方法论',
      contextEngineeringDesc: '受AI语境管理启发，将项目从静态计划转化为动态智能生态系统',
      
      dynamicScene: '动态场景构建',
      dynamicSceneDesc: '超越碎片化邮件与文档，将每个项目视为"活场景"，通过整合客户需求、历史数据、实时变化等所有输入形成连贯语境。',
      
      intelligentStrategy: '智能策略增强',
      intelligentStrategyDesc: '不依赖单一经验，利用过去成功案例的向量知识库，将整个项目档案转化为"智能战略顾问"，实现经证实的最佳实践规模化应用。',
      
      proactiveRisk: '主动风险预警系统',
      proactiveRiskDesc: '从被动解决问题转向主动预防，融合内部项目数据与实时外部信息，系统作为24/7"风险哨兵"，在潜在威胁升级前识别并推荐应急计划。',
      
      // Execution Points
      executionTitle: '项目执行要点',
      supplierManagement: '供应商管理',
      supplierManagementDesc: '确保供应商理解与我方一致，其提供的产品或服务符合要求。',
      
      confirmation: '反复确认',
      confirmationDesc: '在供应商与客户/甲方之间确认交付结果；提前索要样品与图纸；尽早沟通。',
      
      fieldKnowledge: '项目负责人了解现场',
      fieldKnowledgeDesc: '项目负责人必须深入理解项目现场或产品，核心需求不得委托他人。',
      
      // Team Collaboration
      teamCollaboration: '团队协作精神',
      clearDivision: '明确分工',
      clearDivisionDesc: '项目初期明确每位成员的职责与任务，确保所有人了解工作内容与目标。',
      
      mechanism: '建立机制',
      mechanismDesc: '建立定期会议与沟通机制，及时解决项目中的问题，确保进度与质量。',
      
      spirit: '培养精神',
      spiritDesc: '鼓励团队成员相互支持与学习，形成良好氛围，提高协作效率。'
    },
    en: {
      title: 'Project Management & Execution Experience',
      subtitle: 'Professional project management methodology and practical experience',
      methodology: 'Project Management Methodology',
      execution: 'Execution Points',
      collaboration: 'Team Collaboration',
      loading: 'Loading work experience...',
      noData: 'No work experience available',
      error: 'Failed to load data, please try again later',
      
      // Context Engineering Methodology
      contextEngineering: 'Context Engineering Methodology',
      contextEngineeringDesc: 'Inspired by AI context management, transforming projects from static plans into dynamic intelligent ecosystems',
      
      dynamicScene: 'Dynamic Scene Construction',
      dynamicSceneDesc: 'Moving beyond fragmented emails and documents to treat each project as a "living scene", integrating all inputs including client needs, historical data, and real-time changes into coherent context.',
      
      intelligentStrategy: 'Intelligent Strategy Augmentation',
      intelligentStrategyDesc: 'Not relying on single experience, utilizing vector knowledge base of past successful cases to transform entire project archives into "intelligent strategic advisors", achieving scalable application of proven best practices.',
      
      proactiveRisk: 'Proactive Risk Sentinel System',
      proactiveRiskDesc: 'Shifting from reactive problem-solving to proactive prevention, integrating internal project data with real-time external information as a 24/7 "risk sentinel" to identify and recommend emergency plans before potential threats escalate.',
      
      // Execution Points
      executionTitle: 'Project Execution Points',
      supplierManagement: 'Supplier Management',
      supplierManagementDesc: 'Ensure suppliers understand and align with our requirements, providing products or services that meet specifications.',
      
      confirmation: 'Repeated Confirmation',
      confirmationDesc: 'Confirm delivery results between suppliers and clients/principals; request samples and drawings in advance; communicate early.',
      
      fieldKnowledge: 'Project Manager Field Knowledge',
      fieldKnowledgeDesc: 'Project managers must deeply understand the project site or product; core requirements must not be delegated to others.',
      
      // Team Collaboration
      teamCollaboration: 'Team Collaboration Spirit',
      clearDivision: 'Clear Division of Labor',
      clearDivisionDesc: 'Clearly define each member\'s responsibilities and tasks at the project start, ensuring everyone understands their work content and goals.',
      
      mechanism: 'Establish Mechanisms',
      mechanismDesc: 'Establish regular meeting and communication mechanisms to promptly resolve project issues, ensuring progress and quality.',
      
      spirit: 'Cultivate Spirit',
      spiritDesc: 'Encourage team members to support and learn from each other, creating a positive atmosphere and improving collaboration efficiency.'
    }
  };

  const t = texts[language];

  useEffect(() => {
    loadExperience();
  }, [language]);

  const loadExperience = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await fetchExperienceData(language);
      
      if (fetchError) {
        console.error('Failed to load experience data:', fetchError);
      }
      
      // Set default experience data based on Noah Chen's methodology
      const defaultExperience: ExperienceSection[] = [
        {
          id: 1,
          title: t.contextEngineering,
          description: t.contextEngineeringDesc,
          keyPoints: [
            t.dynamicScene + ': ' + t.dynamicSceneDesc,
            t.intelligentStrategy + ': ' + t.intelligentStrategyDesc,
            t.proactiveRisk + ': ' + t.proactiveRiskDesc
          ],
          icon: 'zap',
          category: 'methodology'
        },
        {
          id: 2,
          title: t.executionTitle,
          description: language === 'zh' ? '项目执行过程中的关键要点与最佳实践' : 'Key points and best practices in project execution',
          keyPoints: [
            t.supplierManagement + ': ' + t.supplierManagementDesc,
            t.confirmation + ': ' + t.confirmationDesc,
            t.fieldKnowledge + ': ' + t.fieldKnowledgeDesc
          ],
          icon: 'target',
          category: 'execution'
        },
        {
          id: 3,
          title: t.teamCollaboration,
          description: language === 'zh' ? '建立高效团队协作机制，提升项目执行效率' : 'Establish efficient team collaboration mechanisms to improve project execution efficiency',
          keyPoints: [
            t.clearDivision + ': ' + t.clearDivisionDesc,
            t.mechanism + ': ' + t.mechanismDesc,
            t.spirit + ': ' + t.spiritDesc
          ],
          icon: 'users',
          category: 'collaboration'
        }
      ];
      
      setExperience(data || defaultExperience);
    } catch (err) {
      console.error('Failed to load experience data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'zap': return Zap;
      case 'target': return Target;
      case 'users': return Users;
      case 'shield': return Shield;
      case 'database': return Database;
      default: return Briefcase;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'methodology': return 'border-l-purple-500 bg-purple-50';
      case 'execution': return 'border-l-blue-500 bg-blue-50';
      case 'collaboration': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-amber-500 bg-amber-50';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'methodology': return Lightbulb;
      case 'execution': return Target;
      case 'collaboration': return Users;
      default: return Briefcase;
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-amber-50 to-orange-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Skeleton className="h-12 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          
          <div className="max-w-6xl mx-auto space-y-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
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
      <section className="py-20 bg-gradient-to-br from-amber-50 to-orange-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 text-amber-600 rounded-full mb-6">
              <Briefcase className="w-8 h-8" />
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
    <section className="py-20 bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 text-amber-600 rounded-full mb-6">
            <Settings className="w-8 h-8" />
          </div>
          <h2 className="mb-4">{t.title}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* Experience Sections */}
        <div className="max-w-6xl mx-auto space-y-8">
          {experience.map((section, index) => {
            const IconComponent = getIcon(section.icon);
            const CategoryIcon = getCategoryIcon(section.category);
            
            return (
              <Card 
                key={section.id} 
                className={`overflow-hidden hover:shadow-lg transition-all duration-300 border-l-4 ${getCategoryColor(section.category)}`}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CategoryIcon className="w-6 h-6 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2 text-primary flex items-center gap-2">
                        {section.title}
                        <Badge variant="secondary" className="text-xs">
                          {section.category === 'methodology' ? t.methodology :
                           section.category === 'execution' ? t.execution : t.collaboration}
                        </Badge>
                      </CardTitle>
                      <p className="text-muted-foreground leading-relaxed">
                        {section.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {section.keyPoints.map((point, idx) => {
                      const [title, description] = point.split(': ');
                      return (
                        <div key={idx} className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                          <div className="flex items-start space-x-3">
                            <ArrowRight className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                            <div className="space-y-1">
                              <h4 className="font-medium text-sm text-primary">{title}</h4>
                              {description && (
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                  {description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Additional Context - Resource Integration */}
        <div className="mt-16 max-w-6xl mx-auto">
          <Card className="border-0 bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-primary">
                <Database className="w-5 h-5 mr-2" />
                {language === 'zh' ? '资源整合与利用' : 'Resource Integration and Utilization'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center">
                    <Building className="w-4 h-4 mr-2 text-blue-600" />
                    {language === 'zh' ? '高质量供应商数据库' : 'High-Quality Supplier Database'}
                  </h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {language === 'zh' 
                      ? '经多个项目筛选的供应商更可靠，能在紧急情况下帮助找到可靠合作伙伴。'
                      : 'Suppliers vetted through multiple projects are more reliable and can help find dependable partners in emergency situations.'
                    }
                  </p>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center">
                    <Award className="w-4 h-4 mr-2 text-green-600" />
                    {language === 'zh' ? '项目回顾机制' : 'Project Retrospective Mechanism'}
                  </h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {language === 'zh' 
                      ? '通过项目完成度、成本控制、质量标准三个维度评估项目成效，持续优化流程。'
                      : 'Evaluate project effectiveness through three dimensions: completion rate, cost control, and quality standards, continuously optimizing processes.'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}