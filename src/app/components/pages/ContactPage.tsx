import React, { useState, useEffect } from 'react';
import { Mail, MessageSquare, Phone, MapPin, Github, Linkedin, Twitter, ExternalLink, Terminal, ChevronRight, Monitor, Wifi, Zap, MessageCircle, Globe } from 'lucide-react';
import { useContent } from '../content/ContentContext';
import { useLanguage } from '../language/LanguageContext';
import MediaRenderer from '../shared/MediaRenderer';
import AIChatBox from '../chat/AIChatBox';
import { usePageLanguageSync } from '../shared/useLanguageSync';

export default function ContactPage() {
  const { getContentByLanguage, lastUpdateTimestamp } = useContent();
  const { currentLanguage, isZh } = useLanguage();
  const [contactContent, setContactContent] = useState<any>(null);


  const loadContactContent = async () => {
    try {
      console.log(`[ContactPage] Loading contact content for ${currentLanguage}`);
      const content = await getContentByLanguage('contact', currentLanguage);
      if (content.length > 0 && content[0].data) {
        setContactContent(content[0].data);
      }
    } catch (error) {
      console.warn('Contact content not found, using defaults');
    }
  };

  usePageLanguageSync(
    ['contact'], 
    () => {
      console.log('[ContactPage] Language sync triggered, reloading content');
      loadContactContent();
    },
    () => {
      console.log('[ContactPage] Clearing state for language switch');
      setContactContent(null);
    }
  );

  useEffect(() => {
    console.log(`[ContactPage] Initial load for language: ${currentLanguage}`);
    loadContactContent();
  }, [lastUpdateTimestamp, currentLanguage]);

  const handleNavigation = (target: string, external?: boolean) => {
    if (external) {
      const formattedUrl = formatUrl(target);
      window.open(formattedUrl, '_blank', 'noopener,noreferrer');
    } else {
      window.dispatchEvent(new CustomEvent('navigate', { detail: target }));
    }
  };


  const formatUrl = (url: string) => {
    if (!url) return '';
    

    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    

    if (url.startsWith('www.') || url.includes('.')) {
      return `https://${url}`;
    }
    

    return `https://${url}`;
  };

  const personalInfo = contactContent?.personalInfo || {};
  const directEmail = personalInfo.email || 'chenyujian93@gmail.com';
  const contactMethods = [];
  
  if (personalInfo.email) {
    contactMethods.push({
      icon: Mail,
      label: isZh ? '邮箱地址' : 'Email Address',
      value: personalInfo.email,
      color: 'text-cyan-300',
      href: `mailto:${personalInfo.email}`
    });
  }
  if (personalInfo.phone) {
    contactMethods.push({
      icon: Phone,
      label: isZh ? '联系电话' : 'Phone Number',
      value: personalInfo.phone,
      color: 'text-cyan-300',
      href: `tel:${personalInfo.phone}`
    });
  }
  if (personalInfo.location) {
    contactMethods.push({
      icon: MapPin,
      label: isZh ? '所在位置' : 'Location',
      value: personalInfo.location,
      color: 'text-cyan-300'
    });
  }


  const socialLinks = (personalInfo.socialLinks || []).map(link => {
    let icon = Github; // 默认图标
    let color = 'text-cyan-200 hover:text-cyan-100';


    switch (link.platform.toLowerCase()) {
      case 'github':
        icon = Github;
        color = 'text-cyan-200 hover:text-cyan-100';
        break;
      case 'linkedin':
        icon = Linkedin;
        color = 'text-cyan-200 hover:text-cyan-100';
        break;
      case 'twitter':
        icon = Twitter;
        color = 'text-cyan-200 hover:text-cyan-100';
        break;
      default:
        icon = Globe;
        color = 'text-cyan-200 hover:text-cyan-100';
    }

    return {
      icon,
      name: link.platform.charAt(0).toUpperCase() + link.platform.slice(1),
      url: link.url,
      color
    };
  });

  return (
    <div className="p-6 space-y-8 font-terminal text-green-400 custom-scrollbar">
      <div className="max-w-6xl mx-auto">
        {/* Page Header - Cyan Glass Theme */}
        <div className="glass-cyan rounded-lg transition-all duration-300 mb-8 px-[32px] py-[0px]">
          <div className="flex items-center space-x-3 mb-6">
            <MessageCircle className="w-6 h-6 text-cyan-200" />
            <h1 className="text-large text-white tracking-wide">
              [CONTACT] {contactContent?.pageSettings?.title || (isZh ? '联系终端' : 'Contact Terminal')}
            </h1>
          </div>
          
          <div className="text-medium text-cyan-100 mb-4">
            {contactContent?.pageSettings?.subtitle || (isZh ? '> 建立连接，开启对话' : '> Initialize connection, start dialogue')}
          </div>
          
          {contactContent?.pageSettings?.description && (
            <div className="text-small text-cyan-100 leading-relaxed">
              <MediaRenderer content={contactContent.pageSettings.description} className="prose prose-sm" />
            </div>
          )}
          
          <div className="flex items-center space-x-4 text-small text-cyan-200 mt-4">
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4" />
              <span>{isZh ? '多种联系方式' : 'Multiple Contact Methods'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4" />
              <span>{isZh ? '即时响应' : 'Quick Response'}</span>
            </div>
          </div>
        </div>

        {/* Navigation Buttons - Cyan Glass */}
        {contactContent?.pageSettings?.navigationButtons && contactContent.pageSettings.navigationButtons.length > 0 && (
          <div className="glass-cyan rounded-lg p-6 transition-all duration-300 mb-8">
            <div className="flex items-center space-x-2 text-cyan-200 mb-4">
              <Monitor className="w-5 h-5" />
              <span className="text-medium">[NAVIGATION] {isZh ? '快速导航' : 'Quick Navigation'}</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {contactContent.pageSettings.navigationButtons.map((button) => (
                <button
                  key={button.id}
                  onClick={() => handleNavigation(button.target, button.external)}
                  className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 text-small font-terminal ${
                    button.style === 'primary'
                      ? 'btn-glass-cyan text-white'
                      : 'text-cyan-200/60 border border-cyan-400/30 hover:text-cyan-200 hover:bg-cyan-500/20 backdrop-blur-sm'
                  }`}
                >
                  <ChevronRight className="w-3 h-3" />
                  <span>{button.text}</span>
                  {button.external && <ExternalLink className="w-3 h-3" />}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="space-y-6">
            {/* Contact Methods - Cyan Glass */}
            <div className="glass-cyan rounded-lg p-6 transition-all duration-300">
              <div className="flex items-center space-x-2 text-cyan-200 mb-4">
                <Wifi className="w-5 h-5" />
                <span className="text-medium">[PROTOCOLS] {isZh ? '通信协议' : 'Communication Protocols'}</span>
              </div>
              
              <div className="space-y-3">
                {contactMethods.length > 0 ? contactMethods.map((method, index) => (
                  <div key={index} className="flex items-center space-x-3 p-4 bg-black/20 border border-cyan-300/20 rounded-lg group hover:bg-cyan-500/10 transition-all duration-200">
                    <div className={`${method.color} group-hover:scale-110 transition-transform`}>
                      <method.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="text-white text-small font-medium">{method.label}</div>
                      {method.href ? (
                        <a 
                          href={method.href} 
                          className="text-cyan-200 text-small font-terminal hover:text-cyan-100 transition-colors"
                        >
                          {method.value}
                        </a>
                      ) : (
                        <div className="text-cyan-200 text-small font-terminal">{method.value}</div>
                      )}
                    </div>
                    <div className="text-cyan-300 group-hover:translate-x-1 transition-transform">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                )) : (
                  <div className="p-4 bg-black/20 border border-cyan-300/20 rounded-lg text-center">
                    <div className="text-cyan-300 text-small">
                      {isZh ? '暂无联系方式信息' : 'No contact information available'}
                    </div>
                    <div className="text-cyan-200/60 text-small mt-1">
                      {isZh ? '请在内容数据文件中添加联系信息' : 'Add contact details in the content data file'}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Social Links - Cyan Glass */}
            <div className="glass-cyan rounded-lg p-6 transition-all duration-300">
              <div className="flex items-center space-x-2 text-cyan-200 mb-4">
                <Zap className="w-5 h-5" />
                <span className="text-medium">[NETWORKS] {isZh ? '社交网络' : 'Social Networks'}</span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {socialLinks.length > 0 ? socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={formatUrl(social.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex flex-col items-center p-4 bg-black/20 border border-cyan-300/20 rounded-lg transition-all duration-200 hover:bg-cyan-500/10 hover:transform hover:-translate-y-1 group ${social.color}`}
                  >
                    <social.icon className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-small font-terminal">{social.name}</span>
                  </a>
                )) : (
                  <div className="col-span-2 md:col-span-3 p-4 bg-black/20 border border-cyan-300/20 rounded-lg text-center">
                    <div className="text-cyan-300 text-small">
                      {isZh ? '暂无社交链接' : 'No social links available'}
                    </div>
                    <div className="text-cyan-200/60 text-small mt-1">
                      {isZh ? '请在内容数据文件中添加社交媒体链接' : 'Add social links in the content data file'}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* AI Chat Component - Cyan Glass */}
            <div className="glass-cyan rounded-lg p-6 transition-all duration-300">
              <div className="flex items-center space-x-2 text-cyan-200 mb-4">
                <Terminal className="w-5 h-5" />
                <span className="text-medium">[AI] {isZh ? 'AI助手' : 'AI Assistant'}</span>
              </div>
              <AIChatBox />
            </div>
          </div>

          {/* Direct contact — the site has no form backend. */}
          <div className="glass-cyan rounded-lg p-6 transition-all duration-300 flex flex-col">
            <div className="flex items-center space-x-2 text-cyan-200 mb-6">
              <Mail className="w-5 h-5" />
              <span className="text-medium">[DIRECT] {isZh ? '直接联系' : 'Direct Contact'}</span>
            </div>

            <div className="flex-1 flex flex-col justify-center space-y-6">
              <div className="p-5 bg-black/20 border border-cyan-300/20 rounded-lg">
                <div className="text-white text-medium mb-3">
                  {isZh ? '有合作想法或想聊聊？' : 'Have an idea or want to talk?'}
                </div>
                <p className="text-cyan-100 text-small leading-relaxed">
                  {isZh
                    ? '这个网站采用纯静态展示，不会收集或提交访客填写的数据。请直接通过邮件与我联系。'
                    : 'This is a static portfolio and does not collect or submit visitor data. Please contact me directly by email.'}
                </p>
              </div>

              <a
                href={`mailto:${directEmail}`}
                className="btn-glass-cyan flex items-center justify-center space-x-3 py-4 px-6 rounded-lg transition-all duration-200"
              >
                <Mail className="w-5 h-5" />
                <span className="text-medium font-terminal">{directEmail}</span>
              </a>

              <div className="text-cyan-200/70 text-small text-center">
                {isZh ? '点击后将打开你的默认邮件应用' : 'Opens your default email application'}
              </div>
            </div>
          </div>
        </div>

        {/* Status Footer */}
        <div className="flex items-center justify-between text-small text-cyan-300 pt-8 border-t border-cyan-400/20">
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-4 h-4" />
            <span>
              {isZh ? '纯静态作品集' : 'Static Portfolio'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Mail className="w-4 h-4" />
            <span>{isZh ? '通过邮件联系' : 'Contact by email'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
