import React from 'react';
import { GripVertical, ArrowUpDown, Keyboard } from 'lucide-react';

interface DragGuideProps {
  hasUnsavedOrder: boolean;
  isZh: boolean;
  selectedProjectId?: string;
}

export default function DragGuide({ hasUnsavedOrder, isZh, selectedProjectId }: DragGuideProps) {
  return (
    <div className="px-4 py-3 bg-blue-500/10 border-b border-blue-500/20 space-y-2">
      {/* 拖拽提示 */}
      <div className="flex items-center space-x-2">
        <GripVertical className="w-3 h-3 text-blue-300" />
        <span className="text-xs text-blue-300 font-terminal">
          {isZh ? '拖拽项目进行排序，前端页面将按此顺序显示' : 'Drag projects to reorder, frontend will display in this order'}
        </span>
      </div>
      
      {/* 键盘操作提示 */}
      <div className="flex items-center space-x-2">
        <Keyboard className="w-3 h-3 text-blue-300" />
        <span className="text-xs text-blue-300 font-terminal">
          {isZh ? '点击选中项目后，使用 ↑↓ 键调整顺序' : 'Click to select project, then use ↑↓ keys to adjust order'}
        </span>
      </div>
      
      {/* 选中项目提示 */}
      {selectedProjectId && (
        <div className="flex items-center space-x-2">
          <ArrowUpDown className="w-3 h-3 text-cyan-400" />
          <span className="text-xs text-cyan-300 font-terminal">
            {isZh ? '已选中项目，可使用键盘 ↑↓ 键调整顺序，按 ESC 取消选中' : 'Project selected, use keyboard ↑↓ keys to adjust order, press ESC to deselect'}
          </span>
        </div>
      )}
      
      {/* 未保存更改警告 */}
      {hasUnsavedOrder && (
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 text-yellow-300">⚠️</span>
          <span className="text-xs text-yellow-300 font-terminal">
            {isZh ? '排序已更改，请点击"保存排序"按钮保存' : 'Order changed, click "Save Order" to save'}
          </span>
        </div>
      )}
    </div>
  );
}