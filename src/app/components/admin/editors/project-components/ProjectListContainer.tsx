import React, { useState, useEffect, useCallback } from 'react';
import DraggableProjectItem from './DraggableProjectItem';
import DragGuide from './DragGuide';
import ProjectSortControls from './ProjectSortControls';
import { ContentItem } from '../../../content/ContentContext';

// 解析项目周期的起始时间 - 支持多种格式
function parseProjectStartTime(period: string): Date | null {
  if (!period) return null;
  
  console.log('解析时间字符串:', period);
  
  // 清理输入字符串
  const cleanPeriod = period.trim().replace(/\s+/g, ' ');
  
  // 尝试各种日期格式
  const formats = [
    // 标准格式: "2023.01-2023.06", "2023.1-2023.6"
    {
      regex: /^(\d{4})\.(\d{1,2})(?:\s*[-到至]\s*(?:\d{4}\.)?(\d{1,2}))?/,
      parser: (match: RegExpMatchArray) => {
        const year = parseInt(match[1]);
        const month = parseInt(match[2]);
        return new Date(year, month - 1, 1);
      }
    },
    // 中文格式: "2023年1月", "2023年1月-6月"
    {
      regex: /^(\d{4})年(\d{1,2})月(?:\s*[-到至]\s*(?:\d{1,2}|\d{4}年\d{1,2})月)?/,
      parser: (match: RegExpMatchArray) => {
        const year = parseInt(match[1]);
        const month = parseInt(match[2]);
        return new Date(year, month - 1, 1);
      }
    },
    // 英文格式: "March 2023", "Mar 2023", "January 2023 - June 2023"
    {
      regex: /^(\w+)\s+(\d{4})(?:\s*[-到至]\s*\w+\s+\d{4})?/,
      parser: (match: RegExpMatchArray) => {
        const monthName = match[1].toLowerCase();
        const year = parseInt(match[2]);
        const monthIndex = getMonthIndex(monthName);
        if (monthIndex !== -1) {
          return new Date(year, monthIndex, 1);
        }
        return null;
      }
    },
    // 标准日期格式: "2023-01-15", "2023/01/15"
    {
      regex: /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/,
      parser: (match: RegExpMatchArray) => {
        const year = parseInt(match[1]);
        const month = parseInt(match[2]);
        const day = parseInt(match[3]);
        return new Date(year, month - 1, day);
      }
    },
    // 简化格式: "2023-01", "2023/01"
    {
      regex: /^(\d{4})[\/\-](\d{1,2})$/,
      parser: (match: RegExpMatchArray) => {
        const year = parseInt(match[1]);
        const month = parseInt(match[2]);
        return new Date(year, month - 1, 1);
      }
    }
  ];

  for (const format of formats) {
    const match = cleanPeriod.match(format.regex);
    if (match) {
      try {
        const date = format.parser(match);
        if (date && !isNaN(date.getTime())) {
          console.log('成功解析时间:', period, '->', date);
          return date;
        }
      } catch (error) {
        console.warn('时间解析出错:', error);
        continue;
      }
    }
  }
  
  // 最后尝试直接使用Date构造函数
  try {
    const fallbackDate = new Date(cleanPeriod);
    if (!isNaN(fallbackDate.getTime())) {
      console.log('回退解析成功:', period, '->', fallbackDate);
      return fallbackDate;
    }
  } catch (error) {
    console.warn('回退解析失败:', error);
  }
  
  console.warn('无法解析时间字符串:', period);
  return null;
}

// 获取月份索引的辅助函数
function getMonthIndex(monthName: string): number {
  const months = {
    'jan': 0, 'january': 0, '一月': 0, '1月': 0,
    'feb': 1, 'february': 1, '二月': 1, '2月': 1,
    'mar': 2, 'march': 2, '三月': 2, '3月': 2,
    'apr': 3, 'april': 3, '四月': 3, '4月': 3,
    'may': 4, 'may': 4, '五月': 4, '5月': 4,
    'jun': 5, 'june': 5, '六月': 5, '6月': 5,
    'jul': 6, 'july': 6, '七月': 6, '7月': 6,
    'aug': 7, 'august': 7, '八月': 7, '8月': 7,
    'sep': 8, 'september': 8, '九月': 8, '9月': 8,
    'oct': 9, 'october': 9, '十月': 9, '10月': 9,
    'nov': 10, 'november': 10, '十一月': 10, '11月': 10,
    'dec': 11, 'december': 11, '十二月': 11, '12月': 11
  };
  
  return months[monthName] ?? -1;
}

interface ProjectListContainerProps {
  projects: ContentItem[];
  hasUnsavedChanges: boolean;
  onProjectsChange: (projects: ContentItem[]) => void;
  onEdit: (project: ContentItem) => void;
  onDelete: (projectId: string) => void;
  isZh: boolean;
}

