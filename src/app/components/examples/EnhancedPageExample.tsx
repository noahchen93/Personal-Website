import React, { useEffect } from 'react';
import { Star, Zap, Code, Heart, Eye, ArrowRight, Loader2 } from 'lucide-react';
import EnhancedLazyLoader, { LazyHero, LazyCard, LazyList } from '../shared/EnhancedLazyLoader';
import AnimationSystem, { 
  StaggerContainer, 
  FadeIn, 
  SlideUp, 
  ScaleIn, 
  PageTransition,
  LoadingAnimation 
} from '../shared/AnimationSystem';
import { SmartImage, SmartScrollContainer, useResourcePreloader } from '../shared/SmartPerformanceManager';

// 示例：使用增强懒加载和动画的页面组件
const EnhancedPageExample: React.FC = () => {
  const { preloadImage, preloadRoute } = useResourcePreloader();

  // 预加载关键资源
  useEffect(() => {
    // 预加载首屏下方的重要图片
    preloadImage('/api/placeholder/800/600', 'high');
    
    // 预加载可能访问的路由
    preloadRoute('/projects');
    preloadRoute('/blog');
  }, [preloadImage, preloadRoute]);

  const sampleData = [
    {
      id: '1',
      title: '项目展示卡片',
      description: '这是一个使用增强懒加载的项目卡片，具有美丽的动画效果',
      imageUrl: '/api/placeholder/400/300',
      featured: true,
      technologies: ['React', 'TypeScript', 'Tailwind']
    },
    {
      id: '2',
      title: '博客文章卡片',
      description: '这是一个具有交错动画效果的博客文章卡片',
      imageUrl: '/api/placeholder/400/300',
      readingTime: '5 分钟阅读'
    },
    {
      id: '3',
      title: '兴趣内容卡片',
      description: '展示个人兴趣的卡片，支持智能加载优化',
      imageUrl: '/api/placeholder/400/300',
      category: '技术'
    }
  ];

  return (
    <PageTransition mode="terminal" duration={0.8}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        
        {/* 英雄区域 - 高优先级立即加载 */}
        <LazyHero className="relative">
          <div className="container mx-auto px-6 py-20">
            <div className="text-center space-y-8">
              
              {/* 主标题 - 终端打字机效果 */}
              <AnimationSystem 
                preset="terminal" 
                duration={1.2}
                className="terminal-typewriter"
              >
                <h1 className="text-large text-white mb-4">
                  <span className="terminal-text-cyan">></span> 增强性能优化示例
                </h1>
              </AnimationSystem>

              {/* 副标题 - 滑入动画 */}
              <SlideUp delay={0.3}>
                <p className="text-medium text-blue-200 max-w-2xl mx-auto">
                  展示懒加载、动画系统和性能优化的完整实现
                </p>
              </SlideUp>

              {/* 特性标签 - 交错动画 */}
              <StaggerContainer staggerDelay={0.1} preset="scaleIn">
                <div className="flex flex-wrap justify-center gap-3">
                  <div className="glass-blue rounded-xl px-4 py-2 flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="text-blue-200">智能懒加载</span>
                  </div>
                  <div className="glass-purple rounded-xl px-4 py-2 flex items-center space-x-2">
                    <Star className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-200">丰富动画</span>
                  </div>
                  <div className="glass-green rounded-xl px-4 py-2 flex items-center space-x-2">
                    <Code className="w-4 h-4 text-green-400" />
                    <span className="text-green-200">性能优化</span>
                  </div>
                </div>
              </StaggerContainer>

              {/* CTA 按钮 - 悬浮脉冲效果 */}
              <ScaleIn delay={0.8}>
                <button className="btn-glass-blue px-8 py-3 rounded-xl font-medium flex items-center space-x-2 mx-auto pulse-breath">
                  <span>开始探索</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </ScaleIn>

            </div>
          </div>

          {/* 背景装饰 - 赛博朋克光效 */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="cyber-glow w-64 h-64 absolute top-20 left-10 opacity-30"></div>
            <div className="floating-particles w-full h-full absolute inset-0"></div>
          </div>
        </LazyHero>

        {/* 内容卡片区域 - 智能滚动容器 */}
        <SmartScrollContainer className="py-20">
          <div className="container mx-auto px-6">
            
            {/* 区域标题 */}
            <FadeIn>
              <div className="text-center mb-16">
                <h2 className="text-large text-white mb-4">
                  <span className="terminal-text-cyan">></span> 功能展示
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-cyan-400 mx-auto rounded-full"></div>
              </div>
            </FadeIn>

            {/* 卡片网格 - 交错懒加载 */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sampleData.map((item, index) => (
                <LazyCard
                  key={item.id}
                  delay={index * 200}
                  className="group"
                  onLoad={() => console.log(`Card ${item.id} loaded`)}
                >
                  <div className="glass-blue rounded-xl overflow-hidden hover:scale-105 transition-all duration-500 energy-ripple">
                    
                    {/* 卡片图片 - 智能图片组件 */}
                    <div className="relative h-48 overflow-hidden">
                      <SmartImage
                        src={item.imageUrl}
                        alt={item.title}
                        priority={index < 2 ? 'high' : 'normal'}
                        className="w-full h-full object-cover"
                        onLoad={() => console.log(`Image for ${item.title} loaded`)}
                      />
                      
                      {/* 精选标识 */}
                      {item.featured && (
                        <div className="absolute top-3 left-3 glass-amber rounded-lg px-2 py-1 flex items-center space-x-1">
                          <Star className="w-3 h-3 text-amber-400" />
                          <span className="text-amber-200 text-small">精选</span>
                        </div>
                      )}
                      
                      {/* 悬浮遮罩 */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                        <button className="btn-glass-blue px-4 py-2 rounded-lg flex items-center space-x-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                          <Eye className="w-4 h-4" />
                          <span>查看详情</span>
                        </button>
                      </div>
                    </div>

                    {/* 卡片内容 */}
                    <div className="p-6 space-y-4">
                      <h3 className="text-white font-medium">{item.title}</h3>
                      <p className="text-blue-200 text-small">{item.description}</p>
                      
                      {/* 技术标签 */}
                      {item.technologies && (
                        <div className="flex flex-wrap gap-2">
                          {item.technologies.map((tech, techIndex) => (
                            <span 
                              key={techIndex}
                              className="glass-cyan rounded-lg px-2 py-1 text-cyan-200 text-small"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {/* 阅读时间 */}
                      {item.readingTime && (
                        <div className="flex items-center space-x-2 text-blue-300">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                          <span className="text-small">{item.readingTime}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </LazyCard>
              ))}
            </div>

          </div>
        </SmartScrollContainer>

        {/* 加载状态演示区域 */}
        <div className="py-20 bg-black/20">
          <div className="container mx-auto px-6">
            <FadeIn>
              <div className="text-center mb-12">
                <h2 className="text-large text-white mb-4">
                  <span className="terminal-text-cyan">></span> 加载动画演示
                </h2>
              </div>
            </FadeIn>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* 不同类型的加载动画 */}
              <div className="glass-blue rounded-xl p-6 text-center">
                <h4 className="text-white mb-4">旋转器</h4>
                <LoadingAnimation type="spinner" size="large" color="#3b82f6" />
              </div>
              
              <div className="glass-purple rounded-xl p-6 text-center">
                <h4 className="text-white mb-4">点状动画</h4>
                <LoadingAnimation type="dots" size="large" color="#8b5cf6" />
              </div>
              
              <div className="glass-green rounded-xl p-6 text-center">
                <h4 className="text-white mb-4">脉冲动画</h4>
                <LoadingAnimation type="pulse" size="large" color="#10b981" />
              </div>
              
              <div className="glass-amber rounded-xl p-6 text-center">
                <h4 className="text-white mb-4">终端光标</h4>
                <LoadingAnimation type="terminal" size="large" color="#f59e0b" />
              </div>
            </div>
          </div>
        </div>

        {/* 特效演示区域 */}
        <div className="py-20">
          <div className="container mx-auto px-6">
            <FadeIn>
              <div className="text-center mb-12">
                <h2 className="text-large text-white mb-4">
                  <span className="terminal-text-cyan">></span> 特效展示
                </h2>
              </div>
            </FadeIn>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              
              {/* 全息投影效果 */}
              <AnimationSystem preset="cyber" delay={0.2}>
                <div className="hologram glass-blue rounded-xl p-8 text-center">
                  <h4 className="text-white mb-4">全息投影</h4>
                  <p className="text-blue-200">未来科技感的全息效果</p>
                </div>
              </AnimationSystem>

              {/* 故障艺术效果 */}
              <AnimationSystem preset="glitch" delay={0.4}>
                <div className="glitch-effect glass-rose rounded-xl p-8 text-center" data-text="故障艺术">
                  <h4 className="text-white mb-4">故障艺术</h4>
                  <p className="text-rose-200">赛博朋克风格的故障效果</p>
                </div>
              </AnimationSystem>

              {/* 数据流效果 */}
              <AnimationSystem preset="matrix" delay={0.6}>
                <div className="data-stream glass-green rounded-xl p-8 text-center">
                  <h4 className="text-white mb-4">数据流</h4>
                  <p className="text-green-200">矩阵风格的数据流动</p>
                </div>
              </AnimationSystem>

            </div>
          </div>
        </div>

        {/* 页脚 - 低优先级懒加载 */}
        <LazyList>
          <footer className="glass-footer py-8">
            <div className="container mx-auto px-6 text-center">
              <div className="flex items-center justify-center space-x-2 text-blue-200">
                <Heart className="w-5 h-5 text-red-400 animate-pulse" />
                <span>增强性能优化示例</span>
                <Heart className="w-5 h-5 text-red-400 animate-pulse" />
              </div>
            </div>
          </footer>
        </LazyList>

      </div>
    </PageTransition>
  );
};

export default EnhancedPageExample;