import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Search, X, Calendar, Tag, User, FileText, Zap, Hash, ExternalLink, ArrowRight } from 'lucide-react';
import { useLanguage } from '../language/LanguageContext';
import { useContent } from '../content/ContentContext';

interface SearchResult {
  id: string;
  type: 'project' | 'blog' | 'interest' | 'ai-explore';
  title: string;
  description?: string;
  content?: string;
  tags?: string[];
  date?: string;
  url?: string;
  imageUrl?: string;
  relevanceScore: number;
  matchedFields: string[];
  highlights: string[];
}

interface SmartSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (type: string, id: string) => void;
  placeholder?: string;
  maxResults?: number;
  enableFuzzySearch?: boolean;
  enableContentSearch?: boolean;
}

const SmartSearch: React.FC<SmartSearchProps> = ({
  isOpen,
  onClose,
  onNavigate,
  placeholder,
  maxResults = 10,
  enableFuzzySearch = true,
  enableContentSearch = true
}) => {
  const { isZh } = useLanguage();
  const { getContentByLanguage, getImageUrl } = useContent();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularTags, setPopularTags] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // 加载最近搜索和流行标签
  useEffect(() => {
    const recent = localStorage.getItem('recent-searches');
    if (recent) {
      setRecentSearches(JSON.parse(recent).slice(0, 5));
    }

    const tags = localStorage.getItem('popular-tags');
    if (tags) {
      setPopularTags(JSON.parse(tags).slice(0, 8));
    }
  }, []);

  // 获取所有内容数据
  const allContent = useMemo(async () => {
    try {
      const [projects, blogs, interests, aiExplore] = await Promise.all([
        getContentByLanguage('projects', isZh ? 'zh' : 'en'),
        getContentByLanguage('blog', isZh ? 'zh' : 'en'),
        getContentByLanguage('interests', isZh ? 'zh' : 'en'),
        getContentByLanguage('ai-explore', isZh ? 'zh' : 'en')
      ]);

      const allItems: any[] = [];

      // 项目
      projects.forEach(item => {
        allItems.push({
          ...item,
          type: 'project',
          searchableFields: [
            item.data?.title,
            item.data?.description,
            ...(item.data?.technologies || []),
            ...(item.data?.tags || [])
          ].filter(Boolean)
        });
      });

      // 博客
      blogs.forEach(item => {
        allItems.push({
          ...item,
          type: 'blog',
          searchableFields: [
            item.data?.title,
            item.data?.description,
            enableContentSearch ? item.data?.content : '',
            ...(item.data?.tags || [])
          ].filter(Boolean)
        });
      });

      // 兴趣
      interests.forEach(item => {
        allItems.push({
          ...item,
          type: 'interest',
          searchableFields: [
            item.data?.title,
            item.data?.description,
            item.data?.category,
            ...(item.data?.tags || [])
          ].filter(Boolean)
        });
      });

      // AI探索
      aiExplore.forEach(item => {
        if (item.data?.projects) {
          item.data.projects.forEach((project: any, index: number) => {
            allItems.push({
              id: `${item.id}-${index}`,
              type: 'ai-explore',
              data: project,
              searchableFields: [
                project.title,
                project.description,
                project.category,
                project.difficulty,
                ...(project.tags || [])
              ].filter(Boolean)
            });
          });
        }
      });

      return allItems;
    } catch (error) {
      console.error('[SmartSearch] Failed to load content:', error);
      return [];
    }
  }, [getContentByLanguage, isZh, enableContentSearch]);

  // 模糊搜索算法
  const fuzzyMatch = useCallback((text: string, pattern: string): number => {
    const textLower = text.toLowerCase();
    const patternLower = pattern.toLowerCase();
    
    // 精确匹配得分最高
    if (textLower.includes(patternLower)) {
      const index = textLower.indexOf(patternLower);
      const score = 1.0 - (index / textLower.length) * 0.3; // 位置越靠前得分越高
      return Math.max(score, 0.7);
    }

    if (!enableFuzzySearch) return 0;

    // 模糊匹配算法 (Levenshtein distance based)
    let score = 0;
    let patternIndex = 0;
    
    for (let i = 0; i < textLower.length && patternIndex < patternLower.length; i++) {
      if (textLower[i] === patternLower[patternIndex]) {
        score += 1;
        patternIndex++;
      }
    }
    
    const fuzzyScore = score / patternLower.length;
    return fuzzyScore > 0.6 ? fuzzyScore * 0.8 : 0; // 模糊匹配得分较低
  }, [enableFuzzySearch]);

  // 搜索函数
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);

    try {
      const content = await allContent;
      const searchResults: SearchResult[] = [];

      content.forEach((item) => {
        let maxScore = 0;
        const matchedFields: string[] = [];
        const highlights: string[] = [];

        // 搜索各个字段
        item.searchableFields.forEach((field: string, fieldIndex: number) => {
          if (!field) return;

          const score = fuzzyMatch(field, searchQuery);
          if (score > 0) {
            maxScore = Math.max(maxScore, score);
            
            // 记录匹配的字段
            const fieldNames = ['title', 'description', 'content', 'tags', 'technologies', 'category'];
            const fieldName = fieldNames[fieldIndex] || 'content';
            matchedFields.push(fieldName);

            // 创建高亮片段
            const lowerField = field.toLowerCase();
            const lowerQuery = searchQuery.toLowerCase();
            const index = lowerField.indexOf(lowerQuery);
            
            if (index !== -1) {
              const start = Math.max(0, index - 20);
              const end = Math.min(field.length, index + searchQuery.length + 20);
              const snippet = field.slice(start, end);
              highlights.push(snippet);
            }
          }
        });

        // 如果有匹配，添加到结果中
        if (maxScore > 0) {
          const imageUrl = item.data?.imageUrl ? getImageUrl(item.data.imageUrl) : 
                          item.data?.cover_image_id ? getImageUrl(item.data.cover_image_id) :
                          null;

          searchResults.push({
            id: item.id,
            type: item.type,
            title: item.data?.title || 'Untitled',
            description: item.data?.description,
            content: item.data?.content,
            tags: item.data?.tags || item.data?.technologies || [],
            date: item.data?.created_at || item.created_at,
            url: item.data?.url,
            imageUrl,
            relevanceScore: maxScore,
            matchedFields,
            highlights: highlights.slice(0, 2) // 最多显示2个高亮片段
          });
        }
      });

      // 按相关性排序
      searchResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
      
      setResults(searchResults.slice(0, maxResults));
      setSelectedIndex(0);

      // 保存搜索历史
      const newRecentSearches = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
      setRecentSearches(newRecentSearches);
      localStorage.setItem('recent-searches', JSON.stringify(newRecentSearches));

    } catch (error) {
      console.error('[SmartSearch] Search failed:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [allContent, fuzzyMatch, maxResults, getImageUrl, recentSearches]);

  // 搜索防抖
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, performSearch]);

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (results[selectedIndex]) {
            handleResultClick(results[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose]);

  // 聚焦输入框
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // 结果点击处理
  const handleResultClick = useCallback((result: SearchResult) => {
    if (onNavigate) {
      onNavigate(result.type, result.id);
    }
    onClose();
  }, [onNavigate, onClose]);

  // 标签点击处理
  const handleTagClick = useCallback((tag: string) => {
    setQuery(tag);
  }, []);

  // 获取类型图标
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'project':
        return <Zap className="w-4 h-4 text-blue-400" />;
      case 'blog':
        return <FileText className="w-4 h-4 text-purple-400" />;
      case 'interest':
        return <Hash className="w-4 h-4 text-pink-400" />;
      case 'ai-explore':
        return <User className="w-4 h-4 text-cyan-400" />;
      default:
        return <Search className="w-4 h-4 text-gray-400" />;
    }
  };

  // 获取类型标签
  const getTypeLabel = (type: string) => {
    const labels = {
      project: isZh ? '项目' : 'Project',
      blog: isZh ? '博客' : 'Blog',
      interest: isZh ? '兴趣' : 'Interest',
      'ai-explore': isZh ? 'AI探索' : 'AI Explore'
    };
    return labels[type as keyof typeof labels] || type;
  };

  // 高亮匹配文本
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-400/30 text-yellow-200 rounded px-1">
          {part}
        </mark>
      ) : part
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-20">
      <div className="glass-blue rounded-xl w-full max-w-2xl mx-4 shadow-2xl border border-blue-400/30">
        {/* 搜索输入 */}
        <div className="p-6 border-b border-blue-400/20">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder || (isZh ? '搜索项目、博客、兴趣...' : 'Search projects, blogs, interests...')}
              className="w-full pl-10 pr-10 py-3 bg-transparent border border-blue-400/30 rounded-xl text-white placeholder-blue-300/60 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
            />
            <button
              onClick={onClose}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 搜索结果 */}
        <div ref={resultsRef} className="max-h-96 overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="p-6 text-center">
              <div className="inline-flex items-center space-x-2 text-blue-300">
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                <span>{isZh ? '搜索中...' : 'Searching...'}</span>
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="p-3">
              {results.map((result, index) => (
                <div
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className={`p-4 rounded-xl cursor-pointer transition-all duration-200 mb-2 ${
                    index === selectedIndex
                      ? 'bg-blue-500/20 border border-blue-400/40'
                      : 'hover:bg-blue-500/10 border border-transparent'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {result.imageUrl && (
                      <img
                        src={result.imageUrl}
                        alt={result.title}
                        className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        {getTypeIcon(result.type)}
                        <span className="text-small text-blue-300">
                          {getTypeLabel(result.type)}
                        </span>
                        {result.url && (
                          <ExternalLink className="w-3 h-3 text-blue-400" />
                        )}
                      </div>
                      
                      <h3 className="text-white font-medium mb-1 truncate">
                        {highlightText(result.title, query)}
                      </h3>
                      
                      {result.description && (
                        <p className="text-blue-200/80 text-small mb-2 line-clamp-2">
                          {highlightText(result.description, query)}
                        </p>
                      )}
                      
                      {result.highlights.length > 0 && (
                        <div className="mb-2">
                          {result.highlights.map((highlight, idx) => (
                            <p key={idx} className="text-blue-300/70 text-small truncate">
                              ...{highlightText(highlight, query)}...
                            </p>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {result.tags?.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTagClick(tag);
                              }}
                              className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-lg text-small cursor-pointer hover:bg-blue-500/30 transition-colors"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                        
                        <div className="flex items-center space-x-2 text-blue-400/60 text-small">
                          {result.date && (
                            <>
                              <Calendar className="w-3 h-3" />
                              <span>{new Date(result.date).toLocaleDateString()}</span>
                            </>
                          )}
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : query ? (
            <div className="p-6 text-center">
              <Search className="w-8 h-8 text-blue-400/50 mx-auto mb-3" />
              <p className="text-blue-300">
                {isZh ? '没有找到相关内容' : 'No results found'}
              </p>
              <p className="text-blue-400/60 text-small mt-1">
                {isZh ? '尝试使用不同的关键词' : 'Try different keywords'}
              </p>
            </div>
          ) : (
            <div className="p-6">
              {/* 最近搜索 */}
              {recentSearches.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-blue-300 font-medium mb-3 text-small">
                    {isZh ? '最近搜索' : 'Recent Searches'}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => setQuery(search)}
                        className="bg-blue-500/10 text-blue-300 px-3 py-1 rounded-lg text-small hover:bg-blue-500/20 transition-colors"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 流行标签 */}
              {popularTags.length > 0 && (
                <div>
                  <h3 className="text-blue-300 font-medium mb-3 text-small">
                    {isZh ? '流行标签' : 'Popular Tags'}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {popularTags.map((tag, index) => (
                      <button
                        key={index}
                        onClick={() => handleTagClick(tag)}
                        className="bg-blue-500/10 text-blue-300 px-3 py-1 rounded-lg text-small hover:bg-blue-500/20 transition-colors flex items-center space-x-1"
                      >
                        <Tag className="w-3 h-3" />
                        <span>{tag}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 快捷键提示 */}
        <div className="p-4 border-t border-blue-400/20">
          <div className="flex justify-between items-center text-small text-blue-400/60">
            <div className="flex space-x-4">
              <span>↑↓ {isZh ? '导航' : 'Navigate'}</span>
              <span>↵ {isZh ? '选择' : 'Select'}</span>
              <span>Esc {isZh ? '关闭' : 'Close'}</span>
            </div>
            <span>{results.length} {isZh ? '个结果' : 'results'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartSearch;