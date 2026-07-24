import React from 'react';
import { ExternalLink, Globe, Calendar } from 'lucide-react';
import { useLanguage } from '../../language/LanguageContext';
import { ImageWithFallback } from '../../figma/ImageWithFallback';

interface UrlCardProps {
  url: string;
  title: string;
  description: string;
  image?: string;
  domain: string;
  createdAt?: string;
  onClick?: () => void;
  className?: string;
}

export default function UrlCard({
  url,
  title,
  description,
  image,
  domain,
  createdAt,
  onClick,
  className = ''
}: UrlCardProps) {
  const { isZh } = useLanguage();
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // 默认行为：在新窗口打开链接
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止卡片点击事件
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className={`glass-pink rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:transform hover:-translate-y-1 group ${className}`}
      onClick={handleClick}
    >
      {/* URL封面图片 */}
      {image && (
        <div className="aspect-[16/9] overflow-hidden">
          <ImageWithFallback
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}
      
      {/* URL内容 */}
      <div className="p-6">
        {/* URL域名标识 */}
        <div className="flex items-center space-x-2 mb-3">
          <Globe className="w-4 h-4 text-pink-300" />
          <span className="text-small text-pink-200 font-terminal">
            {domain}
          </span>
          <button
            onClick={handleLinkClick}
            className="ml-auto p-1 rounded-full hover:bg-black/20 transition-colors text-pink-300 hover:text-white"
            title={isZh ? '在新窗口打开' : 'Open in new window'}
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
        
        {/* URL标题 */}
        <h3 className="text-large text-white mb-3 leading-tight group-hover:text-pink-100 transition-colors font-terminal">
          {title}
        </h3>
        
        {/* URL描述 */}
        {description && (
          <p className="text-medium text-pink-100 mb-4 leading-relaxed line-clamp-3 font-terminal">
            {description}
          </p>
        )}
        
        {/* 底部信息 */}
        <div className="flex items-center justify-between pt-3 border-t border-pink-300/20">
          <div className="flex items-center space-x-2 text-pink-300">
            <ExternalLink className="w-4 h-4" />
            <span className="text-small font-terminal">
              {isZh ? '外部链接' : 'External Link'}
            </span>
          </div>
          
          {createdAt && (
            <div className="flex items-center space-x-2 text-pink-200">
              <Calendar className="w-4 h-4" />
              <span className="text-small font-terminal">
                {new Date(createdAt).toLocaleDateString(isZh ? 'zh-CN' : 'en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}