export default function ProjectListContainer({
  projects,
  hasUnsavedChanges,
  onProjectsChange,
  onEdit,
  onDelete,
  isZh
}: ProjectListContainerProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [lastSortMethod, setLastSortMethod] = useState<string>('manual');

  // 移动项目函数
  const moveProject = useCallback((dragIndex: number, hoverIndex: number) => {
    // 确保索引在有效范围内
    if (hoverIndex < 0 || hoverIndex >= projects.length || dragIndex === hoverIndex) return;
    
    console.log(`移动项目: ${dragIndex} -> ${hoverIndex}`);
    
    const newProjects = [...projects];
    const draggedItem = newProjects[dragIndex];
    
    // 移除拖拽项目
    newProjects.splice(dragIndex, 1);
    // 插入到新位置
    newProjects.splice(hoverIndex, 0, draggedItem);
    
    onProjectsChange(newProjects);
    setLastSortMethod('manual');
  }, [projects, onProjectsChange]);

  // 键盘导航支持
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedProjectId) return;

      const selectedIndex = projects.findIndex(p => p.id === selectedProjectId);
      if (selectedIndex === -1) return;

      if (e.key === 'ArrowUp' && selectedIndex > 0) {
        e.preventDefault();
        moveProject(selectedIndex, selectedIndex - 1);
      } else if (e.key === 'ArrowDown' && selectedIndex < projects.length - 1) {
        e.preventDefault();
        moveProject(selectedIndex, selectedIndex + 1);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setSelectedProjectId(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedProjectId, projects, moveProject]);

  // 按时间排序函数
  const handleSortByTime = useCallback((ascending: boolean = false) => {
    console.log(`开始按时间排序: ${ascending ? '升序（最旧的在前）' : '降序（最新的在前）'}`);
    
    const sortedProjects = [...projects].sort((a, b) => {
      const aPeriod = a.data.period;
      const bPeriod = b.data.period;
      
      console.log(`比较项目: "${a.data.title || a.title}" (${aPeriod}) vs "${b.data.title || b.title}" (${bPeriod})`);
      
      // 如果两个项目都有时间信息
      if (aPeriod && bPeriod) {
        const aDate = parseProjectStartTime(aPeriod);
        const bDate = parseProjectStartTime(bPeriod);
        
        if (aDate && bDate) {
          const result = ascending 
            ? aDate.getTime() - bDate.getTime() // 升序：早的在前
            : bDate.getTime() - aDate.getTime(); // 降序：晚的在前
          console.log(`日期比较结果: ${result}`);
          return result;
        }
        
        // 如果无法解析为日期，按字符串比较
        const result = ascending 
          ? aPeriod.localeCompare(bPeriod)
          : bPeriod.localeCompare(aPeriod);
        console.log(`字符串比较结果: ${result}`);
        return result;
      }
      
      // 如果只有一个有时间信息，有时间的排在前面
      if (aPeriod && !bPeriod) return -1;
      if (!aPeriod && bPeriod) return 1;
      
      // 如果都没有时间信息，按创建时间排序
      const aCreated = new Date(a.created_at).getTime();
      const bCreated = new Date(b.created_at).getTime();
      const result = ascending 
        ? aCreated - bCreated
        : bCreated - aCreated;
      console.log(`创建时间比较结果: ${result}`);
      return result;
    });
    
    console.log('排序完成，结果:', sortedProjects.map(p => ({ 
      title: p.data.title || p.title, 
      period: p.data.period 
    })));
    
    onProjectsChange(sortedProjects);
    setSelectedProjectId(null); // 清除选中状态
    setLastSortMethod(ascending ? 'time-asc' : 'time-desc');
  }, [projects, onProjectsChange]);

  return (
    <div className="cms-bg-card rounded-xl shadow-lg border border-blue-500/30">
      {/* 头部 */}
      <div className="p-4 border-b border-blue-500/30 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-white font-terminal">
            {isZh ? '项目列表' : 'Project List'}
            <span className="ml-2 text-sm text-slate-400">
              ({projects.length})
            </span>
          </h3>
          {hasUnsavedChanges && (
            <p className="text-xs text-yellow-400 mt-1 font-terminal">
              {isZh ? '有未保存的更改' : 'Unsaved changes'}
            </p>
          )}
          {lastSortMethod !== 'manual' && (
            <p className="text-xs text-slate-400 mt-1 font-terminal">
              {lastSortMethod === 'time-desc' && (isZh ? '按时间排序：最新在前' : 'Sorted by time: newest first')}
              {lastSortMethod === 'time-asc' && (isZh ? '按时间排序：最旧在前' : 'Sorted by time: oldest first')}
            </p>
          )}
        </div>
        
        {/* 排序控制按钮 */}
        <ProjectSortControls
          onSortByTime={handleSortByTime}
          isZh={isZh}
        />
      </div>
      
      {/* 拖拽和键盘操作指南 */}
      <DragGuide
        hasUnsavedOrder={hasUnsavedChanges}
        isZh={isZh}
        selectedProjectId={selectedProjectId}
      />
      
      {/* 项目列表 */}
      <div className="divide-y divide-blue-500/20 max-h-96 overflow-y-auto custom-scrollbar">
        {projects.map((project, index) => (
          <DraggableProjectItem
            key={project.id}
            project={project}
            index={index}
            moveProject={moveProject}
            onEdit={onEdit}
            onDelete={onDelete}
            onSelect={setSelectedProjectId}
            isSelected={selectedProjectId === project.id}
            isZh={isZh}
          />
        ))}
        
        {projects.length === 0 && (
          <div className="p-8 text-center text-slate-400 font-terminal">
            {isZh ? '还没有项目，点击右侧"新建"按钮开始添加' : 'No projects yet, click the "New" button on the right to get started'}
          </div>
        )}
      </div>
    </div>
  );
}