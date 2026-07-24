import React, { useRef, useEffect } from 'react';
import { GripVertical, MapPin } from 'lucide-react';
import { ContentItem } from '../../../content/ContentContext';

interface ProjectItemProps {
  project: ContentItem;
  index: number;
  moveProject: (dragIndex: number, hoverIndex: number) => void;
  onEdit: (project: ContentItem) => void;
  onDelete: (projectId: string) => void;
  onSelect?: (projectId: string | null) => void;
  isSelected?: boolean;
  isZh: boolean;
}

export default function DraggableProjectItem({ 
  project, 
  index, 
  moveProject, 
  onEdit, 
  onDelete, 
  onSelect,
  isSelected = false,
  isZh 
}: ProjectItemProps) {
  const ref = useRef<HTMLDivElement>(null);

  // 拖拽功能
  const [{ isDragging }, drag, preview] = useDrag({
    type: 'project',
    item: { id: project.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'project',
    hover: (item: { id: string; index: number }) => {
      if (!item) {
        return;
      }

      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Move the item
      moveProject(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  // 组合drag和drop引用
  drag(drop(ref));

  // 键盘事件处理
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isSelected) return;

    e.preventDefault();
    
    if (e.key === 'ArrowUp' && index > 0) {
      moveProject(index, index - 1);
    } else if (e.key === 'ArrowDown') {
      moveProject(index, index + 1);
    } else if (e.key === 'Escape') {
      onSelect?.(null);
    }
  };

  // 点击选中处理
  const handleClick = (e: React.MouseEvent) => {
    // 如果点击的是按钮，不触发选中
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    // 阻止事件冒泡，避免与拖拽冲突
    e.preventDefault();
    e.stopPropagation();
    onSelect?.(isSelected ? null : project.id);
  };

  // 处理空格键选中
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Space') {
      e.preventDefault();
      onSelect?.(isSelected ? null : project.id);
    }
  };

  // 格式化项目时间（用于排序显示）
  const formatProjectTime = () => {
    const data = project.data;
    if (data.period) {
      return data.period;
    }
    // 如果没有period，显示创建时间
    const createdAt = new Date(project.created_at);
    return createdAt.toLocaleDateString(isZh ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'short'
    });
  };

  return (
    <div
      ref={ref}
      className={`p-4 hover:bg-slate-700/50 rounded-xl transition-all duration-200 cursor-pointer ${
        isDragging ? 'opacity-50' : ''
      } ${
        isSelected ? 'bg-blue-500/20 border border-blue-400/50' : ''
      }`}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={isZh 
        ? `项目: ${project.data.title}，按空格选中，方向键调整顺序` 
        : `Project: ${project.data.title}, press space to select, arrow keys to reorder`
      }
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          {/* 拖拽手柄 */}
          <div className="flex-shrink-0 mt-1">
            <GripVertical className={`w-4 h-4 transition-colors ${
              isSelected ? 'text-blue-400' : 'text-slate-400 hover:text-blue-400'
            }`} />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className={`font-medium font-terminal ${
                isSelected ? 'text-blue-200' : 'text-white'
              }`}>
                {project.data.title}
              </h4>
              
              {/* 序号显示 */}
              <span className="text-xs bg-slate-600/50 text-slate-300 px-2 py-0.5 rounded-full font-terminal">
                #{index + 1}
              </span>
              
              {project.data.featured && (
                <span className="text-xs bg-yellow-500/20 text-yellow-200 px-2 py-1 rounded-full border border-yellow-500/30">
                  {isZh ? '精选' : 'Featured'}
                </span>
              )}
              
              {(project.data.projectType || project.data.activityType) && (
                <span className="text-xs bg-green-500/20 text-green-200 px-2 py-1 rounded-full border border-green-500/30">
                  {project.data.projectType || project.data.activityType}
                </span>
              )}
            </div>
            
            <p className="text-sm text-slate-300 mb-2 line-clamp-2 font-terminal">
              {project.data.description}
            </p>
            
            {/* 项目时间和地点信息 */}
            <div className="flex items-center space-x-4 mb-2">
              {formatProjectTime() && (
                <span className="text-xs text-slate-400 font-terminal">
                  📅 {formatProjectTime()}
                </span>
              )}
              {project.data.location && (
                <div className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-cyan-400" />
                  <span className="text-xs text-slate-400 font-terminal">{project.data.location}</span>
                </div>
              )}
            </div>
            
            {/* 技术标签 */}
            <div className="flex flex-wrap gap-1">
              {project.data.technologies?.slice(0, 3).map((tech: string) => (
                <span key={tech} className="text-xs bg-blue-500/20 text-blue-200 px-2 py-1 rounded-md border border-blue-500/30">
                  {tech}
                </span>
              ))}
              {project.data.technologies?.length > 3 && (
                <span className="text-xs text-slate-400 font-terminal">+{project.data.technologies.length - 3}</span>
              )}
            </div>
          </div>
        </div>
        
        {/* 操作按钮 */}
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(project);
            }}
            className="cms-secondary-button text-sm px-3 py-1"
          >
            {isZh ? '编辑' : 'Edit'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(project.id);
            }}
            className="cms-danger-button text-sm px-3 py-1"
          >
            {isZh ? '删除' : 'Delete'}
          </button>
        </div>
      </div>
      
      {/* 选中状态提示 */}
      {isSelected && (
        <div className="mt-2 pt-2 border-t border-blue-400/30">
          <p className="text-xs text-blue-300 font-terminal">
            {isZh ? '使用 ↑↓ 键调整顺序，ESC 取消选中' : 'Use ↑↓ keys to reorder, ESC to deselect'}
          </p>
        </div>
      )}
    </div>
  );
}