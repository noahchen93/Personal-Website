import React from 'react';
import { Terminal, Heart, Code, Zap, ExternalLink, Github, Mail, Linkedin } from 'lucide-react';
import { useLanguage, useTexts } from '../language/LanguageContext';

const Footer: React.FC = () => {
  const { isZh } = useLanguage();
  const texts = useTexts();

  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: 'GitHub',
      icon: <Github className="w-4 h-4" />,
      url: 'https://github.com',
      color: 'hover:text-gray-300'
    },
    {
      name: 'LinkedIn', 
      icon: <Linkedin className="w-4 h-4" />,
      url: 'https://linkedin.com',
      color: 'hover:text-blue-300'
    },
    {
      name: 'Email',
      icon: <Mail className="w-4 h-4" />,
      url: 'mailto:contact@example.com',
      color: 'hover:text-green-300'
    }
  ];

  const techStack = [
    'React', 'TypeScript', 'Tailwind CSS', 'Supabase', 'Vite'
  ];

  return (
    <footer className="glass-footer mt-16 relative">
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          
          {/* Brand & Description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                <Terminal className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-medium text-white font-terminal tracking-wider">
                  NOAH_CHEN.EXE
                </h3>
                <div className="text-small text-blue-200 font-terminal">
                  {isZh ? '全栈开发者' : 'Full-Stack Developer'}
                </div>
              </div>
            </div>
            
            <p className="text-small text-blue-100 leading-relaxed font-terminal">
              {isZh 
                ? '> 专注于现代Web开发技术\n> 热衷于创造优秀的用户体验\n> 拥抱AI驱动的开发流程'
                : '> Focused on modern web technologies\n> Passionate about great user experiences\n> Embracing AI-driven development'
              }
            </p>
          </div>

          {/* Tech Stack */}
          <div className="space-y-4">
            <h4 className="text-medium text-white font-terminal flex items-center space-x-2">
              <Code className="w-4 h-4 text-cyan-400" />
              <span>[TECH] {isZh ? '技术栈' : 'Tech Stack'}</span>
            </h4>
            
            <div className="flex flex-wrap gap-2">
              {techStack.map((tech, index) => (
                <span
                  key={index}
                  className="btn-glass-cyan px-3 py-1 text-small font-terminal rounded-lg"
                >
                  {tech}
                </span>
              ))}
            </div>

            <div className="text-small text-cyan-200 font-terminal flex items-center space-x-2">
              <Zap className="w-3 h-3" />
              <span>{isZh ? '由AI辅助编程构建' : 'Built with AI-assisted coding'}</span>
            </div>
          </div>

          {/* Contact & Social */}
          <div className="space-y-4">
            <h4 className="text-medium text-white font-terminal flex items-center space-x-2">
              <ExternalLink className="w-4 h-4 text-purple-400" />
              <span>[CONNECT] {isZh ? '联系方式' : 'Get in Touch'}</span>
            </h4>
            
            <div className="space-y-3">
              {socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center space-x-3 text-small text-gray-300 ${link.color} transition-all duration-200 font-terminal hover:translate-x-1`}
                >
                  {link.icon}
                  <span>&gt; {link.name}</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-blue-400/20 pt-6 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          
          {/* Copyright */}
          <div className="text-small text-blue-200 font-terminal flex items-center space-x-2">
            <span>© {currentYear} Noah Chen</span>
            <Heart className="w-3 h-3 text-red-400 animate-pulse" />
            <span>{isZh ? '用心制作' : 'Made with passion'}</span>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center space-x-4 text-small font-terminal">
            <div className="flex items-center space-x-2 text-green-300">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>{isZh ? '系统运行中' : 'System Online'}</span>
            </div>
            
            <div className="flex items-center space-x-2 text-cyan-300">
              <Terminal className="w-3 h-3" />
              <span>v2.0.1</span>
            </div>
          </div>
        </div>

        {/* Terminal Command Prompt */}
        <div className="mt-6 p-4 glass-blue rounded-lg">
          <div className="text-small font-terminal text-green-300">
            <span className="text-blue-300">noah@portfolio</span>
            <span className="text-white">:</span>
            <span className="text-yellow-300">~</span>
            <span className="text-white">$ </span>
            <span className="text-green-300">
              echo "{isZh ? '感谢您的访问！' : 'Thanks for visiting!'}"
            </span>
            <span className="w-2 h-4 bg-green-400 inline-block ml-1 animate-pulse"></span>
          </div>
        </div>
      </div>

      {/* Terminal Scanlines Effect */}
      <div className="absolute inset-0 pointer-events-none terminal-scanlines opacity-20"></div>
    </footer>
  );
};

export default Footer;