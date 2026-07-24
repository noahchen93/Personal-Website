import React from 'react';
import { Tag } from 'lucide-react';
import { useLanguage } from '../../language/LanguageContext';
import { DEFAULT_INTEREST_CATEGORIES, CustomCategory, Category, getCategoryName } from './constants';

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  customCategories?: CustomCategory[];
  modifiedDefaultCategories?: Category[];
}

export default function CategoryFilter({ 
  selectedCategory, 
  onCategoryChange, 
  customCategories = [],
  modifiedDefaultCategories = []
}: CategoryFilterProps) {
  const { isZh, currentLanguage } = useLanguage();
  
  const effectiveDefaultCategories = modifiedDefaultCategories.length > 0 
    ? modifiedDefaultCategories 
    : DEFAULT_INTEREST_CATEGORIES;
  
  const allCategories = [...effectiveDefaultCategories, ...customCategories];
  
  return (
    <div className="flex flex-wrap gap-3 justify-center font-mono">
      <button
        onClick={() => onCategoryChange('all')}
        className={`flex items-center space-x-2 px-4 py-2 border rounded-xl transition-all duration-200 tracking-wide ${
          selectedCategory === 'all'
            ? 'border-green-400 bg-green-400 text-black shadow-lg shadow-green-400/20'
            : 'border-gray-700 text-gray-400 hover:border-green-400 hover:text-green-400'
        }`}
      >
        <span>&gt; {isZh ? '全部' : 'All'}</span>
      </button>
      
      {allCategories.map((category) => {
        const Icon = (category as Category).icon || Tag;
        const isActive = selectedCategory === category.id;
        const isCustom = category.id.startsWith('custom_');
        const displayName = getCategoryName(category, currentLanguage);
        
        return (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`flex items-center space-x-2 px-4 py-2 border rounded-xl transition-all duration-200 tracking-wide ${
              isActive
                ? 'border-cyan-400 bg-cyan-400 text-black shadow-lg shadow-cyan-400/20'
                : 'border-gray-700 text-gray-400 hover:border-cyan-400 hover:text-cyan-400'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{isActive ? `[${displayName}]` : displayName}</span>
            {isCustom && !isActive && (
              <Tag className="w-3 h-3 opacity-60" />
            )}
          </button>
        );
      })}
    </div>
  );
}