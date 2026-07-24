import React from 'react';
import { Bot, DatabaseZap } from 'lucide-react';
import { useLanguage } from '../language/LanguageContext';

export default function AIChatBox({ className = '' }: { className?: string }) {
  const { isZh } = useLanguage();

  return (
    <div className={`rounded-xl border border-cyan-300/20 bg-black/20 p-5 ${className}`}>
      <div className="mb-3 flex items-center gap-2 text-cyan-200">
        <Bot className="h-5 w-5" />
        <span className="font-medium">{isZh ? '静态展示模式' : 'Static preview mode'}</span>
      </div>
      <div className="flex items-start gap-3 text-small leading-relaxed text-cyan-100/80">
        <DatabaseZap className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          {isZh
            ? 'AI 助手暂未连接。旧 Supabase 项目恢复或迁移完成后，可以在这里重新启用对话功能。'
            : 'The AI assistant is currently disconnected. It can be re-enabled here after the old Supabase project is recovered or migrated.'}
        </p>
      </div>
    </div>
  );
}
