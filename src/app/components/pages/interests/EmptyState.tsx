import React from 'react';
import { Heart } from 'lucide-react';
import { useLanguage } from '../../language/LanguageContext';

interface EmptyStateProps {
  selectedCategory: string;
  categoryName?: string;
}

export default function EmptyState({ selectedCategory, categoryName }: EmptyStateProps) {
  const { isZh } = useLanguage();
  
  return (
    <div className="text-center py-16">
      <div className="glass-pink rounded-xl p-8 max-w-md mx-auto font-terminal">
        <div className="text-pink-300 mb-4">
          <Heart className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-lg text-white mb-2 tracking-wide">
          &gt; {selectedCategory === 'all' 
            ? (isZh ? '暂无兴趣内容' : 'No interests yet') 
            : (isZh ? `暂无${categoryName}相关内容` : `No ${categoryName} content yet`)}
        </h3>
        <p className="text-pink-200 text-small">
          {selectedCategory === 'all' 
            ? (isZh ? '兴趣内容正在整理中，敬请期待...' : 'Interest content is being organized, stay tuned...') 
            : (isZh ? '该分类下的内容正在整理中，可以看看其他分类~' : 'Content in this category is being organized, try other categories~')
          }
        </p>
      </div>
    </div>
  );
